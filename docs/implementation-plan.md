# Core v0.1 implementation plan

Recorded before implementation, 2026-10-24.

A. Establish strict TypeScript package and SQLite transactional migrations, private data paths, versioned memory and scoped dedup. Validate restart and concurrent writers.
B. Add literal FTS5 retrieval and a separate conservative context optimizer, explicit project/global boundaries and usage metrics.
C. Expose one Zod-validated service dispatcher through CLI, library and official MCP v2 stdio. Validate real subprocess SDK communication.
D. Add authorized read-only Git ingestion with canonical paths, bounds, ignore rules, secret checks and version/deletion handling; test disposable repositories only.
E. Add deterministic feedback, observation, relations, explicit sharing and confirmed deletion; run repeatable benchmark and document evidence.

Architecture: synchronous node:sqlite with WAL and BEGIN IMMEDIATE transactions, prepared statements, foreign-key cascades; explicit project selection everywhere. Global sharing is a separately approved copy without private provenance. Imported material stays candidate and untrusted. No embedding service or outbound application traffic. Git subprocesses use argument arrays and sanitized environment. Preserve existing README content and Git history; no commits, publishing or website changes.
