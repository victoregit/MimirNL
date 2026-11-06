import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fixtureGit } from "./git-fixture.mjs";
import { performance } from "node:perf_hooks";
import { Service, Storage, optimize } from "../dist/index.js";
const root = mkdtempSync(join(tmpdir(), "mimir-benchmark-")),
  repo = join(root, "fixture");
mkdirSync(repo);
fixtureGit(["init", "-q", repo]);
const s = new Service(new Storage(join(root, "memory.sqlite")));
async function call(op, input) {
  const r = await s.call(op, input);
  if (!r.ok) throw Error(r.error.code);
  return r.data;
}
const p = await call("project_register", {
  path: repo,
  authorizeIngestion: true,
});
const relevant = new Set();
for (let i = 0; i < 100; i++) {
  const m = await call("memory_store", {
    projectId: p.id,
    content:
      i < 8
        ? `Renderer buffer architecture relevant fixture fact ${i}`
        : `Unrelated inventory bookkeeping fixture fact ${i}`,
  });
  if (i < 8) relevant.add(m.id);
}
const evaluate = (rows, ms, tokens) => ({
  returned: rows.length,
  latencyMs: Number(ms.toFixed(3)),
  conservativeTokenUpperBound: tokens,
  precision: rows.length
    ? rows.filter((m) => relevant.has(m.id)).length / rows.length
    : 0,
  recall: rows.filter((m) => relevant.has(m.id)).length / relevant.size,
});
let start = performance.now();
const full = s.db
  .prepare("SELECT * FROM memories WHERE project_id=?")
  .all(p.id)
  .map((m) => s.view(m));
const packedFull = optimize(full, 1000000);
const fullMs = performance.now() - start;
start = performance.now();
const selected = await call("memory_search", {
  projectId: p.id,
  query: "Renderer buffer architecture",
  limit: 10,
  tokenBudget: 12000,
});
const selectedMs = performance.now() - start;
assert.equal(selected.memories.length, 8);
assert.equal(selected.memories.filter((m) => relevant.has(m.id)).length, 8);
assert.ok(selected.estimatedTokens <= 12000);
console.log(
  JSON.stringify(
    {
      fixture: {
        corpus: 100,
        relevant: 8,
        query: "Renderer buffer architecture",
        seed: "deterministic indices 0..99",
      },
      withoutMemory: evaluate([], 0, 0),
      fullCorpus: evaluate(full, fullMs, packedFull.estimatedTokens),
      selective: evaluate(
        selected.memories,
        selectedMs,
        selected.estimatedTokens,
      ),
      limitations:
        "Synthetic keyword relevance; one local run, no model/task-quality evaluation. Retrieval latency includes context packing and metric writes; corpus baseline reads and packs all rows without metric writes. Byte upper bounds are not actual model token counts or measured savings.",
    },
    null,
    2,
  ),
);
s.close();

rmSync(root, { recursive: true, force: true });
