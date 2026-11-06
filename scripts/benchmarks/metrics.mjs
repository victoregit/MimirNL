import { isDeepStrictEqual } from "node:util";
import { validateCases, planCases } from "./preflight.mjs";

const SCENARIOS = ["sem_memoria", "com_mimir", "historico_completo"];
const STATUSES = ["completed", "error", "timeout", "denied", "infeasible"];
const fail = () => {
  throw new Error("Invalid offline metrics input.");
};
function shape(value, keys) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).length !== keys.length ||
    keys.some((k) => !Object.hasOwn(value, k))
  )
    fail();
}
function numberOrNull(value) {
  if (
    value !== null &&
    (typeof value !== "number" || !Number.isFinite(value) || value < 0)
  )
    fail();
}
const metric = (value, reason = null) => ({ value, reason });
const unavailable = () => metric(null, "unavailable");
function stats(values) {
  if (!values.length) return { n: 0, median: null, min: null, max: null };
  const sorted = [...values].sort((a, b) => a - b),
    middle = Math.floor(sorted.length / 2);
  return {
    n: sorted.length,
    median:
      sorted.length % 2
        ? sorted[middle]
        : sorted[middle - 1] / 2 + sorted[middle] / 2,
    min: sorted[0],
    max: sorted.at(-1),
  };
}

/** Pure experimental adapter. Caller assertions are neither execution nor source proof.
 * Re-derivation checks the entire supplied plan, including its non-executable context.
 */
