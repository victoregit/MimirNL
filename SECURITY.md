# Security policy

Mimir is an early-development local memory engine with no completed independent security review. The package is licensed under MIT; dependency notices remain applicable. No production support or response-time commitment is established.

For a suspected vulnerability, contact the project owner through an existing trusted private channel if available. There is no configured security email or verified GitHub private-reporting channel. If no channel is available, ask for a private contact route in the project's existing discussion channel without posting exploit details, secrets or private memories. Supply a synthetic reproduction, affected version/platform and impact once a private route is agreed. Never upload real databases or backups as a reproduction.

## Trust boundaries

The local caller, database directory and installed Node/Git binaries must be trusted. Anyone who can access the stdio server can request operations; approval flags represent decisions forwarded by a trusted host, not a separate authentication mechanism. Embedded source instructions cannot approve deletion, verification or sharing. The importer only reads bounded authorized self-contained Git worktrees and never executes their scripts. Secret detection is heuristic and cannot guarantee that all sensitive material is detected. Review imported content before sharing.

Use a local filesystem with working SQLite locks. Keep Windows and WSL databases separate. POSIX files use private modes; Windows ACLs must be set by the operator. Concurrent hostile changes to filesystem components by another local user are outside the portable path-check guarantees. Backup destinations must have an existing trusted parent, cannot use symlink components or traversal, and cannot be inside registered analyzed projects.

## Retention and deletion

There is no automatic age expiry. Memory updates retain prior content and provenance in history. Feedback notes, relations and retrieval metrics persist locally. Memory deletion removes its history, feedback, relations, retrieval-item links and FTS rows through foreign-key cascades/triggers. Project deletion cascades its local memories and retrieval records. An explicitly approved global copy has an independent lifecycle and survives source-project deletion. Retrieval aggregates can remain after deleting one memory. Original Git files and commits remain untouched.

SQL deletion is logical deletion, **not secure physical erasure**. SQLite free pages, WAL/SHM, filesystem snapshots, OS caches and backups may retain content. WAL checkpointing or VACUUM cannot promise secure erasure on modern storage. Use OS encryption and controlled filesystem access, and manage independent copies according to your own retention policy. There are no network uploads or default telemetry. See [backup and recovery](docs/backup-restore.md) for copies, cleanup and retention.
