import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  existsSync,
  statSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { DatabaseSync } from "node:sqlite";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import {
  Service,
  Storage,
  migrateDatabase,
  backupFile,
  backupDatabase,
  restoreDatabase,
  schemas,
} from "../dist/index.js";
import {
  SCHEMA_SQL,
  MIGRATION_2_SQL,
  validateKnowledge,
} from "../dist/storage/schema.js";
import { fixtureGit } from "./git-fixture.mjs";
import { legacyRuntime } from "./legacy-runtime-fixture.mjs";
const roots = [];
let legacy;
const root = () => {
  const p = mkdtempSync(join(tmpdir(), "mimir-learning-"));
  roots.push(p);
  return p;
};
function fixture() {
  const r = root(),
    s = new Service(new Storage(join(r, "knowledge.sqlite"))),
    p = randomUUID(),
    other = randomUUID();
  for (const id of [p, other])
    s.db
      .prepare("INSERT INTO projects VALUES(?,?,1,?)")
      .run(id, join(r, id), new Date().toISOString());
  return { r, s, p, other };
}
const sha = (value) => createHash("sha256").update(value).digest("hex");
async function ok(s, op, d) {
  const r = await s.call(op, d);
  assert.equal(r.ok, true, JSON.stringify(r));
  return r.data;
}
const exp = () => ({
  schemaVersion: 1,
  problem: "synthetic problem",
  environment: {
    platform: null,
    runtime: null,
    tool: null,
    reason: "not_collected",
  },
  action: "synthetic action",
  observedResult: "synthetic observation only",
  tests: [{ reference: randomUUID(), status: "pass", evidenceRefs: [] }],
  sources: [
    {
      reference: "docs/example.md",
      commit: null,
      hash: "a".repeat(64),
      version: null,
      verification: "agent_reported",
      sourceVersionKnown: true,
      reason: null,
    },
  ],
  confidence: { value: 0.9, reason: null },
  identity: {
    requestedModel: "fixture-requested",
    observedModel: null,
    observedModelReason: "not_collected",
    actorKind: "agent",
    actorRef: randomUUID(),
    provenance: "provided",
  },
});
const assess = () => ({
  schemaVersion: 1,
  actorKind: "test",
  actorRef: randomUUID(),
  judgment: "helpful",
  evidenceRefs: [randomUUID()],
  testStatus: "pass",
  sourceVersionKnown: false,
  sourceRefs: [],
});
const review = (p, m, extra = {}) => ({
  projectId: p,
  id: m.id,
  action: "begin",
  expectedVersion: m.version,
  expectedHash: m.hash,
  actorKind: "agent",
  actorRef: randomUUID(),
  ...extra,
});
function v1(path) {
  const d = new DatabaseSync(path);
  d.exec(SCHEMA_SQL);
  d.close();
}
test.after(() => {
  for (const r of roots) rmSync(r, { recursive: true, force: true });
});
test("structured experience strict roundtrip, confidence/test pass never approves; legacy bytes unchanged", async () => {
  const f = fixture();
  try {
    const e = exp(),
      m = await ok(f.s, "experience_observe", {
        projectId: f.p,
        experience: e,
      });
    assert.equal(m.content, JSON.stringify(e));
    assert.equal(m.status, "candidate");
    assert.equal(m.hash, sha(m.content));
    const detail = await ok(f.s, "memory_get", { projectId: f.p, id: m.id });
    assert.equal(detail.learning.review.state, "pending");
    const old = {
      task: "unchanged legacy task",
      attempt: "old attempt",
      result: "old result",
    };
    const lm = await ok(f.s, "experience_observe", { projectId: f.p, ...old });
    assert.equal(lm.content, JSON.stringify(old));
    assert.equal(lm.hash, sha(JSON.stringify(old)));
    assert.equal(
      (
        await f.s.call("experience_observe", {
          projectId: f.p,
          ...old,
          experience: e,
        })
      ).ok,
      false,
    );
    for (const bad of [
      { ...e, unknown: 1 },
      { ...e, schemaVersion: 2 },
      { ...e, confidence: { value: 2, reason: null } },
      { ...e, identity: { ...e.identity, observedModel: "invented" } },
      { ...e, environment: { ...e.environment, reason: null } },
      { ...e, sources: [{ ...e.sources[0], reference: "../escape" }] },
    ])
      assert.equal(
        (
          await f.s.call("experience_observe", {
            projectId: f.p,
            experience: bad,
          })
        ).ok,
        false,
      );
    const before = f.s.db.prepare("SELECT count(*) AS n FROM memories").get().n;
    const secret = exp();
    secret.observedResult = "password=" + "synthetic-value";
    assert.equal(
      (
        await f.s.call("experience_observe", {
          projectId: f.p,
          experience: secret,
        })
      ).error.code,
      "SENSITIVE_CONTENT",
    );
    assert.equal(
      f.s.db.prepare("SELECT count(*) AS n FROM memories").get().n,
      before,
    );
  } finally {
    f.s.close();
  }
});
test("typed feedback exact version/hash, human label and PASS do not approve; atomic rollback", async () => {
  const f = fixture();
  try {
    const m = await ok(f.s, "memory_store", {
      projectId: f.p,
      content: "synthetic assessment",
    });
    const input = {
      projectId: f.p,
      id: m.id,
      action: "note",
      expectedVersion: m.version,
      expectedHash: m.hash,
      assessment: { ...assess(), actorKind: "human" },
    };
    await ok(f.s, "memory_feedback", input);
    const got = await ok(f.s, "memory_get", { projectId: f.p, id: m.id });
    assert.equal(got.status, "candidate");
    assert.equal(got.learning.assessments.length, 1);
    assert.equal(got.learning.assessments[0].provenance, "provided");
    assert.equal(got.learning.assessments[0].memoryVersion, 1);
    assert.equal(
      (await f.s.call("memory_feedback", input)).error.code,
      "STALE_MEMORY",
    );
    assert.equal(
      (
        await f.s.call("memory_feedback", {
          ...input,
          expectedVersion: got.version,
          expectedHash: "0".repeat(64),
        })
      ).error.code,
      "STALE_MEMORY",
    );
    assert.equal(
      (
        await f.s.call("memory_feedback", {
          ...input,
          expectedVersion: got.version,
          action: "approve",
          explicitApproval: true,
        })
      ).ok,
      false,
    );
    const before = f.s.db
      .prepare("SELECT * FROM memories WHERE id=?")
      .get(m.id);
    const snapshots = f.s.db
      .prepare("SELECT count(*) AS n FROM history")
      .get().n;
    const original = f.s.snapshot;
    f.s.snapshot = () => {
      throw Error("synthetic rollback");
    };
    try {
      assert.equal(
        (
          await f.s.call("memory_feedback", {
            ...input,
            expectedVersion: got.version,
          })
        ).ok,
        false,
      );
    } finally {
      f.s.snapshot = original;
    }
    assert.deepEqual(
      f.s.db.prepare("SELECT * FROM memories WHERE id=?").get(m.id),
      before,
    );
    assert.equal(
      f.s.db.prepare("SELECT count(*) AS n FROM history").get().n,
      snapshots,
    );
    assert.equal(
      (await f.s.call("memory_feedback", { ...input, projectId: f.other }))
        .error.code,
      "NOT_FOUND",
    );
  } finally {
    f.s.close();
  }
});
test("candidate review begin exact explicit decision, stale consent rejected, new content invalidates review", async () => {
  const f = fixture();
  try {
    const m = await ok(f.s, "experience_observe", {
      projectId: f.p,
      experience: exp(),
    });
    assert.equal(
      (
        await f.s.call(
          "memory_review",
          review(f.p, m, {
            action: "decide",
            decision: "verified",
            actorKind: "human",
            explicitHumanConsent: true,
          }),
        )
      ).error.code,
      "REVIEW_REQUIRED",
    );
    const begun = await ok(f.s, "memory_review", review(f.p, m));
    assert.equal(begun.status, "candidate");
    assert.equal(begun.learning.review.state, "in_review");
    for (const extra of [
      { actorKind: "human", explicitHumanConsent: false },
      { actorKind: "agent", explicitHumanConsent: true },
    ])
      assert.equal(
        (
          await f.s.call(
            "memory_review",
            review(f.p, begun, {
              action: "decide",
              decision: "verified",
              ...extra,
            }),
          )
        ).error.code,
        "APPROVAL_REQUIRED",
      );
    assert.equal(
      (
        await f.s.call(
          "memory_review",
          review(f.p, m, {
            action: "decide",
            decision: "verified",
            actorKind: "human",
            explicitHumanConsent: true,
          }),
        )
      ).error.code,
      "STALE_MEMORY",
    );
    const approved = await ok(
      f.s,
      "memory_review",
      review(f.p, begun, {
        action: "decide",
        decision: "verified",
        actorKind: "human",
        explicitHumanConsent: true,
        evidenceRefs: [randomUUID()],
      }),
    );
    assert.equal(approved.status, "verified");
    assert.equal(approved.learning.review.subjectVersion, begun.version);
    assert.equal(
      approved.learning.review.authorization,
      "explicit_version_consent",
    );
    await ok(f.s, "memory_update", {
      projectId: f.p,
      id: m.id,
      content: "corrected synthetic content",
    });
    const updated = await ok(f.s, "memory_get", { projectId: f.p, id: m.id });
    assert.equal(updated.status, "candidate");
    assert.equal(updated.learning.review.state, "pending");
    assert.equal(updated.learning.review.subjectHash, updated.hash);
    assert.ok(
      updated.history.some(
        (h) => JSON.parse(h.snapshot.learning).review?.decision === "verified",
      ),
    );
    assert.equal(
      (
        await f.s.call(
          "memory_review",
          review(f.p, approved, {
            action: "decide",
            decision: "verified",
            actorKind: "human",
            explicitHumanConsent: true,
          }),
        )
      ).error.code,
      "STALE_MEMORY",
    );
    // The shared search envelope omits operational learning metadata and remains budgeted.
    const search = await ok(f.s, "memory_search", {
      projectId: f.p,
      query: "synthetic",
      tokenBudget: 2000,
    });
    assert.ok(search.memories.every((m) => !Object.hasOwn(m, "learning")));
  } finally {
    f.s.close();
  }
});
test("legacy explicitApproval retained as local consent with captured version/hash, not typed evidence", async () => {
  const f = fixture();
  try {
    const m = await ok(f.s, "memory_store", {
      projectId: f.p,
      content: "legacy synthetic consent",
    });
    assert.equal(
      (
        await f.s.call("memory_feedback", {
          projectId: f.p,
          id: m.id,
          action: "approve",
        })
      ).error.code,
      "APPROVAL_REQUIRED",
    );
    await ok(f.s, "memory_feedback", {
      projectId: f.p,
      id: m.id,
      action: "approve",
      explicitApproval: true,
    });
    const got = await ok(f.s, "memory_get", { projectId: f.p, id: m.id });
    assert.equal(got.status, "verified");
    assert.equal(got.learning.review.authorization, "legacy_explicit_flag");
    assert.equal(got.learning.review.subjectVersion, m.version);
    assert.equal(got.learning.review.subjectHash, m.hash);
  } finally {
    f.s.close();
  }
});
test("Git content changes and missing-source invalidation reset learning in same history snapshot", async () => {
  const f = fixture();
  try {
    const repo = join(f.r, "repo");
    mkdirSync(repo);
    fixtureGit(["init", "-q", repo]);
    writeFileSync(join(repo, "note.txt"), "synthetic source before");
    const p = await ok(f.s, "project_register", {
      path: repo,
      authorizeIngestion: true,
    });
    await ok(f.s, "project_ingest", { projectId: p.id, maxCommits: 0 });
    const m = f.s.db
      .prepare("SELECT * FROM memories WHERE project_id=?")
      .get(p.id);
    await ok(f.s, "memory_feedback", {
      projectId: p.id,
      id: m.id,
      action: "approve",
      explicitApproval: true,
    });
    writeFileSync(join(repo, "note.txt"), "synthetic source after");
    await ok(f.s, "project_ingest", { projectId: p.id, maxCommits: 0 });
    const got = await ok(f.s, "memory_get", { projectId: p.id, id: m.id });
    assert.equal(got.status, "candidate");
    assert.equal(got.learning.review.state, "pending");
    assert.equal(got.learning.review.subjectHash, got.hash);
  } finally {
    f.s.close();
  }
});
test("schema1 requires explicit migration, verified backup, immutable content/history and 1/2 restore", async () => {
  const r = root(),
    source = join(r, "v1.sqlite");
  v1(source);
  const db = new DatabaseSync(source);
  const p = randomUUID(),
    id = randomUUID(),
    content = JSON.stringify({
      task: "legacy",
      attempt: "synthetic",
      result: "unchanged",
    }),
    now = new Date().toISOString();
  db.prepare("INSERT INTO projects VALUES(?,?,1,?)").run(
    p,
    join(r, "repo"),
    now,
  );
  db.prepare(
    "INSERT INTO memories(id,project_id,scope,type,content,hash,status,origin,source,version,created,updated) VALUES(?,?,'project','episodic',?,?,'verified','execution','{}',1,?,?)",
  ).run(id, p, content, sha(content), now, now);
  const old = db.prepare("SELECT * FROM memories WHERE id=?").get(id);
  db.prepare("INSERT INTO history VALUES(?,1,?,?)").run(
    id,
    JSON.stringify(old),
    now,
  );
  db.close();
  const original = readFileSync(source);
  assert.throws(
    () => new Storage(source),
    (e) => e.code === "MIGRATION_REQUIRED",
  );
  assert.deepEqual(readFileSync(source), original);
  const backup = join(r, "backup1.sqlite");
  await migrateDatabase(source, backup);
  const backupCheck = new DatabaseSync(backup, { readOnly: true });
  try {
    assert.equal(
      backupCheck.prepare("SELECT version FROM migrations").get().version,
      1,
    );
  } finally {
    backupCheck.close();
  }
  const s = new Service(new Storage(source));
  try {
    const row = await ok(s, "memory_get", { projectId: p, id });
    assert.equal(row.content, content);
    assert.equal(row.hash, old.hash);
    assert.equal(row.status, "verified");
    assert.equal(
      row.learning.review,
      null,
      "Migration must not invent historical human review",
    );
    assert.deepEqual(row.history[0].snapshot, JSON.parse(JSON.stringify(old)));
    const b2 = join(r, "backup2.sqlite");
    assert.equal((await backupDatabase(s.storage, b2)).schemaVersion, 2);
    await restoreDatabase(b2, join(r, "restore2.sqlite"));
    const restored = new Storage(join(r, "restore2.sqlite"));
    assert.equal(validateKnowledge(restored.db), 2);
    restored.close();
  } finally {
    s.close();
  }
  await restoreDatabase(backup, join(r, "restore1.sqlite"));
  assert.throws(
    () => new Storage(join(r, "restore1.sqlite")),
    (e) => e.code === "MIGRATION_REQUIRED",
  );
  await assert.rejects(
    migrateDatabase(source, join(r, "no-second.sqlite")),
    (e) => e.code === "MIGRATION_NOT_REQUIRED",
  );
  assert.equal(existsSync(join(r, "no-second.sqlite")), false);
});
test("actual pinned CLI0.3 recovers backup1 and refuses schema2", async () => {
  const r = root();
  legacy = legacyRuntime(join(r, "legacy03"));
  const source = join(r, "source.sqlite"),
    backup = join(r, "backup1.sqlite"),
    restored = join(r, "legacy-restored.sqlite");
  const run = (db, ...args) =>
    spawnSync(process.execPath, [legacy, "--db", db, ...args], {
      encoding: "utf8",
    });
  assert.equal(run(source, "init").status, 0);
  await migrateDatabase(source, backup);
  assert.equal(run(source, "doctor").status, 1);
  assert.equal(
    JSON.parse(run(source, "init").stderr).error.code,
    "UNSUPPORTED_SCHEMA",
  );
  assert.equal(run(restored, "restore", backup, "--confirm").status, 0);
  assert.equal(JSON.parse(run(restored, "init").stdout).data.version, "0.3.0");
  assert.equal(JSON.parse(run(restored, "doctor").stdout).data.healthy, true);
});
test("corrupt/future schema rejected before change or backup publication, exact v2 reference rejects extras", async () => {
  const r = root();
  for (const [name, sql] of [
    ["extra", "ALTER TABLE memories ADD surprise TEXT"],
    ["future", "UPDATE migrations SET version=9"],
    [
      "rogue",
      "CREATE TRIGGER rogue AFTER INSERT ON migrations BEGIN DELETE FROM projects; END",
    ],
  ]) {
    const path = join(r, name + ".sqlite");
    v1(path);
    const db = new DatabaseSync(path);
    db.exec(sql);
    db.close();
    const before = readFileSync(path),
      backup = join(r, name + "-backup.sqlite");
    await assert.rejects(migrateDatabase(path, backup));
    assert.deepEqual(readFileSync(path), before);
    assert.equal(existsSync(backup), false);
  }
  const f = fixture();
  f.s.close();
  const db = new DatabaseSync(join(f.r, "knowledge.sqlite"));
  db.exec("ALTER TABLE memories ADD surprise TEXT");
  db.close();
  assert.throws(() => new Storage(join(f.r, "knowledge.sqlite")));
});
test("injected post-DDL failure rolls back1->2 with verified schema1 backup recoverable", async () => {
  const r = root(),
    path = join(r, "source.sqlite"),
    backup = join(r, "backup.sqlite");
  v1(path);
  const exec = DatabaseSync.prototype.exec;
  DatabaseSync.prototype.exec = function (q) {
    const value = exec.call(this, q);
    if (q === MIGRATION_2_SQL) throw Error("synthetic post-DDL failure");
    return value;
  };
  try {
    await assert.rejects(migrateDatabase(path, backup));
  } finally {
    DatabaseSync.prototype.exec = exec;
  }
  const d = new DatabaseSync(path);
  assert.equal(validateKnowledge(d), 1);
  d.close();
  assert.ok(existsSync(backup));
  await restoreDatabase(backup, join(r, "recovered.sqlite"));
});
test("migration CLI confirm and MCP boundary, version remains development0.4", async () => {
  const r = root(),
    path = join(r, "source.sqlite");
  v1(path);
  const cli = fileURLToPath(new URL("../dist/cli/index.js", import.meta.url));
  const bad = spawnSync(
    process.execPath,
    [cli, "--db", path, "migrate", join(r, "backup.sqlite")],
    { encoding: "utf8" },
  );
  assert.equal(bad.status, 1);
  assert.equal(JSON.parse(bad.stderr).error.code, "CONFIRMATION_REQUIRED");
  assert.equal(existsSync(join(r, "backup.sqlite")), false);
  const good = spawnSync(
    process.execPath,
    [cli, "--db", path, "migrate", join(r, "backup.sqlite"), "--confirm"],
    { encoding: "utf8" },
  );
  assert.equal(good.status, 0, good.stderr);
  assert.equal(JSON.parse(good.stdout).data.schemaVersion, 2);
  const client = new Client({ name: "learning-synthetic", version: "1" });
  try {
    await client.connect(
      new StdioClientTransport({
        command: process.execPath,
        args: [cli, "--db", path, "mcp", "stdio"],
        stderr: "pipe",
      }),
    );
    assert.equal(client.getServerVersion().version, "0.4.0-dev.0");
    const names = (await client.listTools()).tools.map((x) => x.name);
    assert.ok(names.includes("memory_review"));
    assert.ok(!names.includes("migrate"));
    const projectId = randomUUID();
    const setup = new Storage(path);
    try {
      setup.db
        .prepare("INSERT INTO projects VALUES(?,?,1,?)")
        .run(projectId, join(r, "mcp-project"), new Date().toISOString());
    } finally {
      setup.close();
    }
    const observed = await client.callTool({
      name: "experience_observe",
      arguments: { projectId, experience: exp() },
    });
    assert.equal(observed.isError, false);
    const item = JSON.parse(observed.content[0].text).data;
    const beginResult = await client.callTool({
      name: "memory_review",
      arguments: review(projectId, item),
    });
    assert.equal(beginResult.isError, false);
    const began = JSON.parse(beginResult.content[0].text).data;
    assert.equal(began.status, "candidate");
    const noConsent = await client.callTool({
      name: "memory_review",
      arguments: review(projectId, began, {
        action: "decide",
        decision: "verified",
        actorKind: "human",
      }),
    });
    assert.equal(noConsent.isError, true);
    const init = await client.callTool({ name: "init", arguments: {} });
    assert.equal(JSON.parse(init.content[0].text).data.version, "0.4.0-dev.0");
  } finally {
    await client.close();
  }
  assert.ok(!Object.hasOwn(schemas, "migrate"));
});

