import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { validateCases, planCases } from "../scripts/benchmarks/preflight.mjs";

const cli = fileURLToPath(
  new URL("../scripts/benchmarks/preflight-cli.mjs", import.meta.url),
);
function fixture() {
  return {
    contract_version: "0.1",
    case_id: "fictional-case",
    case_revision: 2,
    illustrative_only: false,
    split: "development",
    source: { repository: "fictional-repository", commit_sha: "a".repeat(40) },
    sources: [
      {
        source_id: "guide",
        unit_id: "color",
        path: "docs/fictional.md",
        start_line: 1,
        end_line: 2,
        excerpt: "PRIVATE_EXCERPT_á\r\n",
        sha256: createHash("sha256")
          .update("PRIVATE_EXCERPT_á\r\n", "utf8")
          .digest("hex"),
      },
    ],
    model_context: { task: "PRIVATE_TASK", allowed_source_ids: ["guide"] },
    evaluation_private: {
      gold_status: "validated",
      expected_answer: "PRIVATE_GOLD",
      relevant_unit_ids: ["guide/color"],
      success_criteria: ["PRIVATE_SUCCESS"],
      rubric: [{ id: "fact", criterion: "PRIVATE_CRITERION", weight: 1 }],
    },
    review: {
      author: "PRIVATE_AUTHOR",
      source_reviewer: "PRIVATE_REVIEWER",
      codex_review_ref: "PRIVATE_CODEX",
      human_acceptance_ref: "PRIVATE_ACCEPTANCE",
      decision: "accepted",
      notes: "PRIVATE_NOTES",
    },
    permissions_ref: "PRIVATE_PERMISSION",
  };
}
const reject = (mutate) => {
  const c = fixture();
  mutate(c);
  assert.throws(() => validateCases([c]), /^Error: Invalid cases:/);
};

test("contract illustrative JSON validates structure but cannot be planned", () => {
  const contract = readFileSync(
    new URL("../docs/benchmarks/v03/contrato.md", import.meta.url),
    "utf8",
  );
  const example = JSON.parse(contract.match(/```json\n([\s\S]*?)\n```/)[1]);
  assert.equal(validateCases([example]).status, "structurally_valid");
  assert.throws(() => planCases([example], 3), /Planning requires/);
});

test("synthetic accepted provenance produces deterministic paired balanced public matrix", () => {
  const a = fixture(),
    b = fixture();
  b.case_id = "another-case";
  const plan = planCases([a, b], 3);
  assert.deepEqual(plan, planCases([b, a], 3));
  assert.equal(plan.status, "planned");
  assert.equal(plan.executable, false);
  assert.equal(plan.provenance, "caller_provided_not_verified");
  assert.equal(plan.model, null);
  assert.equal(plan.task_budget, null);
  assert.equal(plan.runs.length, 18);
  assert.equal(new Set(plan.runs.map((r) => r.run_id)).size, 18);
  const scenarios = ["sem_memoria", "com_mimir", "historico_completo"];
  for (const c of [a, b]) {
    const runs = plan.runs.filter((r) => r.case_id === c.case_id);
    for (let repetition = 1; repetition <= 3; repetition++) {
      const pair = runs.filter((r) => r.repetition === repetition);
      assert.deepEqual(
        pair.map((r) => r.scenario).sort(),
        [...scenarios].sort(),
      );
      for (const r of pair) {
        assert.equal(r.case_revision, 2);
        assert.equal(r.source_commit_sha, a.source.commit_sha);
        assert.equal(r.status, "not_run");
        assert.deepEqual(
          Object.keys(r).sort(),
          [
            "run_id",
            "case_id",
            "case_revision",
            "scenario",
            "repetition",
            "source_commit_sha",
            "scenario_order",
            "status",
          ].sort(),
        );
      }
    }
    for (const scenario of scenarios)
      assert.deepEqual(
        runs
          .filter((r) => r.scenario === scenario)
          .map((r) => r.scenario_order)
          .sort(),
        [1, 2, 3],
      );
  }
  assert.deepEqual(
    plan.runs.slice(0, 9).map((r) => r.scenario),
    [
      ...scenarios,
      scenarios[1],
      scenarios[2],
      scenarios[0],
      scenarios[2],
      scenarios[0],
      scenarios[1],
    ],
  );
  const serialized = JSON.stringify(plan);
  for (const privateText of [
    "PRIVATE_",
    "docs/fictional.md",
    "fictional-repository",
    "guide",
    "expected_answer",
    "rubric",
    "model_context",
  ])
    assert.equal(serialized.includes(privateText), false, privateText);
});

