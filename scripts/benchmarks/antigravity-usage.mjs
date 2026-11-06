import { spawn } from "node:child_process";
import { performance } from "node:perf_hooks";

export const MODEL = "gemini-3.8-flash-high";
const CAP = 1024 * 1024;
const RESPONSE_CAP = 256 * 1024;
const COUNTERS = [
  "input_tokens",
  "output_tokens",
  "thinking_tokens",
  "cache_read_tokens",
  "total_tokens",
];
const object = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

// Only the SUCCESS envelope was observed in the single native calibration.
// Unknown lifecycle values must never be promoted to successful completion.
export function parseOutput(text) {
  const empty = {
    status: "invalid_schema",
    response: null,
    usage: null,
    provider_usage: null,
  };
  if (typeof text !== "string" || Buffer.byteLength(text) > CAP) return empty;
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    return empty;
  }
  if (!object(value) || typeof value.status !== "string") return empty;
  const counters = {};
  if (object(value.usage)) {
    for (const key of COUNTERS) {
      const n = value.usage[key];
      if (Number.isSafeInteger(n) && n >= 0) counters[key] = n;
    }
  }
  const provider_usage = Object.keys(counters).length
    ? {
        source: "agy-json-usage",
        counters,
        semantics: "unconfirmed",
      }
    : null;
  if (value.status !== "SUCCESS")
    return { ...empty, status: "incomplete", provider_usage };
  if (
    typeof value.response !== "string" ||
    Buffer.byteLength(value.response) > RESPONSE_CAP
  )
    return { ...empty, provider_usage };
  return {
    status: "completed",
    response: value.response,
    usage: null,
    provider_usage,
  };
}

export function argsAntigravity(prompt, logPath) {
  return [
    "--model",
    MODEL,
    "--effort",
    "high",
    "--sandbox",
    "--mode",
    "plan",
    "--disable-slash-commands",
    "--output-format",
    "json",
    "--print-timeout",
    "60s",
    "--log-file",
    logPath,
    "--print",
    prompt,
  ];
}

// Spawn injection is exclusively for offline tests; imports never start a process.
export async function transport({
  prompt,
  scratch,
  timeoutMs = 90000,
  clock = () => performance.now(),
  spawnImpl = spawn,
}) {
  if (
    typeof prompt !== "string" ||
    Buffer.byteLength(prompt) > CAP ||
    typeof scratch !== "string" ||
    !scratch.startsWith("/") ||
    !Number.isFinite(timeoutMs) ||
    timeoutMs <= 0 ||
    timeoutMs > 90000
  )
    throw new Error("Invalid Antigravity transport options.");
  // A unique, explicit log target avoids reading or replacing existing host logs.
  const { randomUUID } = await import("node:crypto");
  const args = argsAntigravity(
    prompt,
    `${scratch}/antigravity-${randomUUID()}.log`,
  );
  const start = clock();
  return new Promise((resolve) => {
    let child,
      timer,
      chunks = [],
      bytes = 0,
      stderrBytes = 0;
    let failure = null,
      timeout = false,
      settled = false;
    const stop = (reason) => {
      failure ??= reason;
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch {
        child?.kill("SIGKILL");
      }
    };
    const finish = (exit_code, signal) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const wall_ms = Math.max(0, clock() - start);
      const parsed = parseOutput(Buffer.concat(chunks).toString("utf8"));
      const status = failure ?? (exit_code !== 0 ? "failed" : parsed.status);
      resolve({
        ...parsed,
        status,
        exit_code,
        signal,
        timeout,
        tools_detected: null,
        wall_ms,
        first_agent_message_completed_ms:
          status === "completed" ? wall_ms : null,
        response: status === "completed" ? parsed.response : null,
        usage_unavailable_reason: "native_counter_semantics_unconfirmed",
        tools_unavailable_reason: "json_envelope_has_no_tool_events",
        first_message_method: "complete_json_observed_at_close",
        model_identity: { requested: MODEL, observed: null },
      });
    };
    try {
      child = spawnImpl("agy", args, {
        cwd: scratch,
        shell: false,
        detached: true,
        stdio: ["ignore", "pipe", "pipe"],
      });
      child.stdout.on("data", (chunk) => {
        bytes += chunk.length;
        if (bytes > CAP) {
          stop("stdout_limit");
          return;
        }
        chunks.push(Buffer.from(chunk));
      });
      child.stderr.on("data", (chunk) => {
        stderrBytes += chunk.length;
        if (stderrBytes > CAP) stop("stderr_limit");
      });
      child.once("error", () => {
        failure ??= "spawn_error";
        finish(null, null);
      });
      child.once("close", finish);
      timer = setTimeout(() => {
        timeout = true;
        stop("timeout");
      }, timeoutMs);
      if (settled) clearTimeout(timer);
    } catch {
      failure = "spawn_error";
      finish(null, null);
    }
  });
}