test("schema2 learning corruption and invalid foreign keys refused without publication", async () => {
  const f = fixture();
  await ok(f.s, "memory_store", { projectId: f.p, content: "strict metadata" });
  f.s.close();
  const path = join(f.r, "knowledge.sqlite"),
    db = new DatabaseSync(path);
  db.exec("UPDATE memories SET learning='{\"unexpected\":true}'");
  db.close();
  const before = readFileSync(path);
  await assert.rejects(backupFile(path, join(f.r, "forbidden.sqlite")));
  assert.deepEqual(readFileSync(path), before);
  assert.equal(existsSync(join(f.r, "forbidden.sqlite")), false);
  const r = root(),
    bad = join(r, "fk.sqlite");
  v1(bad);
  const d = new DatabaseSync(bad);
  d.exec("PRAGMA foreign_keys=OFF");
  d.prepare("INSERT INTO history VALUES(?,1,'{}',?)").run(
    randomUUID(),
    new Date().toISOString(),
  );
  d.close();
  await assert.rejects(migrateDatabase(bad, join(r, "fk-backup.sqlite")));
  assert.equal(existsSync(join(r, "fk-backup.sqlite")), false);
});
test("migration interrupted after DDL rolls back atomically on process death", async () => {
  const r = root(),
    source = join(r, "source.sqlite"),
    backup = join(r, "backup.sqlite");
  v1(source);
  const migration = new URL("../dist/storage/migrate.js", import.meta.url).href,
    schema = new URL("../dist/storage/schema.js", import.meta.url).href;
  const code = `import {DatabaseSync} from 'node:sqlite';import {migrateDatabase} from ${JSON.stringify(migration)};import {MIGRATION_2_SQL} from ${JSON.stringify(schema)};const exec=DatabaseSync.prototype.exec;DatabaseSync.prototype.exec=function(q){const v=exec.call(this,q);if(q===MIGRATION_2_SQL){process.stdout.write('ddl-ready');Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,30000);}return v;};await migrateDatabase(process.argv[1],process.argv[2]);`;
  const child = spawn(
    process.execPath,
    ["--input-type=module", "-e", code, source, backup],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  let error = "";
  child.stderr.on("data", (b) => (error += b));
  const exited = once(child, "exit");
  await Promise.race([
    once(child.stdout, "data"),
    exited.then(() => {
      throw Error("child exited before DDL " + error);
    }),
  ]);
  child.kill("SIGKILL");
  await exited;
  const db = new DatabaseSync(source);
  assert.equal(validateKnowledge(db), 1);
  db.close();
  await restoreDatabase(backup, join(r, "recovered.sqlite"));
});
test("WAL source changes between backup and write lock fail closed as stale backup", async () => {
  const r = root(),
    source = join(r, "source.sqlite");
  v1(source);
  const d = new DatabaseSync(source);
  d.exec("PRAGMA journal_mode=WAL");
  const p = randomUUID();
  d.prepare("INSERT INTO projects VALUES(?,?,1,?)").run(
    p,
    join(r, "repo"),
    new Date().toISOString(),
  );
  d.close();
  const code = `import {DatabaseSync} from 'node:sqlite';const d=new DatabaseSync(process.argv[1]);d.exec('BEGIN IMMEDIATE');d.prepare('UPDATE projects SET authorized=0 WHERE id=?').run(process.argv[2]);process.stdout.write('locked');setTimeout(()=>{d.exec('COMMIT');d.close();},3000);`;
  const writer = spawn(
    process.execPath,
    ["--input-type=module", "-e", code, source, p],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  const finished = once(writer, "exit");
  await once(writer.stdout, "data");
  try {
    await assert.rejects(
      migrateDatabase(source, join(r, "backup.sqlite")),
      (e) => e.code === "MIGRATION_BACKUP_STALE",
    );
  } finally {
    await finished;
  }
  const db = new DatabaseSync(source);
  assert.equal(validateKnowledge(db), 1);
  assert.equal(
    db.prepare("SELECT authorized FROM projects WHERE id=?").get(p).authorized,
    0,
  );
  db.close();
});
test("migration unsafe/project/traversal/no-clobber boundaries preserve schema1 and parent mode", async () => {
  const r = root(),
    repo = join(r, "repo");
  mkdirSync(repo);
  const source = join(repo, "source.sqlite");
  v1(source);
  const db = new DatabaseSync(source);
  db.prepare("INSERT INTO projects VALUES(?,?,1,?)").run(
    randomUUID(),
    repo,
    new Date().toISOString(),
  );
  db.close();
  const mode = statSync(r).mode;
  await assert.rejects(
    migrateDatabase(source, join(r, "backup.sqlite")),
    (e) => e.code === "UNSAFE_DB",
  );
  assert.equal(existsSync(join(r, "backup.sqlite")), false);
  assert.equal(statSync(r).mode, mode);
  const normal = join(r, "normal.sqlite");
  v1(normal);
  const backup = join(r, "existing.sqlite");
  writeFileSync(backup, "preserve");
  await assert.rejects(migrateDatabase(normal, backup));
  assert.equal(readFileSync(backup, "utf8"), "preserve");
  await assert.rejects(
    migrateDatabase(r + "/repo/../normal.sqlite", join(r, "none.sqlite")),
  );
  assert.equal(existsSync(join(r, "none.sqlite")), false);
});
test("structured assessment source versions strict, native units never imply observed model", async () => {
  const f = fixture();
  try {
    const m = await ok(f.s, "memory_store", {
      projectId: f.p,
      content: "sources synthetic",
    });
    for (const assessment of [
      { ...assess(), sourceVersionKnown: true },
      {
        ...assess(),
        sourceRefs: [
          {
            reference: "docs/reference.md",
            commit: null,
            hash: null,
            version: null,
            verification: "human_reported",
            sourceVersionKnown: true,
            reason: null,
          },
        ],
      },
      { ...assess(), actorKind: "other" },
      { ...assess(), judgment: "approved" },
    ])
      assert.equal(
        (
          await f.s.call("memory_feedback", {
            projectId: f.p,
            id: m.id,
            action: "note",
            expectedVersion: m.version,
            expectedHash: m.hash,
            assessment,
          })
        ).ok,
        false,
      );
    assert.equal(
      (await ok(f.s, "memory_get", { projectId: f.p, id: m.id })).version,
      m.version,
    );
  } finally {
    f.s.close();
  }
});

test("normal initialization race never silently upgrades a concurrently created schema1", () => {
  const r = root(),
    path = join(r, "race.sqlite");
  const exec = DatabaseSync.prototype.exec;
  let injected = false;
  DatabaseSync.prototype.exec = function (q) {
    const value = exec.call(this, q);
    if (!injected && q.includes("PRAGMA journal_mode=WAL")) {
      injected = true;
      exec.call(this, SCHEMA_SQL);
    }
    return value;
  };
  try {
    assert.throws(
      () => new Storage(path),
      (e) => e.code === "MIGRATION_REQUIRED",
    );
  } finally {
    DatabaseSync.prototype.exec = exec;
  }
  const db = new DatabaseSync(path);
  assert.equal(validateKnowledge(db), 1);
  db.close();
});
