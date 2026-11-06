import { temporaryOutput } from "./temporary-output.mjs";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  loadCorpus,
  promptFor,
  validateSelection,
  prepareRetrieval,
  argsFor,
  QUERY,
  MODEL,
  ORDER,
  INSTRUCTION,
  QUESTION,
} from "./context-selection-probe.mjs";
import {
  transport as sharedTransport,
  sha256,
  COMMIT,
} from "./paired-probe.mjs";

export const argsCodex = (scratch) => [
  ...argsFor(scratch),
  "--disable",
  "apps",
  "--disable",
  "plugins",
  "--disable",
  "multi_agent",
];
const write = (path, value) =>
  writeFileSync(
    path,
    typeof value === "string" ? value : JSON.stringify(value, null, 2) + "\n",
    { flag: "wx", mode: 0o600 },
  );
const fields = [
  "input_tokens",
  "cached_input_tokens",
  "output_tokens",
  "total_tokens",
  "wall_ms",
  "end_to_end_ms",
  "retrieval_ms",
  "first_agent_message_completed_ms",
];
const value = (r, f) => (f.endsWith("_tokens") ? r.usage?.[f] : r[f]);
const eligible = (r, f) =>
  r?.status === "completed" && Number.isFinite(value(r, f));
const stats = (values) => {
  const v = values.filter(Number.isFinite).sort((a, b) => a - b),
    n = v.length;
  return {
    n,
    min: n ? v[0] : null,
    max: n ? v[n - 1] : null,
    median: n ? (v[Math.floor((n - 1) / 2)] + v[Math.floor(n / 2)]) / 2 : null,
  };
};
export function summarize(runs) {
  const conditions = Object.fromEntries(
    [ORDER[0], ORDER[1]].map((c) => [
      c,
      Object.fromEntries(
        fields.map((f) => [
          f,
          stats(
            runs
              .filter((r) => r.condition === c && eligible(r, f))
              .map((r) => value(r, f)),
          ),
        ]),
      ),
    ]),
  );
  const pairs = (f) =>
    [1, 2, 3].flatMap((pair) => {
      const a = runs.find((r) => r.pair === pair && r.condition === ORDER[0]);
      const b = runs.find((r) => r.pair === pair && r.condition === ORDER[1]);
      return eligible(a, f) && eligible(b, f)
        ? [{ pair, delta: value(b, f) - value(a, f) }]
        : [];
    });
  return {
    conditions,
    paired_delta_B_minus_A: Object.fromEntries(
      fields.map((f) => [f, stats(pairs(f).map((p) => p.delta))]),
    ),
    eligible_pairs: Object.fromEntries(
      fields.map((f) => [f, pairs(f).map((p) => p.pair)]),
    ),
    metric_exclusions: Object.fromEntries(
      fields.map((f) => [
        f,
        runs
          .filter((r) => !eligible(r, f))
          .map(({ index, status }) => ({
            index,
            status,
            reason: status === "completed" ? "unavailable" : status,
          })),
      ]),
    ),
    coverage: runs.map((r) => ({
      index: r.index,
      status: r.status,
      metrics: Object.fromEntries(
        fields.map((f) => [f, eligible(r, f) ? "available" : "unavailable"]),
      ),
    })),
    formulas: {
      delta: "B-A",
      end_to_end_ms:
        "monotonic t1-t0; retrieval included once; setup/close excluded",
    },
    quality: "pending independent review",
    cost: "unavailable",
    ttft: "unavailable",
    interpretation:
      "Exploratory per-host results; no general causal inference or cross-host model equivalence",
  };
}

