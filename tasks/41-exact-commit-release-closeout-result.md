# Task41 exact-commit release closeout result — 2026-10-26

DOC/BUILD-ONLY work completed; no self-approval or publication. The user reserves all commits/pushes. No repository source, scripts, tests, versions, models, hosts or global configuration changed; retained live databases were not accessed. Pre-existing AGENTS.md edits and task instructions were preserved.

## Artifact and provenance

- Archive: `/mnt/d/Projects/MimirNL/.release/task41/mimir-nl-0.2.0.tgz`
- SHA-256: `0079d6ea71d6e7189fcf54a5292247503f2f36e7cebb674e8abe40d11121e63f`
- Exact source: `27c586c2e12159223dd0cb90d27fcc6691775f28`, exported with `git archive` to `/tmp/mimir-task41-4PxBKB` before any closeout doc edits. Archive never repacked after those edits.
- Linux Node **24.22.1**, npm **11.19.1**; normal locked dependency installation with `npm ci --no-audit --no-fund`, then `npm run build` and one `npm pack --json --pack-destination /mnt/d/Projects/MimirNL/.release/task41`.
- Actual archive inventory: **37 files**, package **0.2.0**, package license **MIT** and MIT LICENSE verified. Explicit allowlist contains compiled code and curated public docs/governance; no tasks, database, host configuration or runtime evidence.
- Checksum/inventory/provenance: `.release/task41/SHA256SUMS`, `inventory.txt`, `pack.json`, `provenance.json`; build/install logs alongside them.

Reviewed Task39 reference was recovered from `/mnt/c/Users/Public/mimir-task39-vfekg7w8/mimir-nl-0.2.0.tgz`; its SHA-256 matches the approved `f5324f8043712dbd759c87b6c64adeb29d1c5287f9bdc7ce9c43cd68b7906654`. Every one of the 37 file contents and all inventory names match exactly. All file modes differ: Task39 `0755`, clean Linux archive `0644`; uid/gid/mtime/owner metadata match. Thus the new archive is **not byte-identical**; this is a mode-only difference, recorded per entry in `comparison.json` (37,782 vs 37,778 compressed bytes, same 133,869 unpacked bytes).

## Focused verification

The staging-only copy of `scripts/package-smoke.mjs` was adjusted solely to select/copy this already-built archive instead of invoking another pack. Repository scripts remain unchanged. `PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH node scripts/package-smoke.mjs` passed against the exact new archive: installed executable, CLI/init and MCP **0.2.0**, MIT, backup/restore, feedback approval and isolation. It used new disposable smoke databases only. Harness copy: `.release/task41/package-smoke-harness.mjs`; output: `installed-smoke.log`. Native Windows smoke was not rerun; the new mode-specific executable installation was verified on Linux, and the task-supplied supervisor verification establishes exact-commit CI success on both platforms.

Supervisor verified [CI run 40270527306](https://github.com/victoregit/MimirNL/actions/runs/40270527306): exact SHA above, overall SUCCESS; Ubuntu/Windows all steps successful including types/lint/format/tests/schema/package smoke/benchmark. This is supervisor-provided evidence, not a fresh worker API check. It supersedes current-status baseline-only CI claims; historical `6590684` evidence and old task bodies remain intact. This green CI does **not** cover subsequent documentation edits.

Focused Prettier on the changed docs passed; `git diff --check` passed. Entry-to-exit tracked-file SHA-256 comparison is in `.release/task41/preservation.json`: only the eleven listed docs changed; all other entry hashes, including source/tests/scripts/package metadata and AGENTS.md, remained unchanged. HEAD remains the exact source SHA. No broad test/review loop was initiated.

## Changed documentation

- `ROADMAP_MIMIR_NL.md`
- `docs/host-acceptance.md`
- `docs/integrations.md`
- `docs/roadmap-execution.md`
- `docs/v02-antigravity-acceptance.md`
- `docs/v02-codex-acceptance.md`
- `docs/v02-final-gates.md`
- `docs/v02-final-human-workflow.md`
- `docs/v02-final-installation.md`
- `docs/v02-host-integration.md`
- `docs/release-0.2.0.md`

New task result: `tasks/41-exact-commit-release-closeout-result.md`. Ignored build/provenance evidence is under `.release/task41/`.

## Remaining gate

Native Windows actual model-host installation/executable availability and acceptance with a separate native fixture remain **OPEN**, along with the final release-scope/operator decision and evidence assessment. Codex individual allowed-action UI limitation is retained. Core/SDK/CI success does not establish native model-host acceptance. Package is a **0.2.0 candidate, unreleased**; full v0.2 completion is unclaimed, npm destination remains unconfirmed. No commit, push, tag, publication or host/model call occurred. Any subsequent doc commit/push belongs to the user.
