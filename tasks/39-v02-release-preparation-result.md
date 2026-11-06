# Task39 result — 0.2.0 candidate preparation (2026-10-26)

Prepared a reviewable **0.2.0 candidate, unreleased**. No self-approval, commit, push, tag, GitHub/npm publication, model/model-host call, global installation/configuration change, or retained fixture DB access. User handles commit/push; supervisor routes independent Flash review. Local SDK subprocess checks below are application protocol tests, not model-host acceptance.

## Exact task-relative changes

- `/mnt/d/Projects/MimirNL/.gitignore`
- `/mnt/d/Projects/MimirNL/README.md`
- `/mnt/d/Projects/MimirNL/ROADMAP_MIMIR_NL.md`
- `/mnt/d/Projects/MimirNL/docs/dependencies.md`
- `/mnt/d/Projects/MimirNL/docs/host-acceptance.md`
- `/mnt/d/Projects/MimirNL/docs/integrations.md`
- `/mnt/d/Projects/MimirNL/docs/roadmap-execution.md`
- `/mnt/d/Projects/MimirNL/docs/v02-antigravity-acceptance.md`
- `/mnt/d/Projects/MimirNL/docs/v02-codex-acceptance.md`
- `/mnt/d/Projects/MimirNL/docs/v02-final-gates.md`
- `/mnt/d/Projects/MimirNL/docs/v02-final-human-workflow.md`
- `/mnt/d/Projects/MimirNL/docs/v02-final-installation.md`
- `/mnt/d/Projects/MimirNL/docs/v02-host-integration.md`
- `/mnt/d/Projects/MimirNL/package-lock.json`
- `/mnt/d/Projects/MimirNL/package.json`
- `/mnt/d/Projects/MimirNL/scripts/package-smoke.mjs`
- `/mnt/d/Projects/MimirNL/src/core/service.ts`
- `/mnt/d/Projects/MimirNL/src/mcp/index.ts`

New files:

- `/mnt/d/Projects/MimirNL/.prettierignore`
- `/mnt/d/Projects/MimirNL/docs/release-0.2.0.md`
- `/mnt/d/Projects/MimirNL/tasks/39-v02-release-preparation-result.md` (this report)

Only root package/lockfile versions and the two runtime version literals changed to 0.2.0; no dependency versions/metadata changed. The existing package smoke script now checks installed package version, executable `init`, actual installed MCP initialization serverInfo and MCP `init` against the source package version, with client cleanup in `finally`. Existing MIT/LICENSE assertions remain. No new broad test matrix or release automation.

The former whole-docs package entry included internal execution evidence and machine-specific host configuration; replaced it with seven explicit end-user documentation entries. README now links repository-only integration/validation/history pages remotely and states actual WSL evidence accurately; dependency notices link excluded historical runtime evidence remotely. Ten current evidence summaries say candidate/unreleased while historical report bodies retain their original versions/scope. `.release/` is ignored. `.prettierignore` excludes only the preserved local `SAVEPOINT_V0.2.md` coordination record, resolving its pre-existing format failure without rewriting it.

## Verification and artifacts

All following Linux commands used command-local PATH `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin` (Node **24.22.1**, existing pinned dependencies):

| Command                                                    | Result                                                                          |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `npm run typecheck`                                        | pass                                                                            |
| `npm run lint`                                             | pass                                                                            |
| `npm run format:check`                                     | first failed only on preserved SAVEPOINT; passed after explicit ignore          |
| `npm test`                                                 | **36 pass, 1 expected Windows-only skip, 0 failures** (37 total)                |
| `npm run schemas:check`                                    | pass                                                                            |
| `npm run package:smoke`                                    | pass; installed executable/MCP **0.2.0**, MIT, recovery, approval and isolation |
| `npm run benchmark`                                        | pass; synthetic sanity assertions, no real model token-savings claim            |
| focused Prettier after final roadmap whitespace adjustment | pass                                                                            |
| `git diff --check`                                         | pass                                                                            |
| `npm pack --json --pack-destination .release/task39`       | pass, **37 files**, 37,778 archive bytes / 133,869 unpacked bytes               |

