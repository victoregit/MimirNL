import { SCHEMA_2_SQL, validateKnowledge } from "./schema.js";
export { SCHEMA_SQL, SCHEMA_2_SQL } from "./schema.js";
import { DatabaseSync } from "node:sqlite";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import {
  mkdirSync,
  realpathSync,
  chmodSync,
  existsSync,
  lstatSync,
  openSync,
  closeSync,
} from "node:fs";
import {
  AppError,
  inside,
  assertSafe,
  sensitivePath,
  assertLocalPath,
} from "../security/index.js";
// SQLite WAL-reset corruption fix: upstream 3.51.3+, or the maintained backports.
export function isPatchedSqlite(version: string): boolean {
  if (!/^\d+\.\d+\.\d+$/.test(version)) return false;
  const [major, minor, patch] = version.split(".").map(Number) as [
    number,
    number,
    number,
  ];
  return (
    major > 3 ||
    (major === 3 &&
      (minor > 51 ||
        (minor === 51 && patch >= 3) ||
        (minor === 50 && patch >= 7) ||
        (minor === 44 && patch >= 6)))
  );
}
export function sqliteRuntime() {
  // Probe only an in-memory connection, before touching any user database or directory.
  const probe = new DatabaseSync(":memory:");
  try {
    const version = String(
      probe.prepare("SELECT sqlite_version() AS version").get()?.version,
    );
    return { version, walResetPatched: isPatchedSqlite(version) };
  } finally {
    probe.close();
  }
}
export function assertPatchedSqlite(version: string): void {
  if (!isPatchedSqlite(version))
    throw new AppError(
      "UNSUPPORTED_SQLITE",
      `Node ${process.version} bundles unsupported SQLite ${version}: concurrent WAL requires SQLite >=3.51.3 (or backports 3.50.7 / 3.44.6). Install the latest Node 24 LTS. No database was opened.`,
    );
}
export function defaultPath() {
  return join(
    process.platform === "win32"
      ? (process.env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local"))
      : (process.env.XDG_DATA_HOME ?? join(homedir(), ".local", "share")),
    "mimir-nl",
    "memory.sqlite",
  );
}

export class Storage {
  db: DatabaseSync;
  path: string;
  constructor(path = defaultPath()) {
    assertPatchedSqlite(sqliteRuntime().version);
    assertSafe(path);
    if (sensitivePath(path))
      throw new AppError("UNSAFE_DB", "Sensitive database path.");
    const requested = assertLocalPath(path);
    for (const suffix of ["-wal", "-shm"]) assertLocalPath(requested + suffix);
    const existing = existsSync(requested);
    if (existing) {
      const probe = new DatabaseSync(requested, {
        readOnly: true,
        timeout: 10000,
      });
      try {
        if (validateKnowledge(probe) === 1)
          throw new AppError(
            "MIGRATION_REQUIRED",
            "Schema1 requires explicit migrate with verified backup before normal operations.",
          );
      } finally {
        probe.close();
      }
    }
    mkdirSync(dirname(requested), { recursive: true, mode: 0o700 });
    if (existsSync(requested) && lstatSync(requested).isSymbolicLink())
      throw new AppError("UNSAFE_DB", "Database symlinks are forbidden.");
    this.path = join(
      realpathSync(dirname(requested)),
      requested.split(/[\\/]/).at(-1)!,
    );
    if (!existsSync(this.path)) {
      try {
        closeSync(openSync(this.path, "wx", 0o600));
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
      }
    }
    if (process.platform !== "win32") chmodSync(this.path, 0o600);
    this.db = new DatabaseSync(this.path, { timeout: 10000 });
    this.db.exec(
      "PRAGMA busy_timeout=10000; PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;",
    );
    try {
      if (!existing)
        this.transaction(() => {
          // The path can be created by another process after our filesystem probe.
          // Never apply schema2 initialization on top of a concurrently created1.
          const populated = this.db
            .prepare(
              "SELECT 1 FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' LIMIT 1",
            )
            .get();
          if (!populated) this.db.exec(SCHEMA_2_SQL);
          else if (validateKnowledge(this.db) !== 2)
            throw new AppError(
              "MIGRATION_REQUIRED",
              "Concurrent schema1 initialization requires explicit migration.",
            );
        });
      else if (validateKnowledge(this.db) !== 2)
        throw new AppError(
          "MIGRATION_REQUIRED",
          "Explicit migration required.",
        );
      for (const p of this.db.prepare("SELECT path FROM projects").all())
        if (inside(assertLocalPath(String(p.path)), this.path))
          throw new AppError(
            "UNSAFE_DB",
            "Database cannot be inside an analyzed repository.",
          );
    } catch (e) {
      this.db.close();
      throw e;
    }
    if (process.platform !== "win32") chmodSync(this.path, 0o600);
  }
  transaction<T>(fn: () => T): T {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const result = fn();
      this.db.exec("COMMIT");
      return result;
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
  close() {
    this.db.close();
  }
}
