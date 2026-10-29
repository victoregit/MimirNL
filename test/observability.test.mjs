import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  statSync,
  chmodSync,
  symlinkSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync, execFileSync } from "node:child_process";
import { once } from "node:events";
import { DatabaseSync } from "node:sqlite";
import { Service, Storage, schemas } from "../dist/index.js";
import { Measurement } from "../dist/observability/index.js";
import { externalEvent } from "../dist/observability/schemas.js";
const roots = [];
function setup(enabled = true) {
  const root = mkdtempSync(join(tmpdir(), "mimir-measure-"));
  roots.push(root);
  const path = join(root, "private", "observability.sqlite");
  const storage = new Storage(join(root, "knowledge.sqlite"));
  const projectId = randomUUID(),
    other = randomUUID();
  for (const p of [projectId, other])
    storage.db
      .prepare("INSERT INTO projects VALUES(?,?,1,?)")
      .run(p, join(root, p), new Date().toISOString());
  const service = new Service(storage, enabled ? { measurementDb: path } : {});
  const start = {
    projectId,
    attemptId: randomUUID(),
    eventId: randomUUID(),
    taskId: "synthetic149",
    sessionId: randomUUID(),
    mode: "synthetic",
  };
  return { root, path, storage, service, start, projectId, other };
}
const body = (s, extra) => ({
  projectId: s.projectId,
  attemptId: s.attemptId,
  eventId: randomUUID(),
  ...extra,
});
const quality = (s) =>
  body(s, {
    kind: "quality",
    actorKind: "test",
    rating: "unassessed",
    independentAssessment: "unknown",
    evidenceRefs: [],
    adverseOutcome: "unknown",
  });
const host = (s, extra = {}) =>
  body(s, {
    kind: "host_usage",
    usage: {
      namespace: "canonical",
      scope: "turn",
      scopeId: randomUUID(),
      sessionId: s.sessionId,
      collector: "fixture",
      collectorVersion: "1",
      semanticsConfirmed: true,
      input: null,
      output: null,
      cachedInput: null,
      total: null,
      reason: "not_collected",
      ...extra,
    },
  });
