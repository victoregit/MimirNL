import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { HOST } from "../scripts/benchmarks/abc-transport.mjs";
import { readFileSync, existsSync } from "node:fs";
import {
  buildPlan,
  validatePlan,
  prompts,
  authorize,
  runSequence,
  ROOT,
  OUT,
  NODE,
  LIMITS,
} from "../scripts/benchmarks/ef03-pilot.mjs";
import { canonical, hash } from "../scripts/benchmarks/contract-v02.mjs";
const ok = () => ({
  status: "completed",
  exit_code: 0,
  response: "synthetic final",
  usage: { input_tokens: 10, cached_input_tokens: 3, output_tokens: 2 },
  wall_ms: 2,
});
const execute = (extra = {}) =>
  runSequence({
    requests: prompts(),
    scratch: "/unused-fake",
    transport: async () => ok(),
    ...extra,
  });
// Plan rebuilding fingerprints fixed POSIX host executables. Pure assembly and
// fake transport tests below remain portable and never require those binaries.
const posixPlan = {
  skip:
    process.platform === "win32" ||
    !existsSync(NODE) ||
    !existsSync(HOST.binary)
      ? "Historical pilot131 fingerprints require the fixed Linux host/runtime binaries"
      : false,
};
test(
  "historical POSIX plan fingerprints reject inventory and limit drift",
  posixPlan,
  () => {
    const p = buildPlan();
    assert.equal(validatePlan(p), p);
    for (const mutate of [
      (q) => (q.limits.attempts = 5),
      (q) => (q.host.requested_model = "other"),
      (q) => (q.inventory[Object.keys(q.inventory)[0]] = "0".repeat(64)),
      (q) => q.requests.reverse(),
      (q) => (q.extra = true),
    ]) {
      const q = structuredClone(p);
      mutate(q);
      assert.throws(() => validatePlan(q));
    }
  },
);
test("exact-only prompt change preserves original suffix/order/selections", () => {
  const rs = prompts();
  assert.deepEqual(
    rs.map((r) => [r.position, r.base_overlap]),
    [
      [1, "preserve"],
      [1, "exact-v1"],
      [3, "exact-v1"],
      [3, "preserve"],
    ],
  );
  assert.deepEqual(
    rs.map((r) => r.prompt_bytes),
    [4065, 2489, 4676, 8193],
  );
  for (const [i, j] of [
    [0, 1],
    [3, 2],
  ]) {
    const a = JSON.parse(rs[i].prompt),
      b = JSON.parse(rs[j].prompt);
    assert.deepEqual(
      a.retrieved.filter(
        (s) => !a.sources.some((t) => canonical(s) === canonical(t)),
      ),
      b.retrieved,
    );
    delete a.retrieved;
    delete b.retrieved;
    assert.deepEqual(a, b);
    assert.deepEqual(rs[i].selection, rs[j].selection);
    assert.doesNotMatch(
      rs[i].prompt,
      /quality-gates|review132|supervisor|expected_answer/,
    );
  }
});
test("authorization strict, externally supplied review bound to plan and output", () => {
  const p = JSON.parse(
      readFileSync(ROOT + "tasks/131-ef03-pilot/plan.json", "utf8"),
    ),
    review = "synthetic review only",
    a = {
      schema_version: "ef03-pilot-authorization-131-v1",
      plan_sha256: p.sha256,
      review_task: 132,
      review_sha256: hash(review),
      reviewer_ref: "test-reviewer",
      supervisor_ref: "test-supervisor",
      verdict: "APPROVE",
      epoch: 1,
      max_attempts: 4,
      output: OUT,
    };
  authorize(p, a, review);
  for (const change of [
    { verdict: "PROPOSED_INVALID" },
    { max_attempts: 54 },
    { plan_sha256: "0".repeat(64) },
    { review_task: 130 },
    { review_sha256: "0".repeat(64) },
    { supervisor_ref: a.reviewer_ref },
    { epoch: 2 },
    { output: "/tmp/else" },
    { extra: true },
  ])
    assert.throws(() => authorize(p, { ...a, ...change }, review));
  assert.throws(() => authorize(p, null, review));
});
test("four sequential fake calls only, usage/final allowlist and unknown metadata", async () => {
  let active = 0,
    n = 0;
  const seen = [];
  const r = await execute({
    transport: async (opts) => {
      assert.equal(++active, 1);
      n++;
      seen.push(hash(opts.prompt));
      assert.equal(opts.timeoutMs, 90000);
      assert.equal(opts.outputBytes, 64000);
      active--;
      return {
        ...ok(),
        stderr: "must not export",
        reasoning: "must not export",
        collector: { private: "must not export" },
      };
    },
  });
  assert.equal(n, 4);
  assert.equal(r.attempts, 4);
  assert.equal(r.stopped, false);
  assert.deepEqual(
    seen,
    prompts().map((p) => p.prompt_sha256),
  );
  assert.equal(r.runs[0].usage.uncached_input_tokens, 7);
  assert.equal(r.runs[0].observed_model, null);
  assert.equal(r.runs[0].retrieval_latency_ms, null);
  assert.doesNotMatch(JSON.stringify(r), /must not export/);
});
test("failure/timeout/tool/oversize/throw stop immediately, no retry or fallback", async () => {
  for (const response of [
    { status: "timeout" },
    { ...ok(), tools_detected: true },
    { ...ok(), response: "x".repeat(64001) },
    { ...ok(), exit_code: 1 },
    { status: "failed" },
    null,
  ]) {
    let n = 0;
    const r = await execute({
      transport: async () => {
        n++;
        if (response === null) throw Error("secret diagnostic");
        return response;
      },
    });
    assert.equal(n, 1);
    assert.equal(r.attempts, 1);
    assert.equal(r.stopped, true);
    assert.deepEqual(
      r.runs.slice(1).map((x) => x.status),
      ["not_run", "not_run", "not_run"],
    );
    assert.doesNotMatch(JSON.stringify(r), /secret diagnostic/);
  }
});
test("global preflight budget and per-call timeout consume attempts as appropriate", async () => {
  let n = 0,
    t = LIMITS.global_ms;
  const transport = async () => {
    n++;
    t += 90001;
    return ok();
  };
  let r = await execute({ started: 0, clock: () => t, transport });
  assert.equal(n, 0);
  assert.equal(r.attempts, 0);
  t = 0;
  r = await execute({ started: 0, clock: () => t, transport });
  assert.equal(n, 1);
  assert.equal(r.runs[0].status, "timeout");
  t = LIMITS.global_ms - 10;
  n = 0;
  r = await execute({
    started: 0,
    clock: () => t,
    transport: async (opts) => {
      n++;
      assert.equal(opts.timeoutMs, 10);
      t += 11;
      return ok();
    },
  });
  assert.equal(n, 1);
  assert.equal(r.runs[0].status, "timeout");
  const requests = prompts();
  requests[0].prompt = "x".repeat(32001);
  n = 0;
  r = await execute({
    requests,
    transport: async () => {
      n++;
      return ok();
    },
  });
  assert.equal(n, 0);
  assert.equal(r.runs[0].status, "infeasible");
  await assert.rejects(execute({ requests: requests.slice(1) }));
});
test("launcher import/default/help/invalid args cannot invoke model or create destination", () => {
  const file = ROOT + "scripts/benchmarks/ef03-pilot-launch.mjs";
  // A previously consumed epoch may already exist. Inert commands must preserve
  // its presence; never delete, rearm or read execution/authorization contents.
  const existedBefore = existsSync(OUT);
  for (const args of [
    [],
    ["--help"],
    ["--live"],
    ["--live", "relative", "relative"],
    [
      "--live",
      ROOT + "tasks/131-ef03-pilot/plan.json",
      ROOT + "tasks/131-ef03-pilot/quality.json",
    ],
  ]) {
    const x = spawnSync(process.execPath, [file, ...args], {
      encoding: "utf8",
    });
    assert.equal(x.status, args.length <= 1 && args[0] !== "--live" ? 0 : 1);
    assert.equal(existsSync(OUT), existedBefore);
  }
  const x = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `await import(${JSON.stringify(pathToFileURL(file).href)})`,
    ],
    { encoding: "utf8" },
  );
  assert.equal(x.status, 0);
  assert.equal(x.stdout, "");
  assert.equal(x.stderr, "");
  const src = readFileSync(file, "utf8");
  assert.match(src, /flag: "wx"/);
  assert.match(src, /setInterval/);
  assert.match(src, /boundedSpawn/);
});

test("aggregate capture guard terminates owned fake child without retaining streams", async () => {
  const { boundedSpawn } = await import(
    "../scripts/benchmarks/ef03-pilot-launch.mjs"
  );
  const { PassThrough } = await import("node:stream");
  let killed = 0,
    spawned = 0;
  const child = {
    stdout: new PassThrough(),
    stderr: new PassThrough(),
    kill: () => {
      killed++;
    },
  };
  child.stdout.on("error", () => {});
  const returned = boundedSpawn("fake", [], {}, () => {
    spawned++;
    return child;
  });
  assert.equal(returned, child);
  child.stdout.write(Buffer.alloc(32000));
  child.stderr.write(Buffer.alloc(32000));
  assert.equal(killed, 0);
  child.stdout.write(Buffer.alloc(1));
  assert.equal(child.ef03_capture_limit, true);
  assert.equal(killed, 1);
  assert.equal(spawned, 1);
  child.stdout.destroy();
  child.stderr.destroy();
});
