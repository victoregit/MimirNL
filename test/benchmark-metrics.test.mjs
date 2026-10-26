import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  rmSync,
  symlinkSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { planCases } from "../scripts/benchmarks/preflight.mjs";
import { evaluateMetrics } from "../scripts/benchmarks/metrics.mjs";

function fixture(reps = 1) {
  const c = {
    contract_version: "0.1",
    case_id: "synthetic",
    case_revision: 1,
    illustrative_only: false,
    split: "development",
    source: { repository: "synthetic", commit_sha: "a".repeat(40) },
    sources: ["a", "b", "c"].map((id) => ({
      source_id: id,
      unit_id: "unit",
      path: "PRIVATE_PATH",
      start_line: 1,
      end_line: 1,
      excerpt: "PRIVATE_EXCERPT",
      sha256: createHash("sha256").update("PRIVATE_EXCERPT").digest("hex"),
    })),
    model_context: {
      task: "PRIVATE_TASK",
      allowed_source_ids: ["a", "b", "c"],
    },
    evaluation_private: {
      gold_status: "validated",
      expected_answer: "PRIVATE_GOLD",
      relevant_unit_ids: ["a/unit", "c/unit"],
      success_criteria: ["PRIVATE_SUCCESS"],
      rubric: [{ id: "r", criterion: "PRIVATE_CRITERION", weight: 1 }],
    },
    review: {
      author: "PRIVATE_AUTHOR",
      source_reviewer: "PRIVATE_REVIEWER",
      codex_review_ref: "PRIVATE_CODEX",
      human_acceptance_ref: "PRIVATE_ACCEPT",
      decision: "accepted",
      notes: "PRIVATE_NOTES",
    },
    permissions_ref: "PRIVATE_PERMISSION",
  };
  const cases = [c],
    plan = planCases(cases, reps);
  const unit = (source_id, stale_status = "current") => ({
    source_id,
    unit_id: "unit",
    commit: c.source.commit_sha,
    stale_status,
  });
  const batch = {
    adapter_version: "experimental-1",
    k: 3,
    latency_method: "caller_elapsed_ms",
    task_success_method: "manual_rubric",
    plan,
    observations: plan.runs.map((r) => ({
      run_id: r.run_id,
      status: "completed",
      truncated: false,
      retrieved:
        r.scenario === "com_mimir"
          ? [unit("a"), unit("a"), unit("b", "stale")]
          : null,
      retrieval_latency_ms: r.scenario === "com_mimir" ? 2 : null,
      total_latency_ms: r.scenario === "com_mimir" ? 5 : 10,
      task_success: r.scenario !== "com_mimir",
      review: {
        evidence_ref: "PRIVATE_EVIDENCE",
        reviewer_ref: "PRIVATE_MANUAL_REVIEWER",
      },
    })),
  };
  return { cases, batch, unit };
}
const mimir = (b) => b.observations.find((o) => o.retrieved !== null);
const report = (f) => evaluateMetrics(f.cases, f.batch);

test("synthetic formulas deduplicate before k; fixed denominator and no private output", () => {
  const f = fixture(),
    r = report(f),
    m = r.runs.find((r) => r.scenario === "com_mimir");
  assert.equal(m.precision_at_k.value, 1 / 3);
  assert.equal(m.recall_at_k.value, 1 / 2);
  assert.deepEqual(m.stale_rate, {
    value: 1 / 2,
    reason: null,
    unique_count: 2,
    stale_count: 1,
    unknown_count: 0,
  });
  assert.equal(m.retrieval_latency_ms.value, 2);
  assert.equal(m.total_latency_ms.value, 5);
  assert.equal(m.source_accuracy.reason, "unavailable");
  assert.equal(JSON.stringify(r).includes("PRIVATE_"), false);
  assert.equal(r.not_execution_proof, true);
  assert.equal(r.plan_executable, false);
  for (const p of r.comparisons) {
    assert.equal(p.eligible_pairs, 1);
    assert.equal(
      p.difference_mimir_minus_baseline.median,
      p.metric === "task_success" ? -1 : -5,
    );
    assert.equal(
      p.percentage_difference.median,
      p.metric === "task_success" ? -100 : -50,
    );
  }
  f.batch.observations.reverse();
  assert.deepEqual(report(f), r);
});

