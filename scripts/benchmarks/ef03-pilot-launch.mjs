// Closed live entry point. No argument/default/help/import can execute a model.
import { mkdirSync, lstatSync, writeFileSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { parseStrictJSON } from "./abc-public.mjs";
import { safePath, readExplicit, writePrivate } from "./offline-files.mjs";
import { transport } from "./abc-transport.mjs";
import {
  ROOT,
  NODE,
  DEST,
  OUT,
  REVIEW,
  LIMITS,
  validatePlan,
  authorize,
  prompts,
  runSequence,
} from "./ef03-pilot.mjs";
function privateOwned(path, mode) {
  safePath(path);
  const s = lstatSync(path);
  if (s.uid !== process.getuid() || (s.mode & 0o777) !== mode)
    throw Error("Private owned path required");
}
// This adapter only bounds the existing audited transport's aggregate stream.
// It does not implement authentication, host arguments, parsing or tool handling.
export function boundedSpawn(binary, args, options, spawnImpl = spawn) {
  const child = spawnImpl(binary, args, options);
  let bytes = 0;
  for (const stream of [child.stdout, child.stderr])
    stream.on("data", (b) => {
      bytes += b.length;
      if (bytes > LIMITS.capture_bytes) {
        child.ef03_capture_limit = true;
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch {
          child.kill("SIGKILL");
        }
        stream.destroy(Error("Capture budget"));
      }
    });
  // The audited transport observes close/errors; no raw bytes are retained here.
  child.stderr.on("error", () => {});
  return child;
}
export async function main(args) {
  if (args.length === 0 || (args.length === 1 && args[0] === "--help")) {
    console.log(
      "EF03: --live PLAN AUTHORIZATION; review132 and external supervisor authorization required; default is offline/no execution.",
    );
    return;
  }
  if (
    args.length !== 3 ||
    args[0] !== "--live" ||
    args[1] !== ROOT + "tasks/131-ef03-pilot/plan.json" ||
    args[2] !== DEST + "/authorization-epoch1.json"
  )
    throw Error("Closed arguments required");
  const started = performance.now();
  if (
    process.platform !== "linux" ||
    process.arch !== "x64" ||
    process.version !== "v24.22.1" ||
    process.execPath !== NODE
  )
    throw Error("Reviewed runtime required");
  const plan = validatePlan(parseStrictJSON(readExplicit(args[1])));
  privateOwned(args[2], 0o600);
  authorize(plan, parseStrictJSON(readExplicit(args[2])), readExplicit(REVIEW));
  privateOwned(DEST, 0o700);
  if (dirname(OUT) !== DEST) throw Error("Destination mismatch");
  try {
    lstatSync(OUT);
    throw Error("Destination exists");
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  const requests = prompts(),
    setup_ms = performance.now() - started;
  if (setup_ms >= LIMITS.global_ms) throw Error("Preflight budget");
  process.umask(0o077);
  // Durable single-use marker is consumed before any possible spawn. A failure
  // after this point must be reported; neither restart nor retry is permitted.
  writeFileSync(
    join(DEST, "epoch1-consumed.json"),
    JSON.stringify({ plan_sha256: plan.sha256 }),
    { flag: "wx", mode: 0o600 },
  );
  mkdirSync(OUT, { mode: 0o700 });
  const scratch = join(OUT, "empty-work");
  mkdirSync(scratch, { mode: 0o700 });
  const progress = (x) =>
    console.log(
      JSON.stringify({ schema_version: "ef03-progress-131-v1", ...x }),
    );
  const timer = setInterval(
    () =>
      progress({ status: "waiting", elapsed_ms: performance.now() - started }),
    30000,
  );
  try {
    const result = await runSequence({
      requests,
      started,
      scratch,
      progress,
      transport: async (opts) => {
        let ownedChild;
        const response = await transport({
          ...opts,
          spawnImpl: (...args) => {
            ownedChild = boundedSpawn(...args);
            return ownedChild;
          },
        });
        return ownedChild?.ef03_capture_limit ? { status: "limit" } : response;
      },
    });
    result.plan_sha256 = plan.sha256;
    result.synthetic = false;
    result.not_execution_proof = false;
    result.actual_model_calls = result.attempts;
    result.setup_ms = setup_ms;
    result.timing_boundary =
      "setup includes offline assembly/hash/preflight; context_ready_transport_ms starts immediately before transport; retrieval not measured";
    writePrivate(join(OUT, "results.json"), result);
    if (result.stopped) process.exitCode = 1;
  } finally {
    clearInterval(timer);
    rmSync(scratch, { recursive: true });
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main(process.argv.slice(2)).catch(() => {
    console.error("EF03 launch failed; do not retry");
    process.exitCode = 1;
  });
