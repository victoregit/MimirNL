# Core v0.1 validation evidence

Validated locally on 2026-10-24. Work was confined to MimirNL plus explicitly disposable OS-temp runtimes, Git fixtures and package-install directories. No user repository was ingested, no website files changed, and no commit/push/publish or host-configuration change was performed. Independent review is pending; this report records executed checks, not self-approval.

## Stages

| Stage | Implemented behavior                                                                                                                              | Executed evidence                                                                                                                                                                                                |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A     | Strict TS package/bin/library, private SQLite WAL/FTS5, transactional migration/version/history/dedup                                             | Restart persistence, rollback, six independent writers with one resulting ID, POSIX mode, newer-schema refusal                                                                                                   |
| B     | Literal BM25, explicit filters/isolation, complete context budget, dedup and usage metrics                                                        | Two-project ID/search/stats/relation isolation, empty/no-match, filters, full response budget and fixture benchmark                                                                                              |
| C     | One Zod service for CLI and official MCP v2                                                                                                       | Real SDK initialize/listTools/callTool subprocess sessions; two simultaneous clients; reciprocal CLI reads/writes; packed executable install                                                                     |
| D     | Explicit canonical Git authorization, bounded read-only incremental import, language/category and fix/change provenance                           | Disposable Git repositories, repeated/changed/deleted sources, tracked/untracked ignores, binaries, sensitive paths/content, symlinks, custom excludes, bounds, external config rejection, uncommitted Git roots |
| E     | Deterministic observations, feedback/review states, versioned manual edits, same-project relations, explicit global copies and confirmed deletion | Observation dedup, approval/sharing guards, shared lifecycle, history, duplicate-edit rollback, source directories preserved after local deletion                                                                |

## Commands and results

Use the latest native Node 24 LTS (24.22.1+ within 24.x). This rerun used official Linux x64 Node **v24.22.1**, npm **11.19.1**, SQLite **3.53.4**, at `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`, via a command-local PATH prefix. Official release metadata and verified archive checksum are in [runtime-download.json](runtime-download.json).

The former Node 24.10.0 / SQLite 3.50.4 results are superseded: passing application tests cannot prove an upstream WAL corruption race safe. Startup now checks SQLite on an in-memory connection before any database filesystem/open/WAL/migration action, accepting >=3.51.3 and backports 3.50.7 / 3.44.6. Boundary/unknown-version regressions and actual patched doctor diagnostics are automated. An actual old-runtime CLI doctor invocation exited 1 with `UNSUPPORTED_SQLITE`, versions and upgrade guidance, without creating the database or its previously absent parent directory; see [sqlite-runtime-rejection.txt](sqlite-runtime-rejection.txt). Independent review remains pending.

```bash
npm ci
npm run typecheck
npm test
npm run docs:schemas
npm run format:check
npm run benchmark
npm pack --json --pack-destination /tmp
```

- `npm ci`: passed, 18 packages installed; 0 npm audit findings reported during installation. This does not constitute a security audit.
- `npm run typecheck`: passed with strict TypeScript 5.9.3.
- `npm test`: build passed, **17 tests passed, 0 failed/skipped**, approximately 12.67 seconds. Full output is in [test-results.txt](test-results.txt).
- `npm run docs:schemas`: built successfully and generated schemas directly from the Zod definitions. Re-run after schema changes.
- Formatting check: passed after formatting code/docs with pinned Prettier.
- `node test/benchmark.mjs` after the successful build: produced [benchmark-results.json](benchmark-results.json). `npm run benchmark` builds then executes the same fixture; it was also executed during implementation.
- A package tarball was installed with `npm install --prefix TEMP_DIR --ignore-scripts /tmp/mimir-nl-0.1.0.tgz`. Its real `node_modules/.bin/mimir` executable successfully ran initialization, doctor, registration, incremental ingestion, search, store/update/get, approval, stats, and confirmed memory/project deletion against a disposable fixture; see [package-smoke.txt](package-smoke.txt). Executable permissions were verified. No global installation or npm publication was required.

