// Coordination entry point; independent review and external authentication are
// prerequisites for live use. No private coordinator or evaluator is imported.
import { lstatSync } from "node:fs";
import { dirname, isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";
import { readExplicit, safePath } from "./offline-files.mjs";
import { authorize, parseStrictJSON, validateManifest } from "./abc-public.mjs";

const APPROVED =
  "e518dd6414b34eaaf64ca783fd389b3e72d5f8965ee74d1214a1b5de36eedc92";
export async function main(args) {
  if (args.length === 0 || (args.length === 1 && args[0] === "--help")) {
    console.log(
      "Task104: MANIFEST AUTHORIZATION NEW_OUTPUT_DIR (absolute paths). Requires independent launcher review and supervisor-authenticated authorization.",
    );
    return;
  }
  if (args.length !== 3 || args.some((p) => !isAbsolute(p)))
    throw Error("Three absolute paths required");
  if (
    process.platform !== "linux" ||
    process.arch !== "x64" ||
    process.version !== "v24.22.1"
  )
    throw Error("Reviewed Node v24.22.1 Linux x64 required");
  const [manifestPath, authorizationPath, out] = args;
  const manifest = validateManifest(
    parseStrictJSON(readExplicit(manifestPath)),
  );
  if (manifest.sha256 !== APPROVED) throw Error("Unreviewed manifest");
  const authorization = parseStrictJSON(readExplicit(authorizationPath));
  authorize(manifest, authorization);
  safePath(dirname(out));
  // lstat catches dangling symlinks too. Only ENOENT permits proceeding;
  // executeABC still owns exclusive mkdir, closing the ordinary creation race.
  try {
    lstatSync(out);
    throw Error("Output already exists");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  process.umask(0o077);
  const { executeABC } = await import("./abc-runtime.mjs");
  const result = await executeABC({
    manifest,
    authorization,
    out,
    mode: "live",
  });
  console.log(
    JSON.stringify({
      actual_model_calls: result.actual_model_calls,
      retrieval_calls: result.retrieval_calls,
      stopped: result.stopped,
    }),
  );
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main(process.argv.slice(2)).catch(() => {
    // Avoid disclosing input contents, host output or raw errors.
    console.error("Task104 launch failed");
    process.exitCode = 1;
  });
