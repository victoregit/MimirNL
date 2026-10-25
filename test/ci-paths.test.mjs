import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import {
  Service,
  Storage,
  backupDatabase,
  restoreDatabase,
} from "../dist/index.js";
import { fixtureGit } from "./git-fixture.mjs";
import { failure, assertLocalPath } from "../dist/security/index.js";

test("unexpected local errors retain safe machine codes without paths or exception text", () => {
  const error = Object.assign(new Error("private fixture path and content"), {
    code: "ENOENT",
    path: "private/path",
  });
  assert.deepEqual(failure(error), {
    ok: false,
    error: {
      code: "INVALID_REQUEST",
      message: "Invalid request or local operation failed.",
      causeCode: "ENOENT",
    },
  });
  const sqlite = failure(
    Object.assign(new Error("private SQL"), {
      code: "ERR_SQLITE_ERROR",
      errcode: 5,
    }),
  );
  assert.equal(sqlite.error.sqliteCode, 5);
  assert.equal(
    failure(Object.assign(error, { code: "private/path" })).error.causeCode,
    undefined,
  );
  assert.equal(JSON.stringify(sqlite).includes("private"), false);
});

test(
  "Windows short-path aliases cannot bypass backup and restore project boundaries",
  { skip: process.platform !== "win32" },
  async (t) => {
    const root = mkdtempSync(join(tmpdir(), "mimir-long-path-boundary-"));
    let service;
    try {
      const short = execFileSync(
        "cmd.exe",
        ["/d", "/c", 'for %I in ("%MIMIR_FIXTURE_PATH%") do @echo %~sI'],
        {
          env: { ...process.env, MIMIR_FIXTURE_PATH: root },
          encoding: "utf8",
          windowsVerbatimArguments: true,
        },
      ).trim();
      if (short === root) {
        t.skip("Filesystem does not generate short names");
        return;
      }
      const repo = join(root, "repo");
      mkdirSync(repo);
      fixtureGit(["init", "-q", repo]);
      service = new Service(new Storage(join(root, "memory.sqlite")));
      const result = await service.call("project_register", {
        path: repo,
        authorizeIngestion: true,
      });
      assert.equal(result.ok, true, JSON.stringify(result));
      const snapshot = join(root, "snapshot.sqlite");
      await backupDatabase(service.storage, snapshot);
      const forbidden = join(short, "repo", "forbidden.sqlite");
      await assert.rejects(
        restoreDatabase(snapshot, forbidden),
        /analyzed project/,
      );
      await assert.rejects(
        backupDatabase(service.storage, forbidden),
        /analyzed project/,
      );
      assert.equal(existsSync(forbidden), false);
      const sensitive = join(root, "credentials");
      mkdirSync(sensitive);
      const shortSensitive = execFileSync(
        "cmd.exe",
        ["/d", "/c", 'for %I in ("%MIMIR_FIXTURE_PATH%") do @echo %~sI'],
        {
          env: { ...process.env, MIMIR_FIXTURE_PATH: sensitive },
          encoding: "utf8",
          windowsVerbatimArguments: true,
        },
      ).trim();
      assert.throws(() => assertLocalPath(shortSensitive), /Sensitive/);
    } finally {
      service?.close();
      rmSync(root, { recursive: true, force: true });
    }
  },
);