async function ok(service, op, d) {
  const r = await service.call(op, d);
  assert.equal(r.ok, true, JSON.stringify(r));
  return r.data;
}
test.after(() => {
  for (const p of roots) rmSync(p, { recursive: true, force: true });
});
test("default off, strict schemas, no JSON path activation or source forgery", async () => {
  const f = setup(false);
  try {
    assert.equal(
      externalEvent.safeParse({ ...quality(f.start), schemaVersion: 2 })
        .success,
      false,
    );
    assert.equal(
      externalEvent.safeParse(
        body(f.start, {
          kind: "call",
          callId: randomUUID(),
          operation: "test",
          status: "failed",
          cliElapsedMs: null,
          internalElapsedMs: null,
          contextBytes: null,
          reason: null,
          requestHash: "a".repeat(64),
          errorCode: "local_failure",
        }),
      ).success,
      false,
    );
    assert.equal(existsSync(f.path), false);
    assert.equal(
      (await f.service.call("measurement_start", f.start)).error.code,
      "MEASUREMENT_DISABLED",
    );
    assert.equal(
      (
        await f.service.call("memory_search", {
          projectId: f.projectId,
          query: "x",
          measurementDb: f.path,
        })
      ).ok,
      false,
    );
    await ok(f.service, "memory_search", {
      projectId: f.projectId,
      query: "x",
    });
    assert.equal(existsSync(join(f.root, "private")), false);
    assert.equal(
      externalEvent.safeParse({
        ...quality(f.start),
        collectionSource: "internal",
      }).success,
      false,
    );
    assert.equal(
      externalEvent.safeParse({ ...quality(f.start), query: "CANARY" }).success,
      false,
    );
    for (const op of [
      "measurement_export",
      "measurement_delete",
      "measurement_prune",
      "measurement_restore",
    ])
      assert.equal(Object.hasOwn(schemas, op), false);
  } finally {
    f.service.close();
  }
});
test("lifecycle, global event idempotency, conflict, scope and incomplete reports", async () => {
  const f = setup();
  try {
    await ok(f.service, "measurement_start", f.start);
    await ok(f.service, "measurement_start", f.start);
    const event = quality(f.start);
    await ok(f.service, "measurement_record", event);
    await ok(f.service, "measurement_record", event);
    assert.equal(
      (
        await f.service.call("measurement_record", {
          ...event,
          rating: "harmful",
        })
      ).error.code,
      "MEASUREMENT_EVENT_CONFLICT",
    );
    assert.equal(
      (
        await f.service.call("measurement_record", {
          ...event,
          projectId: f.other,
        })
      ).error.code,
      "MEASUREMENT_SCOPE",
    );
    const r = await ok(f.service, "measurement_report", {
      projectId: f.projectId,
    });
    assert.equal(r.attempts, 1);
    assert.equal(r.runningIncomplete, 1);
    assert.equal(r.coverage.hostUsageAuthenticated.numerator, 0);
    assert.equal(r.provided.canonicalHostUsage, null);
    assert.equal(r.causalBenefit, null);
    await ok(
      f.service,
      "measurement_finish",
      body(f.start, { status: "failed" }),
    );
    const r2 = await ok(f.service, "measurement_report", {
      projectId: f.projectId,
    });
    assert.equal(r2.status.failed, 1);
    assert.equal(
      (await f.service.call("measurement_record", quality(f.start))).error.code,
      "MEASUREMENT_FINISHED",
    );
    assert.deepEqual(
      f.service.measurement.db
        .prepare("SELECT seq FROM events ORDER BY seq")
        .all()
        .map((r) => r.seq),
      [1, 2, 3],
    );
  } finally {
    f.service.close();
  }
});
test("host equations, missing, native namespace, provided provenance and overlapping scope", async () => {
  const f = setup();
  try {
    await ok(f.service, "measurement_start", f.start);
    for (const u of [
      { input: 1, output: 2, cachedInput: 2, total: 3, reason: null },
      { input: 1, output: 2, cachedInput: 0, total: 4, reason: null },
      { input: -1 },
      { input: 1 },
      { semanticsConfirmed: false },
      { reason: null },
    ])
      assert.equal(externalEvent.safeParse(host(f.start, u)).success, false);
    const canonical = host(f.start, {
      input: 10,
      output: 2,
      cachedInput: 3,
      total: 12,
      reason: null,
    });
    await ok(f.service, "measurement_record", canonical);
    assert.equal(
      (
        await f.service.call("measurement_record", {
          ...canonical,
          eventId: randomUUID(),
        })
      ).error.code,
      "MEASUREMENT_USAGE_OVERLAP",
    );
    assert.equal(
      (
        await f.service.call(
          "measurement_record",
          host(f.start, { scope: "session" }),
        )
      ).error.code,
      "MEASUREMENT_USAGE_OVERLAP",
    );
    await ok(
      f.service,
      "measurement_record",
      host(f.start, {
        namespace: "ag_native",
        semanticsConfirmed: false,
        input: 99,
        output: 5,
        cachedInput: 99,
        total: 9,
        reason: "semantics_unconfirmed",
      }),
    );
    const r = await ok(f.service, "measurement_report", {
      projectId: f.projectId,
    });
    assert.equal(r.provided.canonicalHostUsage.total, 12);
    assert.equal(r.provided.ag_native.length, 1);
    assert.equal(r.coverage.hostUsageAuthenticated.numerator, 0);
    assert.equal(
      (
        await f.service.call("measurement_start", {
          ...f.start,
          eventId: randomUUID(),
          attemptId: randomUUID(),
          identity: { observedModel: "invented" },
        })
      ).ok,
      false,
    );
  } finally {
    f.service.close();
  }
});
test("real search code preserves bounded envelope, scope before uses, failed sink and raw canaries", async () => {
  const f = setup();
  try {
    await ok(f.service, "measurement_start", f.start);
    await ok(f.service, "memory_store", {
      projectId: f.projectId,
      content: "CANARY_QUERY CANARY_CONTENT search evidence",
    });
    const q = {
      projectId: f.projectId,
      query: "CANARY_QUERY",
      tokenBudget: 1800,
    };
    const legacy = await ok(f.service, "memory_search", q);
    const before = f.storage.db
      .prepare("SELECT sum(uses) AS n FROM memories")
      .get().n;
    assert.equal(
      (
        await f.service.call("memory_search", {
          ...q,
          projectId: f.other,
          attemptId: f.start.attemptId,
        })
      ).error.code,
      "MEASUREMENT_SCOPE",
    );
    assert.equal(
      f.storage.db.prepare("SELECT sum(uses) AS n FROM memories").get().n,
      before,
    );
    let capture;
    const measured = await f.service.call(
      "memory_search",
      { ...q, attemptId: f.start.attemptId },
      { onCapture: (s) => (capture = s) },
    );
    // Uses is an existing full-format counter; compare compact envelope instead.
    assert.equal(measured.data.memories[0].content, legacy.memories[0].content);
    assert.equal(capture.captureStatus, "persisted");
    assert.ok(
      Buffer.byteLength(JSON.stringify(measured.data)) <= q.tokenBudget,
    );
    f.service.measurement.db.exec("PRAGMA query_only=ON");
    const compact = { ...q, format: "compact-v1" };
    const expected = await ok(f.service, "memory_search", compact);
    const failed = await f.service.call(
      "memory_search",
      { ...compact, attemptId: f.start.attemptId },
      { onCapture: (s) => (capture = s) },
    );
    assert.deepEqual(failed, { ok: true, data: expected });
    assert.equal(capture.captureStatus, "failed");
    assert.equal(
      (await f.service.call("measurement_record", quality(f.start))).ok,
      false,
    );
    f.service.measurement.db.exec("PRAGMA query_only=OFF");
    const dest = join(f.root, "private", "export.json");
    f.service.measurement.export({
      projectId: f.projectId,
      attemptIds: [f.start.attemptId],
      destination: dest,
    });
    const text = readFileSync(dest, "utf8");
    assert.ok(!text.includes("CANARY_QUERY"));
    assert.ok(!text.includes("CANARY_CONTENT"));
    assert.ok(!text.includes(f.root));
    const report = await ok(f.service, "measurement_report", {
      projectId: f.projectId,
    });
    assert.equal(report.measured.searches, 1);
    assert.equal(report.measured.delivered, 1);
  } finally {
    f.service.close();
  }
});
test("export consistent private no-clobber, delete confirm, TTL dry-run and logical restore", async () => {
  const f = setup();
  try {
    await ok(f.service, "measurement_start", f.start);
    await ok(f.service, "measurement_record", host(f.start));
    await ok(f.service, "memory_search", {
      projectId: f.projectId,
      attemptId: f.start.attemptId,
      query: "x",
    });
    await ok(
      f.service,
      "measurement_finish",
      body(f.start, { status: "aborted" }),
    );
    const dest = join(f.root, "private", "snapshot.json"),
      request = {
        projectId: f.projectId,
        attemptIds: [f.start.attemptId],
        destination: dest,
      };
    f.service.measurement.export(request);
    assert.throws(() => f.service.measurement.export(request));
    if (process.platform !== "win32")
      assert.equal(statSync(dest).mode & 0o777, 0o600);
    const restored = join(f.root, "restore", "observability.sqlite");
    Measurement.restore(dest, restored, f.storage.path);
    assert.throws(() => Measurement.restore(dest, restored, f.storage.path));
    const copy = new Measurement(restored, f.storage.path);
    try {
      const report = copy.report({ projectId: f.projectId });
      assert.equal(report.status.aborted, 1);
      assert.equal(report.measured.searches, 0);
      assert.equal(report.provided.restoredSearchStatus.succeeded, 1);
      assert.equal(
        copy.db
          .prepare("SELECT count(*) AS n FROM events WHERE source='internal'")
          .get().n,
        0,
      );
    } finally {
      copy.close();
    }
    assert.throws(() =>
      f.service.measurement.delete({
        projectId: f.projectId,
        attemptIds: [f.start.attemptId],
      }),
    );
    const before = f.storage.db
      .prepare("SELECT count(*) AS n FROM projects")
      .get().n;
    assert.equal(
      f.service.measurement.prune({
        projectId: f.projectId,
        before: "2099-01-01T00:00:00Z",
      }).attemptIds.length,
      1,
    );
    assert.equal(
      f.service.measurement.report({ projectId: f.projectId }).attempts,
      1,
    );
    assert.throws(() =>
      f.service.measurement.prune({ projectId: f.projectId, dryRun: false }),
    );
    f.service.measurement.delete({
      projectId: f.projectId,
      attemptIds: [f.start.attemptId],
      confirm: true,
    });
    assert.equal(
      f.service.measurement.report({ projectId: f.projectId }).attempts,
      0,
    );
    assert.equal(
      f.storage.db.prepare("SELECT count(*) AS n FROM projects").get().n,
      before,
    );
    const corrupt = JSON.parse(readFileSync(dest));
    corrupt.events[0].body.taskId = "tampered";
    writeFileSync(
      join(f.root, "private", "bad.json"),
      JSON.stringify(corrupt),
      { mode: 0o600 },
    );
    assert.throws(() =>
      Measurement.restore(
        join(f.root, "private", "bad.json"),
        join(f.root, "invalid", "observability.sqlite"),
        f.storage.path,
      ),
    );
    assert.equal(existsSync(join(f.root, "invalid")), false);
  } finally {
    f.service.close();
  }
});
test("privacy rejects unsafe existing leaf, alias, symlink/junction; parents remain unchanged", () => {
  const f = setup(false);
  try {
    const before = statSync(f.root).mode;
    const side = new Measurement(f.path, f.storage.path);
    side.close();
    assert.equal(statSync(f.root).mode, before);
    if (process.platform !== "win32") {
      assert.equal(statSync(join(f.root, "private")).mode & 0o777, 0o700);
      chmodSync(join(f.root, "private"), 0o755);
      assert.throws(() => new Measurement(f.path, f.storage.path));
      chmodSync(join(f.root, "private"), 0o700);
    } else {
      const ownerFixture = spawnSync(
        process.execPath,
        [
          fileURLToPath(
            new URL("./windows-owner-fixture.mjs", import.meta.url),
          ),
          f.root,
        ],
        { encoding: "utf8", timeout: 60000 },
      );
      assert.equal(ownerFixture.status, 0, ownerFixture.stderr);
      // A parent shell can put another edition's Security module before the
      // inbox module. Exercise native ACLs with a controlled shadow module,
      // without changing this process's environment or any existing ACL.
      const modules = join(f.root, "modules"),
        module = join(modules, "Microsoft.PowerShell.Security");
      mkdirSync(module, { recursive: true });
      writeFileSync(
        join(module, "Microsoft.PowerShell.Security.psd1"),
        "@{ModuleVersion='99.0.0';RootModule='Security.psm1';FunctionsToExport=@('Get-Acl','Set-Acl')}",
      );
      writeFileSync(
        join(module, "Security.psm1"),
        "[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'loaded'),'CANARY_ACL_MODULE_RAW'); function Get-Acl {throw 'CANARY_ACL_MODULE_RAW'}; function Set-Acl {throw 'CANARY_ACL_MODULE_RAW'}; Export-ModuleMember -Function Get-Acl,Set-Acl",
      );
      const psHome = join(
        process.env.SystemRoot ?? "C:\\Windows",
        "System32",
        "WindowsPowerShell",
        "v1.0",
      );
      const powershell = join(psHome, "powershell.exe");
      const parentAcl = () =>
        execFileSync(
          powershell,
          [
            "-NoProfile",
            "-NonInteractive",
            "-EncodedCommand",
            Buffer.from(
              `$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue'; $PSModuleAutoLoadingPreference='None'; Import-Module "$PSHOME\\Modules\\Microsoft.PowerShell.Security\\Microsoft.PowerShell.Security.psd1"; (Get-Acl -LiteralPath '${f.root.replaceAll("'", "''")}').Sddl`,
              "utf16le",
            ).toString("base64"),
          ],
          {
            encoding: "utf8",
            windowsHide: true,
            env: { ...process.env, PSModulePath: join(psHome, "Modules") },
          },
        ).trim();
      const sddl = parentAcl();
      const env = { ...process.env };
      for (const key of Object.keys(env))
        if (key.toLowerCase() === "psmodulepath") delete env[key];
      env.PSModulePath = modules;
      const code = `
        import assert from 'node:assert/strict';
        import {execFileSync} from 'node:child_process';
        import {join,dirname} from 'node:path';
        import {privateDestination,privateExisting,createPrivateFile} from ${JSON.stringify(new URL("../dist/observability/privacy.js", import.meta.url).href)};
        const file=privateDestination(join(process.argv[1],'isolated','measurement.sqlite'));
        createPrivateFile(file);
        privateExisting(file,false);
        assert.equal(privateDestination(file),file);
        execFileSync('icacls.exe',[dirname(file),'/grant','*S-1-1-0:(OI)(CI)R'],{stdio:'ignore'});
        assert.throws(()=>privateExisting(dirname(file),true),error=>{
          assert.equal(error.code,'MEASUREMENT_PRIVACY');
          assert.equal(error.message,'Private dedicated measurement destination required.');
          assert.ok(!JSON.stringify(error).includes('CANARY_ACL_MODULE_RAW'));
          assert.ok(!JSON.stringify(error).includes(process.argv[1]));
          return true;
        });
        assert.equal(process.env.PSModulePath,process.argv[2]);
        delete process.env.PSModulePath;
        const stripped=privateDestination(join(process.argv[1],'stripped','measurement.sqlite'));
        createPrivateFile(stripped);
        privateExisting(stripped,false);
      `;
      const child = spawnSync(
        process.execPath,
        ["--input-type=module", "-e", code, f.root, modules],
        { env, encoding: "utf8", timeout: 60000 },
      );
      assert.equal(child.status, 0, child.stderr);
      assert.equal(existsSync(join(module, "loaded")), false);
      assert.equal(parentAcl(), sddl);
      // Real native ACL: a broad Everyone grant on an existing leaf is rejected.
      execFileSync(
        "icacls.exe",
        [join(f.root, "private"), "/grant", "*S-1-1-0:(OI)(CI)R"],
        { stdio: "pipe" },
      );
      assert.throws(() => new Measurement(f.path, f.storage.path));
    }
    assert.throws(() => new Measurement(f.storage.path, f.storage.path));
    const link = join(f.root, "alias");
    symlinkSync(
      join(f.root, "private"),
      link,
      process.platform === "win32" ? "junction" : "dir",
    );
    assert.throws(
      () => new Measurement(join(link, "other.sqlite"), f.storage.path),
    );
    assert.throws(
      () =>
        new Measurement(f.root + "/private/../escape.sqlite", f.storage.path),
    );
  } finally {
    f.service.close();
  }
});
test("future schema and arbitrary/knowledge files refused without mutation", () => {
  const f = setup();
  f.service.close();
  const db = new DatabaseSync(f.path);
  db.exec("UPDATE marker SET version=2");
  db.close();
  const before = readFileSync(f.path);
  assert.throws(() => new Measurement(f.path, f.storage.path));
  assert.deepEqual(readFileSync(f.path), before);
  const arbitrary = join(f.root, "private", "arbitrary");
  writeFileSync(arbitrary, "arbitrary", { mode: 0o600 });
  assert.throws(() => new Measurement(arbitrary, f.storage.path));
  assert.equal(readFileSync(arbitrary, "utf8"), "arbitrary");
});
test("multiprocess sequence, busy sink, crash rollback and incomplete recovery", async () => {
  const f = setup();
  try {
    await ok(f.service, "measurement_start", f.start);
    const module = new URL("../dist/observability/index.js", import.meta.url)
      .href;
    // SQLITE_BUSY is a documented bounded error, not an acknowledgement. This
    // synthetic caller retries only that error, with the same globally unique
    // eventId and a finite ceiling; production keeps its250ms timeout unchanged.
    const code = `import {Measurement} from ${JSON.stringify(module)};const m=new Measurement(process.argv[1],process.argv[2]);try {for(const e of JSON.parse(process.argv[3])){for(let attempt=0;attempt<20;attempt++){try {m.record(e);break;}catch(error){if(error.code!=='ERR_SQLITE_ERROR'||error.errcode!==5||attempt===19)throw error;await new Promise(resolve=>setTimeout(resolve,50));}}}}finally{m.close();}`;
    const children = [1, 2].map(() =>
      spawn(
        process.execPath,
        [
          "--input-type=module",
          "-e",
          code,
          f.path,
          f.storage.path,
          JSON.stringify(Array.from({ length: 5 }, () => quality(f.start))),
        ],
        { stdio: ["ignore", "pipe", "pipe"] },
      ),
    );
    const exits = await Promise.all(
      children.map(async (c) => {
        let err = "";
        c.stderr.on("data", (d) => (err += d));
        const [exit] = await once(c, "exit");
        assert.equal(exit, 0, err);
      }),
    );
    assert.equal(exits.length, 2);
    assert.deepEqual(
      f.service.measurement.db
        .prepare("SELECT seq FROM events ORDER BY seq")
        .all()
        .map((r) => r.seq),
      Array.from({ length: 11 }, (_, i) => i + 1),
    );
    const lockCode = `import {DatabaseSync} from 'node:sqlite';const d=new DatabaseSync(process.argv[1]);d.exec('BEGIN IMMEDIATE');d.prepare('UPDATE attempts SET status=?').run('failed');process.stdout.write('locked');setTimeout(()=>{},30000);`;
    const lock = spawn(
      process.execPath,
      ["--input-type=module", "-e", lockCode, f.path],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    await once(lock.stdout, "data");
    let capture;
    const response = await f.service.call(
      "memory_search",
      { projectId: f.projectId, query: "x", attemptId: f.start.attemptId },
      { onCapture: (s) => (capture = s) },
    );
    assert.equal(response.ok, true);
    assert.equal(capture.captureStatus, "failed");
    const pending = quality(f.start);
    const denied = await f.service.call("measurement_record", pending);
    assert.equal(denied.ok, false);
    assert.equal(denied.error.sqliteCode, 5);
    assert.equal(
      f.service.measurement.db
        .prepare("SELECT count(*) AS n FROM events WHERE id=?")
        .get(pending.eventId).n,
      0,
    );
    lock.kill("SIGKILL");
    await once(lock, "exit");
    const r = f.service.measurement.report({ projectId: f.projectId });
    assert.equal(r.runningIncomplete, 1);
    assert.equal(r.status.failed, 0);
    await ok(f.service, "measurement_record", pending);
    await ok(f.service, "measurement_record", pending);
    assert.equal(
      f.service.measurement.db.prepare("SELECT max(seq) AS n FROM events").get()
        .n,
      12,
    );
  } finally {
    f.service.close();
  }
});
test("CLI trusted startup, diagnostics separate stdout, delete confirmation and native 8.3 TEMP", async () => {
  const f = setup();
  await ok(f.service, "measurement_start", f.start);
  f.service.close();
  const cli = new URL("../dist/cli/index.js", import.meta.url);
  const run = (op, d, extra = []) =>
    spawnSync(
      process.execPath,
      [
        cli.pathname.replace(/^\/(?:([A-Za-z]:))/, "$1"),
        "--db",
        f.storage.path,
        "--measurement-db",
        f.path,
        op,
        JSON.stringify(d),
        ...extra,
      ],
      { encoding: "utf8" },
    );
  const r = run("memory_search", {
    projectId: f.projectId,
    query: "x",
    attemptId: f.start.attemptId,
  });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(r.stdout).ok, true);
  assert.equal(
    JSON.parse(r.stderr.trim()).measurement.captureStatus,
    "persisted",
  );
  const bad = run("measurement_delete", {
    projectId: f.projectId,
    attemptIds: [f.start.attemptId],
  });
  assert.equal(bad.status, 1);
  assert.equal(
    run("measurement_delete", {
      projectId: f.projectId,
      attemptIds: [f.start.attemptId],
      confirm: true,
    }).status,
    1,
  );
  const dry = run("measurement_prune", { projectId: f.projectId }, [
    "--dry-run",
  ]);
  assert.equal(dry.status, 0, dry.stderr);
  assert.equal(JSON.parse(dry.stdout).data.dryRun, true);
  const good = run(
    "measurement_delete",
    { projectId: f.projectId, attemptIds: [f.start.attemptId] },
    ["--confirm"],
  );
  assert.equal(good.status, 0, good.stderr);
  if (process.platform === "win32")
    assert.equal(
      process.env.TEMP.includes("~"),
      true,
      "Native gate must use 8.3 TEMP alias",
    );
});

