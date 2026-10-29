# Changelog

## 0.4.0-dev.0 (unreleased)

Opt-in local measurement sidecar, scoped CLI/MCP lifecycle and reports, CLI-only private logical backup/restore and retention. Knowledge schema remains1. Pending independent review and subsequent real-use acceptance.

## 0.3.0 — candidate / unreleased

- Preserve persistent SQLite/FTS5 memory, project isolation, provenance and explicit approval boundaries.
- Deduplicate search matches before limit with duplicate provenance; add opt-in balanced lexical policy, verified tie recency, compact output and local response telemetry. Defaults remain legacy/full/off.
- Add offline reproducible benchmark tooling, pinned public source fixtures, bounded evaluation evidence and an experimental EF03 exact context deduplication helper. No external API is activated automatically.
- Use package metadata as the single runtime version source for CLI init and MCP; curate the npm documentation allowlist.
- Keep Node >=24.22.1 <25 and the patched SQLite runtime guard. No new dependency, database migration or schema-version change.

The EF03 pilot used two known high-overlap DEV tasks, n=1 per condition: input 31,029 → 29,505 (-4.91%); total 31,398 → 29,890 (-4.80%); quality 4/4 PASS. Both exact-v1 transports were slower. Cost is unknown; cache counts do not identify cached content or a fixed host floor. No general efficiency gain is established. Broader real-use learning remains planned for 0.4.

Review137, local commits, remote CI, tagging and publication are pending. See [release notes](docs/release-0.3.0.md).

## 0.2.0 — historical candidate, unpublished

Host integration, security hardening, backup/restore and cross-platform acceptance evidence are preserved in the [historical release notes](docs/release-0.2.0.md). Those receipts do not validate the 0.3.0 candidate.
