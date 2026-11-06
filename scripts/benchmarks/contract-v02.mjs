import { execFileSync } from "node:child_process";
import {
  PIN,
  canonical,
  hash,
  exact,
  id,
  integer,
  portable,
  fail,
} from "./public-bundle.mjs";
import { safePath, sameDirectory } from "./offline-files.mjs";
export { PIN, canonical, hash };
export const VERSION = "0.2";
export const PROFILE = "technical_reviewed-v1";
export const ARMS = ["sem_memoria", "com_mimir", "historico_completo"];
export const PARAMETERS = Object.freeze({
  k: 3,
  context_bytes: 32000,
  output_words: 120,
  tools: [],
  dedup: "source-content-sha256-before-k",
  base_overlap: "preserve",
  history_sha256: hash(""),
});
const digest = (v) => {
  if (typeof v !== "string" || !/^[a-f0-9]{64}$/.test(v)) fail();
};
export function nonempty(v) {
  if (
    typeof v !== "string" ||
    !v.trim() ||
    v.includes("\0") ||
    Buffer.byteLength(v) > 100000 ||
    Buffer.from(v).toString("utf8") !== v
  )
    fail();
}
const eq = (a, b) => canonical(a) === canonical(b);
// Explicit ranges only: never export a whole repository or read working-tree source.
export function gitExcerpt(root, path, start, end) {
  safePath(root);
  portable(path);
  integer(start, 1, 1000000);
  integer(end, start, 1000000);
  if (
    !/^(src\/[a-zA-Z0-9_/-]+\.ts|README\.md|package\.json|LICENSE)$/.test(path)
  )
    fail();
  const env = {
    PATH: process.env.PATH,
    SystemRoot: process.env.SystemRoot,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_TERMINAL_PROMPT: "0",
    GIT_OPTIONAL_LOCKS: "0",
  };
  const git = (args) =>
    execFileSync(
      "git",
      [
        "--no-replace-objects",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "core.hooksPath=/dev/null",
        "-C",
        root,
        ...args,
      ],
      {
        env,
        stdio: ["ignore", "pipe", "ignore"],
        timeout: 5000,
        maxBuffer: 4000000,
      },
    );
  if (
    !sameDirectory(
      root,
      git(["rev-parse", "--show-toplevel"]).toString().trim(),
    )
  )
    fail();
  const tree = git(["ls-tree", PIN, "--", path]).toString();
  if (
    !/^100(?:644|755) blob [a-f0-9]{40}\t/.test(tree) ||
    tree.trimEnd().split("\n").length !== 1 ||
    tree.trimEnd().split("\t")[1] !== path
  )
    fail();
  const bytes = git(["show", `${PIN}:${path}`]),
    text = bytes.toString("utf8");
  if (!Buffer.from(text).equals(bytes)) fail();
  const lines = text.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  if (end > lines.length) fail();
  return lines.slice(start - 1, end).join("");
}
export function validateSource(s) {
  exact(s, [
    "source_id",
    "unit_id",
    "path",
    "commit",
    "start_line",
    "end_line",
    "excerpt",
    "sha256",
  ]);
  id(s.source_id);
  id(s.unit_id);
  portable(s.path);
  if (s.commit !== PIN) fail();
  integer(s.start_line, 1, 1000000);
  integer(s.end_line, s.start_line, 1000000);
  nonempty(s.excerpt);
  digest(s.sha256);
  if (
    hash(s.excerpt) !== s.sha256 ||
    (s.excerpt.match(/[^\n]*\n|[^\n]+$/g) ?? []).length !==
      s.end_line - s.start_line + 1
  )
    fail();
}
export function validateBundle(b) {
  exact(b, [
    "schema_version",
    "contract_version",
    "parameters",
    "sources",
    "sha256",
  ]);
  if (
    b.schema_version !== "source-bundle-0.2" ||
    b.contract_version !== VERSION ||
    !eq(b.parameters, PARAMETERS) ||
    !Array.isArray(b.sources) ||
    !b.sources.length
  )
    fail();
  b.sources.forEach(validateSource);
  if (
    new Set(b.sources.map((s) => s.source_id + "/" + s.unit_id)).size !==
    b.sources.length
  )
    fail();
  const { sha256, ...payload } = b;
  if (hash(canonical(payload)) !== sha256) fail();
  return b;
}
// Deep allowlist: private additions, even nested ones, cannot affect runtime bytes/hash.
export function publicBundle(sources, root) {
  const projected = sources.map((s) => ({
    source_id: s.source_id,
    unit_id: s.unit_id,
    path: s.path,
    commit: PIN,
    start_line: s.start_line,
    end_line: s.end_line,
    excerpt: s.excerpt,
    sha256: s.sha256,
  }));
  for (const s of projected) {
    validateSource(s);
    if (gitExcerpt(root, s.path, s.start_line, s.end_line) !== s.excerpt)
      fail();
  }
  const payload = {
    schema_version: "source-bundle-0.2",
    contract_version: VERSION,
    parameters: structuredClone(PARAMETERS),
    sources: projected,
  };
  return validateBundle({ ...payload, sha256: hash(canonical(payload)) });
}
export function validateCase(c, b) {
  validateBundle(b);
  exact(c, [
    "contract_version",
    "profile",
    "case_id",
    "case_revision",
    "split",
    "origin",
    "task",
    "query",
    "pool",
    "base",
    "evaluation",
    "technical_review",
    "human_acceptance_ref",
  ]);
  if (
    c.contract_version !== VERSION ||
    c.profile !== PROFILE ||
    !["development", "evaluation"].includes(c.split) ||
    c.human_acceptance_ref !== null
  )
    fail();
  id(c.case_id);
  integer(c.case_revision, 1, 1000000);
  nonempty(c.origin);
  nonempty(c.task);
  nonempty(c.query);
  const keys = new Set(b.sources.map((s) => s.source_id + "/" + s.unit_id));
  for (const list of [c.pool, c.base])
    if (
      !Array.isArray(list) ||
      !list.length ||
      new Set(list).size !== list.length ||
      list.some((k) => !keys.has(k))
    )
      fail();
  if (c.base.some((k) => !c.pool.includes(k))) fail();
  exact(c.evaluation, [
    "relevant_units",
    "expected_answer",
    "rubric",
    "source_evidence",
  ]);
  const e = c.evaluation;
  if (
    e.relevant_units !== null &&
    (!Array.isArray(e.relevant_units) ||
      new Set(e.relevant_units).size !== e.relevant_units.length ||
      e.relevant_units.some((k) => !c.pool.includes(k)))
  )
    fail();
  nonempty(e.expected_answer);
  if (
    !Array.isArray(e.rubric) ||
    !e.rubric.length ||
    new Set(e.rubric.map((r) => r.id)).size !== e.rubric.length
  )
    fail();
  for (const r of e.rubric) {
    exact(r, ["id", "criterion", "weight"]);
    id(r.id);
    nonempty(r.criterion);
    integer(r.weight, 1, 100);
  }
  if (!Array.isArray(e.source_evidence) || !e.source_evidence.length) fail();
  for (const x of e.source_evidence) {
    exact(x, ["unit", "excerpt"]);
    if (!c.pool.includes(x.unit)) fail();
    nonempty(x.excerpt);
    if (
      !b.sources
        .find((s) => s.source_id + "/" + s.unit_id === x.unit)
        .excerpt.includes(x.excerpt)
    )
      fail();
  }
  exact(c.technical_review, [
    "status",
    "author_ref",
    "reviewer_ref",
    "evidence_ref",
  ]);
  const r = c.technical_review;
  nonempty(r.author_ref);
  if (!["pending", "technical_reviewed", "rejected"].includes(r.status)) fail();
  if (r.status === "pending") {
    if (r.reviewer_ref !== null || r.evidence_ref !== null) fail();
  } else {
    nonempty(r.reviewer_ref);
    nonempty(r.evidence_ref);
    if (r.reviewer_ref === r.author_ref) fail();
  }
  return c;
}
// Integrity is not authenticity. The independent reviewer writes a receipt; the
// supervisor verifies its actual provenance. This function cannot grant live access.
export function reviewEligibility(cases, b, receipt) {
  cases.forEach((c) => validateCase(c, b));
  exact(receipt, [
    "schema_version",
    "author_ref",
    "reviewer_ref",
    "verdict",
    "evidence_ref",
    "bundle_sha256",
    "cases_sha256",
  ]);
  for (const k of ["author_ref", "reviewer_ref", "evidence_ref"])
    nonempty(receipt[k]);
  if (
    receipt.schema_version !== "technical-review-receipt-0.2" ||
    receipt.verdict !== "APPROVE" ||
    receipt.author_ref === receipt.reviewer_ref ||
    receipt.bundle_sha256 !== b.sha256 ||
    receipt.cases_sha256 !== hash(canonical(cases))
  )
    fail();
  if (
    cases.some(
      (c) =>
        c.technical_review.status !== "technical_reviewed" ||
        c.technical_review.author_ref !== receipt.author_ref ||
        c.technical_review.reviewer_ref !== receipt.reviewer_ref ||
        c.technical_review.evidence_ref !== receipt.evidence_ref,
    )
  )
    fail();
  return {
    structurally_eligible: true,
    authenticity: "requires-supervisor-verification",
    live_enabled: false,
  };
}
export function runtimeEnvelope(b, task, base, retrieved = []) {
  validateBundle(b);
  nonempty(task);
  for (const list of [base, retrieved])
    if (!Array.isArray(list) || new Set(list).size !== list.length) fail();
  const select = (keys) =>
    keys.map((k) => {
      const s = b.sources.find((s) => s.source_id + "/" + s.unit_id === k);
      if (!s) fail();
      return structuredClone(s);
    });
  // Only source data and the task cross the process boundary. Case bookkeeping
  // and all reviewer material stay in the caller's evaluator process.
  const result = {
    instruction:
      "Responda em até 120 palavras, cite fontes/unidades; abstenha-se se insuficientes.",
    task,
    sources: select(base),
    retrieved: select(retrieved),
    history: "",
  };
  if (Buffer.byteLength(JSON.stringify(result)) > PARAMETERS.context_bytes)
    fail();
  return result;
}
export function makePlan(cases, b, repetitions) {
  if (!Array.isArray(cases) || !cases.length) fail();
  cases.forEach((c) => validateCase(c, b));
  const split = cases[0].split;
  if (
    cases.some((c) => c.split !== split) ||
    new Set(cases.map((c) => c.case_id)).size !== cases.length ||
    repetitions !== (split === "development" ? 1 : 3)
  )
    fail();
  const runs = [];
  [...cases]
    .sort((a, b) => a.case_id.localeCompare(b.case_id, "en"))
    .forEach((c, i) => {
      for (let repetition = 1; repetition <= repetitions; repetition++)
        for (let j = 0; j < 3; j++) {
          const scenario = ARMS[(j + i + repetition - 1) % 3];
          runs.push({
            run_id: `${c.case_id}.${c.case_revision}.${repetition}.${scenario}`,
            case_id: c.case_id,
            case_revision: c.case_revision,
            repetition,
            scenario,
          });
        }
    });
  return {
    schema_version: "offline-plan-0.2",
    split,
    bundle_sha256: b.sha256,
    cases_sha256: hash(canonical(cases)),
    parameters_sha256: hash(canonical(PARAMETERS)),
    executable: false,
    runs,
  };
}
