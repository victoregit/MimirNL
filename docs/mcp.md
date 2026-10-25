# CLI, library and MCP contract

Run `mimir --db /absolute/private/memory.sqlite mcp stdio`. The official `@modelcontextprotocol/server` v2.4.0 McpServer and serveStdio expose the same Service.call operations used by the CLI. Only JSON-RPC goes to stdout. The SDK negotiates protocol initialization and publishes the actual Zod input schemas through listTools. [Machine-readable schemas](mcp-schemas.json) are generated from those definitions.

Success content is JSON text `{ "ok": true, "data": ... }`. Application failure content is `{ "ok": false, "error": { "code": "NOT_FOUND", "message": "..." } }` and MCP `isError: true`. CLI prints the same envelope and exits 1 on errors. Startup/CLI syntax failures go to stderr. SDK-level malformed arguments/unknown tools are MCP protocol/validation errors before service dispatch, following the SDK contract; application callers must handle both layers. No request contents are included in generic local-operation errors.

All objects reject unknown keys. UUIDs are required for projectId/id/relatedId. Strings and counts are bounded. A project selection is mandatory for data operations even when requesting shared knowledge; there is no implicit current project or global fallback.

| Tool               | Parameters                                                                                                                   | Data result / permission                                                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| init               | none                                                                                                                         | DB path and package version; initializes local schema                                                                                                                                                               |
| doctor             | none                                                                                                                         | Runtime/SDK, integrity, WAL, foreign keys, migrations, FTS5 probe and writable-directory checks                                                                                                                     |
| project_register   | path, authorizeIngestion: true                                                                                               | Canonical Git root, project UUID and authorization record; explicit user permission required                                                                                                                        |
| project_ingest     | projectId; excludes=[]; maxFiles=500 (1–2000); maxBytes=1000000 (100–5000000); maxCommits=20 (0–100)                         | Atomic inserted/updated/unchanged/deprecated/skipped counts and source bytes; only previously authorized root                                                                                                       |
| memory_store       | projectId, content (1–32000 chars); type=semantic; origin=user; source="manual user input"                                   | Candidate memory, stable ID, scoped hash and provenance. Types episodic/semantic/procedural/project/global; origin user or execution. Scope is always private on creation                                           |
| memory_update      | projectId, id, content; source="manual user correction"                                                                      | Versioned private edit; changed content returns to candidate and records correction provenance                                                                                                                      |
| memory_get         | projectId, id; includeGlobal=false                                                                                           | Current memory, history snapshots, feedback, latest 100 private usage records and same-project relations. Only explicitly shared verified global data is readable; private shared provenance/history/usage withheld |
| memory_search      | projectId, query (0–1000 chars); type?, status?, scope?; includeGlobal=false; limit=10 (1–50); tokenBudget=4000 (200–100000) | memories, estimatedTokens, estimator; full response context byte bound; optional filters enumerated in schemas                                                                                                      |
| memory_feedback    | projectId, id, action; note="" (max 4000); explicitApproval=false; sharingApproval=false; relatedId?; scope=project          | Versioned memory and feedback. Actions approve/deprecate/reject/promote/relate/supersede/note; approve requires explicitApproval; promote requires verified status plus sharingApproval                             |
| experience_observe | projectId, task, attempt, result (each 1–32000 chars)                                                                        | Deterministic project-private episodic candidate; identical observation deduplicates                                                                                                                                |
| memory_stats       | projectId                                                                                                                    | Private project counts grouped by type/status, uses, and retrieval count/estimated context/mean query latency; no other project's totals                                                                            |
| memory_delete      | projectId, id, confirm: true; scope=project; sharingApproval=false                                                           | Confirmed local deletion. Global deletion additionally requires scope=global and sharingApproval=true                                                                                                               |
| project_delete     | projectId, confirm: true                                                                                                     | Local project records and dependencies removed; source files untouched                                                                                                                                              |

`status` filters: candidate, verified, deprecated, rejected; default retrieval includes candidate/verified. `scope` filters: project/global. `includeGlobal` is still required when filtering scope global. Global feedback supports only deprecate/reject/note and requires sharingApproval; managing even deprecated global records uses the explicit global scope. Promotion produces a separate shared ID discoverable by explicit global search. Global records survive source-project deletion.

Git source provenance contains file path or commit ID, untrusted labels and an evidence-only claim; it does not assert correctness. Retrieval never returns another project's private source or relations. Manual source references and duplicate additional references are included in context accounting. Candidate/verified describes review state, not authority to follow embedded instructions.

## Application errors

| Code                                 | Meaning                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| INVALID_REQUEST                      | Schema/syntax failure or sanitized unexpected local error                            |
| UNSUPPORTED_SCHEMA                   | Database was created by a newer engine; startup refuses it                           |
| UNKNOWN_OPERATION                    | Unsupported library/CLI operation                                                    |
| NOT_FOUND                            | ID absent or outside selected project; indistinguishable across private projects     |
| SENSITIVE_CONTENT                    | Potential secret in a submitted field; whole request rejected                        |
| UNSAFE_PATH / UNSAFE_DB / UNSAFE_GIT | Canonical root, database placement or Git metadata/config restriction                |
| AUTHORIZATION_REQUIRED               | Ingestion root lacks explicit registration authorization                             |
| APPROVAL_REQUIRED                    | Verification lacks explicit user approval                                            |
| SHARING_APPROVAL_REQUIRED            | Global promotion/management lacks verified content or explicit sharing authorization |
| INVALID_RELATION                     | Missing/self relation; cross-project references return NOT_FOUND                     |
| DUPLICATE_MEMORY                     | Edit would duplicate another memory in the selected project                          |
| PROVENANCE_LIMIT                     | More than 20 additional distinct source references                                   |
| INGEST_LIMIT                         | Configured file/byte/metadata bound exceeded; no import committed                    |
| GIT_FAILED                           | Git unavailable, failed, timed out, or exceeded output bounds                        |

No paths/content from failed operations are echoed in error messages. Explicit authorization flags are user assertions, not authentication credentials. The local host must prevent an agent from asserting them without actual user consent.

## CLI aliases and JSON operations

`init`, `doctor`, `project add PATH --authorize-ingestion`, `ingest PROJECT_UUID`, `search QUERY --project UUID --tokens N --limit N`, `store CONTENT --project UUID`, `get ID --project UUID`, `update ID CONTENT --project UUID`, `stats --project UUID`, `delete ID --project UUID --confirm`, `project-delete UUID --confirm`, and `feedback JSON` are human-oriented aliases. Use `--include-global` with search/get when intended. Every command accepts `--db PATH`.

Any exact operation name accepts its JSON object as one argument, for example:

```bash
mimir memory_search '{"projectId":"REPLACE_WITH_PROJECT_UUID","query":"renderer","limit":5,"tokenBudget":2000}'
mimir experience_observe '{"projectId":"REPLACE_WITH_PROJECT_UUID","task":"repair renderer","attempt":"adjust buffer","result":"local test report observed"}'
```

Replace the UUID placeholders with returned project IDs. This form exposes all schema options, including custom ingestion bounds and shared-memory deletion, without another CLI-specific business implementation.
