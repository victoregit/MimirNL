// Offline development-only probe: explicit allow-list, no model/network/private inputs.
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Service, Storage } from "../../dist/index.js";
import { optimize } from "../../dist/optimization/index.js";
import { format } from "prettier";
import { canonical } from "./public-bundle.mjs";
const dir = resolve("docs/benchmarks/v03/evidencias/preparacao");
const digest = (x) => createHash("sha256").update(x).digest("hex");
const read = (name) => readFileSync(join(dir, name));
const bundleBytes = read("sources-0.2.json"),
  devBytes = read("development-0.2.json");
const bundle = JSON.parse(bundleBytes),
  dev = JSON.parse(devBytes),
  freeze = JSON.parse(read("freeze-0.2.json"));
if (
  digest(
    canonical(
      Object.fromEntries(
        Object.entries(bundle).filter(([key]) => key !== "sha256"),
      ),
    ),
  ) !== freeze.bundle_sha256 ||
  digest(canonical(freeze.parameters)) !== freeze.parameters_sha256 ||
  bundle.sha256 !== freeze.bundle_sha256 ||
  digest(canonical(dev)) !== freeze.development_sha256 ||
  dev.length !== 9 ||
  dev.some((c) => c.split !== "development")
)
  throw Error("Development freeze mismatch");
const config = {
  version: "core-v03-1",
  policy: "balanced-v1",
  recency: "verified-ties-v1",
  format: "compact-v1",
  telemetry: false,
  limit: freeze.parameters.k,
  tokenBudget: freeze.parameters.context_bytes,
};
const coreFreeze = JSON.parse(
  readFileSync(resolve("docs/benchmarks/v03/core-parameters-0.3.json")),
);
if (
  JSON.stringify(config) !== JSON.stringify(coreFreeze.config) ||
  digest(JSON.stringify(config)) !== coreFreeze.config_sha256
)
  throw Error("Core parameters freeze mismatch");
const output = {
  version: "offline-core-ablation-v1",
  actual_model_calls: 0,
  development_sha256: digest(devBytes),
  bundle_sha256: digest(bundleBytes),
  baseline: {
    policy: "legacy frozen FTS OR + bm25 + scope + id, limit before dedup",
    format: "full",
    limit: config.limit,
    tokenBudget: config.tokenBudget,
  },
  config,
  config_sha256: digest(JSON.stringify(config)),
  cases: [],
};
for (const c of dev) {
  const root = mkdtempSync(join(tmpdir(), "mimir-dev-"));
  const s = new Service(new Storage(join(root, "db.sqlite")));
  try {
    const p = randomUUID();
    s.db
      .prepare("INSERT INTO projects VALUES(?,?,1,?)")
      .run(p, root, "2020-01-01T00:00:00Z");
    const keys = new Map();
    for (const key of c.pool) {
      const source = bundle.sources.find(
        (x) => `${x.source_id}/${x.unit_id}` === key,
      );
      if (!source || digest(source.excerpt) !== source.sha256)
        throw Error("Source integrity mismatch");
      const m = s.store(p, source.excerpt, "semantic", "user", source);
      keys.set(m.id, key);
      // Stable IDs and dates eliminate UUID/timing dependent ranking and byte size.
      const stable = digest(key)
        .slice(0, 32)
        .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
      s.db.prepare("DELETE FROM history WHERE memory_id=?").run(m.id);
      s.db
        .prepare(
          "UPDATE memories SET id=?,created=?,updated=?,content=content WHERE id=?",
        )
        .run(stable, "2020-01-01T00:00:00Z", "2020-01-01T00:00:00Z", m.id);
      keys.set(stable, key);
    }
    if (
      s.db
        .prepare(
          "SELECT count(*) n FROM memories m JOIN memory_fts f ON f.id=m.id WHERE m.project_id=?",
        )
        .get(p).n !== c.pool.length
    )
      throw Error("Synthetic fixture FTS integrity mismatch");
    const words = c.query.match(/[\p{L}\p{N}_]+/gu)?.slice(0, 40) ?? [];
    const baseline = words.length
      ? s.db
          .prepare(
            "SELECT m.* FROM memory_fts JOIN memories m ON m.id=memory_fts.id WHERE m.project_id=? AND m.status IN ('candidate','verified') AND memory_fts MATCH ? ORDER BY bm25(memory_fts),(m.scope='project') DESC,m.id LIMIT ?",
          )
          .all(p, words.map((w) => '"' + w + '"').join(" OR "), config.limit)
      : [];
    const baselineData = optimize(
      [...new Map(baseline.map((m) => [m.hash, s.view(m)])).values()],
      config.tokenBudget,
    );
    const arms = {};
    for (const [name, options] of Object.entries({
      dedup_full: { policy: "legacy", format: "full", recency: "off" },
      relevance_full: { policy: "balanced-v1", format: "full", recency: "off" },
      relevance_compact: {
        policy: "balanced-v1",
        format: "compact-v1",
        recency: "off",
      },
    })) {
      const arm = await s.call("memory_search", {
        projectId: p,
        query: c.query,
        limit: config.limit,
        tokenBudget: config.tokenBudget,
        ...options,
      });
      if (!arm.ok) throw Error(JSON.stringify(arm));
      arms[name] = {
        options,
        sources: arm.data.memories.map((m) => ({
          source_id: keys.get(m.id),
          sha256: m.hash,
        })),
        envelope_bytes: Buffer.byteLength(JSON.stringify(arm)),
      };
    }
    const result = await s.call("memory_search", {
      projectId: p,
      query: c.query,
      ...Object.fromEntries(
        Object.entries(config).filter(([k]) => k !== "version"),
      ),
    });
    if (!result.ok) throw Error(JSON.stringify(result));
    const describe = (rows) =>
      rows.map((m) => ({ source_id: keys.get(m.id), sha256: m.hash }));
    output.cases.push({
      case_id: c.case_id,
      pool: c.pool,
      baseline: describe(baselineData.memories),
      baseline_envelope_bytes: Buffer.byteLength(
        JSON.stringify({ ok: true, data: baselineData }),
      ),
      arms,
      improved: describe(result.data.memories),
      reason: result.data.reason,
      improved_envelope_bytes: Buffer.byteLength(JSON.stringify(result)),
      structural_pool_coverage: result.data.memories.length / c.pool.length,
    });
  } finally {
    s.close();
    rmSync(root, { recursive: true });
  }
}
writeFileSync(
  resolve("docs/benchmarks/v03/core-ablation-0.3.json"),
  await format(JSON.stringify(output), { parser: "json" }),
);
console.log(
  JSON.stringify({
    cases: output.cases.length,
    actual_model_calls: 0,
    config_sha256: output.config_sha256,
  }),
);
