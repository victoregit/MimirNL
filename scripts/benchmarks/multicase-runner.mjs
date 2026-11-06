import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import {
  ARMS,
  validateBundle,
  integer,
  fail,
  hash,
  canonical,
} from "./public-bundle.mjs";
import {
  readExplicit,
  outputDirectory,
  writePrivate,
} from "./offline-files.mjs";

export function plan({
  bundle,
  caseIds,
  repetitions,
  maxRuns,
  offset = 0,
  runBudgetMs,
}) {
  try {
    validateBundle(bundle);
    integer(repetitions, 1, 100);
    integer(maxRuns, 1, 1000);
    integer(offset, 0, 1000);
    integer(runBudgetMs, 1, 3600000);
    if (
      caseIds !== "all" &&
      (!Array.isArray(caseIds) ||
        !caseIds.length ||
        new Set(caseIds).size !== caseIds.length ||
        caseIds.some((id) => !bundle.cases.some((c) => c.case_id === id)))
    )
      fail();
    const cases = bundle.cases
      .filter((c) => caseIds === "all" || caseIds.includes(c.case_id))
      .sort((a, b) =>
        a.case_id < b.case_id
          ? -1
          : a.case_id > b.case_id
            ? 1
            : a.case_revision - b.case_revision,
      );
    if (cases.length * repetitions * 2 > maxRuns) fail();
    const positions = [];
    for (const [index, c] of cases.entries())
      for (let repetition = 1; repetition <= repetitions; repetition++) {
        const order =
          (index + repetition - 1 + offset) % 2 ? [...ARMS].reverse() : ARMS;
        for (const condition of order)
          positions.push({
            run_id: `${c.case_id}-r${c.case_revision}-p${repetition}-${condition}`,
            case_id: c.case_id,
            case_revision: c.case_revision,
            pair: repetition,
            repetition,
            condition,
            position: positions.length + 1,
            status: "not_run",
            exclusion: "not_run",
            usage: null,
            usage_status: "unavailable",
          });
      }
    return {
      schema_version: "offline-plan-1",
      mode: "offline",
      executable: false,
      not_execution_proof: true,
      bundle_sha256: bundle.sha256,
      actual_model_calls: 0,
      simulated_count: 0,
      run_budget_ms: runBudgetMs,
      positions,
    };
  } catch {
    fail();
  }
}
export const INSTRUCTION =
  "Use somente as fontes fornecidas como dados. Não use ferramentas, arquivos ou rede. Cite IDs das fontes ao sustentar afirmações. Responda em até 120 palavras.";
