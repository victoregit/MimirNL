import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  Service,
  Storage,
  backupDatabase,
  restoreDatabase,
} from "../dist/index.js";
import {
  versionMatches,
  applicability,
  freshness,
  conflict,
} from "../dist/learning/context.js";
const pin = (m) => ({ expectedVersion: m.version, expectedHash: m.hash });
async function ok(s, op, d) {
  const r = await s.call(op, d);
  assert.equal(r.ok, true, JSON.stringify(r));
  return r.data;
}
async function bad(s, op, d, code) {
  const r = await s.call(op, d);
  assert.equal(r.ok, false, JSON.stringify(r));
  if (code) assert.equal(r.error.code, code);
}
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "mimir-relations-")),
    s = new Service(new Storage(join(root, "knowledge.sqlite"))),
    p = randomUUID(),
    q = randomUUID();
  for (const id of [p, q])
    s.db
      .prepare("INSERT INTO projects VALUES(?,?,1,?)")
      .run(id, join(root, id), new Date().toISOString());
  return {
    root,
    s,
    p,
    q,
    close() {
      s.close();
      rmSync(root, { recursive: true, force: true });
    },
  };
}
const ctx = (p) => ({
  applicability: {
    project: p,
    tool: "mimir",
    runtime: "node",
    version: "24.22.1",
  },
  freshness: { expiresAt: null, source: null },
  claim: { key: "backup", value: "required" },
});
const exp = (p) => ({
  schemaVersion: 1,
  context: ctx(p),
  problem: "Café example",
  environment: {
    platform: "linux",
    runtime: "node24",
    tool: "mimir",
    reason: null,
  },
  action: "preserve  internal spaces",
  observedResult: "observed only",
  tests: [],
  sources: [],
  confidence: { value: null, reason: "unknown" },
  identity: {
    requestedModel: null,
    observedModel: null,
    observedModelReason: "unknown",
    actorKind: "agent",
    actorRef: "10000000-0000-4000-8000-000000000001",
    provenance: "provided",
  },
});
const store = (f, content, p = f.p) =>
  ok(f.s, "memory_store", { projectId: p, content });
async function approve(f, m) {
  // Explicit consent below is synthetic fixture authorization, never real human approval.
  const a = await ok(f.s, "memory_review", {
    projectId: f.p,
    id: m.id,
    ...pin(m),
    action: "begin",
    actorKind: "agent",
    actorRef: randomUUID(),
  });
  return ok(f.s, "memory_review", {
    projectId: f.p,
    id: m.id,
    ...pin(a),
    action: "decide",
    actorKind: "human",
    actorRef: randomUUID(),
    decision: "verified",
    explicitHumanConsent: true,
  });
}
async function generalize(f, source, content = "Portable reviewed lesson") {
  return ok(f.s, "memory_generalize", {
    projectId: f.p,
    id: source.id,
    ...pin(source),
    content,
  });
}
async function promote(f, m) {
  return ok(f.s, "memory_feedback", {
    projectId: f.p,
    id: m.id,
    ...pin(m),
    action: "promote",
    sharingApproval: true,
  });
}
const get = (f, m, p = f.p) =>
  ok(f.s, "memory_get", { projectId: p, id: m.id });
