import { withSymlink } from "./platform-fixture.mjs";
import { assertPrivateMode } from "./platform-fixture.mjs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  statSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import {
  diagnoseCache,
  main,
} from "../scripts/benchmarks/cache-diagnostic.mjs";
const slot = (
  usage = {
    input_tokens: 100,
    cached_input_tokens: 70,
    output_tokens: 8,
    total_tokens: 108,
  },
) => ({
  status: "completed",
  exit_code: 0,
  tools_detected: false,
  usage,
  response: "PRIVATE",
});
const result = (s) => ({
  schema_version: "codex-multicase-result-1",
  simulation: false,
  not_execution_proof: false,
  positions: s,
});
test("cache subset derivations, zero, missing, inconsistent, failed and synthetic coverage", () => {
  const d = diagnoseCache(result([slot()]));
  assert.equal(d.rows[0].uncached_input_tokens, 30);
  assert.equal(d.rows[0].cache_hit_ratio, 0.7);
  assert.equal(d.aggregate.total_tokens, 108);
  assert.ok(!JSON.stringify(d).includes("PRIVATE"));
  const zero = diagnoseCache(
    result([
      slot({
        input_tokens: 0,
        cached_input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0,
      }),
    ]),
  ).rows[0];
  assert.equal(zero.cache_hit_ratio, null);
  assert.equal(zero.ratio_reason, "zero_input");
  assert.equal(zero.uncached_input_tokens, 0);
  for (const usage of [
    null,
    {},
    { input_tokens: 1, cached_input_tokens: 2, output_tokens: 3 },
    {
      input_tokens: 1,
      cached_input_tokens: 0,
      output_tokens: 3,
      total_tokens: 9,
    },
  ]) {
    const r = diagnoseCache(result([slot(), slot(usage)]));
    assert.equal(r.aggregate, null);
    assert.equal(r.coverage.eligible, 1);
    assert.equal(r.rows[1].uncached_input_tokens, null);
  }
  const r = diagnoseCache(
    result([
      { ...slot(), status: "failed" },
      { ...slot(), usage_status: "synthetic-test" },
    ]),
  );
  assert.equal(r.coverage.eligible, 0);
  assert.equal(r.rows[0].raw_usage.input_tokens, 100);
  assert.equal(r.rows[1].synthetic, true);
  assert.throws(() => diagnoseCache({ positions: [] }));
});
test("explicit read, exclusive private output, symlink refusal", () => {
  const dir = mkdtempSync(join(tmpdir(), "mimir-cache-test-"));
  try {
    const input = dir + "/result.json";
    writeFileSync(input, JSON.stringify(result([slot()])));
    assert.equal(main(["--result", input, "--out", dir + "/out"]), 0);
    assertPrivateMode(dir + "/out", 0o700);
    assertPrivateMode(dir + "/out/cache-report.json", 0o600);
    const prior = readFileSync(dir + "/out/cache-report.json", "utf8");
    assert.equal(main(["--result", input, "--out", dir + "/out"]), 1);
    assert.equal(readFileSync(dir + "/out/cache-report.json", "utf8"), prior);
    withSymlink(input, dir + "/link.json", () => {
      assert.equal(main(["--result", dir + "/link.json"]), 1);
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
