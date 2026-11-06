import { pathToFileURL } from "node:url";
import { readExplicit, outputDirectory } from "./offline-files.mjs";
import { parsePublicJSON } from "./multicase-codex.mjs";

const count = (n) => Number.isSafeInteger(n) && n >= 0;
const fields = [
  "input_tokens",
  "cached_input_tokens",
  "output_tokens",
  "total_tokens",
];
// Copy only numeric usage, never arbitrary host fields or response content.
export function diagnoseCache(result) {
  if (
    result?.schema_version !== "codex-multicase-result-1" ||
    typeof result.simulation !== "boolean" ||
    typeof result.not_execution_proof !== "boolean" ||
    !Array.isArray(result.positions) ||
    result.positions.some((s) => !s || typeof s.status !== "string")
  )
    throw Error("Invalid public result schema.");
  const rows = result.positions.map((s, index) => {
    const synthetic =
      result.simulation ||
      result.not_execution_proof ||
      s.status === "simulated" ||
      s.usage_status === "synthetic-test";
    const raw_usage = Object.fromEntries(
      fields.map((k) => [k, count(s.usage?.[k]) ? s.usage[k] : null]),
    );
    const errors = fields
      .slice(0, 3)
      .filter((k) => !count(s.usage?.[k]))
      .map((k) => "missing_or_invalid_" + k);
    const {
      input_tokens: input,
      cached_input_tokens: cached,
      output_tokens: output,
    } = raw_usage;
    if (input !== null && cached !== null && cached > input)
      errors.push("cache_exceeds_input");
    if (input !== null && output !== null && !count(input + output))
      errors.push("total_overflow");
    if (
      raw_usage.total_tokens !== null &&
      input !== null &&
      output !== null &&
      raw_usage.total_tokens !== input + output
    )
      errors.push("reported_total_mismatch");
    const valid = errors.length === 0;
    const exclusions = [...errors];
    if (synthetic) exclusions.push("synthetic_not_measurement");
    if (
      s.status !== "completed" ||
      s.exclusion != null ||
      s.exit_code !== 0 ||
      s.tools_detected !== false ||
      s.model_divergence === true
    )
      exclusions.push("operation_not_eligible");
    return {
      position: index + 1,
      synthetic,
      raw_usage,
      errors,
      exclusions,
      eligible: exclusions.length === 0,
      uncached_input_tokens: valid ? input - cached : null,
      total_tokens: valid ? input + output : null,
      cache_hit_ratio: valid && input > 0 ? cached / input : null,
      ratio_reason: !valid
        ? "invalid_or_missing_usage"
        : input === 0
          ? "zero_input"
          : null,
    };
  });
  // Partial coverage stays explicit; do not sum a subset as a complete result.
  const eligible = rows.filter((r) => r.eligible);
  const complete = eligible.length === rows.length && rows.length > 0;
  return {
    schema_version: "cache-diagnostic-1",
    actual_model_calls: 0,
    derivations:
      "uncached=input-cached; total=input+output; ratio=cached/input when input>0",
    cache_attribution: "unavailable",
    cost: "unavailable",
    ttft: "unavailable",
    coverage: {
      positions: rows.length,
      eligible: eligible.length,
      excluded: rows.length - eligible.length,
      complete,
    },
    rows,
    aggregate: complete
      ? {
          input_tokens: eligible.reduce(
            (n, r) => n + r.raw_usage.input_tokens,
            0,
          ),
          cached_input_tokens: eligible.reduce(
            (n, r) => n + r.raw_usage.cached_input_tokens,
            0,
          ),
          uncached_input_tokens: eligible.reduce(
            (n, r) => n + r.uncached_input_tokens,
            0,
          ),
          output_tokens: eligible.reduce(
            (n, r) => n + r.raw_usage.output_tokens,
            0,
          ),
          total_tokens: eligible.reduce((n, r) => n + r.total_tokens, 0),
        }
      : null,
  };
}
export function main(args) {
  if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
    console.log("cache-diagnostic.mjs --result ABS [--out ABS_NEW_DIRECTORY]");
    return 0;
  }
  try {
    if (
      ![2, 4].includes(args.length) ||
      args[0] !== "--result" ||
      (args.length === 4 && args[2] !== "--out")
    )
      throw Error();
    const report = diagnoseCache(parsePublicJSON(readExplicit(args[1])));
    if (args.length === 4)
      outputDirectory(args[3], "cache-report.json", report);
    else console.log(JSON.stringify(report, null, 2));
    return 0;
  } catch {
    console.error("Invalid public cache diagnostic input or output.");
    return 1;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = main(process.argv.slice(2));
