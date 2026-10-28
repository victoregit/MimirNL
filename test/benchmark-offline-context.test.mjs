import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { assembleOfflineContext } from "../scripts/benchmarks/offline-context.mjs";
import {
  runtimeEnvelope,
  canonical,
  hash,
  PIN,
  PARAMETERS,
} from "../scripts/benchmarks/contract-v02.mjs";
const root = new URL("../", import.meta.url);
const read = (path) => JSON.parse(readFileSync(new URL(path, root)));
const manifest = read(
  "docs/benchmarks/v03/evidencias/task103/public-plan/offline-manifest.json",
);
const bundle = manifest.bundle;
const key = (s) => s.source_id + "/" + s.unit_id;
const opt = { base_overlap: "exact-v1" };
const seal = (sources) => {
  const payload = {
    schema_version: "source-bundle-0.2",
    contract_version: "0.2",
    parameters: PARAMETERS,
    sources,
  };
  return { ...payload, sha256: hash(canonical(payload)) };
};

test("default equals legacy bytes; opt-in applies and preserves order/base/input", () => {
  const keys = bundle.sources.slice(0, 3).map(key);
  const before = structuredClone(bundle);
  const a = assembleOfflineContext(bundle, "t", [keys[1]], keys);
  assert.equal(
    a.prompt,
    JSON.stringify(runtimeEnvelope(bundle, "t", [keys[1]], keys)),
  );
  const b = assembleOfflineContext(bundle, "t", [keys[1]], keys, opt);
  assert.deepEqual(b.envelope.retrieved.map(key), [keys[0], keys[2]]);
  assert.deepEqual(b.envelope.sources, a.envelope.sources);
  assert.equal(b.omitted_count, 1);
  assert.equal(b.context_bytes, Buffer.byteLength(b.prompt));
  assert.equal(b.avoided_bytes, a.context_bytes - b.context_bytes);
  assert.notEqual(a.configuration_sha256, b.configuration_sha256);
  assert.equal(b.executable, false);
  assert.deepEqual(bundle, before);
  b.envelope.sources[0].excerpt = "changed clone";
  assert.deepEqual(bundle, before);
  for (const retrieved of [[], [keys[0]]]) {
    const c = assembleOfflineContext(bundle, "t", [keys[1]], retrieved, opt);
    assert.equal(c.omitted_count, 0);
    assert.equal(c.avoided_bytes, 0);
  }
});

test("same text with distinct identity/origin/range is retained; Unicode and key order", () => {
  const s = {
    source_id: "a",
    unit_id: "u",
    path: "p.ts",
    commit: PIN,
    start_line: 1,
    end_line: 1,
    excerpt: 'ação "\\🙂\n',
    sha256: hash('ação "\\🙂\n'),
  };
  const other = { ...s, unit_id: "v" };
  for (const change of [
    {},
    { source_id: "b" },
    { path: "q.ts" },
    { start_line: 2, end_line: 2 },
  ]) {
    const b = seal([s, { ...other, ...change }]);
    assert.equal(
      assembleOfflineContext(b, "t", [key(s)], [key(b.sources[1])], opt)
        .omitted_count,
      0,
    );
  }
  const reversed = Object.fromEntries(Object.entries(s).reverse());
  const b = seal([reversed]);
  const result = assembleOfflineContext(b, "t", [key(s)], [key(s)], opt);
  assert.equal(result.omitted_count, 1);
  assert.equal(result.envelope.sources[0].excerpt, s.excerpt);
});

test("unknown/missing metadata, revision, invalid hash/selections and overbudget fail before dedupe", () => {
  const s = bundle.sources[0];
  for (const change of [
    { status: "stale" },
    { commit: "unknown" },
    { commit: "a".repeat(40) },
    { sha256: "0".repeat(64) },
    { excerpt: undefined },
    { path: undefined },
  ]) {
    assert.throws(() =>
      assembleOfflineContext(
        seal([{ ...s, ...change }]),
        "t",
        [key(s)],
        [key(s)],
        opt,
      ),
    );
  }
  assert.throws(() =>
    assembleOfflineContext(bundle, "t", [key(s)], [key(s), key(s)], opt),
  );
  assert.throws(() =>
    assembleOfflineContext(bundle, "t", [key(s)], ["outside/pool"], opt),
  );
  assert.throws(() =>
    assembleOfflineContext(bundle, "x".repeat(32000), [key(s)], [key(s)], opt),
  );
  assert.throws(() =>
    assembleOfflineContext(bundle, "t", [], [], {
      base_overlap: "exact-v1",
      live: true,
    }),
  );
  assert.throws(() =>
    assembleOfflineContext(bundle, "t", [], [], { base_overlap: "auto" }),
  );
});

test("three public DEV reconstructions: actual API output, runtime suffix accounted separately", () => {
  const suffix =
    " Não utilize ferramentas, shell ou código; responda somente com base nas fontes fornecidas.";
  for (const [position, before, after] of [
    [1, 4065, 2489],
    [3, 8193, 4676],
    [8, 5132, 5132],
  ]) {
    const replay = read(
      `docs/benchmarks/v03/evidencias/task103/offline-replay/position-${String(position).padStart(2, "0")}.json`,
    );
    const r = manifest.requests[position];
    const a = assembleOfflineContext(bundle, r.task, r.base, replay.retrieved);
    const b = assembleOfflineContext(
      bundle,
      r.task,
      r.base,
      replay.retrieved,
      opt,
    );
    a.envelope.instruction += suffix;
    b.envelope.instruction += suffix;
    assert.equal(Buffer.byteLength(JSON.stringify(a.envelope)), before);
    assert.equal(hash(JSON.stringify(a.envelope)), replay.context_sha256);
    assert.equal(Buffer.byteLength(JSON.stringify(b.envelope)), after);
    assert.equal(a.context_bytes - b.context_bytes, before - after);
  }
});
