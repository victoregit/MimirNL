import { createHash } from "node:crypto";

// Errors name only fixed schema locations: untrusted values, keys and gold never
// become diagnostics. This module performs no I/O and makes no provenance claim.
function fail(location, rule) {
  throw new Error(`Invalid cases: ${location}: ${rule}.`);
}
function object(value, fields, location) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail(location, "expected object");
  if (
    Object.keys(value).length !== fields.length ||
    fields.some((key) => !Object.hasOwn(value, key))
  )
    fail(location, "missing or additional fields");
}
function string(value, location, nullable = false) {
  if (nullable && value === null) return;
  if (typeof value !== "string" || !value.trim() || value.includes("\0"))
    fail(location, "expected nonempty string");
}
function enumeration(value, options, location) {
  if (!options.includes(value)) fail(location, "unsupported value");
}
function positiveInteger(value, location) {
  if (!Number.isSafeInteger(value) || value < 1)
    fail(location, "expected positive safe integer");
}
function array(value, location, nonempty = false) {
  if (!Array.isArray(value) || (nonempty && !value.length))
    fail(location, "expected array");
}
function uniqueStrings(value, location) {
  array(value, location);
  value.forEach((entry) => string(entry, location));
  if (new Set(value).size !== value.length)
    fail(location, "duplicate reference");
}
function relativePath(value, location) {
  string(value, location);
  // Use one portable lexical form, independent of the host's path semantics.
  if (
    /[\\:\x00-\x1f\x7f]/u.test(value) ||
    value.split("/").some((part) => !part || part === "." || part === "..")
  )
    fail(location, "expected portable repository-relative path");
}
function hash(value, length, location) {
  if (
    typeof value !== "string" ||
    !new RegExp(`^[0-9a-f]{${length}}$`).test(value)
  )
    fail(location, "invalid hash format");
}
function reviewReferences(c, location) {
  const r = c.review;
  for (const key of [
    "source_reviewer",
    "codex_review_ref",
    "human_acceptance_ref",
  ])
    string(r[key], `${location}.review.${key}`);
  if (r.source_reviewer === r.author)
    fail(`${location}.review`, "source reviewer must differ from author");
  string(c.permissions_ref, `${location}.permissions_ref`);
}

/** Validate a nonempty JSON array of contract 0.1 cases, without reading sources.
 * Accepted/validated assertions remain caller-provided provenance, not verified facts.
 */
