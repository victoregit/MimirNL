import { fileURLToPath } from "node:url";
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
const launcher = new URL(
  "../scripts/benchmarks/task104-launch.mjs",
  import.meta.url,
);
const manifest = fileURLToPath(
  new URL(
    "../docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json",
    import.meta.url,
  ),
);
const run = (args) =>
  spawnSync(process.execPath, [fileURLToPath(launcher), ...args], {
    encoding: "utf8",
  });
test("import and help have no runtime loading or execution", () => {
  const result = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `await import(${JSON.stringify(launcher.href)});`,
    ],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
  for (const args of [[], ["--help"]]) {
    const help = run(args);
    assert.equal(help.status, 0);
    assert.match(help.stdout, /supervisor-authenticated/);
    assert.equal(help.stderr, "");
  }
});
test("invalid arguments reject without execution", () => {
  for (const args of [
    ["live"],
    ["relative", "/tmp/auth", "/tmp/out"],
    ["--help", "extra"],
  ])
    assert.equal(run(args).status, 1);
});
test("strict invalid authorizations fail before runtime and output creation", () => {
  const dir = mkdtempSync(join(tmpdir(), "mimir-task113-test-"));
  try {
    const auth = join(dir, "authorization.json"),
      out = join(dir, "never-created");
    // All fixtures are intentionally invalid, never usable authorizations.
    for (const text of [
      "{}",
      '{"epoch":1,"epoch":1}',
      JSON.stringify({
        schema_version: "abc-authorization-0.2",
        manifest_sha256: "wrong",
        epoch: 1,
        reviewer_ref: "synthetic",
        supervisor_ref: "synthetic",
        verdict: "DENY",
        max_attempts: 0,
        extra: true,
      }),
    ]) {
      writeFileSync(auth, text, { mode: 0o600 });
      const result = run([manifest, auth, out]);
      assert.equal(result.status, 1);
      assert.equal(result.stdout, "");
      assert.equal(result.stderr, "Task104 launch failed\n");
      assert.equal(existsSync(out), false);
    }
  } finally {
    rmSync(dir, { recursive: true });
  }
});