test("required fields, types, enums, versions and exact nested allowlists", () => {
  for (const key of Object.keys(fixture()))
    reject((c) => {
      delete c[key];
    });
  for (const field of [
    null,
    "source",
    "model_context",
    "evaluation_private",
    "review",
  ])
    reject((c) => {
      (field ? c[field] : c).PRIVATE_UNKNOWN_KEY = "PRIVATE_VALUE";
    });
  reject((c) => {
    c.sources[0].extra = "PRIVATE_VALUE";
  });
  reject((c) => {
    c.evaluation_private.rubric[0].extra = true;
  });
  for (const value of [null, {}, [], "0.2", 0.1])
    reject((c) => {
      c.contract_version = value;
    });
  reject((c) => {
    c.split = "invalid";
  });
  reject((c) => {
    c.review.decision = "invalid";
  });
  reject((c) => {
    c.evaluation_private.gold_status = "invalid";
  });
  reject((c) => {
    c.illustrative_only = "false";
  });
  reject((c) => {
    c.case_id = "";
  });
  reject((c) => {
    c.model_context = null;
  });
  reject((c) => {
    c.sources = [];
  });
  reject((c) => {
    c.evaluation_private.success_criteria = [];
  });
  reject((c) => {
    c.evaluation_private.rubric = [];
  });
  assert.throws(() => validateCases([]));
  assert.throws(() => validateCases(fixture()));
});

test("portable paths, line bounds, SHA format and exact UTF8 excerpt hash", () => {
  for (const path of [
    "/absolute",
    "C:/drive",
    "C:drive",
    "\\\\server\\share",
    "a\\b",
    "a/../b",
    "../escape",
    "a/./b",
    "a//b",
    "a\0b",
    "a/",
    "",
  ])
    reject((c) => {
      c.sources[0].path = path;
    });
  reject((c) => {
    c.source.repository = "/local/path";
  });
  for (const value of [
    0,
    -1,
    1.5,
    NaN,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
    "1",
  ])
    for (const field of ["start_line", "end_line"])
      reject((c) => {
        c.sources[0][field] = value;
      });
  reject((c) => {
    c.sources[0].start_line = 3;
  });
  reject((c) => {
    c.case_revision = 0;
  });
  for (const value of ["a".repeat(39), "g".repeat(40), "A".repeat(40)])
    reject((c) => {
      c.source.commit_sha = value;
    });
  reject((c) => {
    c.sources[0].sha256 = "a".repeat(63);
  });
  reject((c) => {
    c.sources[0].sha256 = "0".repeat(64);
  });
  reject((c) => {
    c.sources[0].excerpt += "\n";
  });
  assert.equal(validateCases([fixture()]).case_count, 1);
});

test("source/unit refs, duplicate batch revisions, rubric uniqueness and finite weights", () => {
  reject((c) => {
    c.sources.push(structuredClone(c.sources[0]));
  });
  reject((c) => {
    c.model_context.allowed_source_ids = ["missing"];
  });
  reject((c) => {
    c.model_context.allowed_source_ids = ["guide", "guide"];
  });
  reject((c) => {
    c.evaluation_private.relevant_unit_ids = ["missing/unit"];
  });
  reject((c) => {
    c.evaluation_private.relevant_unit_ids = ["guide/color", "guide/color"];
  });
  reject((c) => {
    c.evaluation_private.rubric.push(
      structuredClone(c.evaluation_private.rubric[0]),
    );
  });
  for (const weight of [0, -1, NaN, Infinity, -Infinity, "1", null])
    reject((c) => {
      c.evaluation_private.rubric[0].weight = weight;
    });
  for (const revision of [2, 3]) {
    const c = fixture(),
      other = fixture();
    other.case_revision = revision;
    assert.throws(
      () => validateCases([c, other]),
      /duplicate case ID or ambiguous revisions/,
    );
  }
});

