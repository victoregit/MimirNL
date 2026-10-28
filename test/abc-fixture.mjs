import { resolve } from "node:path";
// Public development operations plus clearly synthetic evaluation slots, never real holdout.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";
import { core108Fixture } from "./core108-fixture.mjs";
import { hash, canonical } from "../scripts/benchmarks/abc-public.mjs";
export const root = core108Fixture(
  resolve(fileURLToPath(new URL("../", import.meta.url))),
);
export const benchmarkModule = (name) =>
  import(pathToFileURL(root + "/scripts/benchmarks/" + name).href);
const { exportABC } = await benchmarkModule("abc-export.mjs");
let cached;
export function fixture() {
  if (cached) return structuredClone(cached);
  const directory = root + "/docs/benchmarks/v03/evidencias/preparacao/";
  const bundle = JSON.parse(readFileSync(directory + "sources-0.2.json"));
  const dev = JSON.parse(readFileSync(directory + "development-0.2.json"));
  const enrich = (operation) => {
    const source = bundle.sources.find(
      (s) => s.source_id + "/" + s.unit_id === operation.pool[0],
    );
    return {
      contract_version: "0.2",
      profile: "technical_reviewed-v1",
      ...operation,
      origin: "SYNTHETIC RECEIPT TEST ONLY",
      evaluation: {
        relevant_units: null,
        expected_answer: "SYNTHETIC; no answer generated",
        rubric: [
          { id: "synthetic", criterion: "Externally judged only", weight: 1 },
        ],
        source_evidence: [{ unit: operation.pool[0], excerpt: source.excerpt }],
      },
      technical_review: {
        status: "technical_reviewed",
        author_ref: "synthetic-author",
        reviewer_ref: "synthetic-reviewer",
        evidence_ref: "synthetic-not-approval",
      },
      human_acceptance_ref: null,
    };
  };
  const casesBySplit = [
    dev.map(enrich),
    dev
      .slice(0, 3)
      .map((c, i) =>
        enrich({ ...c, case_id: "synthetic-eval-" + i, split: "evaluation" }),
      ),
  ];
  const receipts = casesBySplit.map((cs) => ({
    schema_version: "technical-review-receipt-0.2",
    author_ref: "synthetic-author",
    reviewer_ref: "synthetic-reviewer",
    verdict: "APPROVE",
    evidence_ref: "synthetic-not-approval",
    bundle_sha256: bundle.sha256,
    cases_sha256: hash(canonical(cs)),
  }));
  cached = {
    ...exportABC({
      bundle,
      casesBySplit,
      receipts,
      root,
      epoch: 1,
      synthetic: true,
    }),
    casesBySplit,
    receipts,
  };
  return structuredClone(cached);
}
