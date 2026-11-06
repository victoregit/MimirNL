# Architecture and decisions

## Boundaries

`src/core/service.ts` is the shared application service; `schemas.ts` validates every operation. CLI and MCP only adapt transports. Public exports in `src/index.ts` expose Service, Storage, schemas, ingestion and retrieval interfaces. `Service.call()` returns a promise containing a success/error envelope; callers must check `ok`. Close the service after local library use.

```js
import { Service, Storage } from "mimir-nl";
const service = new Service(new Storage("/absolute/private/memory.sqlite"));
const result = await service.call("memory_stats", {
  projectId: "existing-project-uuid",
});
console.log(result);
service.close();
```

`src/storage` owns SQLite and migrations. `src/retrieval` owns FTS query construction and defines Retriever/EmbeddingProvider contracts. No embedding implementation is enabled. `src/optimization` packs complete memories without truncating provenance. `src/learning` defines deterministic status transitions; the service persists feedback and relations. `src/ingestion/adapters/git.ts` implements the generic adapter interface. `src/security` centralizes sensitive content/path policy and errors.

## ADR 1: built-in SQLite, explicit transactions

Latest Node 24 LTS (24.22.1+ within 24.x) avoids native-addon build requirements. An in-memory SQLite version probe rejects unpatched/unknown WAL-reset runtimes before filesystem changes or user-database open. Database initialization sets WAL, a 10-second busy timeout, foreign keys, migration version 1, scoped unique hash indexes and FTS5 triggers. `BEGIN IMMEDIATE` covers registration, deduplicated writes, snapshots, feedback, ingest batches, confirmed deletion and usage updates. Errors roll back. Separate processes serialize writes through SQLite. History stores complete content/provenance snapshots; every content/status/provenance change increments version. A content duplicate returns its existing scoped ID; distinct source references are retained in versioned provenance (maximum 20 additional references). Retrieval use counters and per-memory usage records are operational metrics and do not change content versions; private get returns the latest 100 usage records with project boundaries enforced.

## ADR 2: explicit isolation and sharing

Every data operation selects a registered project UUID. Content types episodic/semantic/procedural/project/global are independent of project/global scope: even a memory with type `global` is private until promoted. Get/history/relations/stats cannot expose another project's records. Scope-global records must have a NULL project owner and become visible only when verified and explicitly requested. Promotion requires a verified source and explicit cross-project sharing approval; it creates an independent global record with private provenance withheld. Approving sharing authorizes the content itself to be disclosed; review it for project-specific identifiers before sharing. Source project deletion does not silently delete approved shared copies. Shared copies can be explicitly deprecated/rejected/deleted. Their feedback/history/usage counts are withheld from retrieval to avoid private activity leakage.

## ADR 3: evidence is not correctness

Manual writes, execution observations and imports start candidate. A commit establishes a change, and a test report establishes a recorded report, not that a claim is correct. v0.1 verification requires explicit user approval. Feedback is append-only until confirmed local deletion; rejection/deprecation/supersession and relation creation have provenance snapshots. `supersede` deprecates the selected old memory and links to `relatedId`; the replacement is not automatically verified. Experience observation hashes the deterministic task/attempt/result JSON and deduplicates by project. There is no statistical training or automatic global promotion.

## ADR 4: bounded, untrusted ingestion

Registration requires a canonical self-contained Git root and explicit ingestion authorization. The adapter reads tracked and untracked nonignored paths, excludes sensitive/dependency/build/symlink/binary files, and checks content before persistence. Files are limited to 128,000 bytes; total files, bytes, commit history, Git output and execution time are bounded. Limits fail before an ingest transaction. A Git metadata walk rejects symlinks and more than 50,000 entries; local config is limited to 64 KB and external includes/exclude/attribute/mailmap configuration and object alternates are rejected. No shell is used. Git has a minimal environment, system/global config disabled, and hooks/fsmonitor disabled. Repository scripts/tests are never run. Each imported file has path/hash, language and source/configuration/documentation/test-report category provenance; ingestion returns category/language counts. Commit subjects/bodies get deterministic fix/change signals, which are observations rather than quality claims. Manual content updates retain IDs/history and reset changed claims to candidate. Commit memories have commit IDs and an unverified-change label. Unchanged imports preserve IDs and versions; changed files retain IDs, snapshot the new candidate version, and invalidate prior verification. Missing or newly unsafe/excluded files are deprecated. Reappearing deprecated files return as candidates. Unchanged explicit rejection is retained. Bounded commit windows retain previously imported historical commit memories.

## ADR 5: honest retrieval metrics

FTS5 literal Unicode word tokens use OR semantics and BM25 ordering; user FTS operators are never interpreted. Empty/no-match returns an empty array. Filters apply before context selection. Equal hashes are deduplicated across private/shared results. Limit defaults to 10 (maximum 50); budget defaults to 4,000 (200–100,000). The optimizer counts a conservative UTF-8 byte upper bound for the entire serialized service response, including sources, labels and metadata, and returns only complete memories. MCP's surrounding JSON-RPC transport wrapper is not agent context and is excluded. Get/history is not a budgeted retrieval operation. Metrics record selected project, elapsed retrieval/packing time, estimated context and count without storing the query text. Global corpus size can affect BM25 scores; no private records or counts are returned. Benchmark relevance is deterministic fixture labeling, not an LLM outcome measurement.

## Deferred work

Host acceptance tests, model-specific tokenizers, local embeddings/hybrid ranking, encrypted storage, human authorization UI, worktree/submodule traversal, larger-scale ingestion, and independently reviewed security hardening remain future work. There is no web backend or outbound application service.
