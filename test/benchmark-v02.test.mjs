import { withSymlink } from "./platform-fixture.mjs";
import { pathToFileURL } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  writeFileSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import {
  publicBundle,
  validateBundle,
  validateCase,
  reviewEligibility,
  makePlan,
  runtimeEnvelope,
  gitExcerpt,
  hash,
  canonical,
  PIN,
  PARAMETERS,
} from "../scripts/benchmarks/contract-v02.mjs";
import { evaluateMetricsV02 } from "../scripts/benchmarks/metrics-v02.mjs";
import { validateCases } from "../scripts/benchmarks/preflight.mjs";
import { validateBundle as legacyBundle } from "../scripts/benchmarks/public-bundle.mjs";
import {
  readExplicit,
  outputDirectory,
} from "../scripts/benchmarks/offline-files.mjs";
const root = resolve(import.meta.dirname, ".."),
  dir = join(root, "docs/benchmarks/v03/evidencias/preparacao");
const bundle = JSON.parse(readFileSync(join(dir, "sources-0.2.json"), "utf8"));
const clone = structuredClone;
function fixture({
  split = "development",
  relevant = ["code-approval/behavior"],
  reviewed = true,
} = {}) {
  return {
    contract_version: "0.2",
    profile: "technical_reviewed-v1",
    case_id: "synthetic-only",
    case_revision: 1,
    split,
    origin: "SYNTHETIC TEST ONLY; no independent approval",
    task: "Synthetic question",
    query: "synthetic",
    pool: [
      "code-approval/behavior",
      "code-budget/behavior",
      "code-failure/behavior",
    ],
    base: ["code-approval/behavior"],
    evaluation: {
      relevant_units: relevant,
      expected_answer: "SYNTHETIC",
      rubric: [{ id: "one", criterion: "Synthetic criterion", weight: 1 }],
      source_evidence: [
        {
          unit: "code-approval/behavior",
          excerpt: "export function nextStatus(",
        },
      ],
    },
    technical_review: {
      status: reviewed ? "technical_reviewed" : "pending",
      author_ref: "synthetic-author",
      reviewer_ref: reviewed ? "synthetic-reviewer" : null,
      evidence_ref: reviewed ? "synthetic-test-only" : null,
    },
    human_acceptance_ref: null,
  };
}
const unknown = () => ({
  status: "unknown",
  current_reference: null,
  review: null,
});
const unit = (key = "code-approval/behavior") => ({
  unit: key,
  freshness: unknown(),
});
function batch(cases = [fixture()]) {
  const plan = makePlan(
    cases,
    bundle,
    cases[0].split === "development" ? 1 : 3,
  );
  return {
    schema_version: "metrics-input-0.2",
    plan,
    observations: plan.runs.map((r) => ({
      run_id: r.run_id,
      status: "completed",
      truncated: false,
      retrieved: r.scenario === "com_mimir" ? [unit()] : null,
      retrieval_latency_ms: r.scenario === "com_mimir" ? 1 : null,
      total_latency_ms: 5,
      source_review: null,
      outcome: null,
      input_tokens: null,
      output_tokens: null,
      cached_input_tokens: null,
    })),
  };
}
const bRun = (result) => result.runs.find((r) => r.scenario === "com_mimir");
test("0.2 sources: exact pinned bytes, durable snapshots, zero history, no private fields", () => {
  validateBundle(bundle);
  assert.equal(publicBundle(bundle.sources, root).sha256, bundle.sha256);
  for (const s of bundle.sources) {
    assert.equal(
      readFileSync(join(dir, `${s.source_id}--${s.unit_id}.txt`), "utf8"),
      s.excerpt,
    );
  }
  assert.equal(readFileSync(join(dir, "history-c.txt")).length, 0);
  assert.equal(
    hash(readFileSync(join(dir, "history-c.txt"))),
    PARAMETERS.history_sha256,
  );
  const operations = JSON.parse(
      readFileSync(join(dir, "development-0.2.json"), "utf8"),
    ),
    freeze = JSON.parse(readFileSync(join(dir, "freeze-0.2.json"), "utf8"));
  assert.equal(operations.length, 9);
  assert.equal(hash(canonical(operations)), freeze.development_sha256);
  assert.equal(freeze.bundle_sha256, bundle.sha256);
  for (const c of operations)
    assert.deepEqual(Object.keys(c).sort(), [
      "base",
      "case_id",
      "case_revision",
      "pool",
      "query",
      "split",
      "task",
    ]);
  assert.doesNotMatch(
    JSON.stringify(bundle),
    /expected_answer|relevant_units|reviewer|holdout|case_id|private_hash|rubric/,
  );
});
test("deep projection canary and hash invariance; exact nested/public version rejection", () => {
  const poisoned = bundle.sources.map((s) => ({
    ...s,
    evaluation: { expected_answer: "CANARY_GOLD" },
    review: { status: "accepted" },
  }));
  assert.deepEqual(publicBundle(poisoned, root), bundle);
  assert.doesNotMatch(
    JSON.stringify(publicBundle(poisoned, root)),
    /CANARY_GOLD|accepted/,
  );
  for (const mutate of [
    (b) => (b.sources[0].rubric = "CANARY"),
    (b) => (b.parameters.private = "CANARY"),
    (b) => (b.sources[0].excerpt += "x"),
    (b) => (b.contract_version = "0.1"),
  ]) {
    const b = clone(bundle);
    mutate(b);
    assert.throws(() => validateBundle(b));
  }
  assert.throws(() => legacyBundle(bundle));
  assert.throws(() => validateCases([fixture()]));
});
test("source/path safety rejects traversal, symlinks, ranges, non-allowlisted paths and overwrite", () => {
  for (const path of [
    "../README.md",
    "src/../README.md",
    ".env",
    "src/config.ts",
    "README.md:evil",
  ])
    assert.throws(() => gitExcerpt(root, path, 1, 1));
  assert.throws(() => gitExcerpt(root, "README.md", 1, 100000));
  const s = clone(bundle.sources[0]);
  s.start_line++;
  assert.throws(() => publicBundle([s], root));
  const temp = mkdtempSync(join(tmpdir(), "mimir-v02-safe-"));
  try {
    mkdirSync(join(temp, "real"));
    writeFileSync(join(temp, "real", "file"), "safe");
    withSymlink(join(temp, "real"), join(temp, "link"), () => {
      assert.throws(() => readExplicit(join(temp, "link", "file")));
    });
    outputDirectory(join(temp, "out"), "bundle.json", { x: 1 });
    assert.throws(() =>
      outputDirectory(join(temp, "out"), "bundle.json", { x: 2 }),
    );
    assert.equal(
      JSON.parse(readExplicit(join(temp, "out", "bundle.json"))).x,
      1,
    );
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
test("review stages: pending is structural only; receipt external hash not self approval/live", () => {
  const c = fixture({ reviewed: false });
  validateCase(c, bundle);
  const receipt = {
    schema_version: "technical-review-receipt-0.2",
    author_ref: "synthetic-author",
    reviewer_ref: "synthetic-reviewer",
    verdict: "APPROVE",
    evidence_ref: "synthetic-test-only",
    bundle_sha256: bundle.sha256,
    cases_sha256: hash(canonical([c])),
  };
  assert.throws(() => reviewEligibility([c], bundle, receipt));
  const approved = fixture();
  receipt.cases_sha256 = hash(canonical([approved]));
  assert.equal(
    reviewEligibility([approved], bundle, receipt).live_enabled,
    false,
  );
  receipt.reviewer_ref = receipt.author_ref;
  assert.throws(() => reviewEligibility([approved], bundle, receipt));
});
test("fixed denominator, unique hits, R=0 versus sem_gold, baselines N_A", () => {
  const cases = [fixture()],
    input = batch(cases);
  input.observations.find((o) => o.retrieved).retrieved.push(unit());
  const result = evaluateMetricsV02(cases, bundle, input),
    b = bRun(result);
  assert.equal(b.precision_at_3.value, 1 / 3);
  assert.equal(b.recall_at_3.value, 1);
  assert.equal(b.stale_rate.unknown, 1);
  assert.equal(b.stale_rate.reason, "unavailable");
  assert.equal(result.runs[0].precision_at_3.reason, "N_A");
  for (const relevant of [[], null]) {
    const cs = [fixture({ relevant })],
      r = bRun(evaluateMetricsV02(cs, bundle, batch(cs)));
    assert.equal(r.recall_at_3.reason, relevant === null ? "sem_gold" : "N_A");
    assert.equal(r.precision_at_3.value, relevant === null ? null : 0);
  }
  const cs = [fixture({ reviewed: false })];
  assert.equal(
    bRun(evaluateMetricsV02(cs, bundle, batch(cs))).precision_at_3.reason,
    "sem_gold",
  );
});
test("failed, missing, truncated and empty retrieval never score as completed success", () => {
  const cases = [fixture()];
  for (const status of ["error", "timeout", "denied", "infeasible"]) {
    const input = batch(cases),
      o = input.observations.find((o) => o.retrieved);
    o.status = status;
    const b = bRun(evaluateMetricsV02(cases, bundle, input));
    assert.equal(b.precision_at_3.value, null);
    assert.equal(b.precision_at_3.reason, "not_completed");
  }
  let input = batch(cases);
  input.observations = [];
  let r = evaluateMetricsV02(cases, bundle, input);
  assert.equal(bRun(r).precision_at_3.reason, "not_run");
  assert.equal(r.coverage[0].attempts, 0);
  input = batch(cases);
  input.observations.find((o) => o.retrieved).retrieved = [];
  r = evaluateMetricsV02(cases, bundle, input);
  assert.equal(bRun(r).precision_at_3.value, 0);
  assert.equal(bRun(r).stale_rate.reason, "N_A");
  input = batch(cases);
  input.observations.find((o) => o.retrieved).retrieved = null;
  assert.equal(
    bRun(evaluateMetricsV02(cases, bundle, input)).precision_at_3.reason,
    "unavailable",
  );
  input = batch(cases);
  input.observations[0].truncated = true;
  r = evaluateMetricsV02(cases, bundle, input);
  assert.equal(r.comparisons[0].eligible_pairs, 0);
});
test("source accuracy requires evaluated claim/citation/excerpt; zero and absence distinct", () => {
  const cs = [fixture()],
    input = batch(cs),
    o = input.observations.find((o) => o.retrieved);
  const review = {
    reviewer_ref: "synthetic-reviewer",
    evidence_ref: "synthetic-only",
  };
  o.source_review = {
    review,
    claims: [
      {
        claim_id: "one",
        text: "Synthetic factual assertion",
        supported: true,
        citations: [
          {
            unit: "code-approval/behavior",
            excerpt: "export function nextStatus(",
          },
        ],
      },
      {
        claim_id: "two",
        text: "Uncited factual assertion",
        supported: false,
        citations: [],
      },
    ],
  };
  assert.equal(
    bRun(evaluateMetricsV02(cs, bundle, input)).source_accuracy.value,
    0.5,
  );
  o.source_review.claims[1].supported = true;
  assert.throws(() => evaluateMetricsV02(cs, bundle, input));
  o.source_review.claims = [];
  assert.equal(
    bRun(evaluateMetricsV02(cs, bundle, input)).source_accuracy.reason,
    "N_A",
  );
  o.source_review = null;
  assert.equal(
    bRun(evaluateMetricsV02(cs, bundle, input)).source_accuracy.reason,
    "unavailable",
  );
});
test("synthetic freshness only: explicit references and counts, unknown blocks rate", () => {
  const cs = [fixture()],
    input = batch(cs),
    o = input.observations.find((o) => o.retrieved),
    s = bundle.sources.find((s) => s.source_id === "code-approval");
  const current_reference = {
    unit: "code-approval/behavior",
    sha256: s.sha256,
    excerpt: "export function nextStatus(",
    reason: "SYNTHETIC TEST ONLY: semantic comparison supplied by fixture",
  };
  const review = { reviewer_ref: "synthetic", evidence_ref: "synthetic-only" };
  o.retrieved[0].freshness = { status: "stale", current_reference, review };
  let r = bRun(evaluateMetricsV02(cs, bundle, input));
  assert.equal(r.stale_rate.value, 1);
  assert.equal(r.stale_rate.stale, 1);
  o.retrieved.push(unit("code-budget/behavior"));
  r = bRun(evaluateMetricsV02(cs, bundle, input));
  assert.equal(r.stale_rate.reason, "unavailable");
  assert.equal(r.stale_rate.unknown, 1);
  o.retrieved[0].freshness.current_reference = null;
  assert.throws(() => evaluateMetricsV02(cs, bundle, input));
});
test("strict plan/pairs/splits/status/version and native token accounting", () => {
  const cs = [fixture()],
    input = batch(cs);
  for (const mutate of [
    (i) => (i.schema_version = "experimental-1"),
    (i) => i.observations.push(clone(i.observations[0])),
    (i) => (i.observations[0].status = "mystery"),
    (i) => i.plan.runs[0].case_revision++,
    (i) => (i.observations[0].cached_input_tokens = 2),
    (i) => (i.observations[0].total_latency_ms = -1),
  ]) {
    const i = clone(input);
    mutate(i);
    assert.throws(() => evaluateMetricsV02(cs, bundle, i));
  }
  assert.throws(() =>
    makePlan(
      [fixture(), { ...fixture({ split: "evaluation" }), case_id: "other" }],
      bundle,
      1,
    ),
  );
  assert.throws(() => makePlan(cs, bundle, 3));
  const i = clone(input);
  for (const o of i.observations) {
    o.total_latency_ms = o.retrieved ? 3 : 0;
    o.input_tokens = 10;
    o.cached_input_tokens = 4;
  }
  const result = evaluateMetricsV02(cs, bundle, i);
  assert.equal(result.comparisons[0].difference.median, 3);
  assert.equal(result.comparisons[0].percentage_exclusions.baseline_zero, 1);
  assert.equal(result.runs[0].input_tokens.value, 10);
  assert.equal(result.cost.reason, "unavailable");
});
test("rubric outcomes need explicit reviewed items and requirements", () => {
  const cs = [fixture()],
    input = batch(cs),
    o = input.observations.find((o) => o.retrieved);
  o.outcome = {
    review: { reviewer_ref: "synthetic", evidence_ref: "synthetic-only" },
    items: [{ id: "one", satisfied: true }],
    word_limit: true,
    citation_requirement: true,
    abstention_requirement: true,
  };
  assert.equal(
    bRun(evaluateMetricsV02(cs, bundle, input)).task_success.value,
    1,
  );
  o.outcome.word_limit = false;
  assert.equal(
    bRun(evaluateMetricsV02(cs, bundle, input)).task_success.value,
    0,
  );
  o.outcome.word_limit = null;
  assert.equal(
    bRun(evaluateMetricsV02(cs, bundle, input)).task_success.reason,
    "unavailable",
  );
  o.outcome.items = [];
  assert.throws(() => evaluateMetricsV02(cs, bundle, input));
});
test("public renderer separate process: I/O allowlist, canary gold absent, byte budget", () => {
  const temp = mkdtempSync(join(tmpdir(), "mimir-v02-public-"));
  try {
    const req = join(temp, "request.json"),
      bp = join(temp, "sources.json"),
      guard = join(temp, "guard.mjs");
    writeFileSync(bp, JSON.stringify(bundle));
    writeFileSync(
      req,
      JSON.stringify({
        task: "Public task",
        base: ["code-approval/behavior"],
        retrieved: [],
      }),
    );
    writeFileSync(join(temp, "private-gold.json"), "CANARY_GOLD_DO_NOT_READ");
    writeFileSync(
      guard,
      `import fs from 'node:fs';import {syncBuiltinESMExports} from 'node:module';const allowed=new Set(${JSON.stringify([bp, req])});for(const key of ['readFileSync','openSync']){const original=fs[key];fs[key]=function(path,...args){if(typeof path==='string'&&!allowed.has(path))throw Error('Forbidden I/O');return original.call(this,path,...args);};}syncBuiltinESMExports();`,
    );
    const args = [
      "--import",
      pathToFileURL(guard).href,
      join(root, "scripts/benchmarks/v02-cli.mjs"),
      "public-render",
      bp,
      req,
    ];
    const out = execFileSync(process.execPath, args, { encoding: "utf8" });
    assert.doesNotMatch(
      out,
      /CANARY|case_id|split|rubric|relevant_units|review|sha256.*private/,
    );
    assert.equal(JSON.parse(out).task, "Public task");
    assert.equal(
      execFileSync(process.execPath, args, { encoding: "utf8" }),
      out,
    );
    writeFileSync(
      req,
      JSON.stringify({
        task: "Public",
        base: [],
        retrieved: [],
        private: "CANARY",
      }),
    );
    assert.notEqual(spawnSync(process.execPath, args).status, 0);
    assert.throws(() =>
      runtimeEnvelope(bundle, "x".repeat(33000), ["code-approval/behavior"]),
    );
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
test("private dev/eval CLI split gates, deterministic replay and no-overwrite with synthetic fixtures", () => {
  const temp = mkdtempSync(join(tmpdir(), "mimir-v02-replay-"));
  try {
    const bp = join(temp, "bundle.json"),
      cp = join(temp, "cases.json"),
      ip = join(temp, "input.json"),
      cli = join(root, "scripts/benchmarks/v02-cli.mjs");
    const cs = [fixture()];
    writeFileSync(bp, JSON.stringify(bundle));
    writeFileSync(cp, JSON.stringify(cs));
    writeFileSync(ip, JSON.stringify(batch(cs)));
    for (const name of ["one", "two"])
      execFileSync(process.execPath, [
        cli,
        "private-dev-metrics",
        bp,
        cp,
        ip,
        join(temp, name),
      ]);
    assert.equal(
      readFileSync(join(temp, "one", "metrics.json"), "utf8"),
      readFileSync(join(temp, "two", "metrics.json"), "utf8"),
    );
    assert.notEqual(
      spawnSync(process.execPath, [
        cli,
        "private-dev-metrics",
        bp,
        cp,
        ip,
        join(temp, "one"),
      ]).status,
      0,
    );
    assert.notEqual(
      spawnSync(process.execPath, [
        cli,
        "private-eval-plan",
        bp,
        cp,
        join(temp, "wrong"),
      ]).status,
      0,
    );
    execFileSync(process.execPath, [
      cli,
      "private-dev-plan",
      bp,
      cp,
      join(temp, "plan"),
    ]);
    assert.equal(
      JSON.parse(readFileSync(join(temp, "plan", "plan.json"), "utf8"))
        .executable,
      false,
    );
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
