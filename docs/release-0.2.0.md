# 0.2.0 — release-ready, unpublished

Prepared 2026-10-26. Package, CLI `init` and MCP server report **0.2.0**. Final independent evidence review and publication remain pending. License: **MIT**.

The candidate includes persistent project memory, bounded retrieval, Git ingestion with untrusted-source labels, explicit approval and sanitized global sharing, scoped deletion, backup/restore and CLI/library/MCP interfaces. Linux/WSL Codex and Antigravity basic, cross-host, restart-read and sensitive service/metadata/cleanup evidence is recorded in the repository. Task35 added exclusive per-process audits and a bounded lifetime (default 240 minutes); Task36 independently approved that correction. Task37 Antigravity sensitive acceptance used explicit human choices relayed separately through actual one-time CLI dialogs.

Codex allowed-action UI evidence remains limited: service/audit and cleanup checks passed, but individual one-time allow dialogs were not independently enumerated. Metadata is not a full host trace. Actual native Windows Codex 0.164.0 and Antigravity 1.4.7 / gemini-3.8-flash-high acceptance now passed for basic calls, restart persistence, scoped isolation, bounded ingestion and bidirectional cross-host reads. [Task44 canonical evidence](../tasks/44-native-final-evidence.json) records native Node 24.22.1 / SQLite 3.53.4 / Git 2.56.0, separate synthetic DB, final 2 projects / 3 candidates / 2 notes / 0 globals and integrity ok. Owned hosts are closed and the temporary entry removed; synthetic evidence is retained. Native approve/promote/delete were not tested; sensitive evidence remains scoped to WSL. No real-workload token savings, strict configuration isolation, or Windows ACL guarantee is claimed.

## Gate status

- Task40 independent Flash review **APPROVE** is complete, including the revised package smoke script.
- Native Windows model-host acceptance and the bounded [tested installation guide](v02-final-installation.md#actual-native-windows-method--task44) are complete. No new host calls or tests are required for this documentation closeout.
- Final assessment of the documented human-evidence limits and remaining milestone criteria.
- User commit/push completed at `27c586c2e12159223dd0cb90d27fcc6691775f28`; supervisor verified [CI 40270527306](https://github.com/victoregit/MimirNL/actions/runs/40270527306) SUCCESS on Ubuntu and Windows, all steps including installed smoke/schema/benchmark. Baseline `6590684` is historical; this CI does not validate subsequent doc edits.

## Distributable

The package uses an explicit documentation allowlist: architecture, backup/restore, dependency notices, MCP contract/schemas, security and these notes, plus root governance/README/LICENSE and compiled code. Internal execution evidence, logs, host configuration, fixture manifests, acceptance runtime and task records stay in the repository and are excluded from the tarball. Repository integration/acceptance guides contain source-checkout procedures and historical evidence links; consult the repository for those guides.

Exact-commit candidate: `.release/task41/mimir-nl-0.2.0.tgz`, SHA-256 `0079d6ea71d6e7189fcf54a5292247503f2f36e7cebb674e8abe40d11121e63f`, built from clean archived commit `27c586c2e12159223dd0cb90d27fcc6691775f28` on Linux Node 24.22.1 with locked dependencies. All 37 file contents match the reviewed Task39 archive; modes changed from `0755` to `0644`, so archive checksums differ. Installed-package smoke verifies this archive. Inventory, checksum and provenance accompany it under ignored `.release/task41/`. These updated notes are outside the immutable archive; its notes retain their exact-commit historical status. No publication occurred. See [Task41 result](../tasks/41-exact-commit-release-closeout-result.md).

## Publication procedure — operator steps, not executed

1. Obtain the final independent assessment of Task44 evidence and documented limits. Obtain independent review, then have the user commit and push the deliberately reviewed scope. Confirm the exact commit's Ubuntu/Windows CI passes.
2. From that exact clean reviewed checkout on supported Node 24.22.1, run the required local checks and build, then `npm pack --json --pack-destination <local-output>`. Inspect the inventory and verify package/CLI/MCP versions and MIT license. Generate a SHA-256 checksum for `mimir-nl-0.2.0.tgz`; the archive must match the final reviewed commit, not merely this earlier local candidate.
3. The user creates a GitHub Release for the reviewed commit/tag `v0.2.0`, attaches the verified tarball and checksum file, and includes these notes with the actual gate status. Do not describe the release as published until the actual GitHub release and assets are verified. Confirm downloaded assets against the checksum before declaring publication successful.
4. The npm publication destination is **unconfirmed**. Do not run `npm publish` or infer authorization from the GitHub Release procedure. No release workflow or secrets configuration is introduced here.

Task39 performs no commit, push, tag, GitHub/npm publication, model/host call, global installation or host configuration change. The user handles commit/push; the supervisor routes independent review.

## GitHub release body — copy after final review and exact-SHA CI

Mimir NL 0.2.0 provides persistent local project memory through CLI, library and MCP, bounded Git ingestion with untrusted-source labels, explicit approval, sanitized global sharing and backup/restore. Requires Node **>=24.22.1 <25** and Git. License: **MIT**.

Tested with Codex and Antigravity CLI on Linux/WSL and native Windows, including persistence, scoped isolation and cross-host reads. Native tests used Codex 0.164.0, Antigravity 1.4.7 / gemini-3.8-flash-high and Node 24.22.1. Sensitive approval/promotion/deletion evidence is WSL-only; Codex individual allow dialogs were not enumerated. Metadata is not a full host trace. No IDE/Desktop acceptance, Windows ACL certification, strict configuration isolation or real-workload token savings is claimed.

Attach the tarball and SHA-256 checksum rebuilt from the final user commit after its Ubuntu/Windows CI succeeds; record that exact SHA and CI link at publication. The Task41 checksum describes an earlier archive and must not be reused for the final build. GitHub distribution only; no npm publication.
