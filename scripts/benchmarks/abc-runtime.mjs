// Public runtime. All paths created below are exclusively owned by this invocation.
import {
  mkdirSync,
  chmodSync,
  mkdtempSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { Service, Storage } from "../../dist/index.js";
import { safePath, localPath, writePrivate } from "./offline-files.mjs";
import { fail } from "./public-bundle.mjs";
import {
  validateManifest,
  authorize,
  runtimeEnvelope,
  hash,
  canonical,
  CONFIG,
} from "./abc-public.mjs";
import { transport as realTransport } from "./abc-transport.mjs";
export const fakeTransport = async () => ({
  status: "synthetic",
  response: null,
  usage: null,
  model_identity: {
    status: "unavailable",
    reason: "offline fake; no model invoked",
  },
});
function dbState(service) {
  return hash(
    canonical(
      service.db
        .prepare(
          "SELECT id,project_id,content,hash,status,origin,source,uses FROM memories ORDER BY id",
        )
        .all(),
    ),
  );
}
export async function executeABC({
  manifest: m,
  out,
  mode = "offline",
  authorization = null,
  clock = () => performance.now(),
  transportImpl,
  searchHook,
  cleanupHook,
}) {
  const globalStart = clock();
  validateManifest(m);
  if (!["offline", "live"].includes(mode)) fail();
  if (mode === "live") {
    authorize(m, authorization);
    if (process.platform !== "linux")
      throw Error("POSIX transport requires reviewed Linux host");
  } else if (m.stage !== "validate") fail();
  const transport =
    transportImpl ?? (mode === "offline" ? fakeTransport : realTransport);
  localPath(out);
  safePath(dirname(out));
  mkdirSync(out, { mode: 0o700 });
  chmodSync(out, 0o700);
  const result = {
    schema_version: "abc-observations-0.2",
    manifest_sha256: m.sha256,
    synthetic: mode === "offline",
    not_execution_proof: mode === "offline",
    actual_model_calls: 0,
    synthetic_transport_calls: 0,
    retrieval_calls: 0,
    runs: m.requests.map((r, i) => ({
      position: i,
      status: "not_run",
      scenario: r.scenario,
      retrieved: null,
      retrieval_latency_ms: null,
      total_latency_ms: null,
      truncated: false,
      response: null,
      usage: null,
      cleanup: "not_started",
    })),
  };
  let halt = false,
    cancelled = false;
  const cancel = () => {
    cancelled = true;
  };
  process.on("SIGINT", cancel);
  process.on("SIGTERM", cancel);
  const globalRemaining = () => m.limits.global_ms - (clock() - globalStart);
  // A context that is infeasible locally stops the batch before any later attempt.
  try {
    for (let i = 0; i < m.requests.length; i++) {
      if (halt || cancelled || globalRemaining() <= 0) break;
      const r = m.requests[i],
        o = result.runs[i];
      let owned, service, started, deadline;
      try {
        const runStart = clock();
        deadline = Math.min(
          globalStart + m.limits.global_ms,
          runStart + m.limits.run_ms,
        );
        owned = mkdtempSync(join(out, "fixture-"));
        chmodSync(owned, 0o700);
        const scratch = join(owned, "work");
        mkdirSync(scratch, { mode: 0o700 });
        const history = join(owned, "history.txt");
        writeFileSync(history, "", { flag: "wx", mode: 0o600 });
        if (hash(readFileSync(history)) !== m.history.sha256) fail();
        const db = join(owned, "db.sqlite");
        service = new Service(new Storage(db));
        o.initial_db_sha256 = dbState(service);
        const project = randomUUID();
        service.db
          .prepare("INSERT INTO projects VALUES(?,?,1,?)")
          .run(project, scratch, "2020-01-01T00:00:00Z");
        const keyMap = new Map();
        for (const key of r.pool) {
          const s = m.bundle.sources.find(
            (s) => s.source_id + "/" + s.unit_id === key,
          );
          const memory = service.store(
            project,
            s.excerpt,
            "semantic",
            "user",
            s,
          );
          if (!keyMap.has(memory.id)) keyMap.set(memory.id, key);
        }
        if (
          service.db
            .prepare(
              "SELECT count(*) n FROM memories WHERE project_id=? AND status='candidate' AND origin='user'",
            )
            .get(project).n !==
          new Set(
            r.pool.map(
              (k) =>
                m.bundle.sources.find(
                  (s) => s.source_id + "/" + s.unit_id === k,
                ).sha256,
            ),
          ).size
        )
          throw Error("Seed guard failed");
        o.seed_sha256 = dbState(service);
        o.pool_sha256 = hash(canonical(r.pool));
        if (cancelled) throw Error("cancelled");
        if (clock() >= deadline) throw Error("run_timeout");
        started = clock();
        let retrieved = [];
        if (r.scenario === "com_mimir") {
          result.retrieval_calls++;
          const t = clock();
          const opts = {
            projectId: project,
            query: r.query,
            ...Object.fromEntries(
              Object.entries(CONFIG).filter(([k]) => k !== "version"),
            ),
          };
          const response = await (searchHook
            ? searchHook(service, opts)
            : service.call("memory_search", opts));
          o.retrieval_latency_ms = clock() - t;
          if (
            o.retrieval_latency_ms > m.limits.search_ms ||
            clock() >= deadline
          )
            throw Error("search_timeout");
          if (!response.ok) throw Error("Search failed");
          retrieved = response.data.memories.map((memory) => {
            if (memory.project_id !== project || !keyMap.has(memory.id))
              throw Error("Pool guard failed");
            const key = keyMap.get(memory.id);
            const source = m.bundle.sources.find(
              (s) => s.source_id + "/" + s.unit_id === key,
            );
            if (
              memory.hash !== source.sha256 ||
              memory.content !== source.excerpt
            )
              throw Error("Source guard failed");
            return key;
          });
          o.retrieved = retrieved;
        }
        const envelope = runtimeEnvelope(m.bundle, r.task, r.base, retrieved);
        envelope.instruction +=
          " Não utilize ferramentas, shell ou código; responda somente com base nas fontes fornecidas.";
        const prompt = JSON.stringify(envelope);
        o.context_bytes = Buffer.byteLength(prompt);
        o.context_sha256 = hash(prompt);
        if (o.context_bytes > m.limits.context_bytes) throw Error("infeasible");
        const remaining = Math.min(
          m.limits.call_ms,
          deadline - clock(),
          globalRemaining(),
        );
        if (cancelled) throw Error("cancelled");
        if (remaining <= 0) throw Error("run_timeout");
        if (mode === "live") result.actual_model_calls++;
        else result.synthetic_transport_calls++;
        const response = await transport({
          prompt,
          scratch,
          timeoutMs: remaining,
          outputBytes: m.limits.capture_bytes,
          clock,
        });
        o.total_latency_ms = clock() - started;
        o.truncated = response.truncated ?? false;
        o.response_bytes = response.response_bytes ?? null;
        o.response_sha256 = response.response_sha256 ?? null;
        o.transport_status = response.status;
        o.model_identity = response.model_identity ?? {
          status: "unavailable",
          reason: "transport did not expose identity",
        };
        o.usage = response.usage ?? null;
        if (response.response !== null && response.response !== undefined) {
          const bytes = Buffer.from(response.response);
          o.response_bytes = bytes.length;
          o.response_sha256 = hash(bytes);
          o.truncated = bytes.length > m.limits.capture_bytes;
          o.response = o.truncated ? null : response.response;
        }
        o.status =
          mode === "offline" && response.status === "synthetic"
            ? "synthetic"
            : response.status === "timeout"
              ? "timeout"
              : mode === "live" &&
                  response.status === "completed" &&
                  !response.tools_detected &&
                  !o.truncated &&
                  response.exit_code === 0 &&
                  typeof o.response === "string" &&
                  o.response.trim()
                ? "completed"
                : "error";
        if (clock() > deadline || globalRemaining() < 0) o.status = "timeout";
        if (!["completed", "synthetic"].includes(o.status)) halt = true;
      } catch (error) {
        o.status = /timeout/.test(error.message)
          ? "timeout"
          : error.message === "infeasible"
            ? "infeasible"
            : "error";
        o.diagnostic = [
          "run_timeout",
          "search_timeout",
          "infeasible",
          "cancelled",
        ].includes(error.message)
          ? error.message
          : "local_operation_failed";
        halt = true;
      } finally {
        if (started !== undefined) o.total_latency_ms = clock() - started;
        try {
          if (service) {
            o.final_db_sha256 = dbState(service);
            service.close();
            service = null;
          }
          if (owned) {
            o.db_file_sha256 = hash(readFileSync(join(owned, "db.sqlite")));
            if (cleanupHook) cleanupHook(owned);
            rmSync(owned, { recursive: true });
          }
          o.cleanup = "completed";
        } catch {
          o.cleanup = "error_retained";
          halt = true;
          try {
            service?.close();
          } catch {
            /* Keep original cleanup diagnostic. */
          }
        }
        if (clock() > deadline) {
          o.status = "timeout";
          halt = true;
        }
        writePrivate(
          join(out, `position-${String(i).padStart(2, "0")}.json`),
          o,
        );
      }
    }
    result.global_elapsed_ms = clock() - globalStart;
    result.stopped = halt || result.runs.some((r) => r.status === "not_run");
    writePrivate(join(out, "results.json"), result);
    return result;
  } finally {
    process.removeListener("SIGINT", cancel);
    process.removeListener("SIGTERM", cancel);
  }
}
