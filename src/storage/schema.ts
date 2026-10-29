import { parseLearning } from "../learning/schemas.js";
import { DatabaseSync } from "node:sqlite";
import { AppError } from "../security/index.js";
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
// Schema1 is immutable. Schema2 adds one canonical learning JSON extension;
// history snapshots already capture the complete memory row atomically.
export const MIGRATION_2_SQL =
  "ALTER TABLE memories ADD COLUMN learning TEXT NOT NULL DEFAULT '{}'; UPDATE migrations SET version=2;";
export const SCHEMA_2_SQL = SCHEMA_SQL + "\n" + MIGRATION_2_SQL;
function layout(db: DatabaseSync) {
  return db
    .prepare(
      "SELECT type,name,tbl_name,sql FROM sqlite_master WHERE sql IS NOT NULL ORDER BY name",
    )
    .all();
}
export function validateKnowledge(db: DatabaseSync): 1 | 2 {
  const reference = new DatabaseSync(":memory:");
  try {
    const versions = db
      .prepare("SELECT version FROM migrations ORDER BY version")
      .all();
    const version = versions.length === 1 ? Number(versions[0]!.version) : 0;
    if (version !== 1 && version !== 2)
      throw new AppError(
        "UNSUPPORTED_SCHEMA",
        "Database migration version is unsupported.",
      );
    reference.exec(version === 1 ? SCHEMA_SQL : SCHEMA_2_SQL);
    if (JSON.stringify(layout(db)) !== JSON.stringify(layout(reference)))
      throw new AppError(
        "INVALID_BACKUP",
        "Database schema is not supported by this engine.",
      );
    const integrity = db.prepare("PRAGMA integrity_check").all();
    if (
      integrity.length !== 1 ||
      integrity[0]?.integrity_check !== "ok" ||
      db.prepare("PRAGMA foreign_key_check").all().length
    )
      throw new AppError("INVALID_BACKUP", "Database integrity check failed.");
    if (version === 2)
      for (const row of db.prepare("SELECT learning FROM memories").all())
        parseLearning(row.learning);
    return version;
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError(
      "INVALID_BACKUP",
      "Database schema could not be validated.",
    );
  } finally {
    reference.close();
  }
}
