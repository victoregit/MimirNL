import { test } from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import {
  MODEL,
  parseOutput,
  transport,
} from "../scripts/benchmarks/antigravity-usage.mjs";
const envelope = (extra = {}) =>
  JSON.stringify({ status: "SUCCESS", response: "PRIVATE_CANARY_é", ...extra });

test("strict calibration envelope and private response isolation", () => {
  const result = parseOutput(
    envelope({
      secret: "ignored",
      usage: {
        input_tokens: 0,
        cache_read_tokens: 99,
        total_tokens: 4,
        secret: "ignored",
      },
    }),
  );
  assert.equal(result.status, "completed");
  assert.equal(result.usage, null);
  assert.deepEqual(result.provider_usage.counters, {
    input_tokens: 0,
    cache_read_tokens: 99,
    total_tokens: 4,
  });
  const { response, ...metadata } = result;
  assert.equal(response, "PRIVATE_CANARY_é");
  assert.ok(!JSON.stringify(metadata).includes("PRIVATE_CANARY"));
  assert.ok(!JSON.stringify(metadata).includes("ignored"));
});

test("absent, overflow, negative and ambiguous counters never become zero or sums", () => {
  for (const usage of [
    undefined,
    null,
    [],
    {
      input_tokens: -1,
      output_tokens: Number.MAX_SAFE_INTEGER + 1,
      thinking_tokens: "3",
    },
  ]) {
    const result = parseOutput(envelope({ usage }));
    assert.equal(result.usage, null);
    assert.equal(result.provider_usage, null);
  }
});

test("unknown lifecycle, malformed schema and response bounds fail closed", () => {
  for (const value of [
    "{}",
    "null",
    "[]",
    "{",
    envelope({ response: 1 }),
    envelope({ response: "x".repeat(262145) }),
  ])
    assert.equal(parseOutput(value).status, "invalid_schema");
  for (const status of ["FAILED", "success", "NEW_STATE"])
    assert.equal(parseOutput(envelope({ status })).status, "incomplete");
});

function fake(action) {
  return (command, args, options) => {
    assert.equal(command, "agy");
    assert.equal(options.shell, false);
    assert.equal(options.cwd, "/tmp/offline-scratch");
    for (const flag of ["--sandbox", "--disable-slash-commands", "--log-file"])
      assert.ok(args.includes(flag));
    assert.equal(args[args.indexOf("--model") + 1], MODEL);
    assert.equal(args[args.indexOf("--mode") + 1], "plan");
    for (const flag of [
      "--continue",
      "--conversation",
      "--dangerously-skip-permissions",
    ])
      assert.ok(!args.includes(flag));
    const child = new EventEmitter();
    child.stdout = new PassThrough();
    child.stderr = new PassThrough();
    child.kill = () => {
      queueMicrotask(() => child.emit("close", null, "SIGKILL"));
    };
    queueMicrotask(() => action(child));
    return child;
  };
}
const options = { prompt: "synthetic", scratch: "/tmp/offline-scratch" };

test("chunked UTF8 JSON, fixed command and close chronology", async () => {
  let time = 0;
  const result = await transport({
    ...options,
    clock: () => time,
    spawnImpl: fake((child) => {
      const bytes = Buffer.from(envelope());
      for (const byte of bytes) child.stdout.write(Buffer.from([byte]));
      time = 17;
      child.emit("close", 0, null);
    }),
  });
  assert.equal(result.response, "PRIVATE_CANARY_é");
  assert.equal(result.wall_ms, 17);
  assert.equal(result.first_agent_message_completed_ms, 17);
  assert.equal(result.tools_detected, null);
});

test("nonzero exit, spawn failure, timeout and stream caps", async () => {
  for (const [expected, action] of [
    [
      "failed",
      (c) => {
        c.stdout.write(envelope());
        c.emit("close", 2, null);
      },
    ],
    ["spawn_error", (c) => c.emit("error", new Error("PRIVATE_CANARY"))],
    ["timeout", () => {}],
    ["stdout_limit", (c) => c.stdout.write(Buffer.alloc(1048577))],
    ["stderr_limit", (c) => c.stderr.write(Buffer.alloc(1048577))],
  ]) {
    const result = await transport({
      ...options,
      timeoutMs: 5,
      spawnImpl: fake(action),
    });
    assert.equal(result.status, expected);
    assert.equal(result.first_agent_message_completed_ms, null);
    assert.ok(!JSON.stringify(result).includes("PRIVATE_CANARY"));
  }
});

test("invalid options reject before spawning", async () => {
  await assert.rejects(
    transport({
      ...options,
      prompt: "x".repeat(1048577),
      spawnImpl: () => assert.fail(),
    }),
  );
});