export function evaluateMetrics(cases, batch) {
  try {
    return evaluate(cases, batch);
  } catch {
    fail();
  }
}
function evaluate(cases, batch) {
  validateCases(cases);
  shape(batch, [
    "adapter_version",
    "k",
    "latency_method",
    "task_success_method",
    "plan",
    "observations",
  ]);
  if (
    batch.adapter_version !== "experimental-1" ||
    !Number.isSafeInteger(batch.k) ||
    batch.k < 1 ||
    batch.latency_method !== "caller_elapsed_ms" ||
    ![null, "manual_rubric"].includes(batch.task_success_method) ||
    !Array.isArray(batch.observations)
  )
    fail();
  const plan = planCases(cases, batch.plan?.repetitions);
  if (
    !isDeepStrictEqual(plan, batch.plan) ||
    new Set(cases.map((c) => c.split)).size !== 1
  )
    fail();
  // Contract gold uses slash-joined unit IDs. Disallow ambiguous component encodings.
  if (
    cases.some((c) =>
      c.sources.some(
        (s) => s.source_id.includes("/") || s.unit_id.includes("/"),
      ),
    )
  )
    fail();
  const caseMap = new Map(cases.map((c) => [c.case_id, c]));
  const planned = new Map(plan.runs.map((r) => [r.run_id, r]));
  const observed = new Map();
  for (const o of batch.observations) {
    shape(o, [
      "run_id",
      "status",
      "truncated",
      "retrieved",
      "retrieval_latency_ms",
      "total_latency_ms",
      "task_success",
      "review",
    ]);
    const run = planned.get(o.run_id);
    if (
      !run ||
      observed.has(o.run_id) ||
      !STATUSES.includes(o.status) ||
      typeof o.truncated !== "boolean" ||
      (o.task_success !== null && typeof o.task_success !== "boolean")
    )
      fail();
    numberOrNull(o.retrieval_latency_ms);
    numberOrNull(o.total_latency_ms);
    if (o.status !== "completed" && o.task_success !== null) fail();
    if (o.task_success === null) {
      if (o.review !== null) fail();
    } else {
      shape(o.review, ["evidence_ref", "reviewer_ref"]);
      if (
        batch.task_success_method !== "manual_rubric" ||
        Object.values(o.review).some(
          (v) => typeof v !== "string" || !v.trim() || v.includes("\0"),
        )
      )
        fail();
    }
    const c = caseMap.get(run.case_id),
      units = new Map();
    if (run.scenario !== "com_mimir") {
      if (o.retrieved !== null || o.retrieval_latency_ms !== null) fail();
    } else {
      if (!Array.isArray(o.retrieved)) fail();
      for (const u of o.retrieved) {
        shape(u, ["source_id", "unit_id", "commit", "stale_status"]);
        if (
          u.commit !== run.source_commit_sha ||
          !["current", "stale", "unknown"].includes(u.stale_status) ||
          !c.sources.some(
            (s) => s.source_id === u.source_id && s.unit_id === u.unit_id,
          )
        )
          fail();
        const key = JSON.stringify([u.source_id, u.unit_id]);
        if (units.has(key) && units.get(key).stale_status !== u.stale_status)
          fail();
        if (!units.has(key)) units.set(key, u);
      }
    }
    observed.set(o.run_id, { o, units: [...units.values()] });
  }
  const runs = plan.runs.map((r) => {
    const entry = observed.get(r.run_id),
      c = caseMap.get(r.case_id);
    const retrieval = r.scenario === "com_mimir";
    let precision = metric(null, retrieval ? "not_run" : "N_A"),
      recall = precision;
    let stale = {
      ...precision,
      unique_count: null,
      stale_count: null,
      unknown_count: null,
    };
    if (entry && retrieval) {
      const { units } = entry,
        relevant = c.evaluation_private.relevant_unit_ids;
      const hits = units
        .slice(0, batch.k)
        .filter((u) => relevant.includes(`${u.source_id}/${u.unit_id}`)).length;
      precision = metric(hits / batch.k);
      recall = relevant.length
        ? metric(hits / relevant.length)
        : metric(null, "N_A");
      const staleCount = units.filter((u) => u.stale_status === "stale").length;
      const unknownCount = units.filter(
        (u) => u.stale_status === "unknown",
      ).length;
      stale = {
        ...(!units.length
          ? metric(null, "N_A")
          : unknownCount
            ? unavailable()
            : metric(staleCount / units.length)),
        unique_count: units.length,
        stale_count: staleCount,
        unknown_count: unknownCount,
      };
    }
    const o = entry?.o;
    return {
      ...r,
      status: o?.status ?? "not_run",
      truncated: o?.truncated ?? null,
      precision_at_k: precision,
      recall_at_k: recall,
      stale_rate: stale,
      source_accuracy: unavailable(),
      retrieval_latency_ms: !retrieval
        ? metric(null, "N_A")
        : o
          ? metric(
              o.retrieval_latency_ms,
              o.retrieval_latency_ms === null ? "unavailable" : null,
            )
          : metric(null, "not_run"),
      total_latency_ms: metric(
        o?.total_latency_ms ?? null,
        !o ? "not_run" : o.total_latency_ms === null ? "unavailable" : null,
      ),
      task_success: metric(
        o?.task_success === null || !o ? null : Number(o.task_success),
        !o ? "not_run" : o.task_success === null ? "unavailable" : null,
      ),
    };
  });
  const coverage = SCENARIOS.map((scenario) => {
    const selected = runs.filter((r) => r.scenario === scenario),
      attempts = selected.filter((r) => r.status !== "not_run").length;
    const counts = Object.fromEntries(
      [...STATUSES, "not_run"].map((s) => [
        s,
        selected.filter((r) => r.status === s).length,
      ]),
    );
    return {
      scenario,
      planned: selected.length,
      attempts,
      coverage: attempts / selected.length,
      counts,
      failure_rate: metric(
        attempts ? (attempts - counts.completed) / attempts : null,
        attempts ? null : "N_A",
      ),
      task_success: stats(
        selected
          .filter(
            (r) =>
              r.status === "completed" &&
              !r.truncated &&
              r.task_success.value !== null,
          )
          .map((r) => r.task_success.value),
      ),
    };
  });
  const comparisons = [];
  // Pair within the single verified plan; never silently drop failed or absent runs.
  for (const baseline of ["sem_memoria", "historico_completo"]) {
    for (const name of ["total_latency_ms", "task_success"]) {
      const differences = [],
        percentages = [],
        excluded = {},
        percentageExcluded = {};
      const mimir = runs.filter((r) => r.scenario === "com_mimir");
      for (const a of mimir) {
        const b = runs.find(
          (r) =>
            r.scenario === baseline &&
            r.case_id === a.case_id &&
            r.case_revision === a.case_revision &&
            r.repetition === a.repetition,
        );
        const reason = [a, b].some((r) => r.status === "not_run")
          ? "not_run"
          : [a, b].some((r) => r.status !== "completed")
            ? "not_completed"
            : [a, b].some((r) => r.truncated)
              ? "truncated"
              : [a, b].some((r) => r[name].value === null)
                ? "unavailable"
                : null;
        if (reason) {
          excluded[reason] = (excluded[reason] ?? 0) + 1;
          continue;
        }
        const delta = a[name].value - b[name].value;
        differences.push(delta);
        const pct = b[name].value > 0 ? (delta / b[name].value) * 100 : null;
        if (pct !== null && Number.isFinite(pct)) percentages.push(pct);
        else {
          const why = pct === null ? "baseline_zero" : "nonfinite_percentage";
          percentageExcluded[why] = (percentageExcluded[why] ?? 0) + 1;
        }
      }
      comparisons.push({
        baseline,
        metric: name,
        planned_pairs: mimir.length,
        eligible_pairs: differences.length,
        coverage: differences.length / mimir.length,
        exclusions: excluded,
        difference_mimir_minus_baseline: stats(differences),
        percentage_difference: stats(percentages),
        percentage_exclusions: percentageExcluded,
      });
    }
  }
  return {
    adapter_version: "experimental-1",
    experimental: true,
    provenance: "caller_not_verified",
    not_execution_proof: true,
    plan_executable: false,
    split: cases[0].split,
    k: batch.k,
    latency_method: batch.latency_method,
    task_success_method: batch.task_success_method,
    usage_and_cost: "not_implemented",
    retrieval_aggregation: "per_run_only",
    runs,
    coverage,
    comparisons,
  };
}