export function validateCases(cases) {
  array(cases, "batch", true);
  const caseIds = new Set();
  for (const [index, c] of cases.entries()) {
    const at = `cases[${index}]`;
    object(
      c,
      [
        "contract_version",
        "case_id",
        "case_revision",
        "illustrative_only",
        "split",
        "source",
        "sources",
        "model_context",
        "evaluation_private",
        "review",
        "permissions_ref",
      ],
      at,
    );
    enumeration(c.contract_version, ["0.1"], `${at}.contract_version`);
    string(c.case_id, `${at}.case_id`);
    positiveInteger(c.case_revision, `${at}.case_revision`);
    // More than one revision of an ID in a batch would make selection ambiguous.
    if (caseIds.has(c.case_id))
      fail(at, "duplicate case ID or ambiguous revisions");
    caseIds.add(c.case_id);
    if (typeof c.illustrative_only !== "boolean")
      fail(at, "expected illustrative boolean");
    enumeration(c.split, ["development", "evaluation"], `${at}.split`);
    object(c.source, ["repository", "commit_sha"], `${at}.source`);
    relativePath(c.source.repository, `${at}.source.repository`);
    hash(c.source.commit_sha, 40, `${at}.source.commit_sha`);
    array(c.sources, `${at}.sources`, true);
    const sources = new Set(),
      units = new Set();
    for (const s of c.sources) {
      const here = `${at}.sources[]`;
      object(
        s,
        [
          "source_id",
          "unit_id",
          "path",
          "start_line",
          "end_line",
          "excerpt",
          "sha256",
        ],
        here,
      );
      string(s.source_id, `${here}.source_id`);
      string(s.unit_id, `${here}.unit_id`);
      const unit = `${s.source_id}/${s.unit_id}`;
      if (sources.has(s.source_id) || units.has(unit))
        fail(here, "duplicate source or unit reference");
      sources.add(s.source_id);
      units.add(unit);
      relativePath(s.path, `${here}.path`);
      positiveInteger(s.start_line, `${here}.start_line`);
      positiveInteger(s.end_line, `${here}.end_line`);
      if (s.end_line < s.start_line) fail(here, "reversed line interval");
      string(s.excerpt, `${here}.excerpt`);
      hash(s.sha256, 64, `${here}.sha256`);
      if (
        createHash("sha256").update(s.excerpt, "utf8").digest("hex") !==
        s.sha256
      )
        fail(here, "excerpt hash mismatch");
    }
    object(
      c.model_context,
      ["task", "allowed_source_ids"],
      `${at}.model_context`,
    );
    string(c.model_context.task, `${at}.model_context.task`);
    uniqueStrings(
      c.model_context.allowed_source_ids,
      `${at}.model_context.allowed_source_ids`,
    );
    if (c.model_context.allowed_source_ids.some((id) => !sources.has(id)))
      fail(`${at}.model_context`, "unknown source reference");
    const e = c.evaluation_private;
    object(
      e,
      [
        "gold_status",
        "expected_answer",
        "relevant_unit_ids",
        "success_criteria",
        "rubric",
      ],
      `${at}.evaluation_private`,
    );
    enumeration(
      e.gold_status,
      ["pending", "validated", "sem_gold"],
      `${at}.evaluation_private.gold_status`,
    );
    string(e.expected_answer, `${at}.evaluation_private.expected_answer`, true);
    if (e.relevant_unit_ids === null) {
      if (e.gold_status !== "sem_gold")
        fail(`${at}.evaluation_private`, "relevant units required");
    } else {
      uniqueStrings(
        e.relevant_unit_ids,
        `${at}.evaluation_private.relevant_unit_ids`,
      );
      if (e.relevant_unit_ids.some((id) => !units.has(id)))
        fail(`${at}.evaluation_private`, "unknown unit reference");
    }
    array(
      e.success_criteria,
      `${at}.evaluation_private.success_criteria`,
      true,
    );
    e.success_criteria.forEach((s) =>
      string(s, `${at}.evaluation_private.success_criteria`),
    );
    array(e.rubric, `${at}.evaluation_private.rubric`, true);
    const rubricIds = new Set();
    for (const r of e.rubric) {
      object(
        r,
        ["id", "criterion", "weight"],
        `${at}.evaluation_private.rubric[]`,
      );
      string(r.id, `${at}.evaluation_private.rubric[].id`);
      string(r.criterion, `${at}.evaluation_private.rubric[].criterion`);
      if (rubricIds.has(r.id))
        fail(`${at}.evaluation_private.rubric`, "duplicate rubric ID");
      rubricIds.add(r.id);
      if (
        typeof r.weight !== "number" ||
        !Number.isFinite(r.weight) ||
        r.weight <= 0
      )
        fail(
          `${at}.evaluation_private.rubric`,
          "expected finite positive weight",
        );
    }
    object(
      c.review,
      [
        "author",
        "source_reviewer",
        "codex_review_ref",
        "human_acceptance_ref",
        "decision",
        "notes",
      ],
      `${at}.review`,
    );
    string(c.review.author, `${at}.review.author`);
    for (const key of [
      "source_reviewer",
      "codex_review_ref",
      "human_acceptance_ref",
    ])
      string(c.review[key], `${at}.review.${key}`, true);
    enumeration(
      c.review.decision,
      ["pending", "accepted", "rejected"],
      `${at}.review.decision`,
    );
    string(c.review.notes, `${at}.review.notes`);
    string(c.permissions_ref, `${at}.permissions_ref`, true);
    if (c.review.decision === "accepted" || e.gold_status === "validated")
      reviewReferences(c, at);
    if (e.gold_status === "validated") {
      string(e.expected_answer, `${at}.evaluation_private.expected_answer`);
      if (c.review.decision !== "accepted")
        fail(`${at}.review`, "validated gold requires accepted review");
    }
  }
  return {
    status: "structurally_valid",
    case_count: cases.length,
    provenance: "caller_provided_not_verified",
  };
}

const SCENARIOS = ["sem_memoria", "com_mimir", "historico_completo"];

/** Produce a public allowlisted matrix, never contexts, answers or executable work. */
export function planCases(cases, repetitions) {
  validateCases(cases);
  if (
    !Number.isSafeInteger(repetitions) ||
    repetitions < 1 ||
    repetitions > 100
  )
    throw new Error("Repetitions must be an integer from 1 to 100.");
  if (cases.length * repetitions * 3 > 1000)
    throw new Error("Plan exceeds the limit of 1000 runs.");
  if (
    cases.some(
      (c) =>
        c.illustrative_only ||
        c.review.decision !== "accepted" ||
        c.evaluation_private.gold_status !== "validated",
    )
  )
    throw new Error(
      "Planning requires nonillustrative accepted cases with validated gold and complete references (caller provenance only).",
    );
  const runs = [];
  // Sort IDs by code units, avoiding locale-dependent ordering across machines.
  const ordered = [...cases].sort((a, b) =>
    a.case_id < b.case_id ? -1 : a.case_id > b.case_id ? 1 : 0,
  );
  for (const [caseIndex, c] of ordered.entries()) {
    for (let repetition = 1; repetition <= repetitions; repetition++) {
      const rotation = (caseIndex + repetition - 1) % 3;
      for (let position = 0; position < 3; position++) {
        runs.push({
          run_id: `planned-${runs.length + 1}`,
          case_id: c.case_id,
          case_revision: c.case_revision,
          scenario: SCENARIOS[(rotation + position) % 3],
          repetition,
          source_commit_sha: c.source.commit_sha,
          scenario_order: position + 1,
          status: "not_run",
        });
      }
    }
  }
  return {
    status: "planned",
    executable: false,
    provenance: "caller_provided_not_verified",
    reasons: [
      "Requires an approved frozen manifest and pending protocol decisions.",
      "Requires independent verification of sources, hashes, gold and permissions.",
      "Requires execution adapters and verified isolation; this prototype never executes runs.",
    ],
    model: null,
    task_budget: null,
    retrieval: null,
    pending_decisions: [
      "manifest",
      "model_and_parameters",
      "tools",
      "budgets",
      "retrieval",
      "history",
      "memory_seed",
      "permissions",
      "pricing",
      "cache_and_seeds",
    ],
    repetitions,
    runs,
  };
}
