import { withSymlink } from "./platform-fixture.mjs";
import { assertPrivateMode } from "./platform-fixture.mjs";
import { tmpdir } from "node:os";
import { pinnedSourceFixture } from "./pinned-source-fixture.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  mkdtempSync,
  rmSync,
  existsSync,
  statSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
} from "node:fs";
import { join, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import {
  loadLegacy,
  exportCases,
} from "../scripts/benchmarks/export-cases.mjs";
import {
  validateBundle,
  hash,
  seal,
  canonical,
  portable,
} from "../scripts/benchmarks/public-bundle.mjs";
import {
  outputDirectory,
  readExplicit,
} from "../scripts/benchmarks/offline-files.mjs";
import {
  plan,
  runOffline,
  promptFor,
  validateSelection,
} from "../scripts/benchmarks/multicase-runner.mjs";

const root = fileURLToPath(new URL("../", import.meta.url)).replace(/\/$/, "");
const sourceRoot = pinnedSourceFixture(root);
const docs = join(root, "docs/benchmarks/v03");
const expanded = JSON.parse(
  readFileSync(join(docs, "corpus-ampliado.json"), "utf8"),
);
const legacyText = readFileSync(join(docs, "casos.md"), "utf8");
const originals = loadLegacy(legacyText);
const cases = [...expanded, ...originals];
const protocol = JSON.parse(
  readFileSync(join(docs, "protocolo-ampliado.json"), "utf8"),
);
const bundle = exportCases({ cases, protocol, root: sourceRoot });
const options = {
  bundle,
  caseIds: "all",
  repetitions: 1,
  maxRuns: 18,
  runBudgetMs: 60000,
};
const clone = (v) => structuredClone(v);
const fixed = (e) => e.message === "Invalid offline input or local operation.";
function temporary(fn) {
  return async () => {
    const dir = mkdtempSync(join(tmpdir(), "mimir-task85-test-"));
    try {
      await fn(dir);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };
}
function reseal(b) {
  const { sha256, ...payload } = b;
  return seal(payload);
}

test("real six plus three export is faithful, blocked and leaves originals untouched", () => {
  const before = [
    join(docs, "corpus-ampliado.json"),
    join(docs, "casos.md"),
  ].map((p) => hash(readFileSync(p)));
  assert.equal(bundle.cases.length, 9);
  assert.equal(bundle.execution.executable, false);
  assert.equal(
    exportCases({ cases: expanded, protocol, root: sourceRoot }).cases.length,
    6,
  );
  assert.equal(validateBundle(bundle), bundle);
  for (const c of cases) {
    const p = bundle.cases.find((p) => p.case_id === c.case_id);
    assert.deepEqual(p.sources, c.sources);
    assert.deepEqual(p.operation.pool, c.model_context.allowed_source_ids);
    assert.equal(c.evaluation_private.gold_status, "pending");
    assert.equal(c.review.decision, "pending");
  }
  assert.deepEqual(
    before,
    [join(docs, "corpus-ampliado.json"), join(docs, "casos.md")].map((p) =>
      hash(readFileSync(p)),
    ),
  );
  assert.equal(
    bundle.cases.find((c) => c.case_id === "pilot-approval").operation.query,
    "nextStatus explicitApproval approve reject supersede",
  );
  const negative = bundle.cases.find(
    (c) => c.case_id === "expanded-production-p95-absent",
  );
  assert.equal(negative.sources.length, 4);
});

test("all private text canaries vanish; gold changes do not change public digest", () => {
  const altered = clone(cases),
    canary = "PRIVATE_CANARY_85";
  for (const c of altered) {
    c.evaluation_private.expected_answer = canary;
    c.evaluation_private.success_criteria = [canary];
    c.evaluation_private.rubric = [
      { id: canary, criterion: canary, weight: 99 },
    ];
    c.review.author = canary;
    c.review.source_reviewer = canary;
    c.review.codex_review_ref = canary;
    c.review.human_acceptance_ref = canary;
    c.review.notes = canary;
    c.permissions_ref = canary;
  }
  const b = exportCases({ cases: altered, protocol, root: sourceRoot });
  assert.deepEqual(b, bundle);
  assert.ok(!canonical(b).includes(canary));
  for (const c of b.cases) assert.ok(!promptFor(c, c.sources).includes(canary));
  for (const mutate of [
    (c) => (c.evaluation_private.gold_status = canary),
    (c) => (c.review.decision = canary),
    (c) => (c.evaluation_private.relevant_unit_ids = [canary]),
    (c) => (c.evaluation_private[canary] = canary),
  ]) {
    const bad = clone(cases);
    mutate(bad[0]);
    assert.throws(
      () => exportCases({ cases: bad, protocol, root: sourceRoot }),
      fixed,
    );
  }
});

test("public schema refuses private objects, nested extras and tampering", () => {
  assert.throws(() => validateBundle(cases), fixed);
  const paths = [
    (b) => b,
    (b) => b.execution,
    (b) => b.cases[0],
    (b) => b.cases[0].source,
    (b) => b.cases[0].sources[0],
    (b) => b.cases[0].operation,
  ];
  for (const get of paths) {
    const b = clone(bundle);
    get(b).PRIVATE_CANARY = "secret";
    assert.throws(() => validateBundle(b), fixed);
  }
  for (const mutate of [
    (b) => (b.cases[0].sources[0].excerpt += "x"),
    (b) => (b.cases[0].question += "x"),
    (b) => (b.sha256 = "0".repeat(64)),
    (b) => b.cases[0].operation.pool.reverse(),
    (b) => (b.execution.executable = true),
    (b) => b.cases.push(b.cases[0]),
  ]) {
    const b = clone(bundle);
    mutate(b);
    assert.throws(() => validateBundle(b), fixed);
  }
  const b = clone(bundle);
  b.cases[0].split = "evaluation";
  assert.throws(() => reseal(b), fixed);
});

test("legacy parser rejects ambiguous/malformed blocks without executing markdown", () => {
  assert.equal(loadLegacy(legacyText).length, 3);
  for (const s of [
    legacyText + "\n```json\n[]\n```\n",
    "```json\ninvalid\n```",
    "```js\nthrow Error()\n```",
    legacyText.replace('"case_revision": 1', '"case_revision": 0'),
  ])
    assert.throws(() => loadLegacy(s), fixed);
});

test("source guards reject traversal, sensitive paths, altered excerpts/ranges and missing blobs", () => {
  for (const path of [
    "../x",
    "/x",
    "a//b",
    "a/./b",
    "a\\b",
    ".env",
    "x/.env.local",
    ".ssh/id_rsa",
    ".aws/credentials",
    "secret.pem",
    "logs/file",
    "config/file",
    "auth/file",
  ])
    assert.throws(() => portable(path), fixed);
  for (const mutate of [
    (s) => (s.path = ".env"),
    (s) => (s.path = "missing-file"),
    (s) => s.start_line++,
    (s) => s.end_line++,
    (s) => {
      s.excerpt += "CANARY";
      s.sha256 = hash(s.excerpt);
    },
  ]) {
    const c = clone(cases);
    mutate(c[0].sources[0]);
    assert.throws(
      () => exportCases({ cases: c, protocol, root: sourceRoot }),
      fixed,
    );
  }
  const p = clone(protocol);
  p.cases[0].pool.pop();
  assert.throws(
    () => exportCases({ cases, protocol: p, root: sourceRoot }),
    fixed,
  );
});

test(
  "worktree modification and symlinks refused in an isolated clone",
  temporary(async (dir) => {
    const repo = join(dir, "repo");
    execFileSync(
      "git",
      ["clone", "--quiet", "--no-hardlinks", sourceRoot, repo],
      {
        stdio: "ignore",
      },
    );
    const path = join(repo, "src/optimization/index.ts");
    writeFileSync(path, "CANARY");
    assert.throws(() => exportCases({ cases, protocol, root: repo }), fixed);
    rmSync(path);
    withSymlink(join(root, "src/optimization/index.ts"), path, () => {
      assert.throws(() => exportCases({ cases, protocol, root: repo }), fixed);
    });
  }),
);

test(
  "exclusive private outputs and input symlinks preserve preexisting files",
  temporary(async (dir) => {
    const out = join(dir, "out");
    outputDirectory(out, "bundle.json", bundle);
    assertPrivateMode(out, 0o700);
    assertPrivateMode(join(out, "bundle.json"), 0o600);
    const saved = readFileSync(join(out, "bundle.json"), "utf8");
    assert.throws(() => outputDirectory(out, "bundle.json", {}), fixed);
    assert.equal(readFileSync(join(out, "bundle.json"), "utf8"), saved);
    const link = join(dir, "link");
    withSymlink(out, link, () => {
      assert.throws(
        () => outputDirectory(join(link, "child"), "bundle.json", {}),
        fixed,
      );
    });
    withSymlink(join(out, "bundle.json"), join(dir, "input"), () => {
      assert.throws(() => readExplicit(join(dir, "input")), fixed);
    });
    const bad = join(dir, "bad");
    const circular = {};
    circular.self = circular;
    assert.throws(() => outputDirectory(bad, "bundle.json", circular), fixed);
    assert.equal(existsSync(bad), false);
  }),
);

test("matrix is case-qualified, deterministic AB/BA, bounded and preserves slots", () => {
  const p = plan({ ...options, repetitions: 3, maxRuns: 54, offset: 0 });
  assert.equal(p.positions.length, 54);
  assert.equal(new Set(p.positions.map((r) => r.run_id)).size, 54);
  assert.ok(
    p.positions.every((r) => r.status === "not_run" && r.usage === null),
  );
  assert.deepEqual(
    p.positions.slice(0, 6).map((r) => r.condition),
    [
      "contexto_completo",
      "selecao_mimir",
      "selecao_mimir",
      "contexto_completo",
      "contexto_completo",
      "selecao_mimir",
    ],
  );
  const id = bundle.cases[0].case_id;
  assert.equal(plan({ ...options, caseIds: [id] }).positions.length, 2);
  for (const extra of [
    { caseIds: [] },
    { caseIds: [id, id] },
    { caseIds: ["unknown"] },
    { repetitions: 0 },
    { maxRuns: 17 },
    { runBudgetMs: NaN },
    { offset: -1 },
  ])
    assert.throws(() => plan({ ...options, ...extra }), fixed);
});

test(
  "invalid input fails before output, storage or fake invocation",
  temporary(async (dir) => {
    let calls = 0;
    const fake = {
      kind: "declared-offline-fake",
      send: async () => {
        calls++;
        return { marker: "offline-simulation" };
      },
    };
    const out = join(dir, "out"),
      b = clone(bundle);
    b.cases[0].question += "tamper";
    await assert.rejects(
      runOffline({ ...options, bundle: b, out, simulate: true, fake }),
      fixed,
    );
    assert.equal(calls, 0);
    assert.equal(existsSync(out), false);
    await assert.rejects(
      runOffline({
        ...options,
        out,
        simulate: true,
        fake: { kind: "real", send: () => {} },
      }),
      fixed,
    );
    assert.equal(existsSync(out), false);
  }),
);

test(
  "real Mimir all-nine simulation uses exact pools, real selection and neutral fake",
  temporary(async (dir) => {
    const prompts = [];
    const fake = {
      kind: "declared-offline-fake",
      send: async (data) => {
        prompts.push(data);
        return { marker: "offline-simulation" };
      },
    };
    const out = join(dir, "run"),
      p = await runOffline({ ...options, out, simulate: true, fake });
    assert.equal(p.simulated_count, 18);
    assert.equal(p.actual_model_calls, 0);
    assert.equal(p.not_execution_proof, true);
    assert.equal(prompts.length, 18);
    for (const s of p.positions) {
      assert.equal(s.status, "simulated");
      assert.equal(s.usage_status, "unavailable");
      assert.equal(s.usage, null);
      assert.equal(s.retrieval_calls, s.condition === "selecao_mimir" ? 1 : 0);
      const c = bundle.cases.find((c) => c.case_id === s.case_id);
      const capture = JSON.parse(
        readFileSync(join(out, `context-${s.position}.json`), "utf8"),
      );
      const envelope = JSON.parse(capture.prompt);
      assert.deepEqual(envelope.history, []);
      assert.deepEqual(capture.history, []);
      assert.ok(!capture.prompt.includes(c.case_id));
      assert.ok(!capture.prompt.includes(out));
      assert.ok(!capture.prompt.includes('"query"'));
      assert.ok(!capture.prompt.includes('"evaluation_private"'));
      if (s.condition === "contexto_completo")
        assert.deepEqual(envelope.sources, c.sources);
      else {
        assert.ok(envelope.sources.length <= 4);
        for (const source of envelope.sources)
          assert.deepEqual(
            source,
            c.sources.find((s) => s.source_id === source.source_id),
          );
      }
      assert.ok(s.simulated_end_to_end_ms >= 0);
      if (s.condition === "selecao_mimir")
        assert.ok(s.simulated_end_to_end_ms >= s.retrieval_ms);
    }
    assert.ok(!readdirSync(out).some((f) => f.startsWith("slot-")));
    const negative = p.positions.find(
      (s) =>
        s.case_id === "expanded-production-p95-absent" &&
        s.condition === "selecao_mimir",
    );
    assert.ok(
      negative.sources.length > 0,
      "lexical false positives remain, never force empty based on private R",
    );
  }),
);

test("empty selections remain empty; nonmember or corrupted returns rejected", () => {
  const c = bundle.cases[0];
  assert.deepEqual(validateSelection([], c), []);
  const s = c.sources[0],
    row = {
      source: { reference: `${s.source_id}/${s.unit_id}` },
      content: s.excerpt,
      hash: s.sha256,
    };
  assert.deepEqual(validateSelection([row, row], c), [s]);
  assert.throws(
    () => validateSelection([{ ...row, content: "CANARY" }], c),
    fixed,
  );
  assert.throws(
    () => validateSelection([{ ...row, source: { reference: "unknown" } }], c),
    fixed,
  );
});

test(
  "continuous B timer includes one retrieval, serialization and fake, excluding setup",
  temporary(async (dir) => {
    let tick = 0;
    const p = await runOffline({
      ...options,
      caseIds: [bundle.cases[0].case_id],
      out: join(dir, "run"),
      simulate: true,
      clock: () => ++tick,
      fake: {
        kind: "declared-offline-fake",
        send: async () => {
          tick += 50;
          return { marker: "offline-simulation" };
        },
      },
    });
    const b = p.positions.find((s) => s.condition === "selecao_mimir");
    assert.equal(b.retrieval_calls, 1);
    assert.ok(b.simulated_end_to_end_ms >= 52);
    assert.equal(b.setup_ms, 1);
  }),
);

test(
  "budget exhaustion retains not_run positions; failures never become completed",
  temporary(async (dir) => {
    let t = 0;
    const p = await runOffline({
      ...options,
      out: join(dir, "budget"),
      simulate: true,
      runBudgetMs: 1,
      clock: () => (t += 2),
    });
    assert.equal(p.positions.length, 18);
    assert.equal(p.simulated_count, 0);
    assert.ok(
      p.positions.every(
        (s) => s.status === "not_run" && s.exclusion === "run_budget",
      ),
    );
    const q = await runOffline({
      ...options,
      caseIds: [bundle.cases[0].case_id],
      out: join(dir, "failure"),
      simulate: true,
      fake: {
        kind: "declared-offline-fake",
        send: async () => {
          throw Error("PRIVATE_CANARY");
        },
      },
    });
    assert.ok(q.positions.every((s) => s.status === "local_error"));
    assert.ok(!canonical(q).includes("PRIVATE_CANARY"));
  }),
);

test(
  "baseline cap yields infeasible with no truncation or cap increase",
  temporary(async (dir) => {
    const b = clone(bundle);
    b.cases[0].question = "q".repeat(32000);
    const large = reseal(b);
    const p = await runOffline({
      ...options,
      bundle: large,
      caseIds: [large.cases[0].case_id],
      out: join(dir, "run"),
      simulate: true,
    });
    assert.ok(
      p.positions.every(
        (s) => s.status === "infeasible" && s.exclusion === "context_cap",
      ),
    );
    assert.equal(p.simulated_count, 0);
  }),
);

test(
  "imports/help have no I/O; runtime dependency graph excludes private corpus/host modules",
  temporary(async (dir) => {
    const modules = [
      "public-bundle.mjs",
      "export-cases.mjs",
      "export-cases-cli.mjs",
      "multicase-runner.mjs",
    ];
    for (const module of modules) {
      const path = join(root, "scripts/benchmarks", module);
      const result = spawnSync(
        process.execPath,
        [
          "--input-type=module",
          "-e",
          `import fs from 'node:fs';import cp from 'node:child_process';import {syncBuiltinESMExports} from 'node:module';const read=fs.readFileSync;fs.readFileSync=(p,...a)=>{if(String(p).replaceAll(String.fromCharCode(92),'/').includes('/scripts/benchmarks/')&&String(p).endsWith('.mjs'))return read(p,...a);throw Error('IO');};for(const k of ['mkdirSync','writeFileSync','rmSync']) fs[k]=()=>{throw Error('IO');};cp.execFileSync=()=>{throw Error('spawn');};syncBuiltinESMExports();await import(${JSON.stringify(pathToFileURL(path).href)});`,
        ],
        { cwd: dir, encoding: "utf8" },
      );
      assert.equal(result.status, 0, result.stderr);
    }
    for (const module of ["export-cases-cli.mjs", "multicase-runner.mjs"]) {
      const r = spawnSync(
        process.execPath,
        [join(root, "scripts/benchmarks", module), "--help"],
        { cwd: dir, encoding: "utf8" },
      );
      assert.equal(r.status, 0);
    }
    assert.deepEqual(readdirSync(dir), []);
    // Enforce the small runtime dependency closure, rather than letting a private
    // loader accidentally enter memory through a reused legacy runner import.
    for (const module of [
      "multicase-runner.mjs",
      "public-bundle.mjs",
      "offline-files.mjs",
    ]) {
      const source = readFileSync(
        join(root, "scripts/benchmarks", module),
        "utf8",
      );
      assert.ok(
        !/export-cases|preflight|paired-probe|context-selection-probe|live-flow|corpus-ampliado|casos\.md|codex|antigravity/i.test(
          source,
        ),
      );
    }
    const live = spawnSync(
      process.execPath,
      [join(root, "scripts/benchmarks/multicase-runner.mjs"), "--run"],
      { cwd: dir, encoding: "utf8" },
    );
    assert.equal(live.status, 1);
    assert.equal(live.stderr.trim(), "Offline operation failed.");
  }),
);

test(
  "isolated runtime process opens only public bundle, owned fixtures and module code",
  temporary(async (dir) => {
    const input = join(dir, "bundle.json"),
      out = join(dir, "run");
    writeFileSync(input, JSON.stringify(bundle), { mode: 0o600 });
    const code = `
    import fs from 'node:fs';
    import cp from 'node:child_process';
    import {syncBuiltinESMExports} from 'node:module';
    const input=${JSON.stringify(input)},out=${JSON.stringify(out)};
    const read=fs.readFileSync,open=fs.openSync,exec=cp.execFileSync;
    fs.readFileSync=(p,...a)=>{
      if(typeof p==='number'||/\\.(?:mjs|js)$/.test(String(p)))return read(p,...a);
      throw Error('forbidden-data-read');
    };
    fs.openSync=(p,...a)=>{
      if(p===input||String(p).startsWith(out+${JSON.stringify(sep)})||/\\.(?:mjs|js)$/.test(String(p)))return open(p,...a);
      throw Error('forbidden-open');
    };
    cp.execFileSync=(bin,args,...a)=>{
      const init=bin==='git'&&args[0]==='init'&&args[2].startsWith(out+${JSON.stringify(sep + "slot-")});
      const verify=bin==='git'&&args.at(-2)==='rev-parse'&&args.at(-1)==='--show-toplevel'&&a[0]?.cwd?.startsWith(out+${JSON.stringify(sep + "slot-")});
      if(!init&&!verify)throw Error('forbidden-process');
      return exec(bin,args,...a);
    };
    syncBuiltinESMExports();
    const {main}=await import(${JSON.stringify(pathToFileURL(join(root, "scripts/benchmarks/multicase-runner.mjs")).href)});
    process.exitCode=await main(['--simulate','--bundle',input,'--out',out,'--cases','all','--repetitions','1','--max-runs','18','--run-budget-ms','60000']);
  `;
    const r = spawnSync(process.execPath, ["--input-type=module", "-e", code], {
      encoding: "utf8",
      cwd: dir,
    });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(JSON.parse(r.stdout).simulated_count, 18);
  }),
);

test(
  "real fixture seed and stored history contain only public data with candidate/user status",
  temporary(async (dir) => {
    const { Service } = await import("../dist/index.js");
    const originalCall = Service.prototype.call,
      originalClose = Service.prototype.close;
    const seeds = [],
      histories = [],
      searches = [];
    Service.prototype.call = async function (op, args) {
      if (op === "memory_store") seeds.push(clone(args));
      if (op === "memory_search") searches.push(clone(args));
      assert.ok(!["memory_ingest", "memory_feedback"].includes(op));
      return originalCall.call(this, op, args);
    };
    Service.prototype.close = function () {
      histories.push(
        ...this.db
          .prepare("SELECT snapshot FROM history")
          .all()
          .map((r) => JSON.parse(r.snapshot)),
      );
      return originalClose.call(this);
    };
    try {
      const p = await runOffline({
        ...options,
        out: join(dir, "run"),
        simulate: true,
      });
      assert.equal(p.simulated_count, 18);
      assert.equal(
        seeds.length,
        cases.reduce((n, c) => n + c.sources.length, 0),
      );
      assert.equal(searches.length, 9);
      assert.ok(histories.length > 0);
      for (const seed of seeds) {
        assert.equal(seed.origin, "user");
        assert.ok(!canonical(seed).includes("PRIVATE_CANARY"));
        assert.ok(
          cases.some((c) =>
            c.sources.some(
              (s) =>
                s.excerpt === seed.content &&
                `${s.source_id}/${s.unit_id}` === seed.source,
            ),
          ),
        );
      }
      for (const h of histories) {
        assert.equal(h.status, "candidate");
        assert.equal(h.origin, "user");
        for (const c of cases) assert.ok(!canonical(h).includes(c.case_id));
        assert.ok(!canonical(h).includes("evaluation_private"));
      }
      for (const q of searches) {
        assert.equal(q.limit, 4);
        assert.equal(q.tokenBudget, 32000);
        assert.equal(q.includeGlobal, false);
        assert.ok(protocol.cases.some((p) => p.query === q.query));
      }
    } finally {
      Service.prototype.call = originalCall;
      Service.prototype.close = originalClose;
    }
  }),
);
