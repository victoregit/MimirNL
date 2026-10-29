import { validateKnowledge } from "./schema.js";
import { backup, DatabaseSync } from "node:sqlite";
import {
  mkdtempSync,
  chmodSync,
  lstatSync,
  linkSync,
  rmSync,
  openSync,
  closeSync,
  readSync,
  constants,
} from "node:fs";
import { dirname, join } from "node:path";
import { AppError, assertLocalPath, inside } from "../security/index.js";
import { assertPatchedSqlite, sqliteRuntime, type Storage } from "./index.js";

function validate(db: DatabaseSync): string[] {
  db.exec(
    "PRAGMA trusted_schema=OFF; PRAGMA query_only=ON; PRAGMA busy_timeout=10000;",
  );
  validateKnowledge(db);
  return db
    .prepare("SELECT path FROM projects")
    .all()
    .map((p) => String(p.path));
}

function targetPath(path: string, projects: string[]) {
  const target = assertLocalPath(path);
  if (!lstatSync(dirname(target)).isDirectory())
    throw new AppError("UNSAFE_PATH", "Destination parent must exist.");
  if (projects.some((p) => inside(assertLocalPath(p), target)))
    throw new AppError(
      "UNSAFE_DB",
      "Destination cannot be inside an analyzed project.",
    );
  for (const suffix of ["", "-wal", "-shm"]) {
    const candidate = assertLocalPath(target + suffix);
    try {
      lstatSync(candidate);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw e;
    }
    throw new AppError(
      "TARGET_EXISTS",
      "Destination database or sidecar already exists.",
    );
  }
  return target;
}

async function snapshot(
  db: DatabaseSync,
  destination: string,
  projects: string[],
) {
  const target = targetPath(destination, projects);
  // A private sibling directory keeps incomplete snapshots invisible to consumers.
  const work = mkdtempSync(join(dirname(target), ".mimir-snapshot-"));
  if (process.platform !== "win32") chmodSync(work, 0o700);
  const temporary = join(work, "snapshot.sqlite");
  try {
    await backup(db, temporary, { rate: 64 });
    if (process.platform !== "win32") chmodSync(temporary, 0o600);
    const finalize = new DatabaseSync(temporary);
    try {
      finalize.exec("PRAGMA journal_mode=DELETE");
    } finally {
      finalize.close();
    }
    const check = new DatabaseSync(temporary, {
      readOnly: true,
      timeout: 10000,
    });
    let capturedProjects: string[];
    let schemaVersion: 1 | 2;
    try {
      capturedProjects = validate(check);
      schemaVersion = validateKnowledge(check);
    } finally {
      check.close();
    }
    // Recheck projects from the captured snapshot, including concurrent registrations.
    targetPath(target, capturedProjects);
    // Atomic no-replace publication: link fails if another writer created target.
    try {
      linkSync(temporary, target);
    } catch (error) {
      if (
        ["EXDEV", "ENOTSUP", "EPERM"].includes(
          (error as NodeJS.ErrnoException).code ?? "",
        )
      )
        throw new AppError(
          "UNSUPPORTED_FILESYSTEM",
          "Destination filesystem does not support hard links for atomic publication.",
        );
      throw error;
    }
    return { database: target, schemaVersion, consistentSnapshot: true };
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

export async function backupDatabase(storage: Storage, destination: string) {
  return snapshot(
    storage.db,
    destination,
    storage.db
      .prepare("SELECT path FROM projects")
      .all()
      .map((p) => String(p.path)),
  );
}

export async function restoreDatabase(source: string, destination: string) {
  assertPatchedSqlite(sqliteRuntime().version);
  const path = assertLocalPath(source);
  if (!lstatSync(path).isFile())
    throw new AppError("INVALID_BACKUP", "Backup must be a regular file.");
  // Reject WAL-format sources before SQLite can create a source SHM/WAL file.
  const descriptor = openSync(
    path,
    constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
  );
  try {
    const header = Buffer.alloc(100);
    if (
      readSync(descriptor, header, 0, 100, 0) !== 100 ||
      header.subarray(0, 16).toString() !== "SQLite format 3\0" ||
      header[18] !== 1 ||
      header[19] !== 1
    )
      throw new AppError(
        "INVALID_BACKUP",
        "Restore requires a standalone SQLite snapshot in DELETE journal mode.",
      );
  } finally {
    closeSync(descriptor);
  }
  // Standalone snapshots only. Opening an arbitrary live DB may create sidecars.
  for (const suffix of ["-wal", "-shm"]) {
    try {
      lstatSync(path + suffix);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw e;
    }
    throw new AppError(
      "INVALID_BACKUP",
      "Restore requires a standalone snapshot without WAL/SHM.",
    );
  }
  const db = new DatabaseSync(path, { readOnly: true, timeout: 10000 });
  try {
    const projects = validate(db);
    return await snapshot(db, destination, projects);
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError(
      "INVALID_BACKUP",
      "Backup could not be validated or restored.",
    );
  } finally {
    db.close();
  }
}

// Administrative backup can read either exact known layout without opening the
// normal schema2-only Storage constructor or implicitly migrating schema1.
export async function backupFile(source: string, destination: string) {
  assertPatchedSqlite(sqliteRuntime().version);
  const path = assertLocalPath(source);
  if (!lstatSync(path).isFile())
    throw new AppError("INVALID_BACKUP", "Source database must exist.");
  for (const suffix of ["-wal", "-shm"]) assertLocalPath(path + suffix);
  const db = new DatabaseSync(path, { readOnly: true, timeout: 10000 });
  try {
    return await snapshot(db, destination, validate(db));
  } finally {
    db.close();
  }
}