export async function runFlow({
  host = "codex",
  out,
  transportImpl,
  clock = () => performance.now(),
  corpus,
  prepare = prepareRetrieval,
  loadAdapter = () => import("./antigravity-usage.mjs"),
} = {}) {
  if (!["codex", "antigravity"].includes(host)) throw Error("Unknown host");
  let model = MODEL;
  // Resolve the optional adapter before creating output, fixtures or model processes.
  const injectedTransport = typeof transportImpl === "function";
  if (host === "antigravity") {
    model = "gemini-3.8-flash-high";
    if (!transportImpl) {
      const adapter = await loadAdapter();
      if (adapter.MODEL !== model || typeof adapter.transport !== "function")
        throw Error("Invalid Antigravity adapter");
      transportImpl = adapter.transport;
    }
  }
  if (process.platform !== "linux" && !injectedTransport)
    throw Error("Live transport requires reviewed Linux host");
  transportImpl ??= (options) =>
    sharedTransport({ ...options, args: argsCodex(options.scratch) });
  corpus ??= loadCorpus();
  if (
    corpus.length !== 6 ||
    new Set(corpus.map((c) => c.source)).size !== 6 ||
    new Set(corpus.map((c) => c.hash)).size !== 6 ||
    corpus.some((c) => sha256(c.content) !== c.hash)
  )
    throw Error("Invalid corpus");
  const dir = temporaryOutput(out, "mimir-live-flow-");
  const scratch = join(dir, "scratch"),
    started = clock();
  const runs = ORDER.map((condition, i) => ({
    index: i + 1,
    pair: Math.floor(i / 2) + 1,
    condition,
    status: "not_run",
    host,
    requested_model: model,
    requested_config:
      host === "codex" ? { model_reasoning_effort: "low" } : null,
  }));
  mkdirSync(scratch, { mode: 0o700 });
  try {
    write(join(dir, "plan.json"), {
      protocol: "continuous-flow-v1",
      host,
      corpus,
      commit: COMMIT,
      query: QUERY,
      search_budget_unit: "bytes (legacy tokenBudget), not model tokens",
      question: QUESTION,
      instruction: INSTRUCTION,
      order: ORDER,
      requested_model: model,
      requested_config: runs[0].requested_config,
      args:
        host === "codex"
          ? argsCodex(scratch)
          : "adapter-owned; see reviewed adapter",
      limits: { calls: 6, per_process_ms: 90000, global_ms: 600000 },
      quality: "pending independent review",
      future_selections: "unknown until each live retrieval",
    });
    for (const run of runs) {
      if (clock() - started >= 600000) break;
      let fixture, t0;
      const work = join(dir, `fixture-${run.index}`);
      try {
        run.retrieval_ms = 0;
        if (run.condition === ORDER[1]) {
          mkdirSync(work, { mode: 0o700 });
          const setup = clock();
          fixture = await prepare(work, corpus, clock);
          run.setup_ms = clock() - setup;
        }
        if (clock() - started >= 600000) break;
        t0 = clock();
        let units = corpus;
        if (fixture) {
          const result = await fixture.retrieve();
          run.retrieval_ms = result.elapsed_ms;
          units = validateSelection(result.units, corpus);
        }
        const context = units.map(({ source, content }) => ({
          source,
          content,
        }));
        const serialized = JSON.stringify(context),
          prompt = promptFor(units);
        Object.assign(run, {
          returned_count: units.length,
          returned: units.map(({ source, hash }) => ({ source, hash })),
          absent_sources: corpus
            .filter((c) => !units.includes(c))
            .map((c) => c.source),
          context_sha256: sha256(serialized),
          context_bytes: Buffer.byteLength(serialized),
          envelope_sha256: sha256(prompt),
          envelope_bytes: Buffer.byteLength(prompt),
        });
        write(join(dir, `run-context-${run.index}.json`), {
          index: run.index,
          context,
          prompt,
          context_sha256: run.context_sha256,
          envelope_sha256: run.envelope_sha256,
        });
        const remaining = 600000 - (clock() - started);
        if (remaining <= 0) break;
        const result = await transportImpl({
          prompt,
          scratch,
          timeoutMs: Math.min(90000, remaining),
          clock,
        });
        // End at transport close/collector completion, before evidence IO and fixture close.
        run.end_to_end_ms = clock() - t0;
        const { response, ...metadata } = result;
        Object.assign(run, metadata);
        run.model_divergence = result.model_identity?.model
          ? result.model_identity.model !== model
          : null;
        if (typeof response === "string") {
          if (Buffer.byteLength(response) > 64000) run.status = "limit";
          else write(join(dir, `response-${run.index}.txt`), response);
        }
      } catch {
        if (t0 !== undefined && run.end_to_end_ms === undefined)
          run.end_to_end_ms = clock() - t0;
        run.status = "local_error";
      } finally {
        const close = clock();
        try {
          await fixture?.close();
        } catch {
          run.cleanup_status = "close_error";
        } finally {
          rmSync(work, { recursive: true, force: true });
        }
        run.close_ms = clock() - close;
      }
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
    for (const run of runs) write(join(dir, `run-${run.index}.json`), run);
    write(join(dir, "runs.json"), runs);
    write(join(dir, "summary.json"), summarize(runs));
  }
  return { dir, runs };
}
export async function main(args) {
  if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
    console.log(
      "Usage: live-flow-probe.mjs --run [--host codex|antigravity] [--out NEW-/tmp/DIR]. Six calls; independent review required before execution. Import/help are offline.",
    );
    return 0;
  }
  if (args[0] !== "--run") return 1;
  const options = {},
    seen = new Set();
  for (let i = 1; i < args.length; i += 2) {
    if (
      !["--host", "--out"].includes(args[i]) ||
      !args[i + 1] ||
      seen.has(args[i])
    )
      return 1;
    seen.add(args[i]);
    options[args[i].slice(2)] = args[i + 1];
  }
  try {
    const result = await runFlow(options);
    console.log(result.dir);
    return result.runs.every((r) => r.status === "completed") ? 0 : 1;
  } catch {
    console.error("Flow failed; inspect private evidence if created.");
    return 1;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = await main(process.argv.slice(2));
