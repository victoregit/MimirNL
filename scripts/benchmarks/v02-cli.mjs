import { pathToFileURL } from "node:url";
import { join, dirname } from "node:path";
import { readExplicit, outputDirectory, safePath } from "./offline-files.mjs";
import { validateBundle, runtimeEnvelope, makePlan } from "./contract-v02.mjs";
import { evaluateMetricsV02 } from "./metrics-v02.mjs";
// Separate commands/processes: public-render never opens evaluator files. The
// evaluate/plan commands are private tools, not imports of the future runtime.
export function main(args) {
  if (args[0] === "public-render" && args.length === 3) {
    const b = validateBundle(JSON.parse(readExplicit(args[1])));
    const request = JSON.parse(readExplicit(args[2]));
    if (Object.keys(request).sort().join(",") !== "base,retrieved,task")
      throw Error("Invalid public request");
    process.stdout.write(
      JSON.stringify(
        runtimeEnvelope(b, request.task, request.base, request.retrieved),
      ) + "\n",
    );
    return;
  }
  if (
    [
      "private-dev-plan",
      "private-eval-plan",
      "private-dev-metrics",
      "private-eval-metrics",
    ].includes(args[0])
  ) {
    const metrics = args[0].endsWith("metrics");
    if (args.length !== (metrics ? 5 : 4)) throw Error("Invalid arguments");
    const b = validateBundle(JSON.parse(readExplicit(args[1]))),
      cases = JSON.parse(readExplicit(args[2]));
    const split = args[0].startsWith("private-dev-")
      ? "development"
      : "evaluation";
    if (!Array.isArray(cases) || cases.some((c) => c.split !== split))
      throw Error("Split mismatch");
    const result = metrics
      ? evaluateMetricsV02(cases, b, JSON.parse(readExplicit(args[3])))
      : makePlan(cases, b, split === "development" ? 1 : 3);
    const out = args.at(-1);
    safePath(dirname(out));
    outputDirectory(out, metrics ? "metrics.json" : "plan.json", result);
    return;
  }
  throw Error("Invalid offline command");
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    main(process.argv.slice(2));
  } catch {
    process.stderr.write("Invalid offline input or local operation.\n");
    process.exitCode = 1;
  }
}
