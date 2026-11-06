/** Opt-in synthetic fixture relay. Never records raw protocol, content or stderr. */
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import {
  openSync,
  closeSync,
  writeSync,
  readFileSync,
  realpathSync,
  statSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

const tools = new Set([
  "memory_get",
  "memory_search",
  "memory_store",
  "memory_feedback",
  "memory_delete",
  "memory_stats",
]);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const actions = new Set(["approve", "promote", "note"]);
const codes = new Set([
  "APPROVAL_REQUIRED",
  "SHARING_APPROVAL_REQUIRED",
  "VALIDATION_ERROR",
  "NOT_FOUND",
  "INVALID_INPUT",
  "INVALID_REQUEST",
]);

/** Bounded observer: oversized frames are discarded until newline, never truncated into JSON. */
export class Observer {
  constructor(emit) {
    this.emit = emit;
    this.calls = 0;
    this.pending = new Map();
    this.buffers = { request: Buffer.alloc(0), response: Buffer.alloc(0) };
    this.dropping = {};
  }
  feed(direction, chunk) {
    let start = 0;
    for (let i = 0; i < chunk.length; i++) {
      if (chunk[i] !== 10) continue;
      this.part(direction, chunk.subarray(start, i), true);
      start = i + 1;
    }
    this.part(direction, chunk.subarray(start), false);
  }
  part(direction, bytes, end) {
    if (!this.dropping[direction]) {
      if (this.buffers[direction].length + bytes.length > 65536) {
        this.buffers[direction] = Buffer.alloc(0);
        this.dropping[direction] = true;
      } else
        this.buffers[direction] = Buffer.concat([
          this.buffers[direction],
          bytes,
        ]);
    }
    if (!end) return;
    if (!this.dropping[direction]) {
      try {
        this.observe(
          direction,
          JSON.parse(this.buffers[direction].toString("utf8")),
        );
      } catch {
        /* Malformed frames still pass unchanged; they are never captured. */
      }
    }
    this.buffers[direction] = Buffer.alloc(0);
    this.dropping[direction] = false;
  }
  observe(direction, frame) {
    // Only numeric JSON-RPC IDs are retained internally; arbitrary string IDs can carry secrets.
    if (!Number.isSafeInteger(frame?.id)) return;
    if (direction === "request") {
      if (
        frame.method !== "tools/call" ||
        !tools.has(frame.params?.name) ||
        this.pending.size >= 128
      )
        return;
      const args = frame.params.arguments ?? {},
        entry = { tool: frame.params.name };
      for (const key of ["projectId", "id"])
        if (typeof args[key] === "string" && uuid.test(args[key]))
          entry[key] = args[key];
      for (const key of [
        "explicitApproval",
        "sharingApproval",
        "confirm",
        "includeGlobal",
      ])
        if (typeof args[key] === "boolean") entry[key] = args[key];
      if (actions.has(args.action)) entry.action = args.action;
      if (["global", "project"].includes(args.scope)) entry.scope = args.scope;
      entry.call = ++this.calls;
      this.pending.set(frame.id, entry);
      this.emit({ event: "received", ...entry });
    } else {
      const entry = this.pending.get(frame.id);
      if (!entry) return;
      this.pending.delete(frame.id);
      const result = {
        event: "response",
        call: entry.call,
        tool: entry.tool,
        protocolError: !!frame.error,
        toolError: frame.result?.isError === true,
      };
      try {
        const value = JSON.parse(frame.result?.content?.[0]?.text);
        if (typeof value.ok === "boolean") result.ok = value.ok;
        if (codes.has(value.error?.code)) result.code = value.error.code;
        if (uuid.test(value.data?.id ?? "")) result.id = value.data.id;
        if (
          ["candidate", "verified", "rejected", "deprecated"].includes(
            value.data?.status,
          )
        )
          result.status = value.data.status;
        if (typeof value.data?.deleted === "boolean")
          result.deleted = value.data.deleted;
      } catch {
        /* Unknown response shapes produce metadata only. */
      }
      this.emit(result);
    }
  }
}

// Configuration is explicit per invocation; no environment/global configuration is read.
export function sessionLimit(value = "240") {
  if (!/^[0-9]+$/.test(String(value))) throw Error("Invalid lifetime");
  const minutes = Number(value);
  if (!Number.isSafeInteger(minutes) || minutes < 1 || minutes > 720)
    throw Error("Invalid lifetime");
  return minutes * 60 * 1000;
}

export function auditName(name) {
  if (name === "--unique")
    return `audit-session-${process.pid}-${randomUUID()}.jsonl`;
  if (!/^audit-[a-zA-Z0-9_-]+\.jsonl$/.test(name ?? ""))
    throw Error("Invalid audit mode");
  return name;
}

// Injectable timer keeps watchdog regression tests deterministic without a hidden CLI bypass.
export function watchdog(stop, milliseconds, schedule = setTimeout) {
  const timer = schedule(stop, milliseconds);
  timer.unref();
  return timer;
}

// One idempotent termination path for EOF, transport failures, signals and watchdog.
export function termination(signal, schedule = setTimeout) {
  let stopped = false,
    timer;
  return {
    stop() {
      if (stopped) return false;
      stopped = true;
      signal("SIGTERM");
      timer = schedule(() => signal("SIGKILL"), 1000);
      timer.unref();
      return true;
    },
    clear() {
      clearTimeout(timer);
    },
  };
}

export function startupDiagnostic(error) {
  return error?.code === "EEXIST"
    ? "Synthetic audit relay refused startup: audit exists; use --unique or a new audit basename.\n"
    : "Synthetic audit relay refused startup: verify private synthetic fixture, exact runtime, audit mode and lifetime (1..720 minutes).\n";
}

export function main(rootArg, name, minutes) {
  const lifetime = sessionLimit(minutes);
  name = auditName(name);
  const root = realpathSync(rootArg ?? "");
  if (
    dirname(root) !== realpathSync(tmpdir()) ||
    !/^mimir-v02-[a-zA-Z0-9_-]+$/.test(basename(root)) ||
    !/^audit-[a-zA-Z0-9_-]+\.jsonl$/.test(name ?? "")
  )
    throw Error("Expected explicit synthetic fixture and new audit-NAME.jsonl");
  const manifestPath = join(root, "manifest.json");
  if (
    realpathSync(manifestPath) !== manifestPath ||
    statSync(manifestPath).size > 8192
  )
    throw Error("Invalid fixture manifest");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const privateDir = realpathSync(join(root, "private"));
  const db = realpathSync(join(privateDir, "host.sqlite"));
  const cli = realpathSync(
    resolve(import.meta.dirname, "../dist/cli/index.js"),
  );
  if (
    manifest.directory !== root ||
    db !== join(privateDir, "host.sqlite") ||
    manifest.db !== db ||
    manifest.cli !== cli ||
    realpathSync(manifest.node) !== realpathSync(process.execPath) ||
    privateDir !== join(root, "private")
  )
    throw Error("Fixture/runtime mismatch");
  if (
    process.platform !== "win32" &&
    [root, privateDir].some((p) => (statSync(p).mode & 0o077) !== 0)
  )
    throw Error("Fixture directories must be private (0700)");
  const fd = openSync(join(privateDir, name), "wx", 0o600);
  let count = 0,
    finished = false;
  const observer = new Observer((value) => {
    // Maximum 512 bounded metadata rows. Capture limits are explicit; absence never proves completeness.
    if (count < 511) {
      try {
        writeSync(fd, JSON.stringify({ seq: ++count, ...value }) + "\n");
      } catch {
        stop();
      }
    } else if (count === 511) {
      count++;
      try {
        writeSync(
          fd,
          JSON.stringify({ seq: count, event: "capture_limit" }) + "\n",
        );
      } catch {
        stop();
      }
    }
  });
  const child = spawn(process.execPath, [cli, "--db", db, "mcp", "stdio"], {
    stdio: ["pipe", "pipe", "ignore"],
    detached: process.platform !== "win32",
  });
  // A private process group lets timeout/signals also reap any accidental descendants.
  const signal = (sig) => {
    try {
      if (child.pid && process.platform !== "win32")
        process.kill(-child.pid, sig);
      else child.kill(sig);
    } catch {
      /* Already exited. */
    }
  };
  const cleanup = termination(signal);
  const stop = (reason = "transport closed") => {
    if (!cleanup.stop()) return;
    process.stderr.write(
      `Synthetic audit relay stopping: ${typeof reason === "string" ? reason : "transport closed"}.\n`,
    );
  };
  let eofTimer;
  const deadline = watchdog(
    () => stop("session deadline reached; restart with --unique"),
    lifetime,
  );
  // pipe handles backpressure; observers see copies and never reserialize protocol bytes.
  process.stdin.on("data", (chunk) => observer.feed("request", chunk));
  child.stdout.on("data", (chunk) => observer.feed("response", chunk));
  process.stdin.pipe(child.stdin);
  child.stdout.pipe(process.stdout);
  // Let pipe flush queued input and the server finish the final response before termination.
  process.stdin.on("end", () => {
    eofTimer = setTimeout(() => stop("input EOF grace expired"), 30000);
    eofTimer.unref();
  });
  process.stdin.on("error", stop);
  process.stdout.on("error", stop);
  child.stdin.on("error", stop);
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
  const finish = (code) => {
    if (finished) return;
    finished = true;
    signal("SIGKILL");
    clearTimeout(deadline);
    cleanup.clear();
    clearTimeout(eofTimer);
    process.stdin.unpipe();
    process.stdin.pause();
    closeSync(fd);
    process.exitCode = code;
  };
  child.once("error", () => {
    process.stderr.write(
      "Synthetic audit relay child failed; verify runtime and build.\n",
    );
    finish(1);
  });
  child.once("close", (code) => finish(code ?? 1));
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    if (![4, 5].includes(process.argv.length))
      throw Error("Expected arguments");
    main(...process.argv.slice(2));
  } catch (error) {
    process.stderr.write(startupDiagnostic(error));
    process.exitCode = 1;
  }
}
