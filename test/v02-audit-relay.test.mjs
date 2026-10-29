import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import {
  readFileSync,
  statSync,
  rmSync,
  readdirSync,
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  realpathSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import {
  Observer,
  auditName,
  sessionLimit,
  watchdog,
  termination,
  startupDiagnostic,
} from "../scripts/v02-audit-relay.mjs";
const relay = resolve("scripts/v02-audit-relay.mjs");

test("unique names, bounded lifetime and deterministic watchdog", () => {
  const names = new Set(
    Array.from({ length: 1000 }, () => auditName("--unique")),
  );
  assert.equal(names.size, 1000);
  for (const name of names)
    assert.match(name, /^audit-session-[0-9]+-[0-9a-f-]+\.jsonl$/);
  assert.equal(auditName("audit-explicit.jsonl"), "audit-explicit.jsonl");
  assert.throws(() => auditName("../PRIVATE_TOKEN"));
  assert.equal(sessionLimit(), 14400000);
  assert.equal(sessionLimit("720"), 43200000);
  for (const value of ["0", "721", "Infinity", "NaN", "1.5", "-1", "", "1e2"])
    assert.throws(() => sessionLimit(value));
  let callback,
    delay,
    unref = false,
    stopped = false;
  watchdog(
    () => {
      stopped = true;
    },
    7,
    (fn, ms) => {
      callback = fn;
      delay = ms;
      return {
        unref() {
          unref = true;
        },
      };
    },
  );
  assert.equal(delay, 7);
  assert.equal(unref, true);
  callback();
  assert.equal(stopped, true);
  assert.match(
    startupDiagnostic({ code: "EEXIST", message: "PRIVATE_TOKEN" }),
    /--unique/,
  );
  assert.equal(
    startupDiagnostic({ message: "PRIVATE_TOKEN" }).includes("PRIVATE_TOKEN"),
    false,
  );
});

test("deadline termination sends TERM then bounded KILL exactly once", () => {
  const signals = [],
    timers = [];
  const cleanup = termination(
    (signal) => signals.push(signal),
    (fn, ms) => {
      timers.push({ fn, ms });
      return { unref() {} };
    },
  );
  watchdog(
    () => cleanup.stop(),
    5,
    (fn, ms) => {
      timers.push({ fn, ms });
      return { unref() {} };
    },
  );
  timers[0].fn();
  assert.deepEqual(signals, ["SIGTERM"]);
  assert.equal(cleanup.stop(), false);
  assert.equal(timers[1].ms, 1000);
  timers[1].fn();
  assert.deepEqual(signals, ["SIGTERM", "SIGKILL"]);
});

test("observer bounds frames, excludes private content and correlates only allowed requests", () => {
  const rows = [],
    observer = new Observer((row) => rows.push(row));
  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "memory_feedback",
      arguments: {
        action: "approve",
        explicitApproval: false,
        note: "PRIVATE_TOKEN",
        content: "PRIVATE_TOKEN",
      },
    },
  };
  const bytes = Buffer.from(JSON.stringify(request) + "\n");
  observer.feed("request", bytes.subarray(0, 20));
  observer.feed("request", bytes.subarray(20));
  observer.feed(
    "response",
    Buffer.from(
      JSON.stringify({
        id: 1,
        result: {
          content: [
            {
              text: JSON.stringify({
                ok: false,
                error: { code: "APPROVAL_REQUIRED", message: "PRIVATE_TOKEN" },
              }),
            },
          ],
        },
      }) + "\n",
    ),
  );
  observer.feed("request", Buffer.from("x".repeat(100000) + "\nnot json\n"));
  observer.feed(
    "request",
    Buffer.from(JSON.stringify({ ...request, id: "PRIVATE_TOKEN" }) + "\n"),
  );
  observer.feed(
    "request",
    Buffer.from(
      JSON.stringify({
        ...request,
        id: 2,
        params: { name: "unknown", arguments: { content: "PRIVATE_TOKEN" } },
      }) + "\n",
    ),
  );
  assert.equal(rows.length, 2);
  assert.equal(rows[1].code, "APPROVAL_REQUIRED");
  assert.equal(JSON.stringify(rows).includes("PRIVATE_TOKEN"), false);
  for (let id = 2; id < 1000; id++)
    observer.feed(
      "request",
      Buffer.from(JSON.stringify({ ...request, id }) + "\n"),
    );
  assert.equal(observer.pending.size, 128);
});

