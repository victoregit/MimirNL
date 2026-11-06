// Evaluator process only; explicit private files never cross the runtime boundary.
import { pathToFileURL } from "node:url";
import {
  readExplicit,
  outputDirectory,
  writePrivate,
} from "./offline-files.mjs";
import { exportABC } from "./abc-export.mjs";
import { parseStrictJSON, seal, validateManifest } from "./abc-public.mjs";
import { join } from "node:path";
export function main(args) {
  if (args.length !== 10 || args[0] !== "export")
    throw Error(
      "export BUNDLE DEV EVAL DEV_RECEIPT EVAL_RECEIPT ROOT EPOCH NEW_PUBLIC_DIR NEW_PRIVATE_DIR",
    );
  const read = (p) => parseStrictJSON(readExplicit(p));
  const [bundle, dev, evalCases, devReceipt, evalReceipt] = args
    .slice(1, 6)
    .map(read);
  const { manifest, coordinator } = exportABC({
    bundle,
    casesBySplit: [dev, evalCases],
    receipts: [devReceipt, evalReceipt],
    root: args[6],
    epoch: Number(args[7]),
    synthetic: true,
  });
  const { sha256, ...payload } = manifest;
  const proposed = seal({ ...payload, stage: "run", synthetic: false });
  validateManifest(proposed);
  // Private first: if public publication fails, leave the private audit directory.
  // Exclusivity prevents silently resuming or replacing an existing plan.
  outputDirectory(args[9], "coordinator.json", {
    ...coordinator,
    proposed_run_sha256: proposed.sha256,
  });
  outputDirectory(args[8], "offline-manifest.json", manifest);
  writePrivate(join(args[8], "proposed-run-manifest.json"), proposed);
  console.log(
    JSON.stringify({
      positions: manifest.requests.length,
      public_offline_sha256: manifest.sha256,
      proposed_run_sha256: proposed.sha256,
      actual_model_calls: 0,
      live_authorization_present: false,
    }),
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    main(process.argv.slice(2));
  } catch {
    console.error("ABC private export failed");
    process.exitCode = 1;
  }
}
