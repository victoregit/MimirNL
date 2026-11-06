import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { validateCases, planCases } from "./preflight.mjs";

const HELP = `Offline benchmark prototype (no execution, no source verification).
Usage:
  node scripts/benchmarks/preflight-cli.mjs validate CASES.json
  node scripts/benchmarks/preflight-cli.mjs plan CASES.json --reps N --out NEW.json
Input is a nonempty JSON array of contract 0.1 cases. Only the supplied input
is read. Plans contain public identifiers only and are created exclusively.
`;

export function main(args) {
  if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
    process.stdout.write(HELP);
    return 0;
  }
  const [mode, input, ...options] = args;
  let repetitions, output;
  if (mode === "validate" && input && options.length === 0) {
    // No output path: validation is read-only.
  } else if (
    mode === "plan" &&
    input &&
    options.length === 4 &&
    options[0] === "--reps" &&
    options[2] === "--out" &&
    /^[1-9][0-9]*$/.test(options[1]) &&
    options[3]
  ) {
    repetitions = Number(options[1]);
    output = options[3];
  } else {
    process.stderr.write(
      "Invalid arguments. Use --help for offline preflight usage.\n",
    );
    return 1;
  }
  let cases;
  try {
    cases = JSON.parse(readFileSync(input, "utf8"));
  } catch {
    // Native filesystem/JSON errors can include private paths or source content.
    process.stderr.write("Unable to read or parse the supplied cases JSON.\n");
    return 1;
  }
  let result;
  try {
    result =
      mode === "validate"
        ? validateCases(cases)
        : planCases(cases, repetitions);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    return 1;
  }
  if (mode === "plan") {
    try {
      // wx rejects existing files, symlinks and races; never truncate an artifact.
      writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`, {
        flag: "wx",
        mode: 0o600,
      });
    } catch {
      process.stderr.write(
        "Unable to create plan: destination must be new and writable.\n",
      );
      return 1;
    }
    process.stdout.write(
      "Offline plan created; executable=false; no runs performed.\n",
    );
  } else {
    process.stdout.write(
      "Cases structurally valid; caller provenance only, sources and permissions not verified.\n",
    );
  }
  return 0;
}

// Importing either module never reads files, prints diagnostics or runs the CLI.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = main(process.argv.slice(2));
