import { pathToFileURL } from "node:url";
import { assertPrivateMode } from "./platform-fixture.mjs";
import { tmpdir } from "node:os";
import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  rmSync,
  readFileSync,
  statSync,
  readdirSync,
  existsSync,
} from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import {
  loadCorpus,
  PATHS,
  ORDER,
  MODEL,
  QUERY,
  QUESTION,
  argsFor,
  promptFor,
  validateSelection,
  prepareRetrieval,
  runProbe,
  summarize,
  transport,
  main,
} from "../scripts/benchmarks/context-selection-probe.mjs";
import { ROOT, sha256 } from "../scripts/benchmarks/paired-probe.mjs";
const corpus = loadCorpus();
const temporary = () => mkdtempSync(join(tmpdir(), "mimir-selection-test-"));
const clean = (dir) => rmSync(dir, { recursive: true, force: true });
const events = [
  { type: "thread.started", model: MODEL, thread_id: "PRIVATE_CANARY" },
  { type: "turn.started" },
  {
    type: "item.completed",
    item: { type: "reasoning", text: "PRIVATE_CANARY" },
  },
  { type: "item.completed", item: { type: "agent_message", text: "Resposta" } },
  {
    type: "turn.completed",
    usage: { input_tokens: 10, cached_input_tokens: 4, output_tokens: 2 },
  },
];
function fakeSpawn(
  sequence = events,
  code = 0,
  hang = false,
  inspect = () => {},
) {
  return (binary, args) => {
    inspect(binary, args);
    const child = new EventEmitter();
    child.stdin = new PassThrough();
    child.stdout = new PassThrough();
    child.stderr = new PassThrough();
    child.kill = () => {
      child.stdout.end();
      child.stderr.end();
      setImmediate(() => child.emit("close", null, "SIGKILL"));
    };
    queueMicrotask(() => {
      sequence.forEach((e) => child.stdout.write(JSON.stringify(e) + "\n"));
      if (!hang) {
        child.stdout.end();
        child.stderr.end();
        setImmediate(() => child.emit("close", code, null));
      }
    });
    return child;
  };
}
test("six pinned real units, integrity, real top-k without oracle, no duplicate baseline", async () => {
  const dir = temporary();
  let fixture;
  try {
    assert.equal(corpus.length, 6);
    assert.equal(new Set(corpus.map((c) => c.hash)).size, 6);
    corpus.forEach((c, i) => {
      assert.ok(c.source.startsWith(PATHS[i] + "@"));
      assert.equal(c.hash, sha256(c.content));
      assert.equal(c.bytes, Buffer.byteLength(c.content));
      assert.ok(c.content.length <= 32000);
      assert.equal(promptFor(corpus).split(c.content).length - 1, 1);
    });
    assert.match(promptFor(corpus), /estimateTokens/);
    fixture = await prepareRetrieval(dir, corpus);
    const result = await fixture.retrieve();
    assert.ok(result.units.length > 0 && result.units.length <= QUERY.limit);
    assert.deepEqual(validateSelection(result.units, corpus), result.units);
    const prompt = promptFor(result.units);
    for (const unit of result.units)
      assert.equal(prompt.split(unit.content).length - 1, 1);
    for (const unit of corpus.filter((c) => !result.units.includes(c)))
      assert.ok(!prompt.includes(unit.content));
    assert.ok(!prompt.includes(dir));
    assert.ok(prompt.endsWith(QUESTION));
    assert.throws(() =>
      validateSelection([result.units[0], result.units[0]], corpus),
    );
    assert.throws(() =>
      validateSelection([{ ...result.units[0], content: "tampered" }], corpus),
    );
    assert.throws(() =>
      validateSelection([{ ...result.units[0], source: "unknown" }], corpus),
    );
    assert.deepEqual(validateSelection([], corpus), []);
  } finally {
    fixture?.close();
    clean(dir);
  }
});
test("plan precedes six sequential calls; real retrieval, model args, private evidence and cleanup", async () => {
  const dir = temporary(),
    out = join(dir, "out");
  let active = 0,
    calls = 0;
  try {
    const result = await runProbe({
      output: out,
      execute: async (options) => {
        assert.equal(active++, 0);
        calls++;
        const plan = JSON.parse(readFileSync(join(out, "plan.json")));
        assert.equal(plan.positions.length, 6);
        assert.equal(plan.requested_model, MODEL);
        assert.equal(plan.requested_config.model_reasoning_effort, "low");
        assert.equal(
          plan.positions[calls - 1].envelope_sha256,
          sha256(options.prompt),
        );
        assert.deepEqual(readdirSync(options.scratch), []);
        assert.ok(options.timeoutMs <= 90000);
        const response = await transport({
          ...options,
          spawnImpl: fakeSpawn(events, 0, false, (bin, args) => {
            assert.equal(bin, "codex");
            assert.deepEqual(args, argsFor(options.scratch));
          }),
        });
        active--;
        return response;
      },
    });
    assert.equal(calls, 6);
    assert.deepEqual(
      result.runs.map((r) => r.condition),
      ORDER,
    );
    result.runs.forEach((r) => {
      assert.equal(r.status, "completed");
      assert.equal(r.usage.total_tokens, 12);
      assert.equal(r.end_to_end_ms, r.wall_ms + r.retrieval_ms);
      assert.equal(r.model_divergence, false);
    });
    assertPrivateMode(out, 0o700);
    for (const name of readdirSync(out)) {
      assertPrivateMode(join(out, name), 0o600);
      assert.ok(
        !readFileSync(join(out, name), "utf8").includes("PRIVATE_CANARY"),
      );
    }
    assert.ok(!existsSync(join(out, "scratch")));
    assert.ok(!readdirSync(out).some((n) => n.startsWith("fixture")));
    await assert.rejects(
      runProbe({ output: out, execute: () => assert.fail("exclusive") }),
    );
    await assert.rejects(
      runProbe({
        output: "/var/mimir-forbidden",
        execute: () => assert.fail("outside tmp"),
      }),
    );
  } finally {
    clean(dir);
  }
});
test("transport handles errors, timeout partial usage, tool rejection and limits offline", async () => {
  const base = { prompt: "offline", scratch: "/tmp" };
  for (const [spawnImpl, status] of [
    [fakeSpawn(events, 7), "exit_nonzero"],
    [fakeSpawn(events, 0, true), "timeout"],
    [
      fakeSpawn([
        ...events.slice(0, 2),
        { type: "item.started", item: { type: "command_execution" } },
        ...events.slice(2),
      ]),
      "invalid_tools",
    ],
    [fakeSpawn(events.slice(0, 2)), "incomplete"],
    [
      () => {
        throw Error("PRIVATE_CANARY");
      },
      "spawn_error",
    ],
    [
      fakeSpawn([
        ...events.slice(0, 2),
        {
          type: "item.completed",
          item: { type: "agent_message", text: "x".repeat(64001) },
        },
      ]),
      "limit",
    ],
  ]) {
    const result = await transport({
      ...base,
      spawnImpl,
      timeoutMs: status === "timeout" ? 15 : 1000,
    });
    assert.equal(result.status, status);
    if (status === "timeout") assert.equal(result.usage.total_tokens, 12);
    assert.ok(!JSON.stringify(result).includes("PRIVATE_CANARY"));
  }
});
test("timing, missing metrics, failures and global ceiling retain all positions", async () => {
  const dir = temporary();
  let time = 0,
    calls = 0;
  try {
    const result = await runProbe({
      output: join(dir, "out"),
      clock: () => time,
      prepare: async () => {
        time += 20;
        return {
          retrieve: async () => {
            time += 5;
            return { units: [], elapsed_ms: 5 };
          },
          close() {
            time += 2;
          },
        };
      },
      execute: async () => {
        calls++;
        time = 600001;
        return { status: "timeout", usage: { input_tokens: 0 }, wall_ms: 10 };
      },
    });
    assert.equal(calls, 1);
    assert.equal(result.runs.length, 6);
    assert.equal(result.runs[1].status, "not_run");
    assert.equal(result.runs[1].setup_ms, 20);
    assert.equal(result.runs[1].close_ms, 2);
    const summary = summarize(result.runs);
    assert.equal(summary.conditions.contexto_completo.total_tokens.n, 0);
    assert.equal(summary.paired_delta_B_minus_A.wall_ms.median, null);
    assert.equal(summary.exclusions.length, 6);
    assert.equal(summary.coverage[0].usage_available, true);
    const pair = summarize([
      {
        index: 1,
        pair: 1,
        condition: ORDER[0],
        status: "completed",
        usage: { total_tokens: 0, cached_input_tokens: null },
        wall_ms: 10,
        end_to_end_ms: 10,
      },
      {
        index: 2,
        pair: 1,
        condition: ORDER[1],
        status: "completed",
        usage: { total_tokens: 2 },
        wall_ms: 11,
        retrieval_ms: 5,
        end_to_end_ms: 16,
      },
    ]);
    assert.equal(pair.paired_delta_B_minus_A.end_to_end_ms.median, 6);
    assert.equal(pair.conditions.contexto_completo.total_tokens.median, 0);
    assert.equal(pair.conditions.contexto_completo.cached_input_tokens.n, 0);
  } finally {
    clean(dir);
  }
});
test("fixture failure closes and blocks B only, import/help are inert", async () => {
  const dir = temporary();
  let calls = 0,
    closes = 0;
  try {
    const { runs } = await runProbe({
      output: join(dir, "out"),
      prepare: async () => ({
        retrieve: async () => {
          throw Error("PRIVATE_CANARY");
        },
        close() {
          closes++;
        },
      }),
      execute: async () => {
        calls++;
        return { status: "exit_nonzero", wall_ms: 1, usage: null };
      },
    });
    assert.equal(calls, 3);
    assert.equal(closes, 3);
    assert.equal(runs.filter((r) => r.status === "local_error").length, 3);
    assert.ok(!JSON.stringify(runs).includes("PRIVATE_CANARY"));
    const inert = join(dir, "inert");
    // Import/help run with no fixture or executable Codex available in PATH.
    execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `const m = await import(${JSON.stringify(pathToFileURL(join(ROOT, "scripts/benchmarks/context-selection-probe.mjs")).href)}); await m.main(['--help']);`,
      ],
      { cwd: dir, env: { PATH: "" } },
    );
    assert.ok(!existsSync(inert));
    assert.equal(await main([]), 1);
    assert.equal(await main(["--out", dir]), 1);
  } finally {
    clean(dir);
  }
});
test("B timing counts query once and excludes setup/close; no replacement on empty retrieval", async () => {
  const dir = temporary();
  let time = 0;
  try {
    const { runs } = await runProbe({
      output: join(dir, "out"),
      clock: () => time,
      prepare: async () => {
        time += 20;
        return {
          retrieve: async () => {
            time += 5;
            return { units: [], elapsed_ms: 5 };
          },
          close() {
            time += 2;
          },
        };
      },
      execute: async ({ prompt }) => {
        if (!prompt.includes(corpus[0].content))
          assert.equal(prompt, promptFor([]));
        time += 10;
        return {
          status: "completed",
          wall_ms: 10,
          first_agent_message_completed_ms: 7,
          usage: {
            input_tokens: 10,
            cached_input_tokens: 4,
            output_tokens: 2,
            total_tokens: 12,
          },
        };
      },
    });
    assert.deepEqual(
      runs.map((r) => r.end_to_end_ms),
      [10, 15, 15, 10, 10, 15],
    );
    assert.equal(
      summarize(runs).paired_delta_B_minus_A.end_to_end_ms.median,
      5,
    );
    assert.equal(
      summarize(runs).conditions.selecao_mimir.first_agent_message_completed_ms
        .n,
      3,
    );
    for (const r of runs.filter((r) => r.condition === "selecao_mimir")) {
      assert.equal(r.setup_ms, 20);
      assert.equal(r.close_ms, 2);
      assert.equal(r.returned_count, 0);
    }
  } finally {
    clean(dir);
  }
});