test("MCP lifecycle, budget-neutral metadata, administrative operations absent and uncallable", async () => {
  const f = setup(false);
  f.service.close();
  const client = new Client({ name: "measurement-synthetic", version: "1" });
  try {
    await client.connect(
      new StdioClientTransport({
        command: process.execPath,
        args: [
          fileURLToPath(new URL("../dist/cli/index.js", import.meta.url)),
          "--db",
          f.storage.path,
          "--measurement-db",
          f.path,
          "mcp",
          "stdio",
        ],
        stderr: "pipe",
      }),
    );
    const names = (await client.listTools()).tools.map((t) => t.name);
    for (const op of [
      "measurement_start",
      "measurement_record",
      "measurement_finish",
      "measurement_report",
    ])
      assert.ok(names.includes(op));
    for (const op of [
      "measurement_export",
      "measurement_delete",
      "measurement_prune",
      "measurement_restore",
    ]) {
      assert.ok(!names.includes(op));
      try {
        const r = await client.callTool({ name: op, arguments: {} });
        assert.equal(r.isError, true);
      } catch (e) {
        assert.ok(e);
      }
    }
    const start = await client.callTool({
      name: "measurement_start",
      arguments: f.start,
    });
    assert.equal(JSON.parse(start.content[0].text).ok, true);
    const search = await client.callTool({
      name: "memory_search",
      arguments: {
        projectId: f.projectId,
        attemptId: f.start.attemptId,
        query: "x",
        tokenBudget: 200,
      },
    });
    assert.equal(JSON.parse(search.content[0].text).ok, true);
    assert.equal(search._meta.measurement.captureStatus, "persisted");
    assert.ok(
      Buffer.byteLength(
        JSON.stringify(JSON.parse(search.content[0].text).data),
      ) <= 200,
    );
    const finish = await client.callTool({
      name: "measurement_finish",
      arguments: body(f.start, { status: "not_run" }),
    });
    assert.equal(JSON.parse(finish.content[0].text).ok, true);
  } finally {
    await client.close();
  }
});
test("failed search recorded internally, missing outcomes retained and report intervals scoped", async () => {
  const f = setup();
  try {
    await ok(f.service, "measurement_start", f.start);
    let capture;
    const fail = await f.service.call(
      "memory_search",
      { projectId: f.projectId, attemptId: f.start.attemptId, query: '"' },
      { onCapture: (s) => (capture = s) },
    );
    // The retriever may sanitize malformed lexical syntax; force a local storage error
    // after preflight with a temporary missing FTS table instead.
    assert.equal(fail.ok, true);
    f.storage.db.exec("ALTER TABLE memory_fts RENAME TO temporary_fts");
    const bad = await f.service.call(
      "memory_search",
      { projectId: f.projectId, attemptId: f.start.attemptId, query: "test" },
      { onCapture: (s) => (capture = s) },
    );
    assert.equal(bad.ok, false);
    assert.equal(capture.captureStatus, "persisted");
    f.storage.db.exec("ALTER TABLE temporary_fts RENAME TO memory_fts");
    await ok(
      f.service,
      "measurement_record",
      body(f.start, {
        kind: "call",
        callId: randomUUID(),
        operation: "validation",
        status: "failed",
        cliElapsedMs: null,
        internalElapsedMs: null,
        contextBytes: null,
        reason: "not_available",
        requestHash: "a".repeat(64),
        errorCode: "local_failure",
      }),
    );
    await ok(
      f.service,
      "measurement_finish",
      body(f.start, { status: "failed", missingReasons: ["not_collected"] }),
    );
    const r = await ok(f.service, "measurement_report", {
      projectId: f.projectId,
    });
    assert.equal(r.measured.searchStatus.failed, 1);
    assert.equal(r.provided.callStatus.failed, 1);
    assert.equal(r.missingReasons.not_collected, 1);
    assert.equal(
      (await ok(f.service, "measurement_report", { projectId: f.other }))
        .attempts,
      0,
    );
    assert.equal(
      (
        await ok(f.service, "measurement_report", {
          projectId: f.projectId,
          from: "2099-01-01T00:00:00Z",
        })
      ).attempts,
      0,
    );
  } finally {
    f.service.close();
  }
});

