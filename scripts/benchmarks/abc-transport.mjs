// Public-only transport: no legacy case runner or private corpus loader imports.
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { collectStream } from "./codex-usage-cli.mjs";
export const HOST = Object.freeze({
  transport: "codex-lean-jsonl-posix-1",
  binary:
    "/home/usuario/.codex/packages/standalone/releases/0.164.0-x86_64-unknown-linux-musl/bin/codex",
  requested_model: "gpt-6.1-sol",
  reasoning_effort: "low",
  isolation: "ignore-user-config/ephemeral/read-only/empty-cwd",
  disabled_features: ["apps", "plugins", "multi_agent"],
});
export const argsFor = (scratch) => [
  "exec",
  "-m",
  HOST.requested_model,
  "-c",
  'model_reasoning_effort="low"',
  "--ignore-user-config",
  "--ephemeral",
  "--sandbox",
  "read-only",
  "--skip-git-repo-check",
  "--cd",
  scratch,
  "--json",
  ...HOST.disabled_features.flatMap((f) => ["--disable", f]),
  "-",
];
export async function transport({
  prompt,
  scratch,
  timeoutMs = 90000,
  clock = () => performance.now(),
  spawnImpl = spawn,
  outputBytes = 64000,
}) {
  const start = clock();
  let child,
    timeout = false,
    cancelled = false,
    limit = false,
    tools = false,
    response = null,
    stderrBytes = 0;
  let responseBytes = null,
    responseSha256 = null;
  let usageReport = null,
    streamError = false,
    spawnError = false,
    hostError = false;
  let firstMessageMs = null;
  let modelIdentity = {
    status: "unavailable",
    reason: "No model identity in allowlisted public start metadata",
  };
  try {
    child = spawnImpl(HOST.binary, argsFor(scratch), {
      cwd: scratch,
      detached: true,
      env: { PATH: "/usr/local/bin:/usr/bin:/bin", HOME: process.env.HOME },
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch {
    return { status: "spawn_error", wall_ms: clock() - start, usage: null };
  }
  const exited = new Promise((done) => {
    child.once("error", () => {
      spawnError = true;
    });
    child.once("close", (code, signal) => done({ code, signal }));
  });
  const stop = () => {
    // Kill the owned process group, including descendants; never a caller group.
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {
      child.kill("SIGKILL");
    }
    child.stdout.destroy();
    child.stderr.destroy();
  };
  const cancel = () => {
    cancelled = true;
    stop();
  };
  process.once("SIGINT", cancel);
  process.once("SIGTERM", cancel);
  const timer = setTimeout(() => {
    timeout = true;
    stop();
  }, timeoutMs);
  child.stderr.on("data", (b) => {
    stderrBytes += b.length;
    if (stderrBytes > 1024 * 1024) {
      limit = true;
      stop();
    }
  });
  child.stdin.on("error", () => {});
  child.stdin.end(prompt);
  async function* inspected() {
    let pending = Buffer.alloc(0),
      bytes = 0;
    for await (const chunk of child.stdout) {
      bytes += chunk.length;
      if (bytes > 16 * 1024 * 1024) {
        limit = true;
        stop();
        throw Error();
      }
      pending = Buffer.concat([pending, chunk]);
      let end;
      while ((end = pending.indexOf(10)) >= 0) {
        inspect(pending.subarray(0, end));
        pending = pending.subarray(end + 1);
      }
      if (pending.length > 1024 * 1024) {
        limit = true;
        stop();
        throw Error();
      }
      yield chunk;
    }
    if (pending.length) inspect(pending);
  }
  function inspect(line) {
    const e = JSON.parse(line.toString("utf8"));
    if (e.type === "error") hostError = true;
    // Only a model identifier on public start events is allowed; no configuration or logs are read.
    if (
      ["thread.started", "turn.started"].includes(e.type) &&
      typeof e.model === "string" &&
      /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,99}$/.test(e.model)
    ) {
      if (modelIdentity.model && modelIdentity.model !== e.model) throw Error();
      modelIdentity = { status: "public-host-reported", model: e.model };
    }
    if (e.type.startsWith("item.") && e.item) {
      // Fail closed on unknown item kinds, including all tool invocations.
      if (!["agent_message", "reasoning"].includes(e.item.type)) {
        tools = true;
        stop();
      }
      if (e.type === "item.completed" && e.item.type === "agent_message") {
        if (typeof e.item.text === "string") {
          responseBytes = Buffer.byteLength(e.item.text);
          responseSha256 = createHash("sha256")
            .update(e.item.text)
            .digest("hex");
        }
        if (
          typeof e.item.text !== "string" ||
          Buffer.byteLength(e.item.text) > outputBytes
        ) {
          limit = true;
          stop();
          throw Error();
        }
        firstMessageMs ??= clock() - start;
        response = e.item.text;
      }
    }
  }
  try {
    usageReport = await collectStream(inspected(), { clock });
  } catch {
    streamError = true;
    stop();
  }
  const { code, signal } = await exited;
  clearTimeout(timer);
  process.removeListener("SIGINT", cancel);
  process.removeListener("SIGTERM", cancel);
  const status = cancelled
    ? "cancelled"
    : timeout
      ? "timeout"
      : limit
        ? "limit"
        : spawnError
          ? "spawn_error"
          : streamError
            ? "stream_error"
            : code !== 0
              ? "exit_nonzero"
              : tools
                ? "invalid_tools"
                : hostError ||
                    usageReport?.status !== "completed" ||
                    response === null ||
                    !response.trim()
                  ? "incomplete"
                  : "completed";
  return {
    status,
    exit_code: code,
    signal,
    timeout,
    tools_detected: tools,
    wall_ms: clock() - start,
    first_agent_message_completed_ms: firstMessageMs,
    collector: usageReport,
    usage: usageReport?.usage ?? null,
    usage_status: usageReport?.usage_status ?? "unavailable",
    response,
    truncated: limit,
    response_bytes: responseBytes,
    response_sha256: responseSha256,
    model_identity: modelIdentity,
  };
}
