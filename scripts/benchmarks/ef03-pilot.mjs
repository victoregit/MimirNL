// Dedicated EF03 ablation. Importing this module never reads inputs or starts a host.
import { readFileSync, lstatSync, accessSync, constants } from "node:fs";
import { fileURLToPath } from "node:url";
import { assembleOfflineContext } from "./offline-context.mjs";
import { canonical, hash } from "./contract-v02.mjs";
import { readExplicit, safePath } from "./offline-files.mjs";
import { HOST, argsFor } from "./abc-transport.mjs";
export const ROOT = fileURLToPath(new URL("../../", import.meta.url));
export const NODE =
  "/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node";
export const DEST = "/home/usuario/.local/share/mimir-ef03-pilot";
export const OUT = DEST + "/epoch1-dev13-20261028";
export const REVIEW =
  ROOT + "tasks/132-ef03-four-call-pilot-review-findings.md";
export const LIMITS = Object.freeze({
  attempts: 4,
  retry: 0,
  concurrency: 1,
  call_ms: 90000,
  global_ms: 720000,
  prompt_bytes: 32000,
  capture_bytes: 64000,
});
export const SUFFIX =
  " Não utilize ferramentas, shell ou código; responda somente com base nas fontes fornecidas.";
const manifest =
  "docs/benchmarks/v03/evidencias/task103/public-plan/offline-manifest.json";
