import { assertPrivateMode } from "./platform-fixture.mjs";
import { tmpdir } from "node:os";
import { pinnedSourceFixture } from "./pinned-source-fixture.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { spawn, spawnSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  mkdtempSync,
  rmSync,
  readdirSync,
  existsSync,
  statSync,
} from "node:fs";
import { join, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  exportCases,
  loadLegacy,
} from "../scripts/benchmarks/export-cases.mjs";
import { ARMS } from "../scripts/benchmarks/public-bundle.mjs";
import {
  sealManifest,
  validateManifest,
  parsePublicJSON,
  runPrepared,
} from "../scripts/benchmarks/multicase-codex.mjs";
import {
  HOST,
  transport,
  argsFor,
} from "../scripts/benchmarks/multicase-codex-transport.mjs";
const root = fileURLToPath(new URL("../", import.meta.url)).replace(/\/$/, "");
const sourceRoot = pinnedSourceFixture(root);
const docs = join(root, "docs/benchmarks/v03");
const bundle = exportCases({
  root: sourceRoot,
  cases: [
    ...JSON.parse(readFileSync(join(docs, "corpus-ampliado.json"))),
    ...loadLegacy(readFileSync(join(docs, "casos.md"), "utf8")),
  ],
  protocol: JSON.parse(readFileSync(join(docs, "protocolo-ampliado.json"))),
});
const ids = ["expanded-budget-envelope", "expanded-production-p95-absent"];
function manifest(out, changes = {}) {
  return sealManifest({
    schema_version: "codex-multicase-plan-1",
    status: "proposed",
    bundle_sha256: bundle.sha256,
    cases: ids.map((case_id) => ({ case_id, case_revision: 1 })),
    arms: ARMS,
    repetitions: 1,
    offset: 0,
    host: HOST,
    limits: {
      max_calls: 4,
      output_bytes: 64000,
      call_ms: 90000,
      total_ms: 600000,
      context_bytes: 32000,
    },
    out,
    ...changes,
  });
}
const events = (model = true) => [
  { type: "thread.started", ...(model ? { model: HOST.requested_model } : {}) },
  { type: "turn.started" },
  {
    type: "item.completed",
    item: { type: "agent_message", text: "PUBLIC RESPONSE" },
  },
  {
    type: "turn.completed",
    usage: { input_tokens: 100, cached_input_tokens: 70, output_tokens: 8 },
  },
];
const jsonl = (es) => es.map((e) => JSON.stringify(e)).join("\n") + "\n";
function fake(data = jsonl(events()), inspect = () => {}, code = 0) {
  return (bin, args, options) => {
    const child = new EventEmitter();
    child.stdin = new PassThrough();
    child.stdout = new PassThrough();
    child.stderr = new PassThrough();
    child.kill = () => {};
    let prompt = "";
    child.stdin.on("data", (b) => (prompt += b));
    child.stdin.on("finish", () => {
      queueMicrotask(() => {
        inspect({ bin, args, options, prompt });
        child.stdout.end(data);
        child.stderr.end();
        setImmediate(() => child.emit("close", code, null));
      });
    });
    return child;
  };
}
const temporary = (fn) => async () => {
  const dir = mkdtempSync(join(tmpdir(), "mimir-task87-test-"));
  try {
    await fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};
test(
  "four public positions, AB/BA, usage/cache subset, real fixture search, exclusive evidence and cleanup",
  temporary(async (dir) => {
    const m = manifest(join(dir, "out"));
    let calls = 0;
    const r = await runPrepared({
      bundle,
      manifest: m,
      simulation: true,
      spawnImpl: fake(jsonl(events()), ({ bin, args, options, prompt }) => {
        calls++;
        assert.equal(bin, HOST.binary);
        assert.deepEqual(args, argsFor(options.cwd));
        assert.equal(options.detached, true);
        assert.deepEqual(readdirSync(options.cwd), []);
        assert.equal(options.shell, undefined);
        assert.equal(options.env.CAO_TERMINAL_ID, undefined);
        for (const id of ids) {
          assert.ok(!prompt.includes(id));
          assert.ok(!JSON.stringify(args).includes(id));
        }
        const env = JSON.parse(prompt);
        assert.deepEqual(env.history, []);
        assert.deepEqual(Object.keys(env).sort(), [
          "history",
          "instruction",
          "question",
          "sources",
        ]);
        const c = bundle.cases.find((c) => c.question === env.question);
        assert.ok(c);
        if (calls === 1 || calls === 4)
          assert.equal(env.sources.length, c.sources.length);
        for (const s of env.sources)
          assert.ok(c.sources.some((orig) => orig.excerpt === s.excerpt));
      }),
    });
    assert.equal(calls, 4);
    assert.equal(r.actual_model_calls, 0);
    assert.equal(r.completed_calls, 0);
    assert.equal(r.simulated_attempts, 4);
    assert.deepEqual(
      r.positions.map((s) => s.condition),
      [ARMS[0], ARMS[1], ARMS[1], ARMS[0]],
    );
    assert.equal(r.positions.filter((s) => s.retrieval_calls === 1).length, 2);
    for (const s of r.positions) {
      assert.equal(s.simulated_status, "completed");
      assert.equal(s.usage.total_tokens, 108);
      assert.equal(s.usage.cached_input_tokens, 70);
      assert.equal(s.usage_status, "synthetic-test");
      assert.equal(s.model_divergence, false);
    }
    assertPrivateMode(m.out, 0o700);
    for (const f of readdirSync(m.out))
      assertPrivateMode(join(m.out, f), 0o600);
    await assert.rejects(
      runPrepared({
        bundle,
        manifest: m,
        simulation: true,
        spawnImpl: () => assert.fail("overwrite"),
      }),
    );
  }),
);
test(
  "schema/hash/extras/revisions/order/call ceiling and missing operational authorization fail before artifacts/spawn",
  temporary(async (dir) => {
    const base = manifest(join(dir, "out"));
    const bad = [
      { ...base, sha256: "bad" },
      { ...base, extra: true },
      manifest(base.out, { host: { ...HOST, command: "bad" } }),
      manifest(base.out, { cases: [{ case_id: ids[0], case_revision: 2 }] }),
      manifest(base.out, { limits: { ...base.limits, max_calls: 3 } }),
      manifest(base.out, { cases: [...base.cases].reverse() }),
      manifest(base.out, { limits: { ...base.limits, extra: 1 } }),
      manifest(base.out, { arms: [...ARMS].reverse() }),
      manifest(base.out, { cases: [...base.cases, base.cases[0]] }),
    ];
    for (const m of bad)
      await assert.rejects(
        runPrepared({
          bundle,
          manifest: m,
          simulation: true,
          spawnImpl: () => assert.fail("spawn"),
        }),
      );
    await assert.rejects(runPrepared({ bundle, manifest: base }));
    assert.equal(existsSync(base.out), false);
    assert.throws(() => parsePublicJSON('{"a":1,"a":2}'));
    assert.throws(() => parsePublicJSON('{"a":[{"x":1,"x":2}]}'));
    assert.deepEqual(parsePublicJSON('{"a":[1,{"x":2}],"b":true}'), {
      a: [1, { x: 2 }],
      b: true,
    });
  }),
);
test(
  "cap infeasible does not truncate or spawn; positions and fixture cleanup conserved",
  temporary(async (dir) => {
    const b = manifest(join(dir, "out"));
    const m = manifest(b.out, {
      limits: { ...b.limits, context_bytes: 1 },
      offset: 1,
    });
    const r = await runPrepared({
      bundle,
      manifest: m,
      simulation: true,
      spawnImpl: () => assert.fail("cap"),
    });
    assert.equal(r.positions[0].status, "infeasible");
    assert.equal(r.positions[0].retrieval_calls, 1);
    assert.equal(r.positions[1].status, "not_run");
    assert.equal(r.simulated_attempts, 0);
    assert.ok(!readdirSync(m.out).some((f) => f.startsWith("slot-")));
  }),
);
test(
  "malformed/failed/error/tool/empty/oversized streams and nonzero exits never complete",
  temporary(async (dir) => {
    const variants = [
      ["invalid\n", "stream_error"],
      [
        jsonl([
          { type: "turn.started" },
          { type: "turn.failed", error: { message: "private detail" } },
        ]),
        "incomplete",
      ],
      [
        jsonl([
          { type: "turn.started" },
          { type: "error", message: "x" },
          ...events().slice(2),
        ]),
        "incomplete",
      ],
      [
        jsonl([
          ...events().slice(0, 2),
          { type: "item.started", item: { type: "command_execution" } },
          ...events().slice(2),
        ]),
        "invalid_tools",
      ],
      [
        jsonl(
          events().map((e) =>
            e.item ? { ...e, item: { ...e.item, text: "" } } : e,
          ),
        ),
        "incomplete",
      ],
      [
        jsonl(
          events().map((e) =>
            e.item ? { ...e, item: { ...e.item, text: "x".repeat(100) } } : e,
          ),
        ),
        "limit",
      ],
    ];
    for (const [data, status] of variants) {
      const r = await transport({
        prompt: "public",
        scratch: dir,
        timeoutMs: 1000,
        outputBytes: 50,
        spawnImpl: fake(data),
      });
      assert.equal(r.status, status);
    }
    const r = await transport({
      prompt: "public",
      scratch: dir,
      timeoutMs: 1000,
      spawnImpl: fake(jsonl(events(false)), () => {}, 1),
    });
    assert.equal(r.status, "exit_nonzero");
    assert.equal(r.model_identity.status, "unavailable");
    const missing = await transport({
      prompt: "public",
      scratch: dir,
      timeoutMs: 1000,
      spawnImpl: fake(jsonl([{ type: "turn.started" }])),
    });
    assert.equal(missing.usage, null);
  }),
);
test(
  "first error halts without retry and preserves remaining positions",
  temporary(async (dir) => {
    let calls = 0;
    const m = manifest(join(dir, "out"), { offset: 1 });
    const r = await runPrepared({
      bundle,
      manifest: m,
      simulation: true,
      spawnImpl: fake("bad\n", () => calls++),
    });
    assert.equal(calls, 1);
    assert.equal(r.positions[0].simulated_status, "stream_error");
    assert.equal(r.positions.filter((s) => s.status === "not_run").length, 3);
    assert.ok(!readdirSync(m.out).some((f) => f.startsWith("slot-")));
    assert.ok(existsSync(join(m.out, "result.json")));
  }),
);
test(
  "timeout kills owned group including pipe-inheriting descendant",
  temporary(async (dir) => {
    let child;
    const r = await transport({
      prompt: "public",
      scratch: dir,
      timeoutMs: 150,
      spawnImpl: (_b, _a, opts) => {
        child = spawn(
          process.execPath,
          [
            "--input-type=module",
            "-e",
            `import {spawn} from 'node:child_process'; spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'inherit'}); setInterval(()=>{},1000);`,
          ],
          opts,
        );
        return child;
      },
    });
    assert.equal(r.status, "timeout");
    assert.equal(child.signalCode, "SIGKILL");
    assert.equal(r.usage, null);
  }),
);
test(
  "remaining budget bounds timeout and prevents further calls",
  temporary(async (dir) => {
    let time = 0,
      calls = 0;
    const b = manifest(join(dir, "out"));
    const m = manifest(b.out, { limits: { ...b.limits, total_ms: 50 } });
    const r = await runPrepared({
      bundle,
      manifest: m,
      simulation: true,
      clock: () => time,
      spawnImpl: fake(jsonl(events()), () => {
        calls++;
        time = 51;
      }),
    });
    assert.equal(calls, 1);
    assert.equal(r.positions[1].exclusion, "run_budget");
    assert.equal(r.positions.length, 4);
  }),
);
test(
  "validation subprocess reads only explicit public files, no private data or subprocess",
  temporary(async (dir) => {
    const input = join(dir, "bundle.json"),
      mp = join(dir, "manifest.json"),
      m = manifest(join(dir, "out"));
    writeFileSync(input, JSON.stringify(bundle));
    writeFileSync(mp, JSON.stringify(m));
    const code = `import fs from 'node:fs';import cp from 'node:child_process';import {syncBuiltinESMExports} from 'node:module';
  const allowed=${JSON.stringify([input, mp])}; const read=fs.readFileSync,open=fs.openSync;
  fs.readFileSync=(p,...a)=>{if(typeof p==='number'||/\\.(mjs|js)$/.test(String(p)))return read(p,...a);throw Error('private-read');};
  fs.openSync=(p,...a)=>{if(allowed.includes(p)||/\\.(mjs|js)$/.test(String(p)))return open(p,...a);throw Error('private-open');};
  cp.spawn=()=>{throw Error('no-spawn');};cp.execFileSync=()=>{throw Error('no-exec');};syncBuiltinESMExports();
  const {main}=await import(${JSON.stringify(pathToFileURL(join(root, "scripts/benchmarks/multicase-codex.mjs")).href)});process.exitCode=await main(['--validate','--bundle',${JSON.stringify(input)},'--manifest',${JSON.stringify(mp)}]);`;
    const r = spawnSync(process.execPath, ["--input-type=module", "-e", code], {
      cwd: dir,
      encoding: "utf8",
    });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(JSON.parse(r.stdout).positions, 4);
    assert.equal(existsSync(m.out), false);
  }),
);
test(
  "continuous B timer includes search once, excludes setup/close, timeout uses remaining budget",
  temporary(async (dir) => {
    const { Service } = await import("../dist/index.js");
    const call = Service.prototype.call,
      close = Service.prototype.close,
      timer = globalThis.setTimeout;
    let time = 0;
    const delays = [];
    Service.prototype.call = async function (op, args) {
      if (op === "project_register") time += 20;
      if (op === "memory_search") time += 7;
      return call.call(this, op, args);
    };
    Service.prototype.close = function () {
      time += 3;
      return close.call(this);
    };
    globalThis.setTimeout = (fn, ms, ...args) => {
      delays.push(ms);
      return timer(fn, ms, ...args);
    };
    try {
      const b = manifest(join(dir, "out"));
      const m = manifest(b.out, {
        offset: 1,
        limits: { ...b.limits, total_ms: 100 },
      });
      const r = await runPrepared({
        bundle,
        manifest: m,
        simulation: true,
        clock: () => time,
        spawnImpl: fake(jsonl(events()), () => {
          time += 10;
        }),
      });
      assert.deepEqual(
        r.positions.map((s) => s.end_to_end_ms),
        [17, 10, 10, 17],
      );
      assert.equal(r.positions[0].setup_ms, 20);
      assert.equal(r.positions[0].retrieval_ms, 7);
      assert.deepEqual(delays, [73, 60, 50, 13]);
    } finally {
      Service.prototype.call = call;
      Service.prototype.close = close;
      globalThis.setTimeout = timer;
    }
  }),
);
test(
  "execution subprocess allows only bundle/manifest/owned files and controlled JSONL, real retrieval",
  temporary(async (dir) => {
    const input = join(dir, "bundle.json"),
      mp = join(dir, "manifest.json"),
      m = manifest(join(dir, "out"));
    writeFileSync(input, JSON.stringify(bundle));
    writeFileSync(mp, JSON.stringify(m));
    const code = `import fs from 'node:fs';import cp from 'node:child_process';import {EventEmitter} from 'node:events';import {PassThrough} from 'node:stream';import {syncBuiltinESMExports} from 'node:module';
  const input=${JSON.stringify(input)},mp=${JSON.stringify(mp)},out=${JSON.stringify(m.out)};
  const read=fs.readFileSync,open=fs.openSync,exec=cp.execFileSync;
  fs.readFileSync=(p,...a)=>{if(typeof p==='number'||/\\.(mjs|js)$/.test(String(p)))return read(p,...a);throw Error('private-read');};
  fs.openSync=(p,...a)=>{if([input,mp].includes(p)||String(p).startsWith(out+${JSON.stringify(sep)})||/\\.(mjs|js)$/.test(String(p)))return open(p,...a);throw Error('private-open');};
  cp.spawn=()=>{throw Error('no-model');};
  cp.execFileSync=(bin,args,...a)=>{if(bin!=='git'||!((args[0]==='init'&&args[2].startsWith(out+${JSON.stringify(sep + "slot-")}))||(args.at(-1)==='--show-toplevel'&&a[0]?.cwd?.startsWith(out+${JSON.stringify(sep + "slot-")}))))throw Error('private-process');return exec(bin,args,...a);};
  syncBuiltinESMExports();const {readExplicit}=await import(${JSON.stringify(pathToFileURL(join(root, "scripts/benchmarks/offline-files.mjs")).href)});
  const {runPrepared}=await import(${JSON.stringify(pathToFileURL(join(root, "scripts/benchmarks/multicase-codex.mjs")).href)});
  const makeFake=${fake.toString()};
  const r=await runPrepared({bundle:JSON.parse(readExplicit(input)),manifest:JSON.parse(readExplicit(mp)),simulation:true,spawnImpl:makeFake(${JSON.stringify(jsonl(events()))})});console.log(JSON.stringify({n:r.simulated_attempts,calls:r.actual_model_calls}));`;
    const r = spawnSync(process.execPath, ["--input-type=module", "-e", code], {
      cwd: dir,
      encoding: "utf8",
    });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout), { n: 4, calls: 0 });
  }),
);
test(
  "inherited project instructions rejected without artifacts",
  temporary(async (dir) => {
    const m = manifest(join(dir, "out"));
    writeFileSync(join(dir, "AGENTS.override.md"), "not read");
    assert.throws(() => validateManifest(bundle, m));
    assert.equal(existsSync(m.out), false);
  }),
);
test(
  "cancellation kills owned subprocess and removes signal listeners",
  temporary(async (dir) => {
    const before = process.listenerCount("SIGINT");
    const timer = setTimeout(() => process.emit("SIGINT"), 50);
    try {
      const r = await transport({
        prompt: "public",
        scratch: dir,
        timeoutMs: 1000,
        spawnImpl: (_b, _a, opts) =>
          spawn(process.execPath, ["-e", "setInterval(()=>{},1000)"], opts),
      });
      assert.equal(r.status, "cancelled");
      assert.equal(r.usage, null);
      assert.equal(process.listenerCount("SIGINT"), before);
    } finally {
      clearTimeout(timer);
    }
  }),
);

