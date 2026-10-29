import { DatabaseSync } from "node:sqlite";
import {
  existsSync,
  readFileSync,
  writeFileSync,
  openSync,
  closeSync,
  fsyncSync,
  linkSync,
  unlinkSync,
  statSync,
} from "node:fs";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import * as z from "zod/v4";
import { AppError, assertLocalPath, hash, inside } from "../security/index.js";
import { assertPatchedSqlite, sqliteRuntime } from "../storage/index.js";
import { getPackageVersion } from "../version.js";
import {
  privateDestination,
  createPrivateFile,
  privateExisting,
} from "./privacy.js";
import {
  startSchema,
  finishSchema,
  externalEvent,
  internalSearch,
  internalFailure,
  reportSchema,
  adminSchemas,
} from "./schemas.js";
import type { SearchEvent } from "./schemas.js";
export type CaptureStatus = {
  captureStatus: "persisted" | "failed";
  callId: string;
  reason?: "sink_write_failed";
};
const SQL = `CREATE TABLE marker(role TEXT NOT NULL,version INTEGER NOT NULL);
INSERT INTO marker VALUES('mimir-observability',1);
CREATE TABLE attempts(id TEXT PRIMARY KEY,project TEXT NOT NULL,start TEXT NOT NULL,status TEXT NOT NULL,started TEXT NOT NULL,finished TEXT,expires TEXT NOT NULL,runtime TEXT NOT NULL);
CREATE TABLE events(id TEXT PRIMARY KEY,attempt TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,seq INTEGER NOT NULL,at TEXT NOT NULL,source TEXT NOT NULL,origin TEXT NOT NULL,body TEXT NOT NULL,event_hash TEXT NOT NULL,UNIQUE(attempt,seq));
CREATE TABLE usage(event TEXT PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,project TEXT NOT NULL,session TEXT NOT NULL,namespace TEXT NOT NULL,scope TEXT NOT NULL,scope_id TEXT NOT NULL,UNIQUE(project,namespace,scope_id));`;
const layout = (db: DatabaseSync) =>
  canonical(
    db
      .prepare(
        "SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name",
      )
      .all(),
  );
