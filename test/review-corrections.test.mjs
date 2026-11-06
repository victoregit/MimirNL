import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { Service, Storage } from "../dist/index.js";
import { backupDatabase, restoreDatabase } from "../dist/storage/backup.js";
import { fixtureGit } from "./git-fixture.mjs";

test("CLI feedback persists approval; includes deprecates and full ingest reactivates", async () => {
  const root = fs.mkdtempSync(join(tmpdir(), "mimir-review-"));
  const db = join(root, "memory.sqlite");
  const s = new Service(new Storage(db));
  try {
    const repo = join(root, "repo");
    fs.mkdirSync(join(repo, "docs"), { recursive: true });
    fixtureGit(["init", "-q", repo]);
    fs.writeFileSync(join(repo, "docs", "guide.md"), "documentation fixture");
    fs.writeFileSync(join(repo, "outside.md"), "outside scope fixture");
    const call = async (op, input) => {
      const result = await s.call(op, input);
      assert.equal(result.ok, true, JSON.stringify(result));
      return result.data;
    };
    const p = await call("project_register", {
      path: repo,
      authorizeIngestion: true,
    });
    await call("project_ingest", { projectId: p.id });
    const outside = () =>
      s.db
        .prepare(
          "SELECT * FROM memories WHERE content LIKE '%outside scope fixture%'",
        )
        .get();
    const result = JSON.parse(
      execFileSync(
        process.execPath,
        [
          resolve("dist/cli/index.js"),
          "--db",
          db,
          "feedback",
          JSON.stringify({
            projectId: p.id,
            id: outside().id,
            action: "approve",
            explicitApproval: true,
          }),
        ],
        { encoding: "utf8", timeout: 30000 },
      ),
    );
    assert.equal(result.ok, true);
    assert.equal(result.data.status, "verified");
    assert.equal(outside().status, "verified");
    assert.equal(
      s.db
        .prepare("SELECT action FROM feedback WHERE memory_id=?")
        .get(outside().id).action,
      "approve",
    );
    await call("project_ingest", { projectId: p.id, includes: ["docs"] });
    assert.equal(outside().status, "deprecated");
    await call("project_ingest", { projectId: p.id });
    assert.equal(outside().status, "candidate");
  } finally {
    s.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("hard-link failures preserve sources, clean temporary snapshots and never replace targets", async (t) => {
  const root = fs.mkdtempSync(join(tmpdir(), "mimir-link-"));
  const storage = new Storage(join(root, "source.sqlite"));
  const snapshot = join(root, "snapshot.sqlite");
  const target = join(root, "target.sqlite");
  const original = fs.linkSync;
  try {
    await backupDatabase(storage, snapshot);
    const sourceBytes = fs.readFileSync(snapshot);
    for (const code of ["EXDEV", "ENOTSUP", "EPERM", "EEXIST"]) {
      await t.test(code, async () => {
        fs.linkSync = () => {
          // Simulate a competing publisher only after the destination recheck.
          if (code === "EEXIST") fs.writeFileSync(target, "competing writer");
          throw Object.assign(new Error("simulated publication failure"), {
            code,
          });
        };
        syncBuiltinESMExports();
        try {
          for (const operation of [
            () => backupDatabase(storage, target),
            () => restoreDatabase(snapshot, target),
          ]) {
            await assert.rejects(operation(), (error) =>
              code === "EEXIST"
                ? Boolean(error)
                : error.code === "UNSUPPORTED_FILESYSTEM" &&
                  /hard links/.test(error.message),
            );
            if (code === "EEXIST") {
              assert.equal(fs.readFileSync(target, "utf8"), "competing writer");
              fs.unlinkSync(target);
            } else assert.equal(fs.existsSync(target), false);
            assert.deepEqual(fs.readFileSync(snapshot), sourceBytes);
            assert.equal(
              storage.db.prepare("PRAGMA integrity_check").get()
                .integrity_check,
              "ok",
            );
            assert.equal(
              fs
                .readdirSync(root)
                .some((name) => name.startsWith(".mimir-snapshot-")),
              false,
            );
          }
        } finally {
          fs.linkSync = original;
          syncBuiltinESMExports();
        }
      });
    }
  } finally {
    storage.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
});