test("corrupt event hashes and sequence gaps fail closed before search mutates uses", async () => {
  const f = setup();
  try {
    await ok(f.service, "measurement_start", f.start);
    await ok(f.service, "memory_store", {
      projectId: f.projectId,
      content: "corrupt scope evidence",
    });
    const before = f.storage.db
      .prepare("SELECT sum(uses) AS n FROM memories")
      .get().n;
    f.service.measurement.db.exec(
      "UPDATE events SET event_hash='" + "0".repeat(64) + "'",
    );
    const result = await f.service.call("memory_search", {
      projectId: f.projectId,
      attemptId: f.start.attemptId,
      query: "evidence",
    });
    assert.equal(result.ok, false);
    assert.equal(
      f.storage.db.prepare("SELECT sum(uses) AS n FROM memories").get().n,
      before,
    );
    assert.throws(() => new Measurement(f.path, f.storage.path));
  } finally {
    f.service.close();
  }
  const g = setup();
  try {
    await ok(g.service, "measurement_start", g.start);
    g.service.measurement.db.exec("UPDATE events SET seq=3");
    assert.equal(
      (
        await g.service.call("memory_search", {
          projectId: g.projectId,
          attemptId: g.start.attemptId,
          query: "x",
        })
      ).ok,
      false,
    );
    assert.throws(() => new Measurement(g.path, g.storage.path));
  } finally {
    g.service.close();
  }
});
test("known cross-project memory references rejected, matched versions checked", async () => {
  const f = setup();
  try {
    await ok(f.service, "measurement_start", f.start);
    const m = await ok(f.service, "memory_store", {
      projectId: f.other,
      content: "other project evidence",
    });
    const event = body(f.start, {
      kind: "memory_use",
      memories: [
        {
          id: m.id,
          version: m.version,
          hash: m.hash,
          status: m.status,
          scope: m.scope,
        },
      ],
      consulted: true,
      usedReported: false,
      sourceRefsVerified: false,
      evidenceRefs: [],
      actorKind: "agent",
      correlationStatus: "unknown",
    });
    assert.equal(
      (await f.service.call("measurement_record", event)).error.code,
      "MEASUREMENT_SCOPE",
    );
    assert.equal(
      f.service.measurement.db.prepare("SELECT count(*) AS n FROM events").get()
        .n,
      1,
    );
    event.memories[0].id = randomUUID();
    event.correlationStatus = "matched";
    assert.equal(
      (await f.service.call("measurement_record", event)).error.code,
      "MEASUREMENT_CORRELATION",
    );
    event.correlationStatus = "missing";
    await ok(f.service, "measurement_record", event);
  } finally {
    f.service.close();
  }
});
