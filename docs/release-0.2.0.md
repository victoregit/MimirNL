# 0.2.0 candidate — unreleased

Prepared 2026-10-26. Package, CLI `init` and MCP server report **0.2.0**. This candidate does not close the full v0.2 roadmap milestone. License: **MIT**.

The candidate includes persistent project memory, bounded retrieval, Git ingestion with untrusted-source labels, explicit approval and sanitized global sharing, scoped deletion, backup/restore and CLI/library/MCP interfaces. Linux/WSL Codex and Antigravity basic, cross-host, restart-read and sensitive service/metadata/cleanup evidence is recorded in the repository. Task35 added exclusive per-process audits and a bounded lifetime (default 240 minutes); Task36 independently approved that correction. Task37 Antigravity sensitive acceptance used explicit human choices relayed separately through actual one-time CLI dialogs.

Codex allowed-action UI evidence remains limited: service/audit and cleanup checks passed, but individual one-time allow dialogs were not independently enumerated. Metadata is not a full host trace. All actual model-host tests were Linux/WSL; native Windows core/SDK checks do not establish native model-host acceptance. No real-workload token savings, strict configuration isolation, or Windows ACL guarantee is claimed.

## Open gates

- Independent Flash review of this candidate, including the revised package smoke script.
- Native Windows model-host installation and acceptance using a separate native fixture; the installation-guide gate remains **OPEN**. The user's WSL-only usage does not waive it. Completed WSL workflows need no automatic rerun.
- Final assessment of the documented human-evidence limits and remaining milestone criteria.
- User-reviewed commit/push and successful Ubuntu/Windows remote CI on that **exact new commit**. Green baseline `6590684` is historical evidence only.

## Distributable

The package uses an explicit documentation allowlist: architecture, backup/restore, dependency notices, MCP contract/schemas, security and these notes, plus root governance/README/LICENSE and compiled code. Internal execution evidence, logs, host configuration, fixture manifests, acceptance runtime and task records stay in the repository and are excluded from the tarball. Repository integration/acceptance guides contain source-checkout procedures and historical evidence links; consult the repository for those guides.

Local candidates and SHA-256 files belong under ignored `.release/task39/`. Record the exact checksum and inventory after verification. A locally prepared archive is not a published release and does not establish remote CI.

## Publication procedure — operator steps, not executed

1. Resolve or explicitly assess the open gates without marking unmet native acceptance as passed. Obtain independent review, then have the user commit and push the deliberately reviewed scope. Confirm the exact commit's Ubuntu/Windows CI passes.
2. From that exact clean reviewed checkout on supported Node 24.22.1, run the required local checks and build, then `npm pack --json --pack-destination <local-output>`. Inspect the inventory and verify package/CLI/MCP versions and MIT license. Generate a SHA-256 checksum for `mimir-nl-0.2.0.tgz`; the archive must match the final reviewed commit, not merely this earlier local candidate.
3. The user creates a GitHub Release for the reviewed commit/tag `v0.2.0`, attaches the verified tarball and checksum file, and includes these notes with the actual gate status. Keep it a draft/prerelease while required acceptance remains open; do not describe the full milestone as completed. Confirm downloaded assets against the checksum before declaring publication successful.
4. The npm publication destination is **unconfirmed**. Do not run `npm publish` or infer authorization from the GitHub Release procedure. No release workflow or secrets configuration is introduced here.

Task39 performs no commit, push, tag, GitHub/npm publication, model/host call, global installation or host configuration change. The user handles commit/push; the supervisor routes independent review.
