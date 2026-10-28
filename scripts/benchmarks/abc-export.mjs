// Evaluator-side only. Never import this module from a public runtime process.
import {
  reviewEligibility,
  makePlan,
  publicBundle,
  PARAMETERS,
  hash,
  canonical,
} from "./contract-v02.mjs";
import {
  CONFIG,
  LIMITS,
  inventory,
  seal,
  validateManifest,
} from "./abc-public.mjs";
import { fail } from "./public-bundle.mjs";
export function exportABC({
  bundle,
  casesBySplit,
  receipts,
  root,
  epoch,
  synthetic = false,
  stage = "validate",
}) {
  publicBundle(bundle.sources, root);
  const plans = casesBySplit.map((cases, i) => {
    reviewEligibility(cases, bundle, receipts[i]);
    return makePlan(cases, bundle, cases[0].split === "development" ? 1 : 3);
  });
  if (
    plans.length !== 2 ||
    plans[0].split !== "development" ||
    plans[1].split !== "evaluation" ||
    plans.some((p) => p.runs.length !== 27)
  )
    fail();
  const requests = [],
    bookkeeping = [];
  for (let p = 0; p < plans.length; p++)
    for (const run of plans[p].runs) {
      const c = casesBySplit[p].find((c) => c.case_id === run.case_id);
      bookkeeping.push({ position: requests.length, split: c.split, ...run });
      requests.push({
        scenario: run.scenario,
        task: c.task,
        query: c.query,
        pool: [...c.pool],
        base: [...c.base],
      });
    }
  const manifest = seal({
    schema_version: "abc-manifest-0.2",
    contract_version: "0.2",
    profile: "technical_reviewed-v1",
    stage,
    synthetic,
    not_execution_proof: true,
    epoch,
    bundle: structuredClone(bundle),
    parameters: structuredClone(PARAMETERS),
    config: structuredClone(CONFIG),
    limits: structuredClone(LIMITS),
    history: { bytes: 0, sha256: hash("") },
    host: {
      transport: "codex-lean-jsonl-posix-1",
      requested_model: "gpt-6.1-sol",
      reasoning_effort: "low",
      tools: [],
      tools_meaning: "no-authorized-use; internal-capabilities-remain",
      cache: "ambient-uncontrolled",
    },
    code: inventory(),
    requests,
  });
  validateManifest(manifest);
  // These receipt/case hashes stay only in the coordinator, never the public manifest.
  return {
    manifest,
    coordinator: {
      schema_version: "abc-coordinator-0.2",
      manifest_sha256: manifest.sha256,
      plans,
      bookkeeping,
      receipt_sha256: receipts.map((r) => hash(canonical(r))),
    },
  };
}
export function metricsObservations(coordinator, result) {
  if (
    ![coordinator.manifest_sha256, coordinator.proposed_run_sha256]
      .filter(Boolean)
      .includes(result.manifest_sha256)
  )
    fail();
  return coordinator.plans.map((plan) => ({
    schema_version: "metrics-input-0.2",
    plan,
    observations: coordinator.bookkeeping
      .filter(
        (b) =>
          b.split === plan.split &&
          !["synthetic", "not_run"].includes(result.runs[b.position].status),
      )
      .map((b) => {
        const o = result.runs[b.position];
        return {
          run_id: b.run_id,
          status: o.status === "synthetic" ? "not_run" : o.status,
          truncated: o.truncated,
          retrieved:
            o.retrieved?.map((unit) => ({
              unit,
              freshness: {
                status: "unknown",
                current_reference: null,
                review: null,
              },
            })) ?? null,
          retrieval_latency_ms: o.retrieval_latency_ms,
          total_latency_ms: o.total_latency_ms,
          source_review: null,
          outcome: null,
          input_tokens: o.usage?.input_tokens ?? null,
          output_tokens: o.usage?.output_tokens ?? null,
          cached_input_tokens: o.usage?.cached_input_tokens ?? null,
        };
      }),
  }));
}
