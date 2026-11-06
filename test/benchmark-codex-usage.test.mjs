import { withSymlink } from "./platform-fixture.mjs";
import { assertPrivateMode } from "./platform-fixture.mjs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, statSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createUsageCollector } from "../scripts/benchmarks/codex-usage.mjs";
import {
  collectStream,
  MAX_LINE_BYTES,
  MAX_BYTES,
} from "../scripts/benchmarks/codex-usage-cli.mjs";
const start = { type: "turn.started" };
const done = (
  input_tokens = 8,
  cached_input_tokens = 3,
  output_tokens = 2,
) => ({
  type: "turn.completed",
  usage: { input_tokens, cached_input_tokens, output_tokens },
});
const cli = new URL(
  "../scripts/benchmarks/codex-usage-cli.mjs",
  import.meta.url,
);
const run = (events, args = []) =>
  spawnSync(process.execPath, [fileURLToPath(cli), ...args], {
    input:
      typeof events === "string"
        ? events
        : events.map(JSON.stringify).join("\n"),
    encoding: "utf8",
    timeout: 5000,
  });
test("reports usage once, excludes cache from total and strips private canaries", () => {
  const c = createUsageCollector();
  [
    start,
    { type: "future.event", secret: "PRIVATE_CANARY" },
    {
      type: "item.completed",
      item: { type: "agent_message", text: "PRIVATE_CANARY" },
    },
    done(),
  ].forEach((e, i) => c.observe(e, i));
  const r = c.finish(9);
  assert.equal(r.usage.total_tokens, 10);
  assert.equal(r.timing.first_agent_message_completed_ms, 2);
  assert.equal(r.timing.turn_completed_ms, 3);
  assert.equal(r.timing.ttft.status, "unavailable");
  assert.equal(JSON.stringify(r).includes("PRIVATE_CANARY"), false);
  assert.throws(() => c.observe(done(), 10));
});
test("absence, failure and valid zero remain distinct", () => {
  assert.equal(createUsageCollector().finish(0).usage, null);
  const c = createUsageCollector();
  c.observe(start, 0);
  c.observe({ type: "error", message: "PRIVATE_CANARY" }, 1);
  c.observe({ type: "turn.failed", error: { message: "PRIVATE_CANARY" } }, 2);
  assert.equal(c.finish(3).status, "failed");
  assert.equal(c.finish(3).usage, null);
  const z = createUsageCollector();
  z.observe(start, 0);
  z.observe(done(0, 0, 0), 1);
  assert.equal(z.finish(2).usage.total_tokens, 0);
});
test("rejects invalid numbers, structures, duplicate starts and terminals", () => {
  for (const e of [
    done(-1),
    done(Infinity),
    done(Number.MAX_SAFE_INTEGER + 1),
    done("8"),
    null,
    [],
    done(1, 2),
    done(1.5, 0),
    done(Number.MAX_SAFE_INTEGER, 0, 1),
    { type: "turn.completed", usage: { input_tokens: 1, output_tokens: 1 } },
    { type: "turn.completed" },
    { type: "item.completed" },
    start,
    { type: "turn.failed", error: null },
  ]) {
    const c = createUsageCollector();
    c.observe(start, 0);
    assert.throws(() => c.observe(e, 1));
  }
  const c = createUsageCollector();
  assert.throws(() => c.observe(done(), 0));
  c.observe(start, 2);
  assert.throws(() => c.observe({ type: "extra" }, 1));
  assert.throws(() => createUsageCollector({ chronology: "real-replay" }));
});
test("stream handles chunked UTF8, CRLF, final line and injected clock", async () => {
  const text = [start, { type: "extra", text: "ação" }, done()]
    .map(JSON.stringify)
    .join("\r\n");
  const bytes = Buffer.from(text);
  let now = 10;
  const r = await collectStream(
    Readable.from([...bytes].map((b) => Buffer.from([b]))),
    { clock: () => now++ },
  );
  assert.equal(r.timing.first_event_ms, 1);
  assert.equal(r.timing.elapsed_ms, 4);
  assert.equal(r.usage.total_tokens, 10);
});
test("stream rejects malformed, blank, invalid UTF8, oversize and read errors", async () => {
  for (const input of [
    "{PRIVATE_CANARY",
    "\n",
    Buffer.from([255]),
    "x".repeat(MAX_LINE_BYTES + 1),
  ])
    await assert.rejects(
      collectStream(Readable.from([input])),
      /Unable to collect input stream/,
    );
  await assert.rejects(
    collectStream(
      Readable.from(
        (async function* () {
          throw new Error("PRIVATE_CANARY");
        })(),
      ),
    ),
  );
  await assert.rejects(
    collectStream(Readable.from([Buffer.alloc(MAX_BYTES + 1)])),
  );
  assert.equal((await collectStream(Readable.from([]))).status, "incomplete");
});
test("CLI runs offline, has fixed diagnostics and exclusively creates private outputs", () => {
  assert.equal(run([], ["--help"]).status, 0);
  assert.equal(run("", ["--bad"]).status, 1);
  assert.equal(JSON.parse(run([start, done()]).stdout).status, "completed");
  const bad = run("PRIVATE_CANARY");
  assert.equal(bad.status, 1);
  assert.equal((bad.stdout + bad.stderr).includes("PRIVATE_CANARY"), false);
  const dir = mkdtempSync(join(tmpdir(), "mimir-usage-"));
  try {
    const path = join(dir, "report.json");
    assert.equal(run([start, done()], ["--out", path]).status, 0);
    assertPrivateMode(path, 0o600);
    const before = readFileSync(path, "utf8");
    assert.equal(run([start, done()], ["--out", path]).status, 1);
    const link = join(dir, "link");
    withSymlink(path, link, () => {
      assert.equal(run([start, done()], ["--out", link]).status, 1);
    });
    assert.equal(readFileSync(path, "utf8"), before);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("import has no side effects and all post-terminal events are rejected", () => {
  const imported = spawnSync(
    process.execPath,
    ["--input-type=module", "-e", `await import(${JSON.stringify(cli.href)})`],
    { encoding: "utf8", timeout: 5000 },
  );
  assert.equal(imported.status, 0);
  assert.equal(imported.stdout + imported.stderr, "");
  for (const event of [start, done(), { type: "future.event" }]) {
    const c = createUsageCollector();
    c.observe(start, 0);
    c.observe(done(), 1);
    assert.throws(() => c.observe(event, 2));
  }
});