test("N_A, unknown, null and measured zero remain distinct", () => {
  const f = fixture();
  mimir(f.batch).retrieved[0].stale_status = "unknown";
  mimir(f.batch).retrieved[1].stale_status = "unknown";
  let r = report(f);
  assert.equal(
    r.runs.find((r) => r.scenario === "com_mimir").stale_rate.reason,
    "unavailable",
  );
  mimir(f.batch).retrieved = [];
  f.cases[0].evaluation_private.relevant_unit_ids = [];
  mimir(f.batch).retrieval_latency_ms = 0;
  mimir(f.batch).total_latency_ms = null;
  r = report(f);
  const m = r.runs.find((r) => r.scenario === "com_mimir");
  assert.equal(m.stale_rate.reason, "N_A");
  assert.equal(m.recall_at_k.reason, "N_A");
  assert.equal(m.precision_at_k.value, 0);
  assert.equal(m.retrieval_latency_ms.value, 0);
  assert.equal(m.total_latency_ms.reason, "unavailable");
  assert.equal(
    r.runs.find((r) => r.scenario === "sem_memoria").precision_at_k.reason,
    "N_A",
  );
  f.batch.observations = [];
  r = report(f);
  assert.equal(r.runs.length, 3);
  assert.equal(r.coverage[0].attempts, 0);
  assert.equal(r.coverage[0].failure_rate.reason, "N_A");
});

test("pair exclusions, failures, missing observations and positive/zero baselines are visible", () => {
  const f = fixture(8),
    groups = Array.from({ length: 8 }, (_, i) =>
      f.batch.plan.runs.filter((r) => r.repetition === i + 1),
    );
  const obs = (i, scenario) =>
    f.batch.observations.find(
      (o) => o.run_id === groups[i].find((r) => r.scenario === scenario).run_id,
    );
  obs(0, "com_mimir").total_latency_ms = 20;
  obs(1, "sem_memoria").total_latency_ms = 0;
  obs(1, "sem_memoria").task_success = false;
  obs(2, "com_mimir").truncated = true;
  for (const [i, status] of [
    [3, "error"],
    [4, "denied"],
    [5, "infeasible"],
    [6, "timeout"],
  ]) {
    const o = obs(i, "com_mimir");
    o.status = status;
    o.task_success = null;
    o.review = null;
  }
  f.batch.observations = f.batch.observations.filter(
    (o) => o !== obs(7, "sem_memoria"),
  );
  const r = report(f),
    p = r.comparisons.find(
      (p) => p.baseline === "sem_memoria" && p.metric === "total_latency_ms",
    );
  assert.equal(p.eligible_pairs, 2);
  assert.equal(p.coverage, 2 / 8);
  assert.deepEqual(p.exclusions, {
    truncated: 1,
    not_completed: 4,
    not_run: 1,
  });
  assert.deepEqual(p.difference_mimir_minus_baseline, {
    n: 2,
    median: 7.5,
    min: 5,
    max: 10,
  });
  assert.equal(p.percentage_exclusions.baseline_zero, 1);
  const c = r.coverage.find((c) => c.scenario === "com_mimir");
  assert.equal(c.attempts, 8);
  assert.equal(c.failure_rate.value, 0.5);
  for (const s of ["error", "denied", "infeasible", "timeout"])
    assert.equal(c.counts[s], 1);
  assert.equal(
    r.coverage.find((c) => c.scenario === "sem_memoria").attempts,
    7,
  );
  mimir(f.batch).total_latency_ms = null;
  assert.equal(report(f).comparisons[0].exclusions.unavailable, 1);
});

