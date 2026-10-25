import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import {
  isPatchedSqlite,
  assertPatchedSqlite,
  sqliteRuntime,
} from "../dist/storage/index.js";

test("SQLite WAL-reset patch boundaries reject unpatched and unknown versions", () => {
  for (const version of [
    "3.44.5",
    "3.45.9",
    "3.49.9",
    "3.50.4",
    "3.50.6",
    "3.51.2",
    "",
    "unknown",
    "3.51.3-custom",
  ])
    assert.throws(() => assertPatchedSqlite(version), {
      code: "UNSUPPORTED_SQLITE",
    });
  for (const version of [
    "3.44.6",
    "3.44.7",
    "3.50.7",
    "3.51.3",
    "3.53.4",
    "4.0.0",
  ])
    assert.equal(isPatchedSqlite(version), true);
});

test("actual SQLite runtime is patched and doctor reports it", async () => {
  const { Storage, Service } = await import("../dist/index.js");
  assert.equal(sqliteRuntime().walResetPatched, true);
  const service = new Service(
    new Storage(
      join(mkdtempSync(join(tmpdir(), "mimir-runtime-")), "memory.sqlite"),
    ),
  );
  try {
    const result = await service.call("doctor", {});
    assert.deepEqual(result.data.sqlite, sqliteRuntime());
  } finally {
    service.close();
  }
});
