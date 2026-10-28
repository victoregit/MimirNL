import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { TextDecoder } from "node:util";
import { createUsageCollector } from "./codex-usage.mjs";

export const MAX_BYTES = 16 * 1024 * 1024;
export const MAX_LINE_BYTES = 1024 * 1024;

// Byte limits precede decoding; fatal decoding rejects corrupted UTF-8.
export async function collectStream(
  input,
  { clock = () => performance.now() } = {},
) {
  const start = clock();
  const collector = createUsageCollector({
    chronology: "local-stdin-monotonic",
  });
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let total = 0,
    pending = Buffer.alloc(0);
  const line = (bytes) => {
    if (bytes.length > MAX_LINE_BYTES) throw new Error("Invalid input stream.");
    const text = decoder.decode(bytes).replace(/\r$/, "");
    if (!text.trim()) throw new Error("Invalid input stream.");
    collector.observe(JSON.parse(text), clock() - start);
  };
  try {
    for await (const chunk of input) {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      total += bytes.length;
      if (total > MAX_BYTES) throw new Error();
      pending = Buffer.concat([pending, bytes]);
      let end;
      while ((end = pending.indexOf(10)) !== -1) {
        line(pending.subarray(0, end));
        pending = pending.subarray(end + 1);
      }
      if (pending.length > MAX_LINE_BYTES) throw new Error();
    }
    if (pending.length) line(pending);
    return collector.finish(clock() - start);
  } catch {
    throw new Error("Unable to collect input stream.");
  }
}

export async function main(args) {
  if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
    process.stdout.write(
      "Usage: node scripts/benchmarks/codex-usage-cli.mjs [--out NEW.json]\nObserves stdin JSONL using a local monotonic clock; no model execution.\nTiming includes pipeline/startup/buffering; replay cannot establish real latency.\nLimits: 16 MiB total, 1 MiB per line. TTFT and cost unavailable.\n",
    );
    return 0;
  }
  if (args.length && !(args.length === 2 && args[0] === "--out" && args[1])) {
    process.stderr.write("Invalid arguments. Use --help.\n");
    return 1;
  }
  try {
    const report = `${JSON.stringify(await collectStream(process.stdin), null, 2)}\n`;
    if (args.length)
      writeFileSync(args[1], report, { flag: "wx", mode: 0o600 });
    else process.stdout.write(report);
    return 0;
  } catch {
    process.stderr.write("Unable to collect stream or create new report.\n");
    return 1;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = await main(process.argv.slice(2));
