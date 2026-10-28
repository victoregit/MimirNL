import { pathToFileURL } from "node:url";
import { readExplicit } from "./offline-files.mjs";
import { validateManifest, parseStrictJSON } from "./abc-public.mjs";
export async function main(args) {
  if (args.length === 0 || (args.length === 1 && args[0] === "--help"))
    return console.log(
      "ABC 0.2: validate MANIFEST | offline MANIFEST NEW_OUTPUT_DIR. Live requires independently reviewed Task109 and supervisor-bound authorization; no live CLI in Task103.",
    );
  if (args[0] === "validate" && args.length === 2) {
    const m = validateManifest(parseStrictJSON(readExplicit(args[1])));
    console.log(
      JSON.stringify({
        stage: m.stage,
        sha256: m.sha256,
        actual_model_calls: 0,
        execution_proof: false,
      }),
    );
    return;
  }
  if (args[0] === "offline" && args.length === 3) {
    const m = validateManifest(parseStrictJSON(readExplicit(args[1])));
    const { executeABC } = await import("./abc-runtime.mjs");
    const r = await executeABC({ manifest: m, out: args[2] });
    console.log(
      JSON.stringify({
        actual_model_calls: r.actual_model_calls,
        retrieval_calls: r.retrieval_calls,
        synthetic_transport_calls: r.synthetic_transport_calls,
        stopped: r.stopped,
      }),
    );
    return;
  }
  throw Error("Invalid ABC command");
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main(process.argv.slice(2)).catch(() => {
    console.error("ABC operation failed");
    process.exitCode = 1;
  });
