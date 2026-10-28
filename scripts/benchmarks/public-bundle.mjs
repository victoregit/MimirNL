import { createHash } from "node:crypto";

export const PIN = "166e3cf047b2078952e43dc8e9171e053e99e2ce";
export const ARMS = ["contexto_completo", "selecao_mimir"];
export const BLOCK = {
  executable: false,
  provenance: "caller-unverified",
  reasons: ["offline-only", "live-manifest-and-review-required"],
};
export const fail = () => {
  throw Error("Invalid offline input or local operation.");
};
export const hash = (s) => createHash("sha256").update(s).digest("hex");
// Sorting object keys makes hashes independent of JSON formatting and key order.
export function canonical(v) {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (v && typeof v === "object")
    return `{${Object.keys(v)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`)
      .join(",")}}`;
  return JSON.stringify(v);
}
export function exact(v, keys) {
  if (
    !v ||
    typeof v !== "object" ||
    Array.isArray(v) ||
    Object.keys(v).length !== keys.length ||
    keys.some((k) => !Object.hasOwn(v, k))
  )
    fail();
}
const same = (a, b) => canonical(a) === canonical(b);
export const id = (v) => {
  if (typeof v !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(v)) fail();
};
export const integer = (v, min, max) => {
  if (!Number.isSafeInteger(v) || v < min || v > max) fail();
};
export function portable(v) {
  if (
    typeof v !== "string" ||
    /[\\:\x00-\x1f\x7f]/u.test(v) ||
    v
      .split("/")
      .some(
        (x) =>
          !x ||
          x === "." ||
          x === ".." ||
          /^(?:\.env(?:\..*)?|\.aws|\.ssh|\.git|\.config|config|auth|credentials|logs?|.*\.pem)$/i.test(
            x,
          ),
      )
  )
    fail();
}
function text(v, max = 100000) {
  if (
    typeof v !== "string" ||
    !v.trim() ||
    v.includes("\0") ||
    Buffer.byteLength(v) > max ||
    Buffer.from(v).toString("utf8") !== v
  )
    fail();
}
const fields = [
  "case_id",
  "case_revision",
  "query",
  "k",
  "limit",
  "tokenBudget",
  "context_bytes",
  "output_words",
  "pool",
];
export function validateOperation(p) {
  exact(p, fields);
  id(p.case_id);
  integer(p.case_revision, 1, 100000);
  text(p.query, 1000);
  if (
    p.k !== 4 ||
    p.limit !== 4 ||
    p.tokenBudget !== 32000 ||
    p.context_bytes !== 32000 ||
    p.output_words !== 120
  )
    fail();
  if (
    !Array.isArray(p.pool) ||
    !p.pool.length ||
    new Set(p.pool).size !== p.pool.length
  )
    fail();
  p.pool.forEach(id);
}
export function validateProtocol(p) {
  exact(p, [
    "schema_version",
    "status",
    "arms",
    "contract_scenarios_replaced",
    "cases",
  ]);
  if (
    p.schema_version !== "multicase-protocol-1" ||
    p.status !== "proposed" ||
    !same(p.arms, ARMS) ||
    p.contract_scenarios_replaced !== false ||
    !Array.isArray(p.cases) ||
    p.cases.length !== 9
  )
    fail();
  p.cases.forEach(validateOperation);
  if (new Set(p.cases.map((c) => c.case_id)).size !== 9) fail();
  return p;
}
export function validateBundle(b) {
  exact(b, [
    "schema_version",
    "execution",
    "protocol_status",
    "arms",
    "contract_scenarios_replaced",
    "cases",
    "sha256",
  ]);
  if (
    b.schema_version !== "public-cases-1" ||
    !same(b.execution, BLOCK) ||
    b.protocol_status !== "proposed" ||
    !same(b.arms, ARMS) ||
    b.contract_scenarios_replaced !== false ||
    !Array.isArray(b.cases) ||
    ![6, 9].includes(b.cases.length)
  )
    fail();
  const seen = new Set();
  for (const c of b.cases) {
    exact(c, [
      "case_id",
      "case_revision",
      "split",
      "source",
      "question",
      "sources",
      "allowed_source_ids",
      "operation",
    ]);
    id(c.case_id);
    integer(c.case_revision, 1, 100000);
    if (seen.has(c.case_id) || c.split !== "development") fail();
    seen.add(c.case_id);
    exact(c.source, ["repository", "commit_sha"]);
    if (c.source.repository !== "MimirNL" || c.source.commit_sha !== PIN)
      fail();
    text(c.question);
    validateOperation(c.operation);
    if (
      c.operation.case_id !== c.case_id ||
      c.operation.case_revision !== c.case_revision ||
      !Array.isArray(c.sources) ||
      !c.sources.length
    )
      fail();
    const units = new Set(),
      hashes = new Set();
    for (const s of c.sources) {
      exact(s, [
        "source_id",
        "unit_id",
        "path",
        "start_line",
        "end_line",
        "excerpt",
        "sha256",
      ]);
      id(s.source_id);
      id(s.unit_id);
      portable(s.path);
      integer(s.start_line, 1, 1000000);
      integer(s.end_line, s.start_line, 1000000);
      text(s.excerpt);
      if (
        hash(s.excerpt) !== s.sha256 ||
        units.has(s.source_id) ||
        hashes.has(s.sha256)
      )
        fail();
      units.add(s.source_id);
      hashes.add(s.sha256);
      const lines =
        s.excerpt.split("\n").length - (s.excerpt.endsWith("\n") ? 1 : 0);
      if (lines !== s.end_line - s.start_line + 1) fail();
    }
    const pool = c.sources.map((s) => s.source_id);
    if (!same(c.allowed_source_ids, pool) || !same(c.operation.pool, pool))
      fail();
  }
  const { sha256, ...payload } = b;
  if (hash(canonical(payload)) !== sha256) fail();
  return b;
}
export function seal(payload) {
  return validateBundle({ ...payload, sha256: hash(canonical(payload)) });
}