test("canonical structured identity: NFC/edge whitespace/key order; environment, sources, applicability and arrays retain meaning", async () => {
  const f = fixture();
  try {
    const e = exp(f.p),
      a = await ok(f.s, "experience_observe", {
        projectId: f.p,
        experience: e,
      });
    const reordered = Object.fromEntries(
      Object.entries({ ...e, problem: "  Cafe\u0301 example\r\n" }).reverse(),
    );
    const b = await ok(f.s, "experience_observe", {
      projectId: f.p,
      experience: reordered,
    });
    assert.equal(a.id, b.id);
    assert.equal(b.status, "candidate");
    assert.equal((await get(f, b)).history.length, 1);
    for (const changed of [
      { ...e, environment: { ...e.environment, runtime: "node25" } },
      {
        ...e,
        context: {
          ...e.context,
          applicability: { ...e.context.applicability, version: "25.0.0" },
        },
      },
      { ...e, action: "preserve internal spaces" },
      { ...e, identity: { ...e.identity, actorRef: randomUUID() } },
    ]) {
      const c = await ok(f.s, "experience_observe", {
        projectId: f.p,
        experience: changed,
      });
      assert.notEqual(c.id, a.id);
      assert.notEqual(c.hash, a.hash);
    }
    await bad(f.s, "experience_observe", {
      projectId: f.p,
      experience: { ...e, problem: "   " },
    });
    await bad(
      f.s,
      "experience_observe",
      { projectId: f.p, experience: { ...e, context: ctx(f.q) } },
      "INVALID_CONTEXT",
    );
    await bad(
      f.s,
      "memory_context",
      { projectId: f.p, id: a.id, ...pin(a), context: ctx(f.p) },
      "INVALID_CONTEXT",
    );
  } finally {
    f.close();
  }
});
test("exact semver interval limits and unknowns, stale needs evidence not age", () => {
  for (const [range, version, expected] of [
    ["24.22.1", "24.22.1", true],
    ["24.22.1", "24.22.2", false],
    [">=24.0.0 <25.0.0", "24.22.1", true],
    [">24.0.0 <=25.0.0", "24.0.0", false],
    [">24.0.0 <=25.0.0", "25.0.0", true],
    [">=25.0.0 <24.0.0", "24.0.0", null],
    ["^24.0.0", "24.1.0", null],
    ["24.1.0", "v24.1.0", null],
    ["24.1.0", "24.1.0-beta", null],
    [">=01.0.0 <25.0.0", "24.0.0", null],
  ])
    assert.equal(versionMatches(range, version), expected, range);
  const c = ctx(randomUUID());
  assert.equal(freshness(c), "unknown");
  assert.equal(applicability(c, c.applicability), "current");
  assert.equal(
    applicability(c, { ...c.applicability, runtime: null }),
    "unknown",
  );
  assert.equal(
    applicability(c, { ...c.applicability, version: "25.0.0" }),
    "stale",
  );
  c.freshness.expiresAt = "2000-01-01T00:00:00.000Z";
  assert.equal(freshness(c), "stale");
  c.freshness.expiresAt = null;
  c.freshness.source = {
    reference: "opaque",
    expectedHash: "a".repeat(64),
    observedHash: "b".repeat(64),
  };
  assert.equal(freshness(c), "stale");
  c.freshness.source.observedHash = "a".repeat(64);
  assert.equal(freshness(c), "current");
  const b = structuredClone(c);
  b.claim.value = "optional";
  assert.equal(conflict(c, b), true);
  b.applicability.runtime = null;
  assert.equal(conflict(c, b), false);
  b.applicability.runtime = c.applicability.runtime;
  b.applicability.version = "25.0.0";
  assert.equal(conflict(c, b), false);
});
test("applicability is opt-in before limit and dedup, default retrieval unchanged; context invalidates review", async () => {
  const f = fixture();
  try {
    let a = await store(f, "applicability alpha"),
      b = await store(f, "applicability beta");
    a = await ok(f.s, "memory_context", {
      projectId: f.p,
      id: a.id,
      ...pin(a),
      context: ctx(f.p),
    });
    const other = ctx(f.p);
    other.applicability.version = "25.0.0";
    b = await ok(f.s, "memory_context", {
      projectId: f.p,
      id: b.id,
      ...pin(b),
      context: other,
    });
    assert.equal(
      (
        await ok(f.s, "memory_search", {
          projectId: f.p,
          query: "applicability",
        })
      ).memories.length,
      2,
    );
    assert.deepEqual(
      (
        await ok(f.s, "memory_search", {
          projectId: f.p,
          query: "applicability",
          applicability: ctx(f.p).applicability,
          limit: 1,
        })
      ).memories.map((m) => m.id),
      [a.id],
    );
    assert.deepEqual(
      (
        await ok(f.s, "memory_search", {
          projectId: f.p,
          query: "applicability",
          applicability: ctx(f.p).applicability,
          applicabilityStatus: "stale",
        })
      ).memories.map((m) => m.id),
      [b.id],
    );
    a = await approve(f, a);
    const changed = await ok(f.s, "memory_context", {
      projectId: f.p,
      id: a.id,
      ...pin(a),
      context: other,
    });
    assert.equal(changed.status, "candidate");
    assert.equal(changed.learning.review.state, "pending");
    await bad(
      f.s,
      "memory_context",
      { projectId: f.p, id: a.id, ...pin(a), context: other },
      "STALE_MEMORY",
    );
    assert.equal((await get(f, changed)).history.length, 5);
  } finally {
    f.close();
  }
});
test("conflict diagnostics require same known domain; explicit relation preserves status and version evidence", async () => {
  const f = fixture();
  try {
    let a = await store(f, "conflict first"),
      b = await store(f, "conflict second");
    a = await ok(f.s, "memory_context", {
      projectId: f.p,
      id: a.id,
      ...pin(a),
      context: ctx(f.p),
    });
    const c = ctx(f.p);
    c.claim.value = "different";
    b = await ok(f.s, "memory_context", {
      projectId: f.p,
      id: b.id,
      ...pin(b),
      context: c,
    });
    const detail = await get(f, a);
    assert.equal(detail.conflicts[0].id, b.id);
    assert.equal(detail.status, "candidate");
    const r = await ok(f.s, "memory_relation", {
      projectId: f.p,
      id: a.id,
      ...pin(a),
      relatedId: b.id,
      relatedVersion: b.version,
      relatedHash: b.hash,
      kind: "conflict",
      reason: "explicit contradictory observations",
      evidenceRefs: [randomUUID()],
    });
    assert.equal(r.status, "candidate");
    assert.equal(r.learning.relationEvidence[0].target.hash, b.hash);
    assert.equal((await get(f, r)).relations[0].kind, "conflict");
    const q = await store(f, "other project", f.q);
    await bad(
      f.s,
      "memory_relation",
      {
        projectId: f.p,
        id: r.id,
        ...pin(r),
        relatedId: q.id,
        relatedVersion: q.version,
        relatedHash: q.hash,
        kind: "conflict",
        reason: "invalid cross-project",
      },
      "NOT_FOUND",
    );
    await bad(
      f.s,
      "memory_relation",
      {
        projectId: f.p,
        id: r.id,
        ...pin(r),
        relatedId: r.id,
        relatedVersion: r.version,
        relatedHash: r.hash,
        kind: "conflict",
        reason: "self",
      },
      "INVALID_RELATION",
    );
  } finally {
    f.close();
  }
});
test("supersession direction, cycles, competing replacements and legacy entrypoint guards", async () => {
  const f = fixture();
  try {
    let a = await store(f, "supersession a"),
      b = await store(f, "supersession b"),
      c = await store(f, "supersession c");
    a = await ok(f.s, "memory_feedback", {
      projectId: f.p,
      id: a.id,
      action: "supersede",
      relatedId: b.id,
    });
    assert.equal(a.status, "deprecated");
    await bad(
      f.s,
      "memory_feedback",
      { projectId: f.p, id: b.id, action: "supersede", relatedId: a.id },
      "INVALID_RELATION",
    );
    await bad(
      f.s,
      "memory_feedback",
      { projectId: f.p, id: a.id, action: "supersede", relatedId: c.id },
      "INVALID_RELATION",
    );
    // Simulate historical reactivation through explicit legacy approval, cycle still fails.
    a = await ok(f.s, "memory_feedback", {
      projectId: f.p,
      id: a.id,
      action: "approve",
      explicitApproval: true,
    });
    await bad(
      f.s,
      "memory_relation",
      {
        projectId: f.p,
        id: b.id,
        ...pin(b),
        relatedId: a.id,
        relatedVersion: a.version,
        relatedHash: a.hash,
        kind: "supersede",
        reason: "cycle",
      },
      "RELATION_CYCLE",
    );
    assert.equal((await get(f, b)).history.length, 1);
    assert.equal(
      (
        await ok(f.s, "memory_search", {
          projectId: f.p,
          query: "supersession",
        })
      ).memories.length,
      3,
    );
  } finally {
    f.close();
  }
});
test("generalization is distinct candidate, legacy approve cannot bypass exact review, stale and absent sharing consent fail", async () => {
  const f = fixture();
  try {
    const source = await store(f, "private source CANARY_PRIVATE"),
      g = await generalize(f, source);
    assert.equal(g.status, "candidate");
    assert.notEqual(g.id, source.id);
    assert.equal(g.learning.generalization.source.hash, source.hash);
    await bad(
      f.s,
      "memory_feedback",
      { projectId: f.p, id: g.id, action: "approve", explicitApproval: true },
      "REVIEW_REQUIRED",
    );
    await bad(
      f.s,
      "memory_feedback",
      {
        projectId: f.p,
        id: g.id,
        ...pin(g),
        action: "promote",
        sharingApproval: true,
      },
      "SHARING_APPROVAL_REQUIRED",
    );
    const a = await approve(f, g);
    await bad(
      f.s,
      "memory_feedback",
      { projectId: f.p, id: a.id, ...pin(a), action: "promote" },
      "SHARING_APPROVAL_REQUIRED",
    );
    await bad(
      f.s,
      "memory_feedback",
      {
        projectId: f.p,
        id: a.id,
        ...pin(g),
        action: "promote",
        sharingApproval: true,
      },
      "STALE_MEMORY",
    );
    const edited = await ok(f.s, "memory_update", {
      projectId: f.p,
      id: a.id,
      content: "Edited portable lesson",
    });
    assert.equal(
      (await get(f, edited)).learning.generalization.source.id,
      source.id,
    );
    await bad(
      f.s,
      "memory_feedback",
      {
        projectId: f.p,
        id: edited.id,
        action: "approve",
        explicitApproval: true,
      },
      "REVIEW_REQUIRED",
    );
    await bad(
      f.s,
      "memory_generalize",
      {
        projectId: f.p,
        id: source.id,
        ...pin(source),
        content: source.content,
      },
      "DUPLICATE_MEMORY",
    );
    for (const content of [
      source.id,
      f.p,
      join(f.root, "private.txt"),
      "/home/example/private.txt",
    ])
      await bad(
        f.s,
        "memory_generalize",
        { projectId: f.p, id: source.id, ...pin(source), content },
        "PRIVATE_GENERALIZATION",
      );
  } finally {
    f.close();
  }
});
test("promotion withholds private history/provenance; correction and revocation independent, other project unchanged", async () => {
  const f = fixture();
  try {
    const source = await store(f, "CANARY_PRIVATE source details"),
      other = await store(f, "unrelated durable fact", f.q),
      before = await get(f, other, f.q);
    let g = await approve(
      f,
      await generalize(f, source, "Portable lesson with independent lifecycle"),
    );
    g = await promote(f, g);
    const copies = (
      await ok(f.s, "memory_copies", { projectId: f.p, id: g.id })
    ).copies;
    assert.equal(copies.length, 1);
    const copy = copies[0];
    const global = await ok(f.s, "memory_get", {
      projectId: f.q,
      id: copy.id,
      includeGlobal: true,
    });
    assert.deepEqual(global.history, []);
    assert.deepEqual(global.relations, []);
    for (const canary of [
      source.id,
      g.id,
      f.p,
      "CANARY_PRIVATE",
      f.root,
      "generalization",
    ])
      assert.equal(JSON.stringify(global).includes(canary), false, canary);
    await bad(f.s, "memory_copies", { projectId: f.q, id: g.id }, "NOT_FOUND");
    const corrected = await ok(f.s, "memory_correct", {
      projectId: f.p,
      id: g.id,
      ...pin(g),
      content: "Corrected portable new observation",
      reason: "synthetic regression invalidated old observation",
      evidenceRefs: [randomUUID()],
    });
    assert.equal(corrected.invalid.status, "deprecated");
    assert.equal(corrected.correction.status, "candidate");
    assert.equal(corrected.globalCopiesUnchanged, true);
    const found = await ok(f.s, "memory_search", {
      projectId: f.p,
      query: "Portable",
    });
    assert.equal(
      found.memories.some((m) => m.id === g.id),
      false,
    );
    assert.equal(
      (
        await ok(f.s, "memory_get", {
          projectId: f.q,
          id: copy.id,
          includeGlobal: true,
        })
      ).status,
      "verified",
    );
    await bad(f.s, "memory_revoke", {
      projectId: f.p,
      id: g.id,
      copyId: copy.id,
      ...pin(copy),
      sharingApproval: true,
      reason: "missing human consent",
    });
    await bad(
      f.s,
      "memory_revoke",
      {
        projectId: f.q,
        id: g.id,
        copyId: copy.id,
        ...pin(copy),
        sharingApproval: true,
        explicitHumanConsent: true,
        reason: "wrong project",
      },
      "NOT_FOUND",
    );
    await ok(f.s, "memory_revoke", {
      projectId: f.p,
      id: g.id,
      copyId: copy.id,
      ...pin(copy),
      sharingApproval: true,
      explicitHumanConsent: true,
      reason: "specific synthetic consent to revoke copy",
    });
    assert.equal(
      (
        await ok(f.s, "memory_search", {
          projectId: f.q,
          query: "Portable",
          includeGlobal: true,
        })
      ).memories.some((m) => m.id === copy.id),
      false,
    );
    assert.deepEqual(await get(f, other, f.q), before);
    assert.equal((await get(f, g)).history.length, 5);
    const rows = f.s.db
      .prepare("SELECT snapshot FROM history WHERE memory_id=?")
      .all(copy.id);
    assert.equal(rows.length, 2);
    assert.equal(JSON.stringify(rows).includes("CANARY_PRIVATE"), false);
    assert.equal(JSON.stringify(rows).includes(g.id), false);
  } finally {
    f.close();
  }
});
test("legacy explicit review and sharing retained; structured raw experiences require generalization", async () => {
  const f = fixture();
  try {
    const m = await store(f, "Legacy explicitly reviewed policy"),
      a = await ok(f.s, "memory_feedback", {
        projectId: f.p,
        id: m.id,
        action: "approve",
        explicitApproval: true,
      });
    await promote(f, a);
    let e = await ok(f.s, "experience_observe", {
      projectId: f.p,
      experience: exp(f.p),
    });
    e = await ok(f.s, "memory_feedback", {
      projectId: f.p,
      id: e.id,
      action: "approve",
      explicitApproval: true,
    });
    await bad(
      f.s,
      "memory_feedback",
      { projectId: f.p, id: e.id, action: "promote", sharingApproval: true },
      "GENERALIZATION_REQUIRED",
    );
  } finally {
    f.close();
  }
});
test("schema2 backup/restore preserves context, relation evidence, review and copies without new layout", async () => {
  const f = fixture();
  let recovered;
  try {
    let a = await store(f, "backup lesson"),
      b = await store(f, "replacement lesson");
    a = await ok(f.s, "memory_context", {
      projectId: f.p,
      id: a.id,
      ...pin(a),
      context: ctx(f.p),
    });
    await ok(f.s, "memory_relation", {
      projectId: f.p,
      id: a.id,
      ...pin(a),
      relatedId: b.id,
      relatedVersion: b.version,
      relatedHash: b.hash,
      kind: "conflict",
      reason: "reported disagreement",
    });
    const before = await get(f, a);
    const snapshot = join(f.root, "backup.sqlite");
    await backupDatabase(f.s.storage, snapshot);
    const target = join(f.root, "restored.sqlite");
    await restoreDatabase(snapshot, target);
    recovered = new Service(new Storage(target));
    assert.deepEqual(
      await ok(recovered, "memory_get", { projectId: f.p, id: a.id }),
      before,
    );
    assert.equal(
      recovered.db.prepare("SELECT version FROM migrations").get().version,
      2,
    );
  } finally {
    recovered?.close();
    f.close();
  }
});
test("corrective transaction failure rolls back new content, invalidation and relations; dedup cannot overwrite another record", async () => {
  const f = fixture();
  try {
    const a = await store(f, "transaction original"),
      b = await store(f, "transaction occupied");
    const before = await get(f, a);
    await bad(
      f.s,
      "memory_correct",
      {
        projectId: f.p,
        id: a.id,
        ...pin(a),
        content: b.content,
        reason: "collision",
        evidenceRefs: [randomUUID()],
      },
      "DUPLICATE_MEMORY",
    );
    assert.deepEqual(await get(f, a), before);
    f.s.db.exec(
      `CREATE TEMP TRIGGER fail_history BEFORE INSERT ON history WHEN new.memory_id='${a.id}' BEGIN SELECT RAISE(ABORT,'synthetic rollback'); END;`,
    );
    await bad(f.s, "memory_correct", {
      projectId: f.p,
      id: a.id,
      ...pin(a),
      content: "transaction corrective candidate",
      reason: "synthetic failure",
      evidenceRefs: [randomUUID()],
    });
    assert.equal(f.s.db.prepare("SELECT count(*) n FROM memories").get().n, 2);
    assert.equal(f.s.db.prepare("SELECT count(*) n FROM relations").get().n, 0);
    assert.deepEqual(await get(f, a), before);
    f.s.db.exec("DROP TRIGGER fail_history");
  } finally {
    f.close();
  }
});
test("generalization duplicate never approves; private edits and stale review cannot promote; source sees affected copies", async () => {
  const f = fixture();
  try {
    const source = await store(f, "private source with restricted provenance");
    let g = await generalize(f, source, "Portable promotion candidate");
    await bad(
      f.s,
      "memory_generalize",
      { projectId: f.p, id: source.id, ...pin(source), content: g.content },
      "DUPLICATE_MEMORY",
    );
    assert.equal((await get(f, g)).status, "candidate");
    g = await approve(f, g);
    g = await promote(f, g);
    assert.equal(
      (await ok(f.s, "memory_copies", { projectId: f.p, id: source.id })).copies
        .length,
      1,
    );
    const correction = await ok(f.s, "memory_correct", {
      projectId: f.p,
      id: g.id,
      ...pin(g),
      content: "Revised portable content",
      reason: "synthetic correction preserves sharing boundary",
      evidenceRefs: [randomUUID()],
    });
    await bad(
      f.s,
      "memory_feedback",
      {
        projectId: f.p,
        id: correction.correction.id,
        action: "approve",
        explicitApproval: true,
      },
      "REVIEW_REQUIRED",
    );
    let edit = await ok(f.s, "memory_update", {
      projectId: f.p,
      id: correction.correction.id,
      content: "Accidental identifier " + source.id,
    });
    edit = await approve(f, edit);
    await bad(
      f.s,
      "memory_feedback",
      {
        projectId: f.p,
        id: edit.id,
        ...pin(edit),
        action: "promote",
        sharingApproval: true,
      },
      "PRIVATE_GENERALIZATION",
    );
  } finally {
    f.close();
  }
});