test("accepted/validated references and independent reviewer are required", () => {
  for (const key of [
    "source_reviewer",
    "codex_review_ref",
    "human_acceptance_ref",
  ])
    reject((c) => {
      c.review[key] = null;
    });
  reject((c) => {
    c.permissions_ref = null;
  });
  reject((c) => {
    c.review.source_reviewer = c.review.author;
  });
  reject((c) => {
    c.review.decision = "pending";
  });
  reject((c) => {
    c.evaluation_private.expected_answer = null;
  });
  reject((c) => {
    c.evaluation_private.relevant_unit_ids = null;
  });
  const c = fixture();
  c.evaluation_private.gold_status = "sem_gold";
  c.evaluation_private.expected_answer = null;
  c.evaluation_private.relevant_unit_ids = null;
  assert.equal(validateCases([c]).status, "structurally_valid");
  assert.throws(() => planCases([c], 1), /Planning requires/);
  c.review.decision = "pending";
  c.review.source_reviewer =
    c.review.codex_review_ref =
    c.review.human_acceptance_ref =
    c.permissions_ref =
      null;
  assert.equal(validateCases([c]).status, "structurally_valid");
});

test("repetition limits and total matrix bound", () => {
  for (const reps of [undefined, null, 0, -1, 1.5, NaN, Infinity, "3", 101])
    assert.throws(() => planCases([fixture()], reps), /Repetitions/);
  assert.equal(planCases([fixture()], 1).runs.length, 3);
  assert.equal(planCases([fixture()], 100).runs.length, 300);
  const cases = Array.from({ length: 4 }, (_, i) => ({
    ...fixture(),
    case_id: `case-${i}`,
  }));
  assert.equal(planCases(cases, 83).runs.length, 996);
  assert.throws(() => planCases(cases, 84), /1000 runs/);
});

test("actual CLI reads supplied JSON only, handles errors privately and never overwrites", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "mimir-preflight-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const input = join(dir, "PRIVATE_INPUT.json"),
    output = join(dir, "plan.json");
  const run = (...args) =>
    spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
  writeFileSync(input, JSON.stringify([fixture()]));
  assert.equal(run("--help").status, 0);
  const validated = run("validate", input);
  assert.equal(validated.status, 0);
  assert.equal(
    (validated.stdout + validated.stderr).includes("PRIVATE_"),
    false,
  );
  assert.equal(run("plan", input, "--reps", "3", "--out", output).status, 0);
  const bytes = readFileSync(output);
  assert.equal(JSON.parse(bytes).runs.length, 9);
  assert.equal(bytes.includes(Buffer.from("PRIVATE_")), false);
  const collision = run("plan", input, "--reps", "1", "--out", output);
  assert.equal(collision.status, 1);
  assert.deepEqual(readFileSync(output), bytes);
  const link = join(dir, "link.json");
  symlinkSync(output, link);
  assert.equal(run("plan", input, "--reps", "1", "--out", link).status, 1);
  assert.deepEqual(readFileSync(output), bytes);
  for (const args of [
    ["plan", input],
    ["validate", input, "extra"],
    ["plan", input, "--reps", "NaN", "--out", output],
    ["validate", join(dir, "PRIVATE_MISSING")],
  ]) {
    const r = run(...args);
    assert.equal(r.status, 1);
    assert.equal((r.stdout + r.stderr).includes("PRIVATE_"), false);
  }
  for (const content of [
    '{"PRIVATE_INVALID_JSON":',
    JSON.stringify([{ ...fixture(), PRIVATE_EXTRA: "PRIVATE_VALUE" }]),
    JSON.stringify([
      {
        ...fixture(),
        model_context: {
          task: "PRIVATE_TASK",
          allowed_source_ids: ["PRIVATE_MISSING_REF"],
        },
      },
    ]),
  ]) {
    writeFileSync(input, content);
    const r = run("validate", input);
    assert.equal(r.status, 1);
    assert.equal((r.stdout + r.stderr).includes("PRIVATE_"), false);
  }
  assert.deepEqual(readFileSync(output), bytes);
});

test("module imports have no output or filesystem effects", () => {
  const moduleURL = new URL(
    "../scripts/benchmarks/preflight-cli.mjs",
    import.meta.url,
  ).href;
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "-e", `await import(${JSON.stringify(moduleURL)})`],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
});
