import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { evaluateMetrics } from "./metrics.mjs";

export function main(args) {
  if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
    process.stdout.write(
      "Experimental offline metrics; no execution or verification.\nUsage: node scripts/benchmarks/metrics-cli.mjs CASES.json BATCH.json [--out NEW.json]\nWithout --out, validate and summarize on stdout (read-only). k is required in BATCH.json.\n",
    );
    return 0;
  }
  if (
    ![2, 4].includes(args.length) ||
    args.some((a) => !a) ||
    (args.length === 4 && args[2] !== "--out")
  ) {
    process.stderr.write("Invalid arguments. Use --help.\n");
    return 1;
  }
  let result;
  try {
    result = evaluateMetrics(
      JSON.parse(readFileSync(args[0], "utf8")),
      JSON.parse(readFileSync(args[1], "utf8")),
    );
  } catch {
    // Never expose native JSON/FS diagnostics, private data or unknown field names.
    process.stderr.write("Unable to evaluate supplied offline JSON inputs.\n");
    return 1;
  }
  const json = `${JSON.stringify(result, null, 2)}\n`;
  if (args.length === 4) {
    try {
      writeFileSync(args[3], json, { flag: "wx", mode: 0o600 });
    } catch {
      process.stderr.write(
        "Unable to create report: destination must be new and writable.\n",
      );
      return 1;
    }
    process.stdout.write(
      "Experimental offline report created; not execution proof.\n",
    );
  } else process.stdout.write(json);
  return 0;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = main(process.argv.slice(2));
