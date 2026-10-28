import { tmpdir } from "node:os";
import { mkdirSync, rmSync, existsSync, realpathSync } from "node:fs";
import { join, dirname, relative, isAbsolute, sep } from "node:path";
import { pathToFileURL } from "node:url";
import {
  exact,
  integer,
  fail,
  hash,
  canonical,
  validateBundle,
  ARMS,
} from "./public-bundle.mjs";
import {
  plan,
  promptFor,
  prepare,
  validateSelection,
} from "./multicase-runner.mjs";
import {
  localPath,
  readExplicit,
  safePath,
  outputDirectory,
  writePrivate,
} from "./offline-files.mjs";
import { stablePrompt, STABLE_LAYOUT } from "./stable-prompt.mjs";
import { HOST, transport } from "./multicase-codex-transport.mjs";

// JSON.parse alone accepts duplicate keys. Reject that ambiguous representation
// before schema validation, hashing, output creation or any process launch.
export function parsePublicJSON(text) {
  const value = JSON.parse(text);
  const tokens =
    text.match(
      /"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\],:]/g,
    ) ?? [];
  let i = 0;
  function walk() {
    const t = tokens[i++];
    if (t === "{") {
      const seen = new Set();
      if (tokens[i] !== "}")
        do {
          const key = JSON.parse(tokens[i++]);
          if (seen.has(key)) fail();
          seen.add(key);
          i++;
          walk();
        } while (tokens[i++] === ",");
      else i++;
    } else if (t === "[") {
      if (tokens[i] !== "]")
        do {
          walk();
        } while (tokens[i++] === ",");
      else i++;
    }
  }
  walk();
  return value;
}

export const sealManifest = (body) => ({
  ...body,
  sha256: hash(canonical(body)),
});
export function validateManifest(bundle, m) {
  validateBundle(bundle);
  const v2 = m.schema_version === "codex-multicase-plan-2";
  exact(m, [
    ...(v2 ? ["prompt_layout"] : []),
    "schema_version",
    "status",
    "bundle_sha256",
    "cases",
    "arms",
    "repetitions",
    "offset",
    "host",
    "limits",
    "out",
    "sha256",
  ]);
  if (
    (!v2 && m.schema_version !== "codex-multicase-plan-1") ||
    (v2 && canonical(m.prompt_layout) !== canonical(STABLE_LAYOUT)) ||
    m.status !== "proposed" ||
    m.bundle_sha256 !== bundle.sha256 ||
    canonical(m.host) !== canonical(HOST) ||
    canonical(m.arms) !== canonical(ARMS)
  )
    fail();
  exact(m.host, Object.keys(HOST));
  exact(m.limits, [
    "max_calls",
    "output_bytes",
    "call_ms",
    "total_ms",
    "context_bytes",
  ]);
  integer(m.limits.max_calls, 1, 1000);
  integer(m.limits.output_bytes, 1, 64000);
  integer(m.limits.call_ms, 1, 90000);
  integer(m.limits.total_ms, 1, 3600000);
  integer(m.limits.context_bytes, 1, 32000);
  if (!Array.isArray(m.cases) || !m.cases.length) fail();
  for (const c of m.cases) {
    exact(c, ["case_id", "case_revision"]);
    if (
      !bundle.cases.some(
        (b) => b.case_id === c.case_id && b.case_revision === c.case_revision,
      )
    )
      fail();
  }
  if (typeof m.out !== "string") fail();
  const delta = relative(realpathSync(tmpdir()), m.out);
  if (
    !delta ||
    isAbsolute(delta) ||
    delta === ".." ||
    delta.startsWith(".." + sep)
  )
    fail();
  localPath(m.out);
  safePath(dirname(m.out));
  // Codex can discover project instructions in cwd ancestors. Refuse their
  // presence without opening them; scratch itself is created exclusively empty.
  for (let ancestor = m.out; ; ancestor = dirname(ancestor)) {
    if (
      ["AGENTS.md", "AGENTS.override.md"].some((name) =>
        existsSync(join(ancestor, name)),
      )
    )
      fail();
    if (dirname(ancestor) === ancestor) break;
  }

  const { sha256, ...body } = m;
  if (sha256 !== hash(canonical(body))) fail();
  const p = plan({
    bundle,
    caseIds: m.cases.map((c) => c.case_id),
    repetitions: m.repetitions,
    maxRuns: m.limits.max_calls,
    offset: m.offset,
    runBudgetMs: m.limits.total_ms,
  });
  if (
    canonical(m.cases) !==
    canonical(
      [...m.cases].sort((a, b) =>
        a.case_id < b.case_id ? -1 : a.case_id > b.case_id ? 1 : 0,
      ),
    )
  )
    fail();
  return p;
}

