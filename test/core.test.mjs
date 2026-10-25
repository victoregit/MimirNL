import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  unlinkSync,
  symlinkSync,
  readFileSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { Service, Storage, estimateTokens } from "../dist/index.js";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { fixtureGit } from "./git-fixture.mjs";
const cli = resolve("dist/cli/index.js");
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "mimir-test-"));
  const db = join(root, "data", "memory.sqlite");
  const s = new Service(new Storage(db));
  const repo = (name) => {
    const p = join(root, name);
    mkdirSync(p);
    fixtureGit(["init", "-q", p]);
    fixtureGit([
      "-C",
      p,
      "-c",
      "user.name=Fixture",
      "-c",
      "user.email=fixture@example.invalid",
      "commit",
      "--allow-empty",
      "-qm",
      "Initial fixture",
    ]);
    return p;
  };
  return { root, db, s, repo };
}
async function ok(s, op, d = {}) {
  const r = await s.call(op, d);
  assert.equal(r.ok, true, JSON.stringify(r));
  return r.data;
}
async function register(f, name = "repo") {
  return ok(f.s, "project_register", {
    path: f.repo(name),
    authorizeIngestion: true,
  });
}
function run(args) {
  return JSON.parse(
    execFileSync(process.execPath, [cli, ...args], { encoding: "utf8" }),
  );
}
function child(args) {
  return new Promise((res, rej) => {
    const p = spawn(process.execPath, [cli, ...args], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "";
    p.stdout.on("data", (b) => (out += b));
    p.on("error", rej);
    p.on("close", (c) =>
      c === 0 ? res(JSON.parse(out)) : rej(new Error("Child failed: " + out)),
    );
  });
}
test("A: restart persistence, WAL, foreign keys and rollback", async () => {
  const f = fixture();
  const p = await register(f);
  const m = await ok(f.s, "memory_store", {
    projectId: p.id,
    content: "persistent transactional memory",
  });
  const doctor = await ok(f.s, "doctor");
  assert.equal(doctor.wal.journal_mode, "wal");
  assert.equal(doctor.integrity.integrity_check, "ok");
  assert.throws(() =>
    f.s.storage.transaction(() => {
      f.s.db.prepare("DELETE FROM memories WHERE id=?").run(m.id);
      throw Error("rollback");
    }),
  );
  f.s.close();
  const reopened = new Service(new Storage(f.db));
  assert.equal(
    (await ok(reopened, "memory_get", { projectId: p.id, id: m.id })).content,
    m.content,
  );
  if (process.platform !== "win32")
    assert.equal(statSync(f.db).mode & 0o777, 0o600);
  reopened.close();
});
test("A: simultaneous independent processes deduplicate atomic writes", async () => {
  const f = fixture();
  const p = await register(f);
  f.s.close();
  const results = await Promise.all(
    Array.from({ length: 6 }, () =>
      child([
        "--db",
        f.db,
        "store",
        "concurrent shared fact",
        "--project",
        p.id,
      ]),
    ),
  );
  assert.equal(new Set(results.map((r) => r.data.id)).size, 1);
  const s = new Service(new Storage(f.db));
  assert.equal(s.db.prepare("SELECT count(*) n FROM memories").get().n, 1);
  s.close();
});
test("B: isolation for search, IDs, history, stats, relations; bounded literal context", async () => {
  const f = fixture(),
    p = await register(f, "one"),
    q = await register(f, "two");
  const a = await ok(f.s, "memory_store", {
    projectId: p.id,
    content: "isolation distinctive renderer",
  });
  const b = await ok(f.s, "memory_store", {
    projectId: q.id,
    content: "isolation private parser",
  });
  const r = await ok(f.s, "memory_search", {
    projectId: p.id,
    query: 'isolation OR " * --',
    tokenBudget: 1500,
  });
  assert.equal(r.memories.length, 1);
  assert.equal(r.memories[0].id, a.id);
  assert.equal(
    (await ok(f.s, "memory_get", { projectId: p.id, id: a.id })).usageHistory
      .length,
    1,
  );
  assert.ok(estimateTokens(r) <= 1500);
  assert.equal(
    (await f.s.call("memory_get", { projectId: p.id, id: b.id })).ok,
    false,
  );
  assert.equal(
    (
      await f.s.call("memory_feedback", {
        projectId: p.id,
        id: a.id,
        action: "relate",
        relatedId: b.id,
      })
    ).ok,
    false,
  );
  assert.equal(
    (await ok(f.s, "memory_stats", { projectId: p.id })).memories[0].count,
    1,
  );
  for (const query of ["", "   ", "zzzznonexistent"])
    assert.equal(
      (await ok(f.s, "memory_search", { projectId: p.id, query })).memories
        .length,
      0,
    );
  assert.equal(
    (
      await ok(f.s, "memory_search", {
        projectId: p.id,
        query: "isolation",
        tokenBudget: 200,
      })
    ).memories.length,
    0,
  );
  f.s.close();
});
test("D: authorized Git fixture bounds, secrets, ignores, binaries, symlink, incremental versions and deletion", async () => {
  const f = fixture(),
    p = await register(f);
  const path = p.path;
  writeFileSync(
    join(path, "readme.md"),
    "Renderer uses cyan buffer architecture.",
  );
  writeFileSync(join(path, ".gitignore"), "ignored.txt\n");
  writeFileSync(join(path, "ignored.txt"), "never import");
  fixtureGit(["-C", path, "add", "--force", "ignored.txt"]);
  // Sensitive path fixtures contain no secret data and must never be read by the adapter.
  writeFileSync(join(path, ".env.test"), "fixture placeholder");
  writeFileSync(join(path, "key.pem"), "fixture placeholder");
  writeFileSync(join(path, "binary.bin"), Buffer.from([0, 1, 2]));
  writeFileSync(join(path, "secret.txt"), "api_key=" + "x".repeat(24));
  writeFileSync(join(f.root, "outside.txt"), "outside forbidden marker");
  try {
    symlinkSync(join(f.root, "outside.txt"), join(path, "link.txt"));
  } catch (e) {
    if (process.platform !== "win32" || e.code !== "EPERM") throw e;
  }
  const first = await ok(f.s, "project_ingest", { projectId: p.id });
  assert.ok(first.inserted >= 2);
  assert.equal(first.structure.languages.Markdown, 1);
  assert.ok(first.structure.categories.documentation >= 1);
  const second = await ok(f.s, "project_ingest", { projectId: p.id });
  assert.equal(second.inserted, 0);
  assert.equal(second.updated, 0);
  const rows = f.s.db.prepare("SELECT * FROM memories").all();
  assert.ok(
    !rows.some((m) =>
      /never import|outside forbidden|api_key=/.test(m.content),
    ),
  );
  assert.ok(rows.every((m) => m.status === "candidate"));
  const file = rows.find((m) => m.content.includes("Renderer uses"));
  writeFileSync(
    join(path, "readme.md"),
    "Renderer now uses violet buffer architecture.",
  );
  assert.equal(
    (await ok(f.s, "project_ingest", { projectId: p.id })).updated,
    1,
  );
  const updated = await ok(f.s, "memory_get", { projectId: p.id, id: file.id });
  assert.equal(updated.version, 2);
  assert.equal(updated.history.length, 2);
  unlinkSync(join(path, "readme.md"));
  assert.equal(
    (await ok(f.s, "project_ingest", { projectId: p.id })).deprecated,
    1,
  );
  assert.equal(
    (await f.s.call("project_ingest", { projectId: p.id, maxFiles: 1 })).error
      .code,
    "INGEST_LIMIT",
  );
  assert.equal(
    (await f.s.call("project_register", { path, authorizeIngestion: false }))
      .ok,
    false,
  );
  const other = await register(f, "isolated");
  assert.equal(
    (await ok(f.s, "memory_search", { projectId: other.id, query: "Renderer" }))
      .memories.length,
    0,
  );
  f.s.close();
});
test("E: explicit verification, relation history, deterministic observation, sharing and confirmed deletion", async () => {
  const f = fixture(),
    p = await register(f),
    q = await register(f, "second");
  const m = await ok(f.s, "memory_store", {
    projectId: p.id,
    content: "Shared explicitly approved architecture",
  });
  assert.equal(
    (
      await f.s.call("memory_feedback", {
        projectId: p.id,
        id: m.id,
        action: "approve",
      })
    ).error.code,
    "APPROVAL_REQUIRED",
  );
  assert.equal(
    (
      await f.s.call("memory_feedback", {
        projectId: p.id,
        id: m.id,
        action: "promote",
        sharingApproval: true,
      })
    ).ok,
    false,
  );
  const verified = await ok(f.s, "memory_feedback", {
    projectId: p.id,
    id: m.id,
    action: "approve",
    explicitApproval: true,
    note: "User reviewed this statement",
  });
  assert.equal(verified.status, "verified");
  await ok(f.s, "memory_feedback", {
    projectId: p.id,
    id: m.id,
    action: "promote",
    sharingApproval: true,
  });
  assert.equal(
    (await ok(f.s, "memory_search", { projectId: q.id, query: "architecture" }))
      .memories.length,
    0,
  );
  const global = await ok(f.s, "memory_search", {
    projectId: q.id,
    query: "architecture",
    includeGlobal: true,
  });
  assert.equal(global.memories.length, 1);
  assert.ok(!JSON.stringify(global).includes(p.id));
  const observed = {
    projectId: p.id,
    task: "repair renderer",
    attempt: "change buffer",
    result: "local observation: failed",
  };
  const a = await ok(f.s, "experience_observe", observed),
    b = await ok(f.s, "experience_observe", observed);
  assert.equal(a.id, b.id);
  assert.equal(a.status, "candidate");
  await ok(f.s, "memory_feedback", {
    projectId: p.id,
    id: a.id,
    action: "relate",
    relatedId: m.id,
  });
  assert.equal(
    (await ok(f.s, "memory_get", { projectId: p.id, id: a.id })).relations
      .length,
    1,
  );
  await ok(f.s, "memory_feedback", {
    projectId: p.id,
    id: a.id,
    action: "reject",
  });
  assert.equal(
    (await ok(f.s, "memory_get", { projectId: p.id, id: a.id })).status,
    "rejected",
  );
  assert.equal(
    (await f.s.call("memory_delete", { projectId: p.id, id: a.id })).ok,
    false,
  );
  await ok(f.s, "memory_delete", { projectId: p.id, id: a.id, confirm: true });
  await ok(f.s, "project_delete", { projectId: p.id, confirm: true });
  assert.ok(statSync(p.path).isDirectory());
  assert.equal(
    (await f.s.call("memory_get", { projectId: p.id, id: m.id })).ok,
    false,
  );
  f.s.close();
});
test("security: every request field checked, invalid schemas and unsafe database placement", async () => {
  const f = fixture(),
    p = await register(f);
  const secret = "sk-" + "A".repeat(30);
  for (const [op, input] of [
    ["memory_store", { projectId: p.id, content: secret }],
    ["memory_store", { projectId: p.id, content: "ordinary", source: secret }],
    [
      "memory_feedback",
      {
        projectId: p.id,
        id: crypto.randomUUID(),
        action: "note",
        note: secret,
      },
    ],
    [
      "experience_observe",
      {
        projectId: p.id,
        task: "ordinary",
        attempt: secret,
        result: "ordinary",
      },
    ],
  ])
    assert.equal((await f.s.call(op, input)).error.code, "SENSITIVE_CONTENT");
  assert.equal(f.s.db.prepare("SELECT count(*) n FROM memories").get().n, 0);
  assert.equal((await f.s.call("memory_search", { query: "x" })).ok, false);
  assert.equal((await f.s.call("constructor", {})).ok, false);
  const local = new Service(new Storage(join(p.path, "bad.sqlite")));
  assert.equal(
    (
      await local.call("project_register", {
        path: p.path,
        authorizeIngestion: true,
      })
    ).error.code,
    "UNSAFE_DB",
  );
  local.close();
  f.s.close();
});
test("C: real SDK stdio initialize/list/call, CLI shared DB and concurrent MCP clients", async () => {
  const f = fixture(),
    p = await register(f);
  f.s.close();
  const clients = [];
  try {
    for (let i = 0; i < 2; i++) {
      const client = new Client({ name: "mimir-test", version: "1.0.0" });
      const transport = new StdioClientTransport({
        command: process.execPath,
        args: [cli, "--db", f.db, "mcp", "stdio"],
        stderr: "pipe",
      });
      await client.connect(transport);
      clients.push(client);
    }
    const listed = await clients[0].listTools();
    for (const name of [
      "memory_search",
      "memory_get",
      "memory_store",
      "memory_feedback",
      "project_register",
      "project_ingest",
      "memory_stats",
      "memory_delete",
    ])
      assert.ok(listed.tools.some((t) => t.name === name));
    const results = await Promise.all(
      clients.map((client) =>
        client.callTool({
          name: "memory_store",
          arguments: { projectId: p.id, content: "SDK stdio shared context" },
        }),
      ),
    );
    const stored = JSON.parse(results[0].content[0].text);
    assert.equal(stored.ok, true);
    assert.equal(
      JSON.parse(results[1].content[0].text).data.id,
      stored.data.id,
    );
    const searchResult = await clients[0].callTool({
      name: "memory_search",
      arguments: { projectId: p.id, query: "SDK stdio" },
    });
    assert.equal(
      JSON.parse(searchResult.content[0].text).data.memories.length,
      1,
    );
    const sdkRepo = f.repo("sdk-registered");
    writeFileSync(
      join(sdkRepo, "README.md"),
      "SDK authorized ingestion fixture",
    );
    const sdkProject = JSON.parse(
      (
        await clients[0].callTool({
          name: "project_register",
          arguments: { path: sdkRepo, authorizeIngestion: true },
        })
      ).content[0].text,
    );
    assert.equal(sdkProject.ok, true);
    const sdkIngest = JSON.parse(
      (
        await clients[0].callTool({
          name: "project_ingest",
          arguments: { projectId: sdkProject.data.id },
        })
      ).content[0].text,
    );
    assert.equal(sdkIngest.ok, true);
    assert.ok(sdkIngest.data.inserted >= 2);
    const sdkFeedback = JSON.parse(
      (
        await clients[0].callTool({
          name: "memory_feedback",
          arguments: {
            projectId: p.id,
            id: stored.data.id,
            action: "approve",
            explicitApproval: true,
          },
        })
      ).content[0].text,
    );
    assert.equal(sdkFeedback.data.status, "verified");
    const sdkStats = JSON.parse(
      (
        await clients[0].callTool({
          name: "memory_stats",
          arguments: { projectId: p.id },
        })
      ).content[0].text,
    );
    assert.equal(sdkStats.ok, true);
    const fromCli = run([
      "--db",
      f.db,
      "get",
      stored.data.id,
      "--project",
      p.id,
    ]);
    assert.equal(fromCli.data.content, "SDK stdio shared context");
    const fromCliStore = run([
      "--db",
      f.db,
      "store",
      "CLI reciprocal fact",
      "--project",
      p.id,
    ]);
    const fromMcp = await clients[1].callTool({
      name: "memory_get",
      arguments: { projectId: p.id, id: fromCliStore.data.id },
    });
    assert.equal(
      JSON.parse(fromMcp.content[0].text).data.content,
      "CLI reciprocal fact",
    );
    const bad = await clients[0].callTool({
      name: "memory_get",
      arguments: { projectId: p.id, id: crypto.randomUUID() },
    });
    assert.equal(bad.isError, true);
    assert.equal(JSON.parse(bad.content[0].text).error.code, "NOT_FOUND");
  } finally {
    await Promise.all(clients.map((c) => c.close()));
  }
});
test("E: shared lifecycle deletion and global/local retrieval dedup", async () => {
  const f = fixture(),
    p = await register(f);
  const m = await ok(f.s, "memory_store", {
    projectId: p.id,
    content: "approved shared lifecycle",
  });
  await ok(f.s, "memory_feedback", {
    projectId: p.id,
    id: m.id,
    action: "approve",
    explicitApproval: true,
  });
  await ok(f.s, "memory_feedback", {
    projectId: p.id,
    id: m.id,
    action: "promote",
    sharingApproval: true,
  });
  const found = await ok(f.s, "memory_search", {
    projectId: p.id,
    query: "lifecycle",
    includeGlobal: true,
  });
  assert.equal(found.memories.length, 1);
  const global = f.s.db
    .prepare("SELECT id FROM memories WHERE scope='global'")
    .get();
  assert.equal(
    (
      await f.s.call("memory_delete", {
        projectId: p.id,
        id: global.id,
        confirm: true,
        scope: "global",
      })
    ).ok,
    false,
  );
  await ok(f.s, "memory_feedback", {
    projectId: p.id,
    id: global.id,
    action: "deprecate",
    scope: "global",
    sharingApproval: true,
  });
  await ok(f.s, "memory_delete", {
    projectId: p.id,
    id: global.id,
    scope: "global",
    sharingApproval: true,
    confirm: true,
  });
  assert.equal(
    f.s.db.prepare("SELECT count(*) n FROM memories WHERE scope='global'").get()
      .n,
    0,
  );
  f.s.close();
});
test("D: uncommitted repositories, byte bound rollback and changed sensitive sources", async () => {
  const f = fixture(),
    path = join(f.root, "uncommitted");
  mkdirSync(path);
  fixtureGit(["init", "-q", path]);
  const p = await ok(f.s, "project_register", {
    path,
    authorizeIngestion: true,
  });
  writeFileSync(join(path, "safe.txt"), "previous safe rendering observation");
  await ok(f.s, "project_ingest", { projectId: p.id });
  const before = f.s.db.prepare("SELECT * FROM memories").all();
  assert.equal(before.length, 1);
  writeFileSync(join(path, "large.txt"), "x".repeat(500));
  const failed = await f.s.call("project_ingest", {
    projectId: p.id,
    maxBytes: 100,
  });
  assert.equal(failed.error.code, "INGEST_LIMIT");
  assert.equal(f.s.db.prepare("SELECT count(*) n FROM memories").get().n, 1);
  unlinkSync(join(path, "large.txt"));
  writeFileSync(join(path, "safe.txt"), "password=" + "z".repeat(20));
  await ok(f.s, "project_ingest", { projectId: p.id });
  assert.equal(
    f.s.db.prepare("SELECT status FROM memories").get().status,
    "deprecated",
  );
  f.s.close();
});
test("B: filters, complete response budget, oversized input and provenance trust", async () => {
  const f = fixture(),
    p = await register(f);
  await ok(f.s, "memory_store", {
    projectId: p.id,
    content: "matching procedural knowledge",
    type: "procedural",
  });
  await ok(f.s, "memory_store", {
    projectId: p.id,
    content: "matching semantic knowledge",
    type: "semantic",
  });
  const result = await f.s.call("memory_search", {
    projectId: p.id,
    query: "matching",
    type: "procedural",
    tokenBudget: 1800,
  });
  assert.equal(result.data.memories.length, 1);
  assert.ok(estimateTokens(result) <= 1800);
  assert.match(result.data.memories[0].trust, /data/);
  assert.equal(
    (
      await f.s.call("memory_search", {
        projectId: p.id,
        query: "x".repeat(1001),
      })
    ).ok,
    false,
  );
  assert.equal(
    (
      await f.s.call("memory_store", {
        projectId: p.id,
        content: "x".repeat(32001),
      })
    ).ok,
    false,
  );
  f.s.close();
});
test("security: external Git config rejected before Git commands; custom excludes and provenance retention", async () => {
  const f = fixture(),
    p = await register(f);
  const config = join(p.path, ".git", "config");
  const original = readFileSync(config, "utf8");
  writeFileSync(
    config,
    original + "\n[include]\n path = ../untrusted-config\n",
  );
  assert.equal(
    (await f.s.call("project_ingest", { projectId: p.id })).error.code,
    "UNSAFE_GIT",
  );
  writeFileSync(config, original);
  writeFileSync(join(p.path, "exclude-me.txt"), "custom excluded marker");
  await ok(f.s, "project_ingest", {
    projectId: p.id,
    excludes: ["exclude-me"],
  });
  assert.ok(
    !f.s.db
      .prepare("SELECT content FROM memories")
      .all()
      .some((m) => m.content.includes("custom excluded")),
  );
  const a = await ok(f.s, "memory_store", {
    projectId: p.id,
    content: "same content different evidence",
    source: "user observation one",
  });
  const b = await ok(f.s, "memory_store", {
    projectId: p.id,
    content: "same content different evidence",
    source: "user observation two",
  });
  assert.equal(a.id, b.id);
  assert.equal(b.version, 2);
  assert.equal(b.source.additionalReferences.length, 1);
  const c = await ok(f.s, "memory_store", {
    projectId: p.id,
    content: "same content different evidence",
    source: "user observation one",
  });
  assert.equal(c.version, 2);
  f.s.close();
});
test("A: future schema versions are refused without migration writes", () => {
  const f = fixture();
  f.s.db.prepare("INSERT INTO migrations VALUES(2)").run();
  f.s.close();
  assert.throws(
    () => new Storage(f.db),
    (e) => e.code === "UNSUPPORTED_SCHEMA",
  );
});
test("A/E: manual edits preserve ID/history, reset verification and prevent duplicates", async () => {
  const f = fixture(),
    p = await register(f);
  const a = await ok(f.s, "memory_store", {
    projectId: p.id,
    content: "original editable observation",
  });
  await ok(f.s, "memory_feedback", {
    projectId: p.id,
    id: a.id,
    action: "approve",
    explicitApproval: true,
  });
  const updated = await ok(f.s, "memory_update", {
    projectId: p.id,
    id: a.id,
    content: "corrected editable observation",
  });
  assert.equal(updated.id, a.id);
  assert.equal(updated.status, "candidate");
  assert.equal(updated.version, 3);
  assert.equal(
    (await ok(f.s, "memory_get", { projectId: p.id, id: a.id })).history.length,
    3,
  );
  const b = await ok(f.s, "memory_store", {
    projectId: p.id,
    content: "another separate observation",
  });
  assert.equal(
    (
      await f.s.call("memory_update", {
        projectId: p.id,
        id: a.id,
        content: b.content,
      })
    ).error.code,
    "DUPLICATE_MEMORY",
  );
  f.s.close();
});
test("security: quoted JSON configuration secrets and metadata are rejected before persistence", async () => {
  const f = fixture(),
    p = await register(f);
  const content = JSON.stringify({ password: "fixture-value-do-not-persist" });
  const rejected = await f.s.call("memory_store", { projectId: p.id, content });
  assert.equal(rejected.error.code, "SENSITIVE_CONTENT");
  writeFileSync(join(p.path, "config.json"), content);
  const ingested = await ok(f.s, "project_ingest", { projectId: p.id });
  assert.ok(ingested.skipped >= 1);
  assert.ok(
    !f.s.db
      .prepare("SELECT content FROM memories")
      .all()
      .some((m) => m.content.includes("fixture-value-do-not-persist")),
  );
  f.s.close();
});
test("C: CLI positional project deletion consumes the UUID and preserves the source", async () => {
  const f = fixture(),
    p = await register(f);
  f.s.close();
  const result = run(["--db", f.db, "project-delete", p.id, "--confirm"]);
  assert.equal(result.ok, true);
  assert.ok(statSync(p.path).isDirectory());
});
