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
export const SCHEMA_SQL = `
 CREATE TABLE IF NOT EXISTS migrations(version INTEGER PRIMARY KEY); INSERT OR IGNORE INTO migrations VALUES(1);
 CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,path TEXT NOT NULL UNIQUE,authorized INTEGER NOT NULL,created TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS memories(id TEXT PRIMARY KEY,project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,scope TEXT NOT NULL CHECK(scope IN ('project','global')),type TEXT NOT NULL,content TEXT NOT NULL,hash TEXT NOT NULL,status TEXT NOT NULL,origin TEXT NOT NULL,source TEXT NOT NULL,version INTEGER NOT NULL,created TEXT NOT NULL,updated TEXT NOT NULL,uses INTEGER NOT NULL DEFAULT 0,CHECK((scope='project' AND project_id IS NOT NULL) OR (scope='global' AND project_id IS NULL)));
 CREATE UNIQUE INDEX IF NOT EXISTS memory_dedup ON memories(COALESCE(project_id,''),hash,scope);
 CREATE INDEX IF NOT EXISTS memory_project ON memories(project_id,status,type);
 CREATE TABLE IF NOT EXISTS history(memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,version INTEGER NOT NULL,snapshot TEXT NOT NULL,at TEXT NOT NULL,PRIMARY KEY(memory_id,version));
 CREATE TABLE IF NOT EXISTS feedback(id TEXT PRIMARY KEY,memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,action TEXT NOT NULL,note TEXT NOT NULL,at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS relations(a TEXT REFERENCES memories(id) ON DELETE CASCADE,b TEXT REFERENCES memories(id) ON DELETE CASCADE,kind TEXT NOT NULL,PRIMARY KEY(a,b,kind));
 CREATE TABLE IF NOT EXISTS retrievals(id TEXT PRIMARY KEY,project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,elapsed_ms REAL NOT NULL,tokens INTEGER NOT NULL,count INTEGER NOT NULL,at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS retrieval_items(retrieval_id TEXT REFERENCES retrievals(id) ON DELETE CASCADE,memory_id TEXT REFERENCES memories(id) ON DELETE CASCADE,PRIMARY KEY(retrieval_id,memory_id));
 CREATE INDEX IF NOT EXISTS retrieval_memory ON retrieval_items(memory_id);
 CREATE VIRTUAL TABLE IF NOT EXISTS memory_fts USING fts5(id UNINDEXED,content);
 CREATE TRIGGER IF NOT EXISTS memory_ai AFTER INSERT ON memories BEGIN INSERT INTO memory_fts VALUES(new.id,new.content); END;
 CREATE TRIGGER IF NOT EXISTS memory_ad AFTER DELETE ON memories BEGIN DELETE FROM memory_fts WHERE id=old.id; END;
 CREATE TRIGGER IF NOT EXISTS memory_au AFTER UPDATE OF content ON memories BEGIN DELETE FROM memory_fts WHERE id=old.id; INSERT INTO memory_fts VALUES(new.id,new.content); END;`;
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
    this.db = new DatabaseSync(this.path);
    this.db.exec(
      "PRAGMA busy_timeout=10000; PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;",
    );
    if (
      this.db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'",
        )
        .get()
    ) {
      const version = this.db
        .prepare("SELECT max(version) AS version FROM migrations")
        .get();
      if (Number(version?.version) > 1) {
        this.db.close();
        throw new AppError(
          "UNSUPPORTED_SCHEMA",
          "Database migration version is newer than this engine.",
        );
      }
    }
    this.transaction(() => this.db.exec(SCHEMA_SQL));
    for (const p of this.db.prepare("SELECT path FROM projects").all())
      if (inside(String(p.path), this.path)) {
        this.db.close();
        throw new AppError(
          "UNSAFE_DB",
          "Database cannot be inside an analyzed repository.",
        );
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
