import { join } from "node:path";
// Runtime schema: no evaluator reader, review receipt or gold input is accepted here.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { exact, fail, canonical, hash } from "./public-bundle.mjs";
import {
  validateBundle,
  runtimeEnvelope,
  PARAMETERS,
  ARMS,
} from "./contract-v02.mjs";
export { canonical, hash, runtimeEnvelope };
export const LIMITS = Object.freeze({
  call_ms: 90000,
  run_ms: 120000,
  search_ms: 5000,
  global_ms: 7200000,
  context_bytes: 32000,
  capture_bytes: 64000,
  model_per_run: 1,
  retrieval_B: 1,
  concurrency: 1,
  retry: 0,
});
export const CONFIG = Object.freeze({
  version: "core-v03-1",
  policy: "balanced-v1",
  recency: "verified-ties-v1",
  format: "compact-v1",
  telemetry: false,
  limit: 3,
  tokenBudget: 32000,
});
export const CODE = [
  "package.json",
  "package-lock.json",
  "scripts/benchmarks/abc-public.mjs",
  "scripts/benchmarks/abc-runtime.mjs",
  "scripts/benchmarks/abc-transport.mjs",
  "scripts/benchmarks/abc-cli.mjs",
  "scripts/benchmarks/contract-v02.mjs",
  "scripts/benchmarks/public-bundle.mjs",
  "scripts/benchmarks/offline-files.mjs",
  "scripts/benchmarks/codex-usage-cli.mjs",
  "scripts/benchmarks/codex-usage.mjs",
  "scripts/benchmarks/multicase-codex-transport.mjs",
  "src/core/service.ts",
  "src/core/schemas.ts",
  "src/retrieval/index.ts",
  "src/optimization/index.ts",
  "src/storage/index.ts",
  "dist/core/service.js",
  "dist/retrieval/index.js",
  "dist/optimization/index.js",
  "dist/storage/index.js",
  "dist/index.js",
  "dist/core/schemas.js",
  "dist/storage/backup.js",
  "dist/learning/index.js",
  "dist/security/index.js",
  "dist/ingestion/adapters/git.js",
];
const root = fileURLToPath(new URL("../../", import.meta.url));
export function inventory() {
  const entries = Object.fromEntries(
    CODE.map((p) => [p, hash(readFileSync(join(root, p)))]),
  );
  const approved = {
    "src/core/service.ts":
      "dd46662d03ef022cea70e35e7276e789a2f4e69c1c11a1af3f3563f9e71e9e94",
    "src/core/schemas.ts":
      "2b3cf8e9a9a0f54e1547776c20f00e9437089102c318673111c086450da16e9c",
    "src/retrieval/index.ts":
      "f0021222bf83fc5d02818a3c73ac03a4cdde1c33eb2cebb5a421ef5dd1f47d30",
    "src/optimization/index.ts":
      "4dd5c182ae7631169dab169c44b90d177ded821d9250e61975aaed85d65412fc",
  };
  for (const [p, h] of Object.entries(approved))
    if (entries[p] !== h) throw Error("Approved core108 changed");
  return entries;
}
export function seal(payload) {
  return { ...payload, sha256: hash(canonical(payload)) };
}
export function validateManifest(m, { checkCode = true } = {}) {
  exact(m, [
    "schema_version",
    "contract_version",
    "profile",
    "stage",
    "synthetic",
    "not_execution_proof",
    "epoch",
    "bundle",
    "parameters",
    "config",
    "limits",
    "history",
    "host",
    "code",
    "requests",
    "sha256",
  ]);
  if (
    m.schema_version !== "abc-manifest-0.2" ||
    m.contract_version !== "0.2" ||
    m.profile !== "technical_reviewed-v1" ||
    !["validate", "run"].includes(m.stage) ||
    typeof m.synthetic !== "boolean" ||
    m.not_execution_proof !== true ||
    !Number.isSafeInteger(m.epoch) ||
    m.epoch < 1
  )
    fail();
  if (m.synthetic && m.stage !== "validate") fail();
  validateBundle(m.bundle);
  for (const [v, w] of [
    [m.parameters, PARAMETERS],
    [m.config, CONFIG],
    [m.limits, LIMITS],
    [m.history, { bytes: 0, sha256: hash("") }],
    [
      m.host,
      {
        transport: "codex-lean-jsonl-posix-1",
        requested_model: "gpt-6.1-sol",
        reasoning_effort: "low",
        tools: [],
        tools_meaning: "no-authorized-use; internal-capabilities-remain",
        cache: "ambient-uncontrolled",
      },
    ],
  ])
    if (canonical(v) !== canonical(w)) fail();
  if (checkCode && canonical(m.code) !== canonical(inventory())) fail();
  const { sha256, ...payload } = m;
  if (hash(canonical(payload)) !== sha256) fail();
  if (!Array.isArray(m.requests) || m.requests.length !== 54) fail();
  for (const r of m.requests) {
    exact(r, ["scenario", "task", "query", "pool", "base"]);
    if (
      !ARMS.includes(r.scenario) ||
      typeof r.query !== "string" ||
      !r.query.trim() ||
      !Array.isArray(r.pool) ||
      !r.pool.length ||
      new Set(r.pool).size !== r.pool.length ||
      !Array.isArray(r.base) ||
      !r.base.length ||
      r.base.some((k) => !r.pool.includes(k))
    )
      fail();
    const keys = new Set(
      m.bundle.sources.map((s) => s.source_id + "/" + s.unit_id),
    );
    if (r.pool.some((k) => !keys.has(k))) fail();
    runtimeEnvelope(m.bundle, r.task, r.base);
  }
  if (m.requests.filter((r) => r.scenario === "com_mimir").length !== 18)
    fail();
  // Each successive triple must contain one of each arm with identical public inputs.
  for (let i = 0; i < 54; i += 3) {
    const group = i / 3;
    const offset =
      group < 9 ? group : Math.floor((group - 9) / 3) + ((group - 9) % 3);
    for (let j = 0; j < 3; j++)
      if (m.requests[i + j].scenario !== ARMS[(offset + j) % 3]) fail();
    const t = m.requests.slice(i, i + 3);
    if (
      new Set(t.map((r) => r.scenario)).size !== 3 ||
      new Set(t.map(({ scenario, ...r }) => canonical(r))).size !== 1
    )
      fail();
  }
  return m;
}
export function authorize(m, a) {
  exact(a, [
    "schema_version",
    "manifest_sha256",
    "epoch",
    "reviewer_ref",
    "supervisor_ref",
    "verdict",
    "max_attempts",
  ]);
  if (
    a.schema_version !== "abc-authorization-0.2" ||
    a.manifest_sha256 !== m.sha256 ||
    a.epoch !== m.epoch ||
    a.verdict !== "APPROVE" ||
    a.max_attempts !== 54 ||
    typeof a.reviewer_ref !== "string" ||
    !a.reviewer_ref.trim() ||
    typeof a.supervisor_ref !== "string" ||
    !a.supervisor_ref.trim() ||
    a.reviewer_ref === a.supervisor_ref ||
    m.stage !== "run" ||
    m.synthetic
  )
    fail();
  // Structural binding only: the supervisor must authenticate this external artifact.
}
// JSON.parse alone silently accepts duplicate keys; scan structure before use.
// Decoding keys also rejects escaped spellings of an already present key.
export function parseStrictJSON(text) {
  const parsed = JSON.parse(text);
  let at = 0;
  const ws = () => {
    while (/\s/.test(text[at] ?? "") && at < text.length) at++;
  };
  const string = () => {
    const match =
      /^"(?:[^"\\\x00-\x1f]|\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4}))*"/.exec(
        text.slice(at),
      );
    if (!match) fail();
    at += match[0].length;
    return JSON.parse(match[0]);
  };
  const value = () => {
    ws();
    if (text[at] === "{") {
      at++;
      ws();
      const keys = new Set();
      if (text[at] === "}") {
        at++;
        return;
      }
      while (true) {
        ws();
        const key = string();
        if (keys.has(key)) fail();
        keys.add(key);
        ws();
        if (text[at++] !== ":") fail();
        value();
        ws();
        const delimiter = text[at++];
        if (delimiter === "}") return;
        if (delimiter !== ",") fail();
      }
    }
    if (text[at] === "[") {
      at++;
      ws();
      if (text[at] === "]") {
        at++;
        return;
      }
      while (true) {
        value();
        ws();
        const delimiter = text[at++];
        if (delimiter === "]") return;
        if (delimiter !== ",") fail();
      }
    }
    if (text[at] === '"') {
      string();
      return;
    }
    const token =
      /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(
        text.slice(at),
      );
    if (!token) fail();
    at += token[0].length;
  };
  value();
  ws();
  if (at !== text.length) fail();
  return parsed;
}
