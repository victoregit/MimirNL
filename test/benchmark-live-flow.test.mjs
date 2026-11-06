import { assertPrivateMode } from "./platform-fixture.mjs";
import { tmpdir } from "node:os";
import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  rmSync,
  readFileSync,
  readdirSync,
  statSync,
  existsSync,
} from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import {
  runFlow,
  summarize,
  argsCodex,
  main,
} from "../scripts/benchmarks/live-flow-probe.mjs";
import {
  loadCorpus,
  prepareRetrieval,
  promptFor,
  ORDER,
  argsFor,
} from "../scripts/benchmarks/context-selection-probe.mjs";
import { sha256 } from "../scripts/benchmarks/paired-probe.mjs";
const corpus = loadCorpus();
const temp = () => mkdtempSync(join(tmpdir(), "mimir-flow-test-"));
const clean = (dir) => rmSync(dir, { recursive: true, force: true });
const completed = {
  status: "completed",
  wall_ms: 999,
  usage: null,
  response: "FINAL",
};
test("live real Service search is inside each request, no replay; context recorded before transport", async () => {
  const dir = temp(),
    out = join(dir, "out"),
    sequence = [];
  let time = 0,
    call = 0;
  try {
    const result = await runFlow({
      out,
      clock: () => time,
      prepare: async (...args) => {
        sequence.push("setup");
        time += 20;
        const fixture = await prepareRetrieval(...args);
        return {
          retrieve: async () => {
            sequence.push("search");
            time += 5;
            const result = await fixture.retrieve();
            time += 2;
            return result;
          },
          close: () => {
            sequence.push("close");
            time += 3;
            fixture.close();
          },
        };
      },
      transportImpl: async ({ prompt, scratch, timeoutMs }) => {
        call++;
        sequence.push(`call${call}`);
        const plan = JSON.parse(readFileSync(join(out, "plan.json")));
        assert.equal(
          plan.future_selections,
          "unknown until each live retrieval",
        );
        assert.equal(plan.order.length, 6);
        assert.ok(!JSON.stringify(plan).includes("envelope_sha256"));
        const context = JSON.parse(
          readFileSync(join(out, `run-context-${call}.json`)),
        );
        assert.equal(context.envelope_sha256, sha256(prompt));
        assert.deepEqual(readdirSync(scratch), []);
        assert.ok(timeoutMs <= 90000);
        const units = context.context;
        if (ORDER[call - 1] === ORDER[0])
          assert.equal(prompt, promptFor(corpus));
        else {
          assert.ok(units.length <= 3);
          assert.equal(sequence.at(-2), "search");
        }
        for (const unit of units)
          assert.equal(prompt.split(unit.content).length - 1, 1);
        assert.equal(new Set(units.map((u) => u.source)).size, units.length);
        time += 10;
        return completed;
      },
    });
    assert.equal(call, 6);
    assert.deepEqual(sequence, [
      "call1",
      "setup",
      "search",
      "call2",
      "close",
      "setup",
      "search",
      "call3",
      "close",
      "call4",
      "call5",
      "setup",
      "search",
      "call6",
      "close",
    ]);
    assert.deepEqual(
      result.runs.map((r) => r.end_to_end_ms),
      [10, 17, 17, 10, 10, 17],
    );
    for (const r of result.runs.filter((r) => r.condition === ORDER[1])) {
      assert.equal(r.setup_ms, 20);
      assert.equal(r.close_ms, 3);
      assert.ok(r.returned_count > 0);
      assert.ok(!("response" in r));
    }
    assertPrivateMode(out, 0o700);
    for (const f of readdirSync(out)) {
      assertPrivateMode(join(out, f), 0o600);
      if (f.endsWith(".json"))
        assert.ok(!readFileSync(join(out, f), "utf8").includes("FINAL"));
    }
    assert.ok(!existsSync(join(out, "scratch")));
    assert.ok(!readdirSync(out).some((f) => f.startsWith("fixture")));
    await assert.rejects(
      runFlow({ out, transportImpl: () => assert.fail("exclusive") }),
    );
    assert.deepEqual(argsCodex("/tmp/scratch"), [
      ...argsFor("/tmp/scratch"),
      "--disable",
      "apps",
      "--disable",
      "plugins",
      "--disable",
      "multi_agent",
    ]);
  } finally {
    clean(dir);
  }
});
test("AG injection, unknown usage/cache semantics, empty selection, continuous time and no invented totals", async () => {
  const dir = temp();
  let time = 0,
    calls = 0;
  try {
    const { runs } = await runFlow({
      host: "antigravity",
      out: join(dir, "out"),
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
      transportImpl: async ({ prompt }) => {
        calls++;
        if (ORDER[calls - 1] === ORDER[1]) assert.equal(prompt, promptFor([]));
        time += 10;
        return {
          ...completed,
          usage: {
            input_tokens: 10,
            cached_input_tokens: null,
            output_tokens: 2,
            total_tokens: null,
          },
          provider_usage: { cache_read_tokens: 5 },
          usage_missing_reason: "cache relation and total unknown",
        };
      },
    });
    assert.equal(calls, 6);
    assert.deepEqual(
      runs.map((r) => r.end_to_end_ms),
      [10, 15, 15, 10, 10, 15],
    );
    assert.equal(runs[0].requested_model, "gemini-3.8-flash-high");
    const s = summarize(runs);
    assert.equal(s.conditions.contexto_completo.total_tokens.n, 0);
    assert.equal(
      s.conditions.contexto_completo.cached_input_tokens.median,
      null,
    );
    assert.equal(s.metric_exclusions.total_tokens.length, 6);
    assert.deepEqual(s.eligible_pairs.end_to_end_ms, [1, 2, 3]);
    assert.equal(s.paired_delta_B_minus_A.end_to_end_ms.median, 5);
    assert.ok(!JSON.stringify(s).includes("percent"));
  } finally {
    clean(dir);
  }
});
test("integrity/search failures block B, close errors handled; response never leaks into metadata", async () => {
  const dir = temp();
  let calls = 0,
    closed = 0;
  try {
    const { runs } = await runFlow({
      out: join(dir, "out"),
      prepare: async () => ({
        retrieve: async () => ({
          units: [corpus[0], corpus[0]],
          elapsed_ms: 1,
        }),
        close() {
          closed++;
          throw Error("CANARY");
        },
      }),
      transportImpl: async () => {
        calls++;
        return {
          ...completed,
          status: "timeout",
          exit_code: null,
          signal: "SIGKILL",
          timeout: true,
        };
      },
    });
    assert.equal(calls, 3);
    assert.equal(closed, 3);
    assert.equal(runs.filter((r) => r.status === "local_error").length, 3);
    assert.equal(runs[0].status, "timeout");
    assert.ok(!JSON.stringify(runs).includes("CANARY"));
    assert.ok(!existsSync(join(dir, "out", "scratch")));
  } finally {
    clean(dir);
  }
});
test("global deadline limits calls, import/help inert, invalid CLI and output rejected", async () => {
  const dir = temp();
  let time = 0,
    calls = 0;
  try {
    const { runs } = await runFlow({
      out: join(dir, "out"),
      clock: () => time,
      transportImpl: async () => {
        calls++;
        time = 600001;
        return completed;
      },
    });
    assert.equal(calls, 1);
    assert.equal(runs.filter((r) => r.status === "not_run").length, 5);
    assert.equal(await main([]), 1);
    assert.equal(await main(["--run", "--host", "unknown"]), 1);
    assert.equal(
      await main(["--run", "--host", "codex", "--host", "codex"]),
      1,
    );
    await assert.rejects(
      runFlow({ out: "/var/forbidden", transportImpl: () => assert.fail() }),
    );
    execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `const m=await import(${JSON.stringify(new URL("../scripts/benchmarks/live-flow-probe.mjs", import.meta.url).href)});await m.main(['--help']);`,
      ],
      { cwd: dir, env: { PATH: "" } },
    );
  } finally {
    clean(dir);
  }
});
test("missing AG adapter fails before corpus, output, fixture or transport", async () => {
  const dir = temp(),
    out = join(dir, "out");
  try {
    await assert.rejects(
      runFlow({
        host: "antigravity",
        out,
        loadAdapter: async () => {
          throw Object.assign(Error("missing"), {
            code: "ERR_MODULE_NOT_FOUND",
          });
        },
        prepare: () => assert.fail("no setup"),
      }),
      { code: "ERR_MODULE_NOT_FOUND" },
    );
    assert.equal(existsSync(out), false);
  } finally {
    clean(dir);
  }
});
