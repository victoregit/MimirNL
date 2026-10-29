import { DatabaseSync } from "node:sqlite";
import { lstatSync } from "node:fs";
import { assertLocalPath, AppError, hash, inside } from "../security/index.js";
import { assertPatchedSqlite, sqliteRuntime } from "./index.js";
import { backupFile } from "./backup.js";
import { MIGRATION_2_SQL, validateKnowledge } from "./schema.js";
function contentDigest(db: DatabaseSync) {
  const tables = [
    "migrations",
    "projects",
    "memories",
    "history",
    "feedback",
    "relations",
    "retrievals",
    "retrieval_items",
  ];
  return hash(
    JSON.stringify(
      tables.map((table) => [
        table,
        db
          .prepare(`SELECT * FROM ${table}`)
          .all()
          .map((r) => JSON.stringify(r))
          .sort(),
      ]),
    ),
  );
}
export async function migrateDatabase(
  source: string,
  backupDestination: string,
) {
  assertPatchedSqlite(sqliteRuntime().version);
  const path = assertLocalPath(source);
  if (!lstatSync(path).isFile())
    throw new AppError("INVALID_BACKUP", "Migration source must exist.");
  for (const suffix of ["-wal", "-shm"]) assertLocalPath(path + suffix);
  const probe = new DatabaseSync(path, { readOnly: true, timeout: 10000 });
  try {
    if (validateKnowledge(probe) !== 1)
      throw new AppError(
        "MIGRATION_NOT_REQUIRED",
        "Only exact schema1 can migrate to2.",
      );
    if (
      probe
        .prepare("SELECT path FROM projects")
        .all()
        .some((p) => inside(assertLocalPath(String(p.path)), path))
    )
      throw new AppError(
        "UNSAFE_DB",
        "Database cannot be inside an analyzed project.",
      );
  } finally {
    probe.close();
  }
  const snapshot = await backupFile(path, backupDestination);
  if (snapshot.schemaVersion !== 1)
    throw new AppError(
      "MIGRATION_RACE",
      "Source changed before migration backup.",
    );
  const db = new DatabaseSync(path, { timeout: 10000 });
  const saved = new DatabaseSync(assertLocalPath(backupDestination), {
    readOnly: true,
  });
  try {
    db.exec(
      "PRAGMA busy_timeout=10000; PRAGMA foreign_keys=ON; BEGIN IMMEDIATE;",
    );
    try {
      if (
        validateKnowledge(db) !== 1 ||
        validateKnowledge(saved) !== 1 ||
        contentDigest(db) !== contentDigest(saved)
      )
        throw new AppError(
          "MIGRATION_BACKUP_STALE",
          "Source differs from verified backup; retry with a new backup destination.",
        );
      db.exec(MIGRATION_2_SQL);
      if (validateKnowledge(db) !== 2)
        throw new AppError(
          "MIGRATION_FAILED",
          "Post-migration validation failed.",
        );
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
    return {
      schemaVersion: 2,
      previousSchemaVersion: 1,
      backup: snapshot.database,
      backupVerified: true,
      migrated: true,
    };
  } finally {
    saved.close();
    db.close();
  }
}
