import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Service, Storage } from "../dist/index.js";
import { optimize, estimateTokens } from "../dist/optimization/index.js";

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "mimir-v03-"));
  const s = new Service(new Storage(join(root, "memory.sqlite")));
  t.after(() => {
    s.close();
    rmSync(root, { recursive: true });
  });
  const p = randomUUID();
  s.db
    .prepare("INSERT INTO projects VALUES(?,?,1,?)")
    .run(p, root, new Date().toISOString());
  const add = (text) =>
    s.store(p, text, "semantic", "user", { citation: "synthetic" });
  const search = async (opts = {}) => {
    const r = await s.call("memory_search", {
      projectId: p,
      query: "alpha",
      tokenBudget: 10000,
      ...opts,
    });
    assert.equal(r.ok, true, JSON.stringify(r));
    return r.data;
  };
  return { s, p, add, search };
}

test("v03: dedup precedes limit and retains duplicate provenance without crossing scope", async (t) => {
  const { s, add, search } = fixture(t);
  const a = add("alpha same");
  const b = add("alpha other");
  s.db
    .prepare(
      "INSERT INTO memories SELECT ?,NULL,'global',type,content,hash,'verified',origin,source,version,created,updated,uses FROM memories WHERE id=?",
    )
    .run(randomUUID(), a.id);
  const result = await search({ includeGlobal: true, limit: 2 });
  assert.deepEqual(
    new Set(result.memories.map((m) => m.id)),
    new Set([a.id, b.id]),
  );
  assert.equal(
    result.memories.find((m) => m.id === a.id).duplicateProvenance.length,
    1,
  );
  assert.equal(
    (await search()).memories.every((m) => m.duplicateProvenance.length === 0),
    true,
  );
});

test("v03: controlled recency only breaks verified ties, invalid/future dates do not dominate", async (t) => {
  const { s, add, search } = fixture(t);
  const ms = [add("alpha a"), add("alpha b"), add("alpha c"), add("alpha d")];
  for (const [i, date] of [
    "2020-01-01",
    "2021-01-01",
    "invalid",
    "2999-01-01",
  ].entries())
    s.db
      .prepare("UPDATE memories SET status='verified',updated=? WHERE id=?")
      .run(date, ms[i].id);
  assert.equal(
    (await search({ recency: "verified-ties-v1" })).memories[0].id,
    ms[1].id,
  );
  s.db
    .prepare("UPDATE memories SET status='rejected' WHERE id=?")
    .run(ms[1].id);
  assert.equal(
    (await search({ recency: "verified-ties-v1" })).memories[0].id,
    ms[0].id,
  );
});

test("v03: deterministic low evidence, empty and FTS injection handling", async (t) => {
  const { add, search } = fixture(t);
  add("alpha local evidence");
  for (const query of ["", "!!!", "missing", "alpha beta gamma delta epsilon"])
    assert.equal(
      (await search({ query, policy: "balanced-v1" })).reason,
      "no_lexical_evidence",
    );
  await search({ query: 'alpha OR " * NOT', policy: "balanced-v1" });
  assert.equal(
    (
      await search({
        query: "alpha beta gamma delta epsilon",
        policy: "legacy",
      })
    ).memories.length,
    1,
  );
});

test("v03: whole UTF8 envelopes, minimum rejection and intact large excerpts", () => {
  assert.throws(() => optimize([], 1), { code: "BUDGET_TOO_SMALL" });
  for (const budget of [200, 300, 1000, 10000]) {
    const result = optimize(
      [{ content: "🧠ação".repeat(300), source: "引用".repeat(50) }],
      budget,
    );
    assert.ok(estimateTokens({ ok: true, data: result }) <= budget);
    if (result.memories.length)
      assert.equal(result.memories[0].content, "🧠ação".repeat(300));
  }
});

test("v03: compact retains citations and hashes, telemetry opt-in, impossible budget does not mutate", async (t) => {
  const { s, add, search, p } = fixture(t);
  add("alpha 🧠 ação");
  const full = await search();
  const compact = await search({ format: "compact-v1" });
  for (const key of [
    "id",
    "content",
    "hash",
    "source",
    "trust",
    "duplicateProvenance",
  ])
    assert.deepEqual(compact.memories[0][key], full.memories[0][key]);
  assert.ok(estimateTokens(compact) < estimateTokens(full));
  assert.equal(full.telemetry, undefined);
  assert.equal(
    (await search({ telemetry: true })).telemetry.version,
    "local-v1",
  );
  const before = s.db.prepare("SELECT count(*) n FROM retrievals").get().n;
  const r = await s.call("memory_search", {
    projectId: p,
    query: "alpha",
    tokenBudget: 200,
    telemetry: true,
    policy: "balanced-v1",
  });
  assert.equal(r.ok, false);
  assert.equal(r.error.code, "BUDGET_TOO_SMALL");
  assert.equal(
    s.db.prepare("SELECT count(*) n FROM retrievals").get().n,
    before,
  );
});

test("v03: telemetry contains only local counters and never uploads", async (t) => {
  const { add, search } = fixture(t);
  add("alpha private synthetic excerpt");
  t.mock.method(globalThis, "fetch", () => {
    throw Error("Network forbidden");
  });
  const result = await search({ telemetry: true });
  assert.deepEqual(Object.keys(result.telemetry).sort(), [
    "format",
    "policy",
    "returnedCandidates",
    "version",
  ]);
  assert.equal(JSON.stringify(result.telemetry).includes("alpha"), false);
  assert.equal((await search()).telemetry, undefined);
});