Exact local candidate: `/mnt/d/Projects/MimirNL/.release/task39/mimir-nl-0.2.0.tgz`

SHA-256: `f5324f8043712dbd759c87b6c64adeb29d1c5287f9bdc7ce9c43cd68b7906654`

Checksum file: `/mnt/d/Projects/MimirNL/.release/task39/SHA256SUMS`.

Inventory was inspected from the actual tarball, not only a dry run: all 37 entries belong to the explicit package allowlist or compiled `dist`; package version is 0.2.0 and LICENSE contains MIT License. No local DB/WAL, raw log, private host config, credential filename, tasks, scripts, acceptance runtime, fixture manifests or node_modules is included. End-user docs/contract/governance and compiled library/CLI/types remain included. JSON entries are only package metadata and MCP schemas. Lockfile object comparison against HEAD confirmed **all dependency metadata unchanged** after normalizing only the two root version fields.

Native Windows focused installed-tarball smoke: **pass**, Node **v24.22.1**, platform **win32**. Used the existing disposable native Node/Git runtime and the exact above tarball copied to an isolated `C:\Users\Public\mimir-task39-*` staging directory. Invoked `cmd.exe /d /c <staging>\run.cmd`; runner adds the disposable Node/Git to process PATH, creates a staging-only node_modules junction to existing native test dependencies, and runs `node scripts\package-smoke.mjs`. The staged script is an exact copy of the revised smoke except it selects the already-built candidate archive instead of packing the staging directory. Installed package/CLI/MCP all reported **0.2.0**; MIT/license, doctor, backup/restore, feedback approval, ingestion and data isolation assertions passed. All DBs were newly created disposable smoke DBs and cleaned by the script. No WSL live database was shared with Windows. No native model-host acceptance is inferred.

Verification logs, checks.json, pack metadata, inventory, preservation summary and exact native harness copies are under ignored `/mnt/d/Projects/MimirNL/.release/task39/`. `native-staging.txt` and `native-command.txt` identify the retained disposable staging/harness for reviewer inspection. The sole revised repository script requiring new independent review is `scripts/package-smoke.mjs`; review should also assess the package allowlist and `.prettierignore` choice.

## Preservation and remaining gates

Before/after SHA-256 comparison covered **190 existing nonignored files**, excluding prohibited credential/config names: **18 intended existing files changed, 172 unchanged, zero deleted**. AGENTS.md, SAVEPOINT, existing tasks/findings/evidence and fixture scripts/tests are byte-identical to task entry. Snapshot manifest: `/tmp/mimir-task39/before.json`; result `.release/task39/preservation.json`. Concurrent supervisor task files were not edited. Ignored build output was rebuilt; retained fixture DBs were never opened.

Native Windows model-host installation/acceptance and the installation-guide gate remain **OPEN**; all actual model-host tests were Linux/WSL. Antigravity Task37 choices were explicit human decisions relayed separately through actual CLI dialogs. Codex individual allowed-action UI evidence remains limited; service/metadata/cleanup evidence does not fill that gap. Task35/36 relay correction/APPROVE remains historical reviewed evidence, not approval of this version/package change. No WSL host rerun was performed or requested.

Independent candidate review and final evidence assessment remain pending, followed by the user's reviewed commit/push and successful Ubuntu/Windows remote CI at that **exact new SHA**. Baseline `6590684` green CI does not validate this candidate. Full v0.2 roadmap closure is unclaimed. Release notes contain operator-only GitHub Release instructions with archive/checksum and draft/prerelease handling while gates remain open. npm destination is unconfirmed; no npm publication is authorized by this task. Rebuild/recheck the final artifact from the exact reviewed commit before any later publication.

Suggested commit title: `chore(release): prepare unreleased 0.2.0 candidate`