// An acknowledgement of this exact public plan is separate from technical
// validation. Neither a hash nor this proposed manifest asserts human approval.
export async function runPrepared({
  bundle,
  manifest: m,
  authorizePlan,
  simulation = false,
  spawnImpl,
  clock = () => performance.now(),
}) {
  const p = validateManifest(bundle, m);
  if (
    (simulation && typeof spawnImpl !== "function") ||
    typeof simulation !== "boolean" ||
    (!simulation && authorizePlan !== m.sha256) ||
    (!simulation && spawnImpl) ||
    (!simulation && process.platform !== "linux")
  )
    fail();
  const result = {
    schema_version: "codex-multicase-result-1",
    plan_sha256: m.sha256,
    bundle_sha256: bundle.sha256,
    simulation,
    not_execution_proof: simulation,
    actual_model_calls: 0,
    attempted_calls: 0,
    completed_calls: 0,
    simulated_attempts: 0,
    positions: p.positions,
    quality: "unavailable",
    cost: "unavailable",
    ttft: "unavailable",
  };
  outputDirectory(m.out, "plan.json", m);
  const started = clock();
  let halted = false;
  try {
    for (const slot of result.positions) {
      slot.requested_model = HOST.requested_model;
      slot.model_identity = { status: "unavailable" };
      if (halted || clock() - started >= m.limits.total_ms) {
        slot.exclusion = halted ? "previous_failure" : "run_budget";
        continue;
      }
      const c = bundle.cases.find((c) => c.case_id === slot.case_id);
      const work = join(m.out, `slot-${slot.position}`);
      let fixture,
        owned = false,
        t0;
      try {
        mkdirSync(work, { mode: 0o700 });
        owned = true;
        const scratch = join(work, "scratch");
        mkdirSync(scratch, { mode: 0o700 });
        if (slot.condition === ARMS[1]) {
          const setup = clock();
          fixture = await prepare(work, c);
          slot.setup_ms = clock() - setup;
        }
        if (clock() - started >= m.limits.total_ms) {
          slot.exclusion = "run_budget";
          continue;
        }
        t0 = clock();
        let sources = c.sources;
        slot.retrieval_calls = 0;
        if (fixture) {
          const retrieval = clock();
          slot.retrieval_calls = 1;
          sources = validateSelection(await fixture.retrieve(), c);
          slot.retrieval_ms = clock() - retrieval;
        }
        const prompt =
          m.schema_version === "codex-multicase-plan-2"
            ? stablePrompt(c, sources)
            : promptFor(c, sources);
        slot.context_bytes = Buffer.byteLength(prompt);
        slot.context_sha256 = hash(prompt);
        if (
          slot.context_bytes >
          Math.min(c.operation.context_bytes, m.limits.context_bytes)
        ) {
          slot.status = "infeasible";
          slot.exclusion = "context_cap";
          halted = true;
          continue;
        }
        const remaining = m.limits.total_ms - (clock() - started);
        if (remaining <= 0) {
          slot.exclusion = "run_budget";
          continue;
        }
        // Save public evidence before spawn. No IDs or bookkeeping enter the
        // transport: only the envelope, an opaque empty cwd and fixed limits.
        writePrivate(join(m.out, `context-${slot.position}.json`), {
          prompt,
          history: [],
        });
        const timeoutMs = Math.min(
          m.limits.call_ms,
          m.limits.total_ms - (clock() - started),
        );
        if (timeoutMs <= 0) {
          slot.exclusion = "run_budget";
          continue;
        }
        if (
          result.attempted_calls + result.simulated_attempts >=
          m.limits.max_calls
        )
          fail();
        if (simulation) result.simulated_attempts++;
        else {
          result.attempted_calls++;
          result.actual_model_calls++;
        }
        const r = await transport({
          prompt,
          scratch,
          timeoutMs,
          outputBytes: m.limits.output_bytes,
          clock,
          ...(simulation ? { spawnImpl } : {}),
        });
        slot.end_to_end_ms = clock() - t0;
        // The production transport is the sole authority for response/usage.
        slot.status = r.status;
        slot.exclusion = r.status === "completed" ? null : r.status;
        slot.exit_code = r.exit_code ?? null;
        slot.signal = r.signal ?? null;
        slot.usage = r.usage ?? null;
        slot.usage_status = simulation
          ? "synthetic-test"
          : (r.usage_status ?? "unavailable");
        slot.wall_ms = r.wall_ms;
        slot.model_identity = r.model_identity ?? { status: "unavailable" };
        slot.model_divergence = slot.model_identity.model
          ? slot.model_identity.model !== HOST.requested_model
          : null;
        slot.tools_detected = r.tools_detected ?? null;
        if (typeof r.response === "string")
          writePrivate(join(m.out, `response-${slot.position}.json`), {
            response: r.response,
          });
        if (simulation) {
          slot.simulated_status = slot.status;
          slot.status = "simulated";
          slot.exclusion = "simulation_not_measurement";
        } else if (r.status === "completed") result.completed_calls++;
        if (r.status !== "completed") halted = true;
      } catch {
        slot.status = "local_error";
        slot.exclusion = "local_error";
        halted = true;
      } finally {
        if (t0 !== undefined && slot.end_to_end_ms === undefined)
          slot.end_to_end_ms = clock() - t0;
        try {
          await fixture?.close();
        } catch {
          slot.cleanup_status = "close_error";
          halted = true;
        } finally {
          if (owned) rmSync(work, { recursive: true, force: true });
        }
      }
    }
  } finally {
    writePrivate(join(m.out, "result.json"), result);
  }
  return result;
}