function canonical(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value && typeof value === "object")
    return (
      "{" +
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([k, v]) => JSON.stringify(k) + ":" + canonical(v))
        .join(",") +
      "}"
    );
  return JSON.stringify(value);
}
function error(code: string): never {
  throw new AppError(code, "Measurement contract rejected.");
}
function checkLayout(db: DatabaseSync) {
  const ref = new DatabaseSync(":memory:");
  try {
    ref.exec(SQL);
    const marker = db.prepare("SELECT * FROM marker").all();
    if (
      canonical(marker) !==
        canonical([{ role: "mimir-observability", version: 1 }]) ||
      layout(db) !== layout(ref) ||
      db.prepare("PRAGMA integrity_check").get()?.integrity_check !== "ok" ||
      db.prepare("PRAGMA foreign_key_check").all().length
    )
      error("MEASUREMENT_SCHEMA");
  } catch {
    error("MEASUREMENT_SCHEMA");
  } finally {
    ref.close();
  }
}
const storedBody = z.union([
  startSchema,
  finishSchema,
  externalEvent,
  internalSearch,
  internalFailure,
]);
const envelope = z
  .object({
    id: z.string().uuidv4(),
    attempt: z.string().uuidv4(),
    seq: z.number().int().positive(),
    at: z.iso.datetime(),
    source: z.enum(["internal", "provided"]),
    origin: z.enum(["runtime", "restore"]),
    body: z.string(),
    event_hash: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
const runtime = z
  .object({
    mimir: z.string().regex(/^[0-9a-zA-Z.+-]{1,64}$/),
    node: z.string().regex(/^v[0-9.]{1,32}$/),
    platform: z.enum([
      "linux",
      "win32",
      "darwin",
      "freebsd",
      "openbsd",
      "aix",
      "sunos",
      "android",
      "haiku",
      "netbsd",
      "cygwin",
    ]),
    configOrigin: z.enum(["trusted_startup", "restored_provided"]),
  })
  .strict();
const snapshotSchema = z
  .object({
    schemaVersion: z.literal(1),
    role: z.literal("mimir-observability-export"),
    runtime: z
      .object({ mimir: z.string(), node: z.string(), platform: z.string() })
      .strict(),
    attempts: z
      .array(
        z
          .object({
            start: startSchema,
            status: z.enum([
              "running",
              "succeeded",
              "failed",
              "aborted",
              "not_run",
            ]),
            started: z.iso.datetime(),
            finished: z.iso.datetime().nullable(),
            expires: z.iso.datetime(),
            runtime,
          })
          .strict(),
      )
      .max(1000),
    events: z.array(envelope.extend({ body: storedBody })).max(100000),
  })
  .strict();

function populateSnapshot(
  db: DatabaseSync,
  snapshot: z.infer<typeof snapshotSchema>,
) {
  for (const a of snapshot.attempts)
    db.prepare("INSERT INTO attempts VALUES(?,?,?,?,?,?,?,?)").run(
      a.start.attemptId,
      a.start.projectId,
      canonical(a.start),
      a.status,
      a.started,
      a.finished,
      a.expires,
      canonical(a.runtime),
    );
  for (const e of snapshot.events) {
    const a = snapshot.attempts.find((a) => a.start.attemptId === e.attempt);
    if (
      !a ||
      e.body.projectId !== a.start.projectId ||
      e.body.attemptId !== e.attempt ||
      e.body.eventId !== e.id ||
      hash(
        canonical({
          body: e.body,
          source: e.source,
          origin: e.origin,
          seq: e.seq,
          at: e.at,
        }),
      ) !== e.event_hash
    )
      error("MEASUREMENT_SCHEMA");
    const b = e.body;
    if (
      e.origin === "restore"
        ? e.source !== "provided"
        : "kind" in b && (b.kind === "search" || b.kind === "search_failure")
          ? e.source !== "internal"
          : e.source !== "provided"
    )
      error("MEASUREMENT_SCHEMA");
    db.prepare("INSERT INTO events VALUES(?,?,?,?,?,?,?,?)").run(
      e.id,
      e.attempt,
      e.seq,
      e.at,
      e.source,
      e.origin,
      canonical(b),
      e.event_hash,
    );
    if ("kind" in b && b.kind === "host_usage") {
      const u = b.usage;
      if (u.sessionId !== a.start.sessionId) error("MEASUREMENT_USAGE_SCOPE");
      const rows = db
        .prepare(
          "SELECT scope FROM usage WHERE project=? AND namespace=? AND session=?",
        )
        .all(b.projectId, u.namespace, u.sessionId);
      if (rows.some((r) => r.scope === "session" || u.scope === "session"))
        error("MEASUREMENT_USAGE_OVERLAP");
      db.prepare("INSERT INTO usage VALUES(?,?,?,?,?,?)").run(
        e.id,
        b.projectId,
        u.sessionId,
        u.namespace,
        u.scope,
        u.scopeId,
      );
    }
  }
  for (const a of snapshot.attempts) {
    const es = snapshot.events
      .filter((e) => e.attempt === a.start.attemptId)
      .sort((a, b) => a.seq - b.seq);
    if (
      !es.length ||
      es.some((e, i) => e.seq !== i + 1) ||
      canonical(es[0]!.body) !== canonical(a.start)
    )
      error("MEASUREMENT_SCHEMA");
    const finishes = es.filter(
      (e) => "status" in e.body && !("kind" in e.body),
    );
    if (
      a.status === "running"
        ? a.finished !== null || finishes.length !== 0
        : a.finished === null ||
          finishes.length !== 1 ||
          finishes[0] !== es.at(-1) ||
          !("status" in finishes[0]!.body) ||
          finishes[0]!.body.status !== a.status
    )
      error("MEASUREMENT_SCHEMA");
  }
}

function checkData(db: DatabaseSync) {
  db.exec("BEGIN");
  const scratch = new DatabaseSync(":memory:");
  try {
    const snapshot = snapshotSchema
      .extend({
        attempts: z.array(snapshotSchema.shape.attempts.element),
        events: z.array(snapshotSchema.shape.events.element),
      })
      .parse({
        schemaVersion: 1,
        role: "mimir-observability-export",
        runtime: {
          mimir: getPackageVersion(),
          node: process.version,
          platform: process.platform,
        },
        attempts: db
          .prepare("SELECT * FROM attempts ORDER BY id")
          .all()
          .map((a) => ({
            start: JSON.parse(String(a.start)),
            status: a.status,
            started: a.started,
            finished: a.finished,
            expires: a.expires,
            runtime: JSON.parse(String(a.runtime)),
          })),
        events: db
          .prepare("SELECT * FROM events ORDER BY attempt,seq")
          .all()
          .map((e) => ({ ...e, body: JSON.parse(String(e.body)) })),
      });
    scratch.exec("PRAGMA foreign_keys=ON;");
    scratch.exec(SQL);
    populateSnapshot(scratch, snapshot);
    if (
      canonical(db.prepare("SELECT * FROM usage ORDER BY event").all()) !==
      canonical(scratch.prepare("SELECT * FROM usage ORDER BY event").all())
    )
      error("MEASUREMENT_SCHEMA");
    db.exec("COMMIT");
  } catch {
    db.exec("ROLLBACK");
    error("MEASUREMENT_SCHEMA");
  } finally {
    scratch.close();
  }
}
export class Measurement {
  readonly path: string;
  private db: DatabaseSync;
  constructor(path: string, mainPath: string, projectRoots: string[] = []) {
    assertPatchedSqlite(sqliteRuntime().version);
    const requested = assertLocalPath(path),
      main = assertLocalPath(mainPath);
    if (
      requested === main ||
      ["-wal", "-shm"].some(
        (s) => requested === main + s || requested + s === main,
      ) ||
      projectRoots.some((r) => inside(r, requested))
    )
      error("MEASUREMENT_PATH");
    this.path = privateDestination(requested);
    const existing = existsSync(this.path);
    if (existing) {
      // Validate role, exact layout and future version read-only before changing pragmas.
      const probe = new DatabaseSync(this.path, { readOnly: true });
      try {
        checkLayout(probe);
        checkData(probe);
      } finally {
        probe.close();
      }
    } else createPrivateFile(this.path);
    this.db = new DatabaseSync(this.path);
    try {
      this.db.exec("PRAGMA busy_timeout=250; PRAGMA foreign_keys=ON;");
      if (!existing) this.tx(() => this.db.exec(SQL));
      this.db.exec("PRAGMA journal_mode=WAL;");
      checkLayout(this.db);
    } catch (e) {
      this.db.close();
      throw e;
    }
  }
  private tx<T>(fn: () => T): T {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const v = fn();
      this.db.exec("COMMIT");
      return v;
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
  private attempt(project: string, id: string) {
    const row = this.db.prepare("SELECT * FROM attempts WHERE id=?").get(id);
    if (!row || row.project !== project) error("MEASUREMENT_SCOPE");
    const start = startSchema.parse(JSON.parse(String(row.start)));
    if (
      start.attemptId !== id ||
      start.projectId !== project ||
      !["running", "succeeded", "failed", "aborted", "not_run"].includes(
        String(row.status),
      )
    )
      error("MEASUREMENT_SCHEMA");
    return {
      ...row,
      status: String(row.status),
      started: String(row.started),
      finished: row.finished === null ? null : String(row.finished),
      expires: String(row.expires),
      runtime: runtime.parse(JSON.parse(String(row.runtime))),
      parsed: start,
    };
  }
  assertAttempt(project: string, id: string) {
    const a = this.attempt(project, id);
    if (a.status !== "running") error("MEASUREMENT_FINISHED");
    this.events(project, [id]);
  }
  private existing(id: string, body: unknown, source: string) {
    const row = this.db.prepare("SELECT * FROM events WHERE id=?").get(id);
    if (!row) return false;
    if (row.body !== canonical(body) || row.source !== source)
      error("MEASUREMENT_EVENT_CONFLICT");
    return true;
  }
  private insert(
    body: { eventId: string; attemptId: string },
    source: "internal" | "provided",
  ) {
    const text = canonical(body);
    if (Buffer.byteLength(text) > 65536) error("MEASUREMENT_LIMIT");
    const seq = Number(
      this.db
        .prepare(
          "SELECT COALESCE(MAX(seq),0)+1 AS n FROM events WHERE attempt=?",
        )
        .get(body.attemptId)!.n,
    );
    const at = new Date().toISOString();
    const eventHash = hash(
      canonical({ body, source, origin: "runtime", seq, at }),
    );
    this.db
      .prepare("INSERT INTO events VALUES(?,?,?,?,?,?,?,?)")
      .run(
        body.eventId,
        body.attemptId,
        seq,
        at,
        source,
        "runtime",
        text,
        eventHash,
      );
    return {
      eventId: body.eventId,
      seq,
      eventHash,
      captureStatus: "persisted",
    };
  }
  start(input: unknown) {
    const d = startSchema.parse(input);
    return this.tx(() => {
      if (this.existing(d.eventId, d, "provided"))
        return {
          eventId: d.eventId,
          idempotent: true,
          captureStatus: "persisted",
        };
      if (d.retryOf) this.attempt(d.projectId, d.retryOf);
      const now = new Date();
      this.db.prepare("INSERT INTO attempts VALUES(?,?,?,?,?,?,?,?)").run(
        d.attemptId,
        d.projectId,
        canonical(d),
        "running",
        now.toISOString(),
        null,
        new Date(now.getTime() + d.ttlDays * 86400000).toISOString(),
        canonical({
          mimir: getPackageVersion(),
          node: process.version,
          platform: process.platform,
          configOrigin: "trusted_startup",
        }),
      );
      return this.insert(d, "provided");
    });
  }
  record(input: unknown) {
    const d = externalEvent.parse(input);
    return this.tx(() => {
      this.attempt(d.projectId, d.attemptId);
      if (this.existing(d.eventId, d, "provided"))
        return {
          eventId: d.eventId,
          idempotent: true,
          captureStatus: "persisted",
        };
      this.assertAttempt(d.projectId, d.attemptId);
      if (d.kind === "host_usage") {
        const u = d.usage;
        if (
          this.attempt(d.projectId, d.attemptId).parsed.sessionId !==
          u.sessionId
        )
          error("MEASUREMENT_USAGE_SCOPE");
        // A session aggregate and its turns overlap. Reject mixing; never double-sum.
        const rows = this.db
          .prepare(
            "SELECT * FROM usage WHERE project=? AND namespace=? AND session=?",
          )
          .all(d.projectId, u.namespace, u.sessionId);
        if (
          rows.some(
            (r) =>
              r.scope_id === u.scopeId ||
              r.scope === "session" ||
              u.scope === "session",
          )
        )
          error("MEASUREMENT_USAGE_OVERLAP");
        const result = this.insert(d, "provided");
        this.db
          .prepare("INSERT INTO usage VALUES(?,?,?,?,?,?)")
          .run(
            d.eventId,
            d.projectId,
            u.sessionId,
            u.namespace,
            u.scope,
            u.scopeId,
          );
        return result;
      }
      return this.insert(d, "provided");
    });
  }
  finish(input: unknown) {
    const d = finishSchema.parse(input);
    return this.tx(() => {
      this.attempt(d.projectId, d.attemptId);
      if (this.existing(d.eventId, d, "provided"))
        return {
          eventId: d.eventId,
          idempotent: true,
          captureStatus: "persisted",
        };
      this.assertAttempt(d.projectId, d.attemptId);
      this.db
        .prepare("UPDATE attempts SET status=?,finished=? WHERE id=?")
        .run(d.status, new Date().toISOString(), d.attemptId);
      return this.insert(d, "provided");
    });
  }
  // The only internal event producer takes no JSON collectionSource flag. Service
  // supplies measurements from its own search; external record cannot parse search.
  captureSearch(
    input: SearchEvent | z.infer<typeof internalFailure>,
  ): CaptureStatus {
    try {
      const d = z.union([internalSearch, internalFailure]).parse(input);
      this.tx(() => {
        this.assertAttempt(d.projectId, d.attemptId);
        this.insert(d, "internal");
      });
      return { captureStatus: "persisted", callId: d.callId };
    } catch {
      return {
        captureStatus: "failed",
        callId: input.callId,
        reason: "sink_write_failed",
      };
    }
  }
  private events(project: string, ids: string[]) {
    return ids.flatMap((id) => {
      this.attempt(project, id);
      return this.db
        .prepare("SELECT * FROM events WHERE attempt=? ORDER BY seq")
        .all(id)
        .map((row, index) => {
          const e = envelope.parse(row),
            body = storedBody.parse(JSON.parse(e.body));
          if (
            e.seq !== index + 1 ||
            (index === 0 &&
              canonical(body) !==
                canonical(this.attempt(project, id).parsed)) ||
            body.projectId !== project ||
            body.attemptId !== id ||
            body.eventId !== e.id ||
            hash(
              canonical({
                body,
                source: e.source,
                origin: e.origin,
                seq: e.seq,
                at: e.at,
              }),
            ) !== e.event_hash ||
            (e.origin === "restore"
              ? e.source !== "provided"
              : "kind" in body &&
                  (body.kind === "search" || body.kind === "search_failure")
                ? e.source !== "internal"
                : e.source !== "provided")
          )
            error("MEASUREMENT_SCHEMA");
          return { ...e, body };
        });
    });
  }
  report(input: unknown) {
    const d = reportSchema.parse(input);
    if (d.attemptId) this.attempt(d.projectId, d.attemptId);
    // One read snapshot includes attempts and events, including incomplete attempts.
    this.db.exec("BEGIN");
    try {
      const rows = this.db
        .prepare(
          "SELECT * FROM attempts WHERE project=? AND (? IS NULL OR id=?) AND (? IS NULL OR started>=?) AND (? IS NULL OR started<=?) ORDER BY started,id",
        )
        .all(
          d.projectId,
          d.attemptId ?? null,
          d.attemptId ?? null,
          d.from ?? null,
          d.from ?? null,
          d.to ?? null,
          d.to ?? null,
        );
      const events = this.events(
        d.projectId,
        rows.map((r) => String(r.id)),
      );
      const status = {
        succeeded: 0,
        failed: 0,
        aborted: 0,
        not_run: 0,
        running: 0,
      };
      const ratings = {
        agent: { helpful: 0, useless: 0, harmful: 0, unassessed: 0 },
        test: { helpful: 0, useless: 0, harmful: 0, unassessed: 0 },
        human: { helpful: 0, useless: 0, harmful: 0, unassessed: 0 },
      };
      let retrieved = 0,
        delivered = 0,
        contextBytes = 0,
        internalElapsedMs = 0,
        providedCliElapsedMs = 0,
        providedCalls = 0,
        searches = 0;
      const consulted = new Set<string>(),
        used = new Set<string>(),
        verified = new Set<string>();
      const assessed = new Set<string>(),
        usageAttempts = new Set<string>();
      const tokens = { input: 0, output: 0, cachedInput: 0, total: 0 };
      let tokenEvents = 0;
      const nativeUsage: unknown[] = [];
      const searchStatus = { succeeded: 0, failed: 0 };
      const restoredSearchStatus = { succeeded: 0, failed: 0 };
      const callStatus = { succeeded: 0, failed: 0, aborted: 0, not_run: 0 };
      const missingReasons: Record<string, number> = {};
      for (const r of rows) {
        this.attempt(d.projectId, String(r.id));
        status[r.status as keyof typeof status]++;
      }
      for (const e of events) {
        const b = e.body;
        if (!("kind" in b) && "missingReasons" in b)
          for (const reason of b.missingReasons)
            missingReasons[reason] = (missingReasons[reason] ?? 0) + 1;
        if ("kind" in b) {
          if (b.kind === "search")
            (e.source === "internal" ? searchStatus : restoredSearchStatus)
              .succeeded++;
          if (b.kind === "search_failure")
            (e.source === "internal" ? searchStatus : restoredSearchStatus)
              .failed++;
          if (b.kind === "call") callStatus[b.status]++;
          if (b.kind === "search" && e.source === "internal") {
            retrieved += b.retrieved;
            delivered += b.delivered;
            contextBytes += b.contextBytes;
            internalElapsedMs += b.internalElapsedMs;
            searches++;
          }
          if (b.kind === "call") {
            if (b.cliElapsedMs !== null) {
              providedCliElapsedMs += b.cliElapsedMs;
              providedCalls++;
            }
          }
          if (b.kind === "quality") {
            ratings[b.actorKind][b.rating]++;
            if (b.rating !== "unassessed") assessed.add(b.attemptId);
          }
          if (b.kind === "memory_use")
            for (const m of b.memories) {
              const key = m.id + ":" + m.version + ":" + m.hash;
              if (b.consulted) consulted.add(key);
              if (b.usedReported) used.add(key);
              if (b.sourceRefsVerified) verified.add(key);
            }
          if (b.kind === "host_usage") {
            if (b.usage.namespace === "ag_native")
              nativeUsage.push({
                attemptId: b.attemptId,
                ...b.usage,
                source: "provided",
              });
            else if (b.usage.total !== null) {
              for (const k of [
                "input",
                "output",
                "cachedInput",
                "total",
              ] as const)
                tokens[k] += b.usage[k]!;
              tokenEvents++;
              usageAttempts.add(b.attemptId);
            }
          }
        }
      }
      const safeTokens = Object.values(tokens).every(Number.isSafeInteger);
      const result = {
        schemaVersion: 1,
        projectId: d.projectId,
        attempts: rows.length,
        status,
        runningIncomplete: status.running,
        ratings,
        qualityUnassessedAttempts: rows.length - assessed.size,
        measured: {
          searches,
          searchStatus,
          retrieved,
          delivered,
          contextBytes,
          internalElapsedMsSum: internalElapsedMs,
        },
        provided: {
          restoredSearchStatus,
          callStatus,
          callsWithCliElapsed: providedCalls,
          cliElapsedMsSum: providedCliElapsedMs,
          consultedUniqueVersions: consulted.size,
          usedReportedUniqueVersions: used.size,
          sourceRefsVerifiedReportedUniqueVersions: verified.size,
          canonicalHostUsage: tokenEvents && safeTokens ? tokens : null,
          canonicalHostUsageReason:
            tokenEvents && safeTokens ? null : "not_available",
          ag_native: nativeUsage,
        },
        missingReasons,
        coverage: {
          internalSearch: {
            numerator: new Set(
              events
                .filter(
                  (e) =>
                    e.source === "internal" &&
                    "kind" in e.body &&
                    (e.body.kind === "search" ||
                      e.body.kind === "search_failure"),
                )
                .map((e) => e.attempt),
            ).size,
            denominator: rows.length,
          },
          hostUsageProvided: {
            numerator: usageAttempts.size,
            denominator: rows.length,
          },
          hostUsageAuthenticated: { numerator: 0, denominator: rows.length },
          qualityAssessed: {
            numerator: assessed.size,
            denominator: rows.length,
          },
        },
        attemptsDetail: rows.map((r) => ({
          attemptId: r.id,
          status: r.status,
          started: r.started,
          finished: r.finished,
          totalWallElapsedMs: r.finished
            ? Date.parse(String(r.finished)) - Date.parse(String(r.started))
            : null,
          activeWorkMs: null,
          activeWorkReason: "not_collected",
        })),
        causalBenefit: null,
        causalReason: "no_paired_control",
        durationPolicy:
          "Sums may overlap task wall duration; never add them to total.",
        provenance:
          "Host usage and ratings are provided reports, not authenticated observations.",
      };
      this.db.exec("COMMIT");
      return result;
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
  export(input: unknown) {
    const d = adminSchemas.measurement_export.parse(input);
    const destination = privateDestination(d.destination);
    if (
      destination === this.path ||
      destination === this.path + "-wal" ||
      destination === this.path + "-shm"
    )
      error("MEASUREMENT_PATH");
    this.db.exec("BEGIN");
    try {
      const attempts = d.attemptIds.map((id) => {
        const a = this.attempt(d.projectId, id);
        return {
          start: a.parsed,
          status: a.status,
          started: a.started,
          finished: a.finished,
          expires: a.expires,
          runtime: a.runtime,
        };
      });
      const events = this.events(d.projectId, d.attemptIds);
      const data = {
        schemaVersion: 1,
        role: "mimir-observability-export",
        runtime: {
          mimir: getPackageVersion(),
          node: process.version,
          platform: process.platform,
        },
        attempts,
        events,
      };
      // wx publishes a consistent, complete logical snapshot without clobbering.
      // A failed write is not claimed successful; consumers must parse/validate JSON.
      const temp = join(dirname(destination), randomUUID() + ".json");
      const fd = openSync(temp, "wx", 0o600);
      try {
        privateExisting(temp, false);
        writeFileSync(fd, JSON.stringify(data));
        fsyncSync(fd);
      } finally {
        closeSync(fd);
      }
      try {
        linkSync(temp, destination);
      } finally {
        unlinkSync(temp);
      }
      privateExisting(destination, false);
      this.db.exec("COMMIT");
      return {
        exported: true,
        attempts: attempts.length,
        events: events.length,
      };
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
  delete(input: unknown) {
    const d = adminSchemas.measurement_delete.parse(input);
    return this.tx(() => {
      for (const id of d.attemptIds) this.attempt(d.projectId, id);
      for (const id of d.attemptIds)
        this.db
          .prepare("DELETE FROM attempts WHERE id=? AND project=?")
          .run(id, d.projectId);
      return { deleted: d.attemptIds.length, secureErase: false };
    });
  }
  prune(input: unknown) {
    const d = adminSchemas.measurement_prune.parse(input);
    if (!d.dryRun && !d.confirm) error("CONFIRMATION_REQUIRED");
    return this.tx(() => {
      const ids = this.db
        .prepare("SELECT id FROM attempts WHERE project=? AND expires<?")
        .all(d.projectId, d.before ?? new Date().toISOString())
        .map((r) => String(r.id));
      if (!d.dryRun)
        for (const id of ids)
          this.db.prepare("DELETE FROM attempts WHERE id=?").run(id);
      return {
        dryRun: d.dryRun,
        attemptIds: ids,
        deleted: d.dryRun ? 0 : ids.length,
      };
    });
  }
  static restore(
    source: string,
    destination: string,
    mainPath: string,
    projectRoots: string[] = [],
  ) {
    const src = assertLocalPath(source);
    privateExisting(src, false);
    if (statSync(src).size > 16000000) error("MEASUREMENT_LIMIT");
    const snapshot = snapshotSchema.parse(
      JSON.parse(readFileSync(src, "utf8")),
    );
    if (existsSync(assertLocalPath(destination))) error("MEASUREMENT_EXISTS");
    // Fully validate the logical snapshot in memory before creating a destination.
    const scratch = new DatabaseSync(":memory:");
    scratch.exec("PRAGMA foreign_keys=ON;");
    scratch.exec(SQL);

    try {
      populateSnapshot(scratch, snapshot);
    } finally {
      scratch.close();
    }
    // A logical backup has no signature. An explicit restore can preserve facts
    // and IDs but cannot authenticate a JSON claim of internal instrumentation.
    for (const a of snapshot.attempts)
      a.runtime.configOrigin = "restored_provided";
    for (const e of snapshot.events) {
      e.origin = "restore";
      e.source = "provided";
      e.event_hash = hash(
        canonical({
          body: e.body,
          source: e.source,
          origin: e.origin,
          seq: e.seq,
          at: e.at,
        }),
      );
    }
    const dest = new Measurement(destination, mainPath, projectRoots);
    try {
      dest.tx(() => populateSnapshot(dest.db, snapshot));
    } finally {
      dest.close();
    }
    return {
      restored: true,
      attempts: snapshot.attempts.length,
      events: snapshot.events.length,
    };
  }
  close() {
    this.db.close();
  }
}