Exact direct dependency pins: `@modelcontextprotocol/server@2.4.0`, `zod@4.6.7`; development/test `@modelcontextprotocol/client@2.4.0`, `typescript@5.9.3`, `@types/node@24.10.0`, `prettier@3.6.2`. [package-lock.json](../package-lock.json) pins transitive versions/integrities. See [dependencies](dependencies.md) for online API verification.

## Actual MCP coverage

The test launches `node dist/cli/index.js --db TEMP_DB mcp stdio` using the **published official v2 Client and StdioClientTransport**. It initializes two server subprocesses, lists required tools, concurrently stores identical content, searches, registers and ingests another authorized fixture, approves a memory, reads stats, verifies missing-ID errors, and reads each transport's writes through the other transport/CLI. Clients close in `finally`. No mocked transports or SDK v1 examples are used. JSON-RPC stdout parsing succeeds; SQLite warnings remain on stderr. Tests also launch six independent CLI writer processes against the same WAL database.

## Eleven acceptance checks

1. Create/restart persistence: verified, including history and rollback.
2. Register two projects: verified repeatedly in isolation tests.
3. Ingest Git fixture: verified through service and actual MCP calls.
4. Reingest unchanged without duplicates: verified by inserted/updated counts and IDs.
5. Relevant search: verified by fixture content and deterministic benchmark labels.
6. Cross-project isolation: ID/search/stats/relations and explicit global opt-in verified.
7. Candidate feedback transition: approval guard, verified/rejected/deprecated states and content-edit invalidation verified.
8. Real SDK communication: initialized/listed/called subprocesses successfully.
9. CLI/MCP shared memories: reciprocal reads/writes on one explicit DB verified.
10. Build/typecheck/tests: passed; 17 automated tests.
11. Runnable documentation/package: install/build scripts, installed executable smoke, generated schemas and host configuration references supplied. Native host acceptance remains untested.

## Measured benchmark

A deterministic corpus contains 100 memories; indices 0–7 contain the labeled query concepts. Each mode is measured on this local run:

| Mode                       | Returned | Context UTF-8 byte upper bound |                 Latency ms | Precision | Recall |
| -------------------------- | -------: | -----------------------------: | -------------------------: | --------: | -----: |
| Without provided memory    |        0 |                              0 | 0 (no retrieval operation) |         0 |      0 |
| Full corpus, read and pack |      100 |                         52,065 |                      8.833 |      0.08 |   1.00 |
| Selective query and pack   |        8 |                          4,317 |                      2.799 |      1.00 |   1.00 |

Empty-output precision is defined as zero for this report. Selective latency includes retrieval, context packing and metric writes; full-corpus latency includes reading/packing but no metric writes. This is a synthetic keyword benchmark, one run, not a model-quality experiment or proof of general speed improvement. Counts are conservative byte upper bounds, **not real tokenizer counts or measured model savings**. Rerun timings will vary.

## Windows and remaining limits

Native Windows Node v24.21.0 successfully initialized/reopened a separate temp DB and reported SQLite 3.53.4, integrity `ok`, and WAL. Windows Git was unavailable (`git ENOENT`), so full Windows ingestion/test-suite execution was not possible; doctor correctly reports Git unavailable. WSL/Linux has full automated coverage. Native PowerShell examples require a Windows Git installation and a fresh Windows dependency install.

Codex and Google Antigravity configurations follow official documentation, verified online, but neither real host was configured or tested. Only the official SDK client integration is claimed. The secret detector is heuristic and not exhaustive DLP. Linked worktrees/submodules/external object stores are unsupported; source scripts/tests are never executed. SQLite storage is unencrypted, deletion is logical rather than secure erasure, and WAL requires a trustworthy local filesystem. Approval flags assume a trusted local host forwarding actual human decisions. No embeddings or model training are implemented; extension interfaces are provided. License remains To be defined.

Recommended next steps are independent code/security review, host acceptance on disposable projects, and native Windows Git/MCP tests before real repository use.