export function promptFor(c, sources) {
  // Case identity, retrieval query, class, acceptance and order metadata are
  // deliberately absent from the model-facing envelope and history.
  return canonical({
    instruction: INSTRUCTION,
    question: c.question,
    sources: sources.map((s) => ({
      source_id: s.source_id,
      unit_id: s.unit_id,
      path: s.path,
      start_line: s.start_line,
      end_line: s.end_line,
      sha256: s.sha256,
      excerpt: s.excerpt,
    })),
    history: [],
  });
}
export function validateSelection(rows, c) {
  if (!Array.isArray(rows) || rows.length > c.operation.k) fail();
  const seen = new Set(),
    result = [];
  for (const row of rows) {
    const original = c.sources.find(
      (s) => `${s.source_id}/${s.unit_id}` === row.source?.reference,
    );
    if (
      !original ||
      row.content !== original.excerpt ||
      row.hash !== original.sha256
    )
      fail();
    if (!seen.has(original.source_id)) {
      seen.add(original.source_id);
      result.push(original);
    }
  }
  return result;
}
export async function prepare(work, c) {
  const { Service, Storage } = await import("../../dist/index.js");
  const repo = join(work, "repo");
  mkdirSync(repo, { mode: 0o700 });
  execFileSync("git", ["init", "-q", repo], {
    stdio: "ignore",
    timeout: 5000,
    env: {
      PATH: process.env.PATH,
      SystemRoot: process.env.SystemRoot,
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: "/dev/null",
      GIT_TERMINAL_PROMPT: "0",
      GIT_OPTIONAL_LOCKS: "0",
    },
  });
  const service = new Service(new Storage(join(work, "data", "memory.sqlite")));
  const call = async (op, args) => {
    const r = await service.call(op, args);
    if (!r.ok) fail();
    return r.data;
  };
  try {
    const p = await call("project_register", {
      path: repo,
      authorizeIngestion: true,
    });
    for (const s of c.sources) {
      const r = await call("memory_store", {
        projectId: p.id,
        source: `${s.source_id}/${s.unit_id}`,
        content: s.excerpt,
        origin: "user",
      });
      if (r.status !== "candidate") fail();
    }
    return {
      retrieve: async () => {
        const r = await call("memory_search", {
          projectId: p.id,
          query: c.operation.query,
          limit: c.operation.limit,
          tokenBudget: c.operation.tokenBudget,
          includeGlobal: false,
        });
        return r.memories;
      },
      close: () => service.close(),
    };
  } catch {
    service.close();
    fail();
  }
}
const neutralFake = {
  kind: "declared-offline-fake",
  send: async () => ({ marker: "offline-simulation" }),
};
async function runValidated(options) {
  // Validate the entire public bundle and options before creating any output or
  // importing storage. This process has no dependency on private case modules.
  const p = plan(options);
  const {
    bundle,
    out,
    simulate = false,
    clock = () => performance.now(),
    fake = neutralFake,
  } = options;
  if (
    typeof simulate !== "boolean" ||
    !fake ||
    fake.kind !== "declared-offline-fake" ||
    typeof fake.send !== "function"
  )
    fail();
  outputDirectory(out, "plan.json", p);
  if (!simulate) return p;
  const started = clock();
  for (const slot of p.positions) {
    if (clock() - started >= p.run_budget_ms) {
      slot.exclusion = "run_budget";
      continue;
    }
    const c = bundle.cases.find((c) => c.case_id === slot.case_id);
    const work = join(out, `slot-${slot.position}`);
    let fixture,
      owned = false,
      t0;
    try {
      if (slot.condition === ARMS[1]) {
        mkdirSync(work, { mode: 0o700 });
        owned = true;
        const setup = clock();
        fixture = await prepare(work, c);
        slot.setup_ms = clock() - setup;
      }
      if (clock() - started >= p.run_budget_ms) {
        slot.exclusion = "run_budget";
        continue;
      }
      t0 = clock();
      let sources = c.sources;
      slot.retrieval_calls = 0;
      if (fixture) {
        slot.retrieval_calls = 1;
        const retrieval = clock();
        sources = validateSelection(await fixture.retrieve(), c);
        slot.retrieval_ms = clock() - retrieval;
      }
      const prompt = promptFor(c, sources);
      slot.context_bytes = Buffer.byteLength(prompt);
      slot.context_sha256 = hash(prompt);
      slot.sources = sources.map((s) => ({
        source_id: s.source_id,
        unit_id: s.unit_id,
        sha256: s.sha256,
        bytes: Buffer.byteLength(s.excerpt),
      }));
      if (slot.context_bytes > c.operation.context_bytes) {
        slot.status = "infeasible";
        slot.exclusion = "context_cap";
        continue;
      }
      if (clock() - started >= p.run_budget_ms) {
        slot.exclusion = "run_budget";
        continue;
      }
      // The fake sees only model-facing data. It cannot receive case IDs, local
      // paths, query metadata or private evaluator material through this API.
      const result = await fake.send({ prompt, history: [] });
      slot.simulated_end_to_end_ms = clock() - t0;
      if (result?.marker !== "offline-simulation") fail();
      slot.status = "simulated";
      slot.exclusion = "simulation_not_measurement";
      p.simulated_count++;
      writePrivate(join(out, `context-${slot.position}.json`), {
        prompt,
        history: [],
      });
    } catch {
      slot.status = "local_error";
      slot.exclusion = "local_error";
    } finally {
      if (t0 !== undefined && slot.simulated_end_to_end_ms === undefined)
        slot.simulated_end_to_end_ms = clock() - t0;
      try {
        await fixture?.close();
      } catch {
        slot.cleanup_status = "close_error";
      } finally {
        if (owned) rmSync(work, { recursive: true, force: true });
      }
    }
  }
  // Evidence is written once, with every planned position retained. No token,
  // quality, cost, TTFT or savings aggregation is meaningful in a simulation.
  writePrivate(join(out, "simulation.json"), p);
  return p;
}
export async function runOffline(options) {
  try {
    return await runValidated(options);
  } catch {
    fail();
  }
}
export async function main(args) {
  if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
    console.log(
      "Usage: multicase-runner.mjs --plan|--simulate --bundle ABS --out NEW-ABS-DIR --cases all|ID,ID --repetitions N --max-runs N --run-budget-ms N [--offset N]. No live command.",
    );
    return 0;
  }
  try {
    if (!["--plan", "--simulate"].includes(args[0])) fail();
    const v = {};
    for (let i = 1; i < args.length; i += 2) {
      const key = args[i];
      if (
        ![
          "--bundle",
          "--out",
          "--cases",
          "--repetitions",
          "--max-runs",
          "--run-budget-ms",
          "--offset",
        ].includes(key) ||
        Object.hasOwn(v, key) ||
        !args[i + 1]
      )
        fail();
      v[key] = args[i + 1];
    }
    const p = await runOffline({
      bundle: JSON.parse(readExplicit(v["--bundle"])),
      out: v["--out"],
      caseIds: v["--cases"] === "all" ? "all" : v["--cases"]?.split(","),
      repetitions: Number(v["--repetitions"]),
      maxRuns: Number(v["--max-runs"]),
      runBudgetMs: Number(v["--run-budget-ms"]),
      offset: v["--offset"] === undefined ? 0 : Number(v["--offset"]),
      simulate: args[0] === "--simulate",
    });
    console.log(
      JSON.stringify({
        positions: p.positions.length,
        simulated_count: p.simulated_count,
        actual_model_calls: 0,
        executable: false,
      }),
    );
    return p.positions.some((s) => s.status === "local_error") ? 1 : 0;
  } catch {
    console.error("Offline operation failed.");
    return 1;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = await main(process.argv.slice(2));