export const INPUTS = [
  manifest,
  ...[1, 3].map(
    (i) =>
      `docs/benchmarks/v03/evidencias/task103/offline-replay/position-${String(i).padStart(2, "0")}.json`,
  ),
];
export const CODE = [
  "scripts/benchmarks/ef03-pilot.mjs",
  "scripts/benchmarks/ef03-pilot-launch.mjs",
  "scripts/benchmarks/offline-context.mjs",
  "scripts/benchmarks/contract-v02.mjs",
  "scripts/benchmarks/public-bundle.mjs",
  "scripts/benchmarks/offline-files.mjs",
  "scripts/benchmarks/abc-transport.mjs",
  "scripts/benchmarks/abc-public.mjs",
  "scripts/benchmarks/codex-usage-cli.mjs",
  "scripts/benchmarks/codex-usage.mjs",
  "scripts/benchmarks/multicase-codex-transport.mjs",
  "tasks/131-ef03-pilot/quality.json",
  "tasks/131-ef03-pilot/authorization.schema.json",
  "test/benchmark-ef03-pilot.test.mjs",
];
const digest = (p) => {
  safePath(p);
  if (!lstatSync(p).isFile()) throw Error("Regular file required");
  return hash(readFileSync(p));
};
const read = (p) => JSON.parse(readExplicit(ROOT + p));
export function prompts() {
  const m = read(manifest);
  return [
    [1, "preserve"],
    [1, "exact-v1"],
    [3, "exact-v1"],
    [3, "preserve"],
  ].map(([position, base_overlap]) => {
    const r = m.requests[position],
      retrieved = read(INPUTS[position === 1 ? 1 : 2]).retrieved;
    if (!retrieved.every((k) => r.pool.includes(k)))
      throw Error("Selection outside pool");
    const a = assembleOfflineContext(m.bundle, r.task, r.base, retrieved, {
      base_overlap,
    });
    a.envelope.instruction += SUFFIX;
    const prompt = JSON.stringify(a.envelope);
    if (Buffer.byteLength(prompt) > LIMITS.prompt_bytes)
      throw Error("Prompt budget");
    return {
      position,
      base_overlap,
      configuration_sha256: a.configuration_sha256,
      prompt,
      prompt_bytes: Buffer.byteLength(prompt),
      prompt_sha256: hash(prompt),
      selection: { query: r.query, pool: r.pool, base: r.base, retrieved },
    };
  });
}
export function buildPlan() {
  accessSync(HOST.binary, constants.X_OK);
  accessSync(NODE, constants.X_OK);
  const payload = {
    schema_version: "ef03-pilot-plan-131-v1",
    epoch: 1,
    author_ref: "developer-task131",
    required_review: 132,
    limits: LIMITS,
    host: {
      ...HOST,
      cli_version: "0.164.0",
      node: NODE,
      node_version: "v24.22.1",
      arguments: argsFor("<owned-empty-scratch>"),
    },
    binary_sha256: digest(HOST.binary),
    node_sha256: digest(NODE),
    output: OUT,
    inventory: Object.fromEntries(
      [...INPUTS, ...CODE].map((p) => [p, digest(ROOT + p)]),
    ),
    requests: prompts().map((request) => {
      const metadata = { ...request };
      delete metadata.prompt;
      return metadata;
    }),
    retrieval_latency_ms: null,
    retrieval_status: "N_A_fixed_public_selection_no_search",
    execution_proof: false,
  };
  return { ...payload, sha256: hash(canonical(payload)) };
}
export function validatePlan(p) {
  // Rebuild only offline: every source, selection, prompt, limit and executable is bound.
  if (canonical(p) !== canonical(buildPlan()))
    throw Error("Plan or inventory drift");
  return p;
}
export function authorize(p, a, reviewBytes) {
  const keys = [
    "schema_version",
    "plan_sha256",
    "review_task",
    "review_sha256",
    "reviewer_ref",
    "supervisor_ref",
    "verdict",
    "epoch",
    "max_attempts",
    "output",
  ];
  if (
    !a ||
    canonical(Object.keys(a).sort()) !== canonical(keys.sort()) ||
    a.schema_version !== "ef03-pilot-authorization-131-v1" ||
    a.plan_sha256 !== p.sha256 ||
    a.review_task !== 132 ||
    a.review_sha256 !== hash(reviewBytes) ||
    a.verdict !== "APPROVE" ||
    a.epoch !== 1 ||
    a.max_attempts !== 4 ||
    a.output !== OUT ||
    ![a.reviewer_ref, a.supervisor_ref].every(
      (x) =>
        typeof x === "string" && /^[a-zA-Z0-9][a-zA-Z0-9._:-]{2,150}$/.test(x),
    ) ||
    new Set([a.reviewer_ref, a.supervisor_ref, p.author_ref]).size !== 3
  )
    throw Error("External authorization required");
}
// Pure orchestrator: only the closed launcher supplies the real audited transport.
// No retry path exists. A failed/timeout attempt consumes its slot and halts.
export async function runSequence({
  requests,
  transport,
  scratch,
  clock = () => performance.now(),
  started = clock(),
  progress = () => {},
}) {
  if (requests.length !== 4) throw Error("Four requests required");
  const runs = requests.map((r) => ({
    position: r.position,
    base_overlap: r.base_overlap,
    status: "not_run",
    usage: null,
    response: null,
    retrieval_latency_ms: null,
  }));
  let attempts = 0;
  for (let i = 0; i < 4; i++) {
    const remaining = LIMITS.global_ms - (clock() - started);
    if (remaining <= 0) break;
    const r = requests[i],
      o = runs[i],
      t = clock();
    if (Buffer.byteLength(r.prompt) > LIMITS.prompt_bytes) {
      o.status = "infeasible";
      break;
    }
    attempts++;
    progress({ attempts, remaining_attempts: 4 - attempts, status: "started" });
    let x;
    try {
      x = await transport({
        prompt: r.prompt,
        scratch,
        timeoutMs: Math.min(LIMITS.call_ms, remaining),
        outputBytes: LIMITS.capture_bytes,
        clock,
      });
    } catch {
      x = { status: "transport_error" };
    }
    const elapsed = clock() - t;
    const valid =
      x.status === "completed" &&
      x.exit_code === 0 &&
      !x.tools_detected &&
      !x.truncated &&
      typeof x.response === "string" &&
      x.response.trim() &&
      Buffer.byteLength(x.response) <= LIMITS.capture_bytes;
    o.status =
      elapsed > LIMITS.call_ms ||
      clock() - started > LIMITS.global_ms ||
      x.status === "timeout"
        ? "timeout"
        : valid
          ? "completed"
          : "failed";
    o.context_ready_transport_ms = elapsed;
    o.transport_ms = Number.isFinite(x.wall_ms) ? x.wall_ms : null;
    o.prompt_bytes = r.prompt_bytes;
    o.prompt_sha256 = r.prompt_sha256;
    o.tools_detected = x.tools_detected === true;
    o.response = o.status === "completed" ? x.response : null;
    o.response_sha256 = o.response === null ? null : hash(o.response);
    o.response_bytes =
      o.response === null ? null : Buffer.byteLength(o.response);
    // Never export the collector, stderr, reasoning, transcript or arbitrary host fields.
    const u = x.usage;
    if (
      u &&
      [u.input_tokens, u.output_tokens, u.cached_input_tokens].every(
        (n) => Number.isSafeInteger(n) && n >= 0,
      ) &&
      u.cached_input_tokens <= u.input_tokens &&
      Number.isSafeInteger(u.input_tokens + u.output_tokens)
    )
      o.usage = {
        input_tokens: u.input_tokens,
        output_tokens: u.output_tokens,
        cached_input_tokens: u.cached_input_tokens,
        total_tokens: u.input_tokens + u.output_tokens,
        uncached_input_tokens: u.input_tokens - u.cached_input_tokens,
      };
    const observed = x.model_identity?.model;
    o.requested_model = HOST.requested_model;
    o.observed_model =
      typeof observed === "string" &&
      /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,99}$/.test(observed)
        ? observed
        : null;
    o.cost = null;
    o.ttft_ms = null;
    o.cached_savings = null;
    progress({ attempts, remaining_attempts: 4 - attempts, status: o.status });
    if (o.status !== "completed") break;
  }
  return {
    schema_version: "ef03-pilot-results-131-v1",
    attempts,
    remaining_attempts: 4 - attempts,
    stopped: runs.some((r) => r.status !== "completed"),
    runs,
    elapsed_since_preflight_ms: clock() - started,
  };
}
