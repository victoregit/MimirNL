import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { fixtureGit } from "../test/git-fixture.mjs";
import { runNpm } from "./npm-cli.mjs";
const root = mkdtempSync(join(tmpdir(), "mimir-package-"));
// Windows npm/bin shims require cmd.exe; arguments are controlled temp paths.
function command(bin, args, options = {}) {
  const cmdShim = process.platform === "win32" && /\.(?:cmd|bat)$/i.test(bin);
  // cmd.exe shims need explicit quoting to preserve a single argument containing spaces.
  // Only controlled fixture arguments enter this shell boundary.
  if (cmdShim) {
    const quote = (value) => {
      if (/["%!?^&|<>\r\n]/.test(value))
        throw Error("Unsupported fixture shell character");
      return '"' + value + '"';
    };
    bin = quote(bin);
    args = args.map(quote);
  }
  const settings = {
    encoding: "utf8",
    timeout: 120000,
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  };
  if (cmdShim)
    return execFileSync(
      process.env.ComSpec ?? "cmd.exe",
      ["/d", "/s", "/c", '"' + [bin, ...args].join(" ") + '"'],
      { ...settings, windowsVerbatimArguments: true },
    );
  return execFileSync(bin, args, settings);
}
try {
  const pack = JSON.parse(
    runNpm(["pack", "--json", "--pack-destination", root]),
  );
  const metadata = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  assert.equal(pack[0].version, metadata.version);
  const packedPaths = pack[0].files.map((file) => file.path);
  for (const path of packedPaths) {
    assert.ok(
      !/^(tasks|test|scripts|node_modules|docs\/benchmarks)\//.test(path),
      path,
    );
    assert.ok(!/\.(?:tar|sqlite|pem)$/.test(path), path);
  }
  for (const path of metadata.files.filter((path) => path !== "dist")) {
    assert.ok(packedPaths.includes(path), `Missing package document: ${path}`);
  }
  const install = join(root, "install");
  mkdirSync(install);
  writeFileSync(
    join(install, "package.json"),
    JSON.stringify({ name: "mimir-smoke-fixture", private: true }),
  );
  runNpm([
    "install",
    "--prefix",
    install,
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    join(root, pack[0].filename),
  ]);
  const bin = join(
    install,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "mimir.cmd" : "mimir",
  );
  if (process.platform !== "win32") assert.ok(statSync(bin).mode & 0o111);
  assert.equal(
    JSON.parse(
      readFileSync(
        join(install, "node_modules", "mimir-nl", "package.json"),
        "utf8",
      ),
    ).license,
    "MIT",
  );
  assert.match(
    readFileSync(join(install, "node_modules", "mimir-nl", "LICENSE"), "utf8"),
    /MIT License/,
  );
  const db = join(root, "memory.sqlite"),
    snapshot = join(root, "snapshot.sqlite"),
    restored = join(root, "restore.sqlite");
  function cli(database, ...args) {
    // JSON contains quotes that the controlled cmd.exe shim boundary rejects.
    // Invoke the installed entry point directly for feedback on Windows; all
    // other smoke commands still exercise the installed executable shim.
    const direct = process.platform === "win32" && args[0] === "feedback";
    const r = JSON.parse(
      command(direct ? process.execPath : bin, [
        ...(direct
          ? [
              join(
                install,
                "node_modules",
                "mimir-nl",
                "dist",
                "cli",
                "index.js",
              ),
            ]
          : []),
        "--db",
        database,
        ...args,
      ]),
    );
    assert.equal(r.ok, true, JSON.stringify(r));
    return r.data;
  }
  const expectedVersion = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  ).version;
  const installedPackage = JSON.parse(
    readFileSync(
      join(install, "node_modules", "mimir-nl", "package.json"),
      "utf8",
    ),
  );
  assert.equal(installedPackage.version, expectedVersion);
  assert.equal(cli(db, "init").version, expectedVersion);
  // Initialize the actual installed stdio server, independently of CLI dispatch.
  const client = new Client({
    name: "installed-package-smoke",
    version: "1.0.0",
  });
  try {
    await client.connect(
      new StdioClientTransport({
        command: process.execPath,
        args: [
          join(install, "node_modules", "mimir-nl", "dist", "cli", "index.js"),
          "--db",
          join(root, "mcp.sqlite"),
          "mcp",
          "stdio",
        ],
        stderr: "pipe",
      }),
    );
    assert.equal(client.getServerVersion().version, expectedVersion);
    const result = await client.callTool({ name: "init", arguments: {} });
    assert.equal(
      JSON.parse(result.content[0].text).data.version,
      expectedVersion,
    );
  } finally {
    await client.close();
  }
  assert.equal(cli(db, "doctor").healthy, true);
  const repo = join(root, "repo");
  mkdirSync(repo);
  fixtureGit(["init", "-q", repo]);
  writeFileSync(
    join(repo, "fixture.md"),
    "installed package retrieval evidence",
  );
  const project = cli(db, "project", "add", repo, "--authorize-ingestion");
  assert.ok(cli(db, "ingest", project.id).inserted > 0);
  const m = cli(
    db,
    "store",
    "versioned package smoke",
    "--project",
    project.id,
  );
  cli(db, "update", m.id, "updated package smoke", "--project", project.id);
  // Exercise the installed CLI dispatcher and verify approval survives recovery.
  const feedback = cli(
    db,
    "feedback",
    JSON.stringify({
      projectId: project.id,
      id: m.id,
      action: "approve",
      explicitApproval: true,
    }),
  );
  assert.equal(feedback.status, "verified");
  cli(db, "backup", snapshot);
  cli(restored, "restore", snapshot, "--confirm");
  assert.equal(
    cli(restored, "get", m.id, "--project", project.id).content,
    "updated package smoke",
  );
  assert.equal(
    cli(restored, "get", m.id, "--project", project.id).status,
    "verified",
  );
  assert.ok(
    cli(restored, "search", "retrieval", "--project", project.id).memories
      .length,
  );
  cli(restored, "delete", m.id, "--project", project.id, "--confirm");
  assert.equal(
    cli(db, "get", m.id, "--project", project.id).content,
    "updated package smoke",
  );
  assert.ok(
    readFileSync(
      join(install, "node_modules", "mimir-nl", "SECURITY.md"),
      "utf8",
    ).length,
  );
  console.log(
    JSON.stringify({
      installedExecutable: true,
      version: expectedVersion,
      installedMcpVersion: true,
      backupRestore: true,
      feedbackApproval: true,
      isolation: true,
      node: process.version,
      platform: process.platform,
    }),
  );
} finally {
  rmSync(root, { recursive: true, force: true });
}
