# Backup, restore and migration recovery

Back up from a trusted local account. Close unnecessary writers for predictable completion; SQLite online backup still captures consistent committed state with active WAL writers. Uncommitted transactions are excluded. This is a complete database backup, including global memories, project paths, provenance, history, feedback and metrics. It is unencrypted and should be treated as sensitive private data.

```sh
mimir --db /private/mimir/memory.sqlite backup /private/backups/snapshot-001.sqlite
mimir --db /private/recovery/new-memory.sqlite restore /private/backups/snapshot-001.sqlite --confirm
mimir --db /private/recovery/new-memory.sqlite doctor
```

Create destination parent directories first with private permissions. On PowerShell, use independent native paths such as `C:\Users\you\AppData\Local\mimir-nl\memory.sqlite` and a private backup folder; invoke the same commands with quoted paths. Do not place databases or backups inside an analyzed project. Windows ACLs are the operator's responsibility. Never open the same live database from WSL and Windows.

Backup uses `node:sqlite`'s online snapshot API; copying only the live `.sqlite` file can lose WAL content and is unsupported. A private sibling `.mimir-snapshot-*` directory contains work in progress. Completion validates the entire supported schema, migration version, integrity and foreign keys, switches the private snapshot to standalone DELETE journal mode, then publishes it atomically with a no-replace hard link. The filesystem must support hard links. POSIX staging directories are 0700 and snapshots are 0600. Existing destinations, WAL/SHM conflicts, path traversal, sensitive paths and symlink components are rejected. There is no overwrite option. Destination directories must be trusted against concurrent hostile local modifications.

Restore accepts only a regular standalone supported snapshot without WAL/SHM companions. It validates before creating a new target. Source and active databases are preserved. Failed operations remove their own staging directory, never the source or an existing target. An abrupt process/OS crash may leave a private `.mimir-snapshot-*` directory; once no backup/restore process is running, inspect and remove only the known incomplete directory. A completed destination is valid even if a crash left its staging link. No automatic retention or cleanup daemon exists.

Keep multiple dated offline snapshots, test restoration periodically, restrict access, and delete expired copies under your organization's retention policy. Deleting live records does not remove them from earlier snapshots. Filesystem/OS backups are additional independent copies. No automatic encryption or external upload is provided.

Before upgrading, create and verify a snapshot. Development0.4 supports exact knowledge schemas1 and2 for backup/restore; new databases use2. Normal operations refuse existing1 with MIGRATION_REQUIRED. Explicit `mimir --db EXISTING_SCHEMA1 migrate NEW_BACKUP1 --confirm` validates1, verifies a private backup, acquires a write lock, refuses changes since the backup, applies the extension transactionally and validates2 before commit. Restore retains its snapshot version; use approved0.3/149 for recovered1 or explicitly migrate the recovered copy. See [learning/migration recovery](v04/learning.md). Future/altered schemas are rejected. If an upgrade fails, stop writers, preserve the failed database plus sidecars for private diagnosis, and restore the pre-upgrade snapshot to a new path using the compatible engine. Point clients explicitly at that recovered path after checking doctor and representative memories/history. Do not downgrade by editing the migrations table. Future migrations require their own compatibility tests and recovery instructions.

Administrative backup/restore is exported as a library service and exposed through CLI only. It is deliberately absent from the MCP tool list: source text and model tool calls should not gain new filesystem administration privileges through this hardening change.

Atomic snapshot publication requires hard-link support on the destination filesystem. Backup and restore return `UNSUPPORTED_FILESYSTEM` when publication fails with EXDEV, ENOTSUP or EPERM; use a destination supporting hard links and check its permissions. Failed publication cleans up the temporary snapshot and does not overwrite an existing destination.
