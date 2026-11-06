import { exact, fail } from "./public-bundle.mjs";
import { makePlan, canonical, nonempty, ARMS } from "./contract-v02.mjs";
const metric = (value, reason = null) => ({ value, reason });
const absent = (reason) => metric(null, reason);
const statuses = [
  "completed",
  "error",
  "timeout",
  "denied",
  "infeasible",
  "not_run",
];
function number(v) {
  if (v !== null && (typeof v !== "number" || !Number.isFinite(v) || v < 0))
    fail();
}
function review(r) {
  exact(r, ["reviewer_ref", "evidence_ref"]);
  nonempty(r.reviewer_ref);
  nonempty(r.evidence_ref);
}
export function stats(values) {
  const a = [...values].sort((a, b) => a - b),
    n = a.length;
  return {
    n,
    median: n
      ? n % 2
        ? a[(n - 1) / 2]
        : a[n / 2 - 1] / 2 + a[n / 2] / 2
      : null,
    min: n ? a[0] : null,
    max: n ? a[n - 1] : null,
  };
}
// Every factual claim must be explicitly listed by a reviewer. No response is
// automatically scored and a citation alone is never evidence of entailment.
function sourceAccuracy(value, c, b) {
  if (value === null) return absent("unavailable");
  exact(value, ["review", "claims"]);
  review(value.review);
  if (!Array.isArray(value.claims)) fail();
  let supported = 0;
  const seen = new Set();
  for (const claim of value.claims) {
    exact(claim, ["claim_id", "text", "supported", "citations"]);
    nonempty(claim.claim_id);
    nonempty(claim.text);
    if (
      seen.has(claim.claim_id) ||
      typeof claim.supported !== "boolean" ||
      !Array.isArray(claim.citations)
    )
      fail();
    seen.add(claim.claim_id);
    for (const x of claim.citations) {
      exact(x, ["unit", "excerpt"]);
      nonempty(x.excerpt);
      if (
        !c.pool.includes(x.unit) ||
        !b.sources
          .find((s) => s.source_id + "/" + s.unit_id === x.unit)
          ?.excerpt.includes(x.excerpt)
      )
        fail();
    }
    if (claim.supported && !claim.citations.length) fail();
    if (claim.supported) supported++;
  }
  return {
    ...(value.claims.length
      ? metric(supported / value.claims.length)
      : absent("N_A")),
    supported_claims: supported,
    evaluable_claims: value.claims.length,
  };
}
function outcome(value, c) {
  if (value === null) return absent("unavailable");
  exact(value, [
    "review",
    "items",
    "word_limit",
    "citation_requirement",
    "abstention_requirement",
  ]);
  review(value.review);
  if (
    !Array.isArray(value.items) ||
    value.items.length !== c.evaluation.rubric.length ||
    new Set(value.items.map((x) => x.id)).size !== value.items.length
  )
    fail();
  for (const x of value.items) {
    exact(x, ["id", "satisfied"]);
    if (
      typeof x.satisfied !== "boolean" ||
      !c.evaluation.rubric.some((r) => r.id === x.id)
    )
      fail();
  }
  for (const key of [
    "word_limit",
    "citation_requirement",
    "abstention_requirement",
  ])
    if (![true, false, null].includes(value[key])) fail();
  const weight = c.evaluation.rubric.reduce((n, r) => n + r.weight, 0),
    score =
      c.evaluation.rubric.reduce(
        (n, r) =>
          n + (value.items.find((x) => x.id === r.id).satisfied ? r.weight : 0),
        0,
      ) / weight;
  const known = [
    "word_limit",
    "citation_requirement",
    "abstention_requirement",
  ].every((k) => value[k] !== null);
  return {
    ...(known
      ? metric(
          Number(
            score === 1 &&
              value.word_limit &&
              value.citation_requirement &&
              value.abstention_requirement,
          ),
        )
      : absent("unavailable")),
    rubric_score: score,
    requirements: {
      word_limit: value.word_limit,
      citation_requirement: value.citation_requirement,
      abstention_requirement: value.abstention_requirement,
    },
  };
}
function freshness(units, c, b) {
  const counts = { current: 0, stale: 0, unknown: 0, total: units.length };
  for (const u of units) {
    if (!["current", "stale", "unknown"].includes(u.freshness.status)) fail();
    exact(u.freshness, ["status", "current_reference", "review"]);
    if (u.freshness.status === "unknown") {
      if (u.freshness.current_reference !== null || u.freshness.review !== null)
        fail();
    } else {
      review(u.freshness.review);
      const r = u.freshness.current_reference;
      exact(r, ["unit", "sha256", "excerpt", "reason"]);
      nonempty(r.reason);
      nonempty(r.excerpt);
      const s = b.sources.find((s) => s.source_id + "/" + s.unit_id === r.unit);
      // A current reference is an evaluated, fixed source from the public bundle.
      // A different hash/version alone does not establish semantic obsolescence.
      if (
        !s ||
        !c.pool.includes(r.unit) ||
        s.sha256 !== r.sha256 ||
        !s.excerpt.includes(r.excerpt)
      )
        fail();
    }
    counts[u.freshness.status]++;
  }
  return {
    ...(!units.length
      ? absent("N_A")
      : counts.unknown
        ? absent("unavailable")
        : metric(counts.stale / counts.total)),
    ...counts,
  };
}
export function evaluateMetricsV02(cases, b, batch) {
  exact(batch, ["schema_version", "plan", "observations"]);
  if (
    batch.schema_version !== "metrics-input-0.2" ||
    !Array.isArray(batch.observations)
  )
    fail();
  const plan = makePlan(cases, b, cases[0]?.split === "development" ? 1 : 3);
  if (canonical(plan) !== canonical(batch.plan)) fail();
  const observed = new Map(),
    planned = new Map(plan.runs.map((r) => [r.run_id, r]));
  for (const o of batch.observations) {
    exact(o, [
      "run_id",
      "status",
      "truncated",
      "retrieved",
      "retrieval_latency_ms",
      "total_latency_ms",
      "source_review",
      "outcome",
      "input_tokens",
      "output_tokens",
      "cached_input_tokens",
    ]);
    const r = planned.get(o.run_id);
    if (
      !r ||
      observed.has(o.run_id) ||
      !statuses.includes(o.status) ||
      o.status === "not_run" ||
      typeof o.truncated !== "boolean"
    )
      fail();
    for (const key of [
      "retrieval_latency_ms",
      "total_latency_ms",
      "input_tokens",
      "output_tokens",
      "cached_input_tokens",
    ])
      number(o[key]);
    for (const key of ["input_tokens", "output_tokens", "cached_input_tokens"])
      if (o[key] !== null && !Number.isSafeInteger(o[key])) fail();
    if (
      o.cached_input_tokens !== null &&
      (o.input_tokens === null || o.cached_input_tokens > o.input_tokens)
    )
      fail();
    if (
      o.retrieval_latency_ms !== null &&
      o.total_latency_ms !== null &&
      o.retrieval_latency_ms > o.total_latency_ms
    )
      fail();
    if (
      r.scenario !== "com_mimir" &&
      (o.retrieved !== null || o.retrieval_latency_ms !== null)
    )
      fail();
    if (
      r.scenario === "com_mimir" &&
      o.retrieved !== null &&
      !Array.isArray(o.retrieved)
    )
      fail();
    if (
      (o.status !== "completed" || o.truncated) &&
      (o.source_review !== null || o.outcome !== null)
    )
      fail();
    observed.set(o.run_id, o);
  }
  const runs = plan.runs.map((r) => {
    const o = observed.get(r.run_id),
      c = cases.find((c) => c.case_id === r.case_id),
      isB = r.scenario === "com_mimir",
      eligible = o?.status === "completed" && !o.truncated;
    const reason = !o
      ? "not_run"
      : o.status !== "completed"
        ? "not_completed"
        : o.truncated
          ? "truncated"
          : "unavailable";
    let precision = absent(isB ? reason : "N_A"),
      recall = precision,
      stale = precision;
    if (o?.retrieved !== null && o?.retrieved !== undefined) {
      const unique = new Map();
      for (const u of o.retrieved) {
        exact(u, ["unit", "freshness"]);
        if (!c.pool.includes(u.unit)) fail();
        if (
          unique.has(u.unit) &&
          canonical(unique.get(u.unit)) !== canonical(u)
        )
          fail();
        unique.set(u.unit, u);
      }
      // Dedup by canonical content, matching the frozen retrieval policy, before k.
      const seenHashes = new Set(),
        units = [];
      for (const u of unique.values()) {
        const sha = b.sources.find(
          (s) => s.source_id + "/" + s.unit_id === u.unit,
        ).sha256;
        if (!seenHashes.has(sha)) {
          seenHashes.add(sha);
          units.push(u);
        }
      }
      const allFresh = freshness(units, c, b);
      if (eligible) {
        stale = allFresh;
        const relevant = c.evaluation.relevant_units;
        if (
          relevant === null ||
          c.technical_review.status !== "technical_reviewed"
        )
          precision = recall = absent("sem_gold");
        else {
          const hits = units
            .slice(0, 3)
            .filter((u) => relevant.includes(u.unit)).length;
          precision = metric(hits / 3);
          recall = relevant.length
            ? metric(hits / relevant.length)
            : absent("N_A");
        }
      }
    }
    const out = eligible ? outcome(o.outcome, c) : absent(reason),
      accuracy = eligible
        ? sourceAccuracy(o.source_review, c, b)
        : absent(reason);
    const value = (key) =>
      !o
        ? absent("not_run")
        : o[key] === null
          ? absent("unavailable")
          : metric(o[key]);
    return {
      ...r,
      status: o?.status ?? "not_run",
      truncated: o?.truncated ?? null,
      precision_at_3: precision,
      recall_at_3: recall,
      stale_rate: stale,
      source_accuracy: accuracy,
      task_success: out,
      retrieval_latency_ms: isB ? value("retrieval_latency_ms") : absent("N_A"),
      total_latency_ms: value("total_latency_ms"),
      input_tokens: value("input_tokens"),
      output_tokens: value("output_tokens"),
      cached_input_tokens: value("cached_input_tokens"),
    };
  });
  const comparisons = [];
  for (const baseline of [ARMS[0], ARMS[2]])
    for (const name of [
      "total_latency_ms",
      "input_tokens",
      "output_tokens",
      "source_accuracy",
      "task_success",
    ]) {
      const deltas = [],
        percent = [],
        exclusions = {},
        percentage_exclusions = {};
      for (const a of runs.filter((r) => r.scenario === ARMS[1])) {
        const z = runs.find(
          (r) =>
            r.case_id === a.case_id &&
            r.case_revision === a.case_revision &&
            r.repetition === a.repetition &&
            r.scenario === baseline,
        );
        const reason = [a, z].some((r) => r.status === "not_run")
          ? "not_run"
          : [a, z].some((r) => r.status !== "completed")
            ? "not_completed"
            : [a, z].some((r) => r.truncated)
              ? "truncated"
              : [a, z].some((r) => r[name].value === null)
                ? "unavailable"
                : null;
        if (reason) {
          exclusions[reason] = (exclusions[reason] ?? 0) + 1;
          continue;
        }
        const delta = a[name].value - z[name].value;
        deltas.push(delta);
        const pct = z[name].value > 0 ? 100 * (delta / z[name].value) : null;
        if (pct !== null && Number.isFinite(pct)) percent.push(pct);
        else {
          const why = pct === null ? "baseline_zero" : "nonfinite";
          percentage_exclusions[why] = (percentage_exclusions[why] ?? 0) + 1;
        }
      }
      comparisons.push({
        baseline,
        metric: name,
        planned_pairs: runs.length / 3,
        eligible_pairs: deltas.length,
        exclusions,
        difference: stats(deltas),
        percentage_difference: stats(percent),
        percentage_exclusions,
      });
    }
  return {
    schema_version: "metrics-output-0.2",
    split: plan.split,
    execution_proof: false,
    live_enabled: false,
    retrieval_aggregation: "per_run_only",
    cost: absent("unavailable"),
    ttft: absent("unavailable"),
    effective_model: absent("unavailable"),
    runs,
    comparisons,
    coverage: ARMS.map((scenario) => {
      const selected = runs.filter((r) => r.scenario === scenario),
        counts = Object.fromEntries(
          statuses.map((s) => [
            s,
            selected.filter((r) => r.status === s).length,
          ]),
        );
      return {
        scenario,
        planned: selected.length,
        attempts: selected.length - counts.not_run,
        counts,
        coverage: (selected.length - counts.not_run) / selected.length,
      };
    }),
  };
}
