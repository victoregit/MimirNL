import { assertPrivateMode } from "./platform-fixture.mjs";
import { pathToFileURL } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  rmSync,
  readFileSync,
  writeFileSync,
  statSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync, spawnSync } from "node:child_process";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { fixture, root, benchmarkModule } from "./abc-fixture.mjs";
const { executeABC } = await benchmarkModule("abc-runtime.mjs");
const {
  validateManifest,
  seal,
  authorize,
  parseStrictJSON,
  runtimeEnvelope,
  canonical,
  hash,
} = await benchmarkModule("abc-public.mjs");
const { metricsObservations } = await benchmarkModule("abc-export.mjs");
import { evaluateMetricsV02 } from "../scripts/benchmarks/metrics-v02.mjs";
import { transport } from "../scripts/benchmarks/abc-transport.mjs";
const temp = () => mkdtempSync(join(tmpdir(), "mimir-abc-test-"));
const cleanup = (p) => rmSync(p, { recursive: true, force: true });
test("ABC strict public schema, deep extras, tamper/code/epoch/legacy and authorization binding", () => {
  const { manifest: m } = fixture();
  validateManifest(m);
  assert.throws(() => parseStrictJSON('{"a":1,"\\u0061":2}'));
  assert.deepEqual(parseStrictJSON('{"a":[1,true,null,"s"]}'), {
    a: [1, true, null, "s"],
  });
  for (const mutate of [
    (x) => (x.schema_version = "public-cases-1"),
    (x) => (x.epoch = 0),
    (x) => (x.requests[0].case_id = "CANARY"),
    (x) => (x.bundle.sources[0].gold = "CANARY"),
    (x) => (x.limits.retry = 1),
    (x) => (x.code["src/core/service.ts"] = "0".repeat(64)),
    (x) => (x.config.policy = "legacy"),
    (x) => (x.requests[0].base = []),
  ]) {
    const x = structuredClone(m);
    mutate(x);
    assert.throws(() =>
      validateManifest(
        seal(
          Object.fromEntries(Object.entries(x).filter(([k]) => k !== "sha256")),
        ),
      ),
    );
  }
  const { sha256, ...payload } = m;
  const live = seal({ ...payload, stage: "run", synthetic: false });
  const a = {
    schema_version: "abc-authorization-0.2",
    manifest_sha256: live.sha256,
    epoch: live.epoch,
    reviewer_ref: "independent109",
    supervisor_ref: "supervisor",
    verdict: "APPROVE",
    max_attempts: 54,
  };
  authorize(live, a);
  for (const change of [
    { epoch: 2 },
    { manifest_sha256: m.sha256 },
    { max_attempts: 55 },
  ])
    assert.throws(() => authorize(live, { ...a, ...change }));
  assert.throws(() => authorize(m, a));
  assert.doesNotMatch(
    JSON.stringify(m),
    /case_id|case_revision|split|expected_answer|relevant_units|rubric|synthetic-author|synthetic-eval|receipt_sha256/,
  );
});
test("54 offline positions, 18 real SQLite searches, fresh DB/reset, preserved overlap and A=C, no LLM scoring", async () => {
  const p = temp();
  try {
    const f = fixture(),
      r = await executeABC({ manifest: f.manifest, out: join(p, "out") });
    assert.equal(r.actual_model_calls, 0);
    const linked = { ...f.coordinator, proposed_run_sha256: "a".repeat(64) };
    assert.equal(
      metricsObservations(linked, {
        ...r,
        manifest_sha256: linked.proposed_run_sha256,
      }).length,
      2,
    );
    assert.throws(() =>
      metricsObservations(linked, { ...r, manifest_sha256: "b".repeat(64) }),
    );
    assert.equal(r.synthetic_transport_calls, 54);
    assert.equal(r.retrieval_calls, 18);
    assert.equal(r.stopped, false);
    assert.equal(r.runs.filter((o) => o.status === "synthetic").length, 54);
    assert.equal(new Set(r.runs.map((o) => o.initial_db_sha256)).size, 1);
    assert.ok(
      r.runs.every(
        (o) =>
          o.cleanup === "completed" &&
          o.db_file_sha256 &&
          o.usage === null &&
          o.response === null,
      ),
    );
    for (let i = 0; i < 54; i += 3) {
      const rows = r.runs.slice(i, i + 3);
      assert.equal(
        rows.find((o) => o.scenario === "sem_memoria").context_sha256,
        rows.find((o) => o.scenario === "historico_completo").context_sha256,
      );
    }
    const request = f.manifest.requests[0],
      envelope = runtimeEnvelope(
        f.manifest.bundle,
        request.task,
        request.base,
        request.base,
      );
    assert.deepEqual(envelope.sources, envelope.retrieved);
    for (const [i, input] of metricsObservations(f.coordinator, r).entries()) {
      const scored = evaluateMetricsV02(
        f.casesBySplit[i],
        f.manifest.bundle,
        input,
      );
      assert.equal(scored.coverage[0].attempts, 0);
    }
    assertPrivateMode(join(p, "out"), 0o700);
    assertPrivateMode(join(p, "out/results.json"), 0o600);
    await assert.rejects(
      executeABC({ manifest: f.manifest, out: join(p, "out") }),
    );
  } finally {
    cleanup(p);
  }
});
test("no retry after spawn failure/truncation/invalid tool; all later slots remain not_run", async () => {
  for (const response of [
    { status: "spawn_error" },
    { status: "completed", exit_code: 0, response: "x".repeat(64001) },
    {
      status: "completed",
      exit_code: 0,
      response: "answer",
      tools_detected: true,
    },
  ]) {
    const p = temp();
    try {
      let calls = 0;
      const r = await executeABC({
        manifest: fixture().manifest,
        out: join(p, "out"),
        transportImpl: async () => {
          calls++;
          return response;
        },
      });
      assert.equal(calls, 1);
      assert.equal(r.synthetic_transport_calls, 1);
      assert.equal(r.actual_model_calls, 0);
      assert.equal(r.runs[0].status, "error");
      assert.equal(r.runs.filter((o) => o.status === "not_run").length, 53);
    } finally {
      cleanup(p);
    }
  }
});
test("run/search/global remaining includes synchronous work, no spawn after expiry, cleanup errors retained", async () => {
  for (const kind of ["global", "search", "cleanup"]) {
    const p = temp();
    try {
      let now = 0,
        calls = 0;
      const m = fixture().manifest;
      const r = await executeABC({
        manifest: m,
        out: join(p, "out"),
        clock: () => now,
        transportImpl: async () => {
          calls++;
          if (kind === "global") now = 7200001;
          return { status: "synthetic" };
        },
        searchHook: async (s, o) => {
          const result = await s.call("memory_search", o);
          if (kind === "search") now += 5001;
          return result;
        },
        cleanupHook: () => {
          if (kind === "cleanup") throw Error("synthetic cleanup");
        },
      });
      assert.equal(r.stopped, true);
      assert.ok(r.runs.some((o) => o.status === "not_run"));
      if (kind === "search") assert.equal(calls, 1);
      if (kind === "cleanup") assert.equal(r.runs[0].cleanup, "error_retained");
    } finally {
      cleanup(p);
    }
  }
  const p = temp();
  try {
    let t = 0;
    const r = await executeABC({
      manifest: fixture().manifest,
      out: join(p, "expired"),
      clock: () => {
        t += 120001;
        return t;
      },
      transportImpl: async () => {
        throw Error("must not spawn");
      },
    });
    assert.equal(r.synthetic_transport_calls, 0);
  } finally {
    cleanup(p);
  }
});
test("empty retrieval preserved without fallback; retrieval failure missing rather than zero", async () => {
  for (const failure of [false, true]) {
    const p = temp();
    try {
      const r = await executeABC({
        manifest: fixture().manifest,
        out: join(p, "out"),
        searchHook: async () =>
          failure ? { ok: false } : { ok: true, data: { memories: [] } },
      });
      const b = r.runs.find((o) => o.scenario === "com_mimir");
      assert.deepEqual(b.retrieved, failure ? null : []);
      assert.equal(b.status, failure ? "error" : "synthetic");
    } finally {
      cleanup(p);
    }
  }
});
test("help/validate/import side effect free; public process deep I/O canary blocks arbitrary private names", () => {
  const p = temp();
  try {
    const f = fixture(),
      mp = join(p, "manifest.json"),
      guard = join(p, "guard.mjs");
    writeFileSync(mp, JSON.stringify(f.manifest));
    writeFileSync(join(p, "unrelated.json"), "CANARY_GOLD");
    // Permit only exact public input and frozen executable inventory, including promise APIs.
    writeFileSync(
      guard,
      `import {fileURLToPath} from 'node:url';import fs from 'node:fs';import fsp from 'node:fs/promises';import {syncBuiltinESMExports} from 'node:module';const allowed=new Set(${JSON.stringify([mp, ...Object.keys(f.manifest.code).map((p) => join(root, p))])});for(const target of [fs,fsp])for(const name of ['readFileSync','readFile','openSync','open'])if(target[name]){const original=target[name];target[name]=function(p,...args){if(typeof p!=='number'&&!allowed.has(String(p).startsWith('file:')?fileURLToPath(p):String(p)))throw Error('Forbidden private I/O');return original.call(this,p,...args);};}syncBuiltinESMExports();`,
    );
    const cli = root + "/scripts/benchmarks/abc-cli.mjs";
    const output = execFileSync(
      process.execPath,
      ["--import", pathToFileURL(guard).href, cli, "validate", mp],
      { encoding: "utf8" },
    );
    assert.doesNotMatch(output, /CANARY|gold|case_id/);
    assert.equal(JSON.parse(output).actual_model_calls, 0);
    assert.equal(spawnSync(process.execPath, [cli, "--help"]).status, 0);
    assert.notEqual(
      spawnSync(process.execPath, [cli, "live", mp, join(p, "out")]).status,
      0,
    );
    execFileSync(process.execPath, [
      "--input-type=module",
      "-e",
      `await import(${JSON.stringify(pathToFileURL(cli).href)})`,
    ]);
  } finally {
    cleanup(p);
  }
});
test("transport kills owned child immediately on tool event, timeout, output cap and synchronous spawn errors", async () => {
  for (const kind of ["tool", "timeout", "capture", "spawn"]) {
    let killed = 0,
      child;
    const spawnImpl = () => {
      if (kind === "spawn") throw Error("synthetic spawn");
      child = new EventEmitter();
      child.stdin = new PassThrough();
      child.stdout = new PassThrough();
      child.stderr = new PassThrough();
      child.kill = () => {
        killed++;
        child.stdout.end();
        child.stderr.end();
        queueMicrotask(() => child.emit("close", null, "SIGKILL"));
      };
      if (kind !== "timeout")
        setImmediate(() =>
          child.stdout.write(
            JSON.stringify({
              type: "item.completed",
              item:
                kind === "tool"
                  ? { type: "command_execution", command: "never executed" }
                  : { type: "agent_message", text: "x".repeat(100) },
            }) + "\n",
          ),
        );
      return child;
    };
    const r = await transport({
      prompt: "public",
      scratch: tmpdir(),
      spawnImpl,
      timeoutMs: kind === "timeout" ? 10 : 1000,
      outputBytes: 50,
    });
    assert.notEqual(r.status, "completed");
    if (kind !== "spawn") assert.ok(killed > 0);
    if (kind === "tool") assert.equal(r.tools_detected, true);
    if (kind === "timeout") assert.equal(r.status, "timeout");
  }
});
test("public runtime I/O canary: exact input/code reads and owned fixture files only", () => {
  const p = temp();
  try {
    const f = fixture(),
      mp = join(p, "manifest.json"),
      script = join(p, "public-process.mjs"),
      out = join(p, "out"),
      privatePath = join(p, "arbitrary-name.json");
    writeFileSync(mp, JSON.stringify(f.manifest));
    writeFileSync(privatePath, "PRIVATE_CANARY");
    writeFileSync(
      script,
      `import fs from 'node:fs';import fsp from 'node:fs/promises';import {fileURLToPath} from 'node:url';import {dirname,basename,join} from 'node:path';import {syncBuiltinESMExports} from 'node:module';import {executeABC} from ${JSON.stringify(pathToFileURL(join(root, "scripts/benchmarks/abc-runtime.mjs")).href)};const allowed=new Set(${JSON.stringify([mp, ...Object.keys(f.manifest.code).map((p) => join(root, p))])});const prefix=${JSON.stringify(join("", "fixture-"))};const outputPrefix=${JSON.stringify(out)};for(const target of [fs,fsp])for(const name of ['readFileSync','readFile','openSync','open'])if(target[name]){const original=target[name];target[name]=function(p,...args){const path=typeof p==='number'?null:String(p).startsWith('file:')?fileURLToPath(p):String(p);if(path&&!allowed.has(path)&&!(dirname(dirname(path))===outputPrefix&&basename(dirname(path)).startsWith(prefix)&&['history.txt','db.sqlite'].includes(basename(path)))&&!(args[0]==='wx'&&dirname(path)===outputPrefix&&/^(?:position-[0-9]{2}|results)\\.json$/.test(basename(path))))throw Error('Forbidden I/O');return original.call(this,p,...args);};}syncBuiltinESMExports();let blocked=false;try{fs.readFileSync(${JSON.stringify(privatePath)});}catch{blocked=true;}if(!blocked)throw Error('Canary not blocked');const m=JSON.parse(fs.readFileSync(${JSON.stringify(mp)}));const r=await executeABC({manifest:m,out:${JSON.stringify(out)}});console.log(JSON.stringify({positions:r.runs.filter(o=>o.status==='synthetic').length,calls:r.actual_model_calls}));`,
    );
    const output = execFileSync(process.execPath, [script], {
      encoding: "utf8",
    });
    assert.deepEqual(JSON.parse(output), { positions: 54, calls: 0 });
    assert.doesNotMatch(output, /PRIVATE_CANARY/);
  } finally {
    cleanup(p);
  }
});
test("cancellation before transport retains diagnostics and remaining not_run without retry", async () => {
  const p = temp();
  try {
    let calls = 0;
    const r = await executeABC({
      manifest: fixture().manifest,
      out: join(p, "out"),
      searchHook: async (s, o) => {
        process.emit("SIGINT");
        return s.call("memory_search", o);
      },
      transportImpl: async () => {
        calls++;
        return { status: "synthetic" };
      },
    });
    assert.equal(calls, 1);
    assert.equal(
      r.runs.find((o) => o.scenario === "com_mimir").diagnostic,
      "cancelled",
    );
    assert.ok(r.stopped);
  } finally {
    cleanup(p);
  }
});
test(
  "real fake subprocess timeout terminates the owned POSIX process group",
  { skip: process.platform === "win32" },
  async () => {
    const { spawn } = await import("node:child_process");
    let pid;
    const spawnImpl = (_binary, _args, options) => {
      const child = spawn(
        process.execPath,
        ["-e", "process.stdin.resume();setInterval(()=>{},1000)"],
        options,
      );
      pid = child.pid;
      return child;
    };
    const r = await transport({
      prompt: "synthetic only",
      scratch: tmpdir(),
      spawnImpl,
      timeoutMs: 50,
    });
    assert.equal(r.status, "timeout");
    assert.throws(() => process.kill(pid, 0), { code: "ESRCH" });
  },
);
