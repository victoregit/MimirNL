import { pathToFileURL } from "node:url";
import { assertPrivateMode } from "./platform-fixture.mjs";
import { tmpdir } from "node:os";
import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  rmSync,
  statSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import {
  ROOT,
  ORDER,
  loadSource,
  promptFor,
  sha256,
  prepareRetrieval,
  runProbe,
  createOutput,
  transport,
  summarize,
  main,
} from "../scripts/benchmarks/paired-probe.mjs";
const source = loadSource();
function parent() {
  return mkdtempSync(join(tmpdir(), "mimir-paired-test-"));
}
function fakeSpawn(events, code = 0, hang = false) {
  return () => {
    const p = new EventEmitter();
    p.stdin = new PassThrough();
    p.stdout = new PassThrough();
    p.stderr = new PassThrough();
    p.kill = () => {
      p.stdout.end();
      p.stderr.end();
      setImmediate(() => p.emit("close", null, "SIGKILL"));
    };
    queueMicrotask(() => {
      for (const e of events) p.stdout.write(JSON.stringify(e) + "\n");
      if (!hang) {
        p.stdout.end();
        p.stderr.end();
        setImmediate(() => p.emit("close", code, null));
      }
    });
    return p;
  };
}
const events = [
  { type: "thread.started", thread_id: "PRIVATE_CANARY" },
  { type: "turn.started" },
  { type: "item.completed", item: { type: "reasoning", text: "GOLD_CANARY" } },
  {
    type: "item.completed",
    item: { type: "agent_message", text: "Final answer" },
  },
  {
    type: "turn.completed",
    usage: { input_tokens: 10, cached_input_tokens: 4, output_tokens: 2 },
  },
];
test("source parity, no private IDs or gold, real disposable retrieval", async () => {
  const dir = parent();
  let f;
  try {
    f = await prepareRetrieval(dir, source);
    const r = await f.retrieve();
    assert.equal(r.content, source);
    assert.equal(r.hash, sha256(source));
    assert.ok(promptFor(source, r.content).startsWith(promptFor(source)));
    assert.ok(!promptFor(source, r.content).includes(dir));
    assert.ok(!promptFor(source, r.content).includes("expected_answer"));
    assert.throws(() => promptFor(source, "mismatch"));
  } finally {
    f?.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
test("transport preserves approved usage on nonzero/timeout and rejects tools/incomplete", async () => {
  const base = {
    prompt: "offline",
    scratch: "/tmp",
    spawnImpl: fakeSpawn(events),
  };
  const ok = await transport(base);
  assert.equal(ok.status, "completed");
  assert.equal(ok.usage.total_tokens, 12);
  assert.equal(ok.response, "Final answer");
  assert.ok(!JSON.stringify(ok).includes("CANARY"));
  assert.equal(
    (await transport({ ...base, spawnImpl: fakeSpawn(events, 7) })).status,
    "exit_nonzero",
  );
  const timed = await transport({
    ...base,
    timeoutMs: 10,
    spawnImpl: fakeSpawn(events, 0, true),
  });
  assert.equal(timed.status, "timeout");
  assert.equal(timed.usage.input_tokens, 10);
  const toolEvents = [
    ...events.slice(0, 2),
    {
      type: "item.started",
      item: { type: "command_execution", command: "CANARY" },
    },
    ...events.slice(2),
  ];
  assert.equal(
    (await transport({ ...base, spawnImpl: fakeSpawn(toolEvents) })).status,
    "invalid_tools",
  );
  assert.equal(
    (await transport({ ...base, spawnImpl: fakeSpawn(events.slice(0, 2)) }))
      .status,
    "incomplete",
  );
  assert.equal(
    (
      await transport({
        ...base,
        spawnImpl: () => {
          throw Error();
        },
      })
    ).status,
    "spawn_error",
  );
  assert.equal(
    (
      await transport({
        ...base,
        spawnImpl: fakeSpawn([
          {
            type: "item.completed",
            item: { type: "agent_message", text: "x".repeat(64001) },
          },
        ]),
      })
    ).status,
    "limit",
  );
});
test("six calls, fixed paired order, inclusive timing, exclusive private artifacts", async () => {
  const dir = parent();
  const out = join(dir, "out");
  let time = 0,
    calls = 0,
    setups = 0;
  try {
    const result = await runProbe({
      output: out,
      source,
      clock: () => time,
      prepare: async () => {
        setups++;
        time += 20;
        return {
          retrieve: async () => {
            time += 5;
            return { content: source, hash: sha256(source), elapsed_ms: 5 };
          },
          close() {},
        };
      },
      execute: async ({ prompt, timeoutMs }) => {
        calls++;
        assert.ok(prompt.includes(source));
        assert.ok(timeoutMs <= 90000);
        time += 10;
        return {
          status: "completed",
          wall_ms: 10,
          response: "answer",
          usage: {
            input_tokens: 10,
            cached_input_tokens: 0,
            output_tokens: 1,
            total_tokens: 11,
          },
        };
      },
    });
    assert.equal(calls, 6);
    assert.equal(setups, 3);
    assert.deepEqual(
      result.runs.map((r) => r.condition),
      ORDER,
    );
    assert.deepEqual(
      result.runs.map((r) => r.end_to_end_ms),
      [10, 15, 15, 10, 10, 15],
    );
    assert.equal(
      summarize(result.runs).paired_delta_B_minus_A.end_to_end_ms.median,
      5,
    );
    assertPrivateMode(out, 0o700);
    for (const name of readdirSync(out))
      assertPrivateMode(join(out, name), 0o600);
    assert.throws(() => createOutput(out));
    assert.equal(
      JSON.parse(readFileSync(join(out, "summary.json"))).quality,
      "pending independent review",
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("global ceiling retains not_run and failures with null coverage", async () => {
  const dir = parent();
  let time = 0,
    calls = 0;
  try {
    const { runs } = await runProbe({
      output: join(dir, "out"),
      source,
      clock: () => time,
      execute: async () => {
        calls++;
        time = 600001;
        return { status: "timeout", usage: null, wall_ms: 600001 };
      },
    });
    assert.equal(calls, 1);
    assert.equal(runs[0].status, "timeout");
    assert.equal(runs[1].status, "not_run");
    assert.equal(summarize(runs).conditions.sem_memoria.total_tokens.n, 0);
    assert.equal(
      summarize(runs).conditions.sem_memoria.total_tokens.median,
      null,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("import and help do not create fixtures or spawn Codex; CLI requires --run", async () => {
  const dir = parent();
  try {
    execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `await import(${JSON.stringify(pathToFileURL(join(ROOT, "scripts/benchmarks/paired-probe.mjs")).href)})`,
      ],
      { cwd: dir },
    );
    assert.deepEqual(readdirSync(dir), []);
    assert.equal(await main([]), 1);
    assert.equal(await main(["--out", dir]), 1);
    assert.equal(await main(["--help"]), 0);
    assert.deepEqual(readdirSync(dir), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("public model allowlist and stderr bounds do not retain private output", async () => {
  const reported = structuredClone(events);
  reported[0].model = "gpt-example";
  const result = await transport({
    prompt: "offline",
    scratch: "/tmp",
    spawnImpl: fakeSpawn(reported),
  });
  assert.deepEqual(result.model_identity, {
    status: "public-host-reported",
    model: "gpt-example",
  });
  reported[0].model = "/private/config";
  assert.equal(
    (
      await transport({
        prompt: "offline",
        scratch: "/tmp",
        spawnImpl: fakeSpawn(reported),
      })
    ).model_identity.status,
    "unavailable",
  );
  const noisy = () => {
    const child = fakeSpawn([], 0, true)();
    setImmediate(() => child.stderr.write(Buffer.alloc(1024 * 1024 + 1)));
    return child;
  };
  assert.equal(
    (await transport({ prompt: "offline", scratch: "/tmp", spawnImpl: noisy }))
      .status,
    "limit",
  );
});

test("local retrieval failures are reported, cleaned, and never invoke a model for B", async () => {
  const dir = parent();
  let calls = 0;
  try {
    const { runs } = await runProbe({
      output: join(dir, "out"),
      source,
      prepare: async () => {
        throw Error("PRIVATE_CANARY");
      },
      execute: async () => {
        calls++;
        return {
          status: "exit_nonzero",
          usage: {
            input_tokens: 0,
            cached_input_tokens: 0,
            output_tokens: 0,
            total_tokens: 0,
          },
        };
      },
    });
    assert.equal(calls, 3);
    assert.equal(runs.filter((r) => r.status === "local_error").length, 3);
    assert.ok(!JSON.stringify(runs).includes("PRIVATE_CANARY"));
    assert.ok(
      !readdirSync(join(dir, "out")).some((name) => name.startsWith("fixture")),
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