test(
  "v2 binds stable prefix to plan and fake transport, v1 remains frozen",
  temporary(async (dir) => {
    const { STABLE_LAYOUT, STABLE_PREFIX, stablePrompt } = await import(
      "../scripts/benchmarks/stable-prompt.mjs"
    );
    const { promptFor } = await import(
      "../scripts/benchmarks/multicase-runner.mjs"
    );
    const { hash } = await import("../scripts/benchmarks/public-bundle.mjs");
    const old = JSON.parse(
      readFileSync(join(docs, "piloto-codex-proposto.json")),
    );
    assert.equal(
      old.sha256,
      "95870f259e83fb5b4ea4dab50de654a61258474e9ec9b6de2baf9bbd2c2216c5",
    );
    // The immutable proposal specifies a Linux /tmp path. Windows must reject
    // that physical destination while still checking its original hash above.
    if (process.platform === "win32")
      assert.throws(() => validateManifest(bundle, old));
    else validateManifest(bundle, old);
    const c = bundle.cases.find((c) => c.case_id === ids[0]);
    assert.equal(
      hash(promptFor(c, c.sources)),
      "b6577fb4f106b15f56b95c02ce34676728827d6bb1786f323cc5b6e054435227",
    );
    const m = manifest(join(dir, "out"), {
      schema_version: "codex-multicase-plan-2",
      prompt_layout: STABLE_LAYOUT,
    });
    assert.throws(() =>
      validateManifest(bundle, {
        ...m,
        prompt_layout: { ...STABLE_LAYOUT, version: "tampered" },
      }),
    );
    assert.throws(() =>
      validateManifest(
        bundle,
        manifest(m.out, { prompt_layout: STABLE_LAYOUT }),
      ),
    );
    await assert.rejects(
      runPrepared({ bundle, manifest: m, authorizePlan: old.sha256 }),
    );
    let calls = 0;
    const r = await runPrepared({
      bundle,
      manifest: m,
      simulation: true,
      spawnImpl: fake(jsonl(events()), ({ prompt }) => {
        calls++;
        assert.ok(prompt.startsWith(STABLE_PREFIX));
        const e = JSON.parse(prompt);
        assert.equal(prompt, stablePrompt({ question: e.question }, e.sources));
        assert.deepEqual(e.history, []);
        assert.equal(Object.keys(e).at(-1), "question");
        for (const id of ids) assert.ok(!prompt.includes(id));
      }),
    });
    assert.equal(calls, 4);
    assert.equal(r.actual_model_calls, 0);
    assert.ok(
      stablePrompt({ ...c, question: "different" }, []).startsWith(
        STABLE_PREFIX,
      ),
    );
    assert.equal(STABLE_LAYOUT.prefix_bytes, Buffer.byteLength(STABLE_PREFIX));
  }),
);