export async function main(args) {
  if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
    console.log(
      "multicase-codex.mjs --validate|--run --bundle ABS --manifest ABS [--authorize-plan SHA256]. Run requires separate prior operational authorization; validation never spawns.",
    );
    return 0;
  }
  try {
    if (!["--validate", "--run"].includes(args[0])) fail();
    const v = {};
    for (let i = 1; i < args.length; i += 2) {
      if (
        !["--bundle", "--manifest", "--authorize-plan"].includes(args[i]) ||
        Object.hasOwn(v, args[i]) ||
        !args[i + 1]
      )
        fail();
      v[args[i]] = args[i + 1];
    }
    if (args[0] === "--validate" && v["--authorize-plan"]) fail();
    const bundle = parsePublicJSON(readExplicit(v["--bundle"])),
      manifest = parsePublicJSON(readExplicit(v["--manifest"]));
    const p = validateManifest(bundle, manifest);
    if (args[0] === "--validate") {
      console.log(
        JSON.stringify({
          plan_sha256: manifest.sha256,
          positions: p.positions.length,
          status: "proposed",
          actual_model_calls: 0,
        }),
      );
      return 0;
    }
    const r = await runPrepared({
      bundle,
      manifest,
      authorizePlan: v["--authorize-plan"],
    });
    console.log(
      JSON.stringify({
        attempted_calls: r.attempted_calls,
        completed_calls: r.completed_calls,
      }),
    );
    return r.positions.every((s) => s.status === "completed") ? 0 : 1;
  } catch {
    console.error("Public Codex plan failed.");
    return 1;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = await main(process.argv.slice(2));