test("real SDK through subprocess relay preserves errors, privacy and closes cleanly", async () => {
  let fixture;
  if (process.platform === "win32") {
    // Native-only disposable DB: never reuse a Linux fixture or weaken runtime checks.
    const directory = realpathSync(mkdtempSync(join(tmpdir(), "mimir-v02-")));
    mkdirSync(join(directory, "private"));
    fixture = {
      directory,
      db: join(directory, "private", "host.sqlite"),
      node: realpathSync(process.execPath),
      cli: realpathSync(resolve("dist/cli/index.js")),
    };
    execFileSync(process.execPath, [fixture.cli, "--db", fixture.db, "init"], {
      stdio: "ignore",
    });
    writeFileSync(join(directory, "manifest.json"), JSON.stringify(fixture));
  } else {
    fixture = JSON.parse(
      execFileSync(
        "python3",
        ["scripts/v02-host-fixture.py", "prepare", "--node", process.execPath],
        { encoding: "utf8" },
      ),
    );
  }
  const client = new Client({ name: "offline-relay-test", version: "1.0" });
  try {
    // Independent official SDK clients overlap against one disposable fixture.
    const beforeDb = readFileSync(fixture.db);
    const clients = Array.from(
      { length: 3 },
      () => new Client({ name: "concurrent-relay", version: "1" }),
    );
    try {
      await Promise.all(
        clients.map(async (peer) => {
          await peer.connect(
            new StdioClientTransport({
              command: process.execPath,
              args: [relay, fixture.directory, "--unique"],
              stderr: "pipe",
            }),
          );
          assert.equal((await peer.listTools()).tools.length, 24);
        }),
      );
    } finally {
      await Promise.all(clients.map((peer) => peer.close()));
    }
    // A restart must allocate a fourth file, never reopen one of the first three.
    const restarted = new Client({ name: "restart-relay", version: "1" });
    try {
      await restarted.connect(
        new StdioClientTransport({
          command: process.execPath,
          args: [relay, fixture.directory, "--unique"],
          stderr: "pipe",
        }),
      );
      assert.equal((await restarted.listTools()).tools.length, 24);
    } finally {
      await restarted.close();
    }
    const uniqueFiles = readdirSync(join(fixture.directory, "private")).filter(
      (name) => name.startsWith("audit-session-"),
    );
    assert.equal(uniqueFiles.length, 4);
    for (const name of uniqueFiles) {
      if (process.platform !== "win32")
        assert.equal(
          statSync(join(fixture.directory, "private", name)).mode & 0o777,
          0o600,
        );
      assert.equal(
        readFileSync(join(fixture.directory, "private", name)).length,
        0,
      );
    }
    assert.deepEqual(readFileSync(fixture.db), beforeDb);
    await client.connect(
      new StdioClientTransport({
        command: process.execPath,
        args: [relay, fixture.directory, "audit-sdk.jsonl"],
        stderr: "pipe",
      }),
    );
    assert.ok(
      (await client.listTools()).tools.some(
        (tool) => tool.name === "memory_get",
      ),
    );
    const result = await client.callTool({
      name: "memory_get",
      arguments: {
        projectId: "00000000-0000-4000-8000-000000000001",
        id: "00000000-0000-4000-8000-000000000002",
      },
    });
    assert.equal(JSON.parse(result.content[0].text).error.code, "NOT_FOUND");
    const invalid = await client.callTool({
      name: "memory_delete",
      arguments: {
        projectId: "00000000-0000-4000-8000-000000000001",
        id: "00000000-0000-4000-8000-000000000002",
      },
    });
    assert.equal(invalid.isError, true);
    await client.close();
    // Compare byte-for-byte responses against direct stdio, including unusual whitespace.
    const frame = Buffer.from(
      ' {"jsonrpc":"2.0", "id":99,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"raw-fixture","version":"1"}}}\n',
    );
    async function raw(args) {
      const child = spawn(process.execPath, args, {
        stdio: ["pipe", "pipe", "ignore"],
      });
      const exited = new Promise((resolve) => child.once("exit", resolve));
      const timer = setTimeout(() => child.kill("SIGKILL"), 3000);
      try {
        const output = await new Promise((resolve, reject) => {
          let output = Buffer.alloc(0);
          child.on("error", reject);
          child.stdout.on("data", (chunk) => {
            output = Buffer.concat([output, chunk]);
            if (output.includes(10)) resolve(output);
          });
          child.once("exit", () => reject(Error("Exited before response")));
          child.stdin.write(frame.subarray(0, 13));
          child.stdin.write(frame.subarray(13));
        });
        child.kill("SIGTERM");
        await exited;
        return output;
      } finally {
        clearTimeout(timer);
        child.kill("SIGKILL");
      }
    }
    assert.deepEqual(
      await raw([relay, fixture.directory, "audit-raw.jsonl"]),
      await raw([fixture.cli, "--db", fixture.db, "mcp", "stdio"]),
    );
    const path = join(fixture.directory, "private/audit-sdk.jsonl");
    const rows = readFileSync(path, "utf8").trim().split("\n").map(JSON.parse);
    assert.ok(rows.some((row) => row.code === "NOT_FOUND"));
    if (process.platform !== "win32")
      assert.equal(statSync(path).mode & 0o777, 0o600);
    const originalAudit = readFileSync(path);
    const refused = spawn(
      process.execPath,
      [relay, fixture.directory, "audit-sdk.jsonl"],
      { stdio: "pipe" },
    );
    let stderr = "",
      stdout = "";
    refused.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    refused.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    assert.equal(
      await new Promise((resolve) => refused.on("close", resolve)),
      1,
    );
    assert.match(stderr, /audit exists; use --unique/);
    assert.equal(stderr.includes(fixture.directory), false);
    assert.equal(stdout, "");
    assert.deepEqual(readFileSync(path), originalAudit);
    // EOF must reap the real server promptly and leave stdout protocol-only.
    const eof = spawn(
      process.execPath,
      [relay, fixture.directory, "--unique"],
      { stdio: "pipe" },
    );
    const eofClosed = new Promise((resolve) => eof.once("close", resolve));
    const bound = setTimeout(() => eof.kill("SIGKILL"), 5000);
    eof.stdin.end();
    assert.equal(await eofClosed, 0);
    clearTimeout(bound);
  } finally {
    await client.close();
    rmSync(fixture.directory, { recursive: true, force: true });
  }
});