test("reject tampered plans, mixed cases, invalid observations and numeric edge cases privately", () => {
  const mutations = [
    (f) => f.batch.observations.push(structuredClone(f.batch.observations[0])),
    (f) => (mimir(f.batch).run_id = "PRIVATE_FOREIGN"),
    (f) => (mimir(f.batch).retrieved[0].unit_id = "PRIVATE_MISSING"),
    (f) => (mimir(f.batch).retrieved[0].commit = "b".repeat(40)),
    (f) => (mimir(f.batch).retrieved[1].stale_status = "unknown"),
    (f) => (mimir(f.batch).PRIVATE_RAW = "PRIVATE_GOLD"),
    (f) => (mimir(f.batch).review.extra = "PRIVATE_GOLD"),
    (f) => (mimir(f.batch).status = "unknown"),
    (f) => (mimir(f.batch).status = "error"),
    (f) => (f.batch.task_success_method = null),
    (f) => (f.batch.latency_method = "other"),
    (f) => (f.batch.observations[0].retrieved = []),
    (f) => {
      const other = structuredClone(f.cases[0]);
      other.case_id = "second";
      other.split = "evaluation";
      f.cases.push(other);
      f.batch.plan = planCases(f.cases, 1);
    },
    ...[0, -1, NaN, Infinity, 1.5].map((v) => (f) => (f.batch.k = v)),
    ...[-1, NaN, Infinity, "0"].map(
      (v) => (f) => (mimir(f.batch).total_latency_ms = v),
    ),
    ...[
      "run_id",
      "case_id",
      "case_revision",
      "scenario",
      "repetition",
      "source_commit_sha",
      "scenario_order",
      "status",
    ].map((key) => (f) => (f.batch.plan.runs[0][key] = "PRIVATE_TAMPERED")),
    (f) => f.batch.plan.runs.push(f.batch.plan.runs[0]),
    (f) => (f.batch.plan.executable = true),
    (f) => (f.batch.plan.pending_decisions = []),
    (f) => (f.batch.plan.repetitions = 2),
    (f) => (f.cases[0].evaluation_private.gold_status = "sem_gold"),
  ];
  for (const mutate of mutations) {
    const f = fixture();
    mutate(f);
    assert.throws(() => report(f), /^Error: Invalid offline metrics input\.$/);
  }
});

test("actual CLI is read-only by default, private and exclusively creates reports", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "mimir-metrics-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const cases = join(dir, "PRIVATE_CASES.json"),
    batch = join(dir, "PRIVATE_BATCH.json"),
    output = join(dir, "report.json");
  const cli = new URL("../scripts/benchmarks/metrics-cli.mjs", import.meta.url)
    .pathname;
  const run = (...args) =>
    spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
  const f = fixture();
  writeFileSync(cases, JSON.stringify(f.cases));
  writeFileSync(batch, JSON.stringify(f.batch));
  assert.equal(run("--help").status, 0);
  const readOnly = run(cases, batch);
  assert.equal(readOnly.status, 0);
  assert.deepEqual(JSON.parse(readOnly.stdout), report(f));
  assert.equal(run(cases, batch, "--out", output).status, 0);
  const bytes = readFileSync(output);
  assert.equal(statSync(output).mode & 0o777, 0o600);
  assert.equal(run(cases, batch, "--out", output).status, 1);
  const link = join(dir, "link");
  symlinkSync(output, link);
  assert.equal(run(cases, batch, "--out", link).status, 1);
  assert.deepEqual(readFileSync(output), bytes);
  for (const args of [
    [cases],
    [cases, batch, "--extra", output],
    ["PRIVATE_MISSING", batch],
  ]) {
    const r = run(...args);
    assert.equal(r.status, 1);
    assert.equal((r.stdout + r.stderr).includes("PRIVATE_"), false);
  }
  for (const content of [
    '{"PRIVATE_INVALID":',
    JSON.stringify({ ...f.batch, PRIVATE_EXTRA: "PRIVATE_RAW" }),
  ]) {
    writeFileSync(batch, content);
    const r = run(cases, batch);
    assert.equal(r.status, 1);
    assert.equal((r.stdout + r.stderr).includes("PRIVATE_"), false);
  }
  const imported = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `await import(${JSON.stringify(new URL("../scripts/benchmarks/metrics-cli.mjs", import.meta.url).href)})`,
    ],
    { encoding: "utf8", cwd: dir },
  );
  assert.equal(imported.status, 0);
  assert.equal(imported.stdout + imported.stderr, "");
});
