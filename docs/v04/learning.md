# Structured experiences and explicit review (0.4 development)

Foundation148 and collector149 were independently approved by148/150. This V04-02/03 increment is pending review152; v0.4 remains in progress. It does not implement applicability, contradiction detection, supersession-cycle changes, generalization, training or automatic approval. The real dogfood database stays schema1 until approval152. Use the preserved approved149 CLI for real task151 measurement while developing this increment.

## Experience and evidence

`experience_observe` accepts either the unchanged legacy `{projectId,task,attempt,result}` or `{projectId,experience}` with strict `experience.schemaVersion:1`. Do not mix forms. Legacy serialization/hash stays unchanged. Structured content is the validated JSON document in schema field order, stored as the episodic memory content with source format `experience-v1`; no parallel copy of the experience is stored. Generic `memory_update` can replace its content as text, clears the typed source marker and resets review, rather than claiming the replacement passed experience validation.

The document contains problem, environment, action, observedResult, tests, sources, confidence and identity. Problem/action/result each1–4000 characters; total structured JSON at most32000 UTF-8 bytes. Arrays:30 tests,20 sources,20 evidence refs per test/source assessment. A source reference is a non-sensitive project-relative path or opaque identifier (max240), with commit/hash/version or explicit missing reason; `sourceVersionKnown` is a report, not independent verification. No logs/transcripts or personal absolute paths are requested. The existing secret guard still applies and is heuristic, not exhaustive DLP.

Environment platform/runtime/tool are provided labels or null with reason. Requested model is a provided request; observedModel remains null with a reason. Identity provenance is always provided. Test PASS, confidence0–1, human/test/agent labels and source-verification labels cannot establish truth or approve a memory. Missing confidence is null with reason. Strict schema and generated transport definitions are in [mcp-schemas.json](../mcp-schemas.json).

## Typed assessment and review

`memory_feedback` retains its legacy operations and accepts an optional `assessment` only with local `action:note` and exact `expectedVersion`/`expectedHash`. Assessment has schemaVersion1, actorKind (`test|human|agent`), opaque actorRef, judgment (`helpful|useless|harmful|unassessed`), testStatus, evidenceRefs, sourceVersionKnown and versioned sourceRefs. A stale version/hash fails before mutation. Typed assessments never approve, even with actorKind human, judgment helpful or testStatus pass.

Canonical learning state is one `memories.learning` JSON extension, captured by the existing full-row history snapshot in the same transaction. Typed assessments (maximum100 per current content) live only there; the legacy feedback table keeps its existing action/note audit shape. No silent pruning occurs. `memory_get` exposes parsed learning state for private records; history preserves prior metadata. Search omits learning metadata to preserve its established bounded envelope; global views withhold private learning history.

`memory_review` is shared CLI/MCP. Required: projectId, id, action `begin|decide`, expectedVersion, expectedHash, actorKind, actorRef; optional decision, explicitHumanConsent and evidenceRefs. Begin enters `in_review` and increments memory version without changing status or approving. Decide requires an active review for unchanged content and the current exact version/hash. A verified decision additionally requires actorKind human **and** explicitHumanConsent true. Rejection/deprecation are explicit decisions. Each transition atomically updates status/learning/version/history. Content changes (manual or Git reconciliation) reset to candidate/pending with the new version/hash and no current-content assessments; earlier decisions/evidence remain in history. Missing/unsafe imported sources invalidate current review as they are deprecated.

Example flow with synthetic placeholders:

```sh
mimir --db KNOWLEDGE memory_review '{"projectId":"PROJECT_UUID","id":"MEMORY_UUID","action":"begin","expectedVersion":1,"expectedHash":"CONTENT_SHA256","actorKind":"agent","actorRef":"ACTOR_UUID"}'
# Inspect the returned version and content. Only after explicit human consent:
mimir --db KNOWLEDGE memory_review '{"projectId":"PROJECT_UUID","id":"MEMORY_UUID","action":"decide","expectedVersion":2,"expectedHash":"CONTENT_SHA256","actorKind":"human","actorRef":"ACTOR_UUID","decision":"verified","explicitHumanConsent":true}'
```

Authorization remains the existing trusted local single-user boundary: an MCP host/client must forward actual user consent, never infer it from generic code-review approval, test results or retrieved text. JSON actorKind human and event hashes are not authenticated identities or signatures. The legacy `memory_feedback action:approve, explicitApproval:true` remains compatible: inside one transaction it targets the current selected memory version/hash and records `authorization:legacy_explicit_flag`, without inventing an actor identity. Optional expectedVersion/hash can pin that legacy operation. This flag still means actual memory-specific user consent; approval of task150/152 code does not supply it. New review consent is explicit to the current version/hash. No real memory is automatically approved or promoted by this increment.

## Schema and recovery

New knowledge databases use schema2. Existing schema1 is validated read-only and normal operations fail with `MIGRATION_REQUIRED`; there is no automatic migration. `backup`/`restore` support the entire exact known1/2 layouts, including FTS tables/triggers, integrity and FK checks. Restore preserves the source version in a new destination; a restored1 remains1 until explicit migration. Schema1 SQL and existing hashes/history are preserved. Migration adds only learning JSON default `{}`; migrated legacy review is unknown (`review:null`), not a fabricated historical human decision, while existing status is retained.

Administrative CLI (absent from MCP):

```sh
mimir --db EXISTING_SCHEMA1 migrate NEW_PRIVATE_BACKUP1 --confirm
```

Stop old0.3/149 clients before migrating: a client already holding an open connection cannot be retroactively forced to understand schema2. Migration validates exact schema1, publishes and verifies a private standalone backup1, acquires BEGIN IMMEDIATE, revalidates schema1 and compares all canonical application rows with that backup. A concurrent change causes `MIGRATION_BACKUP_STALE`; close unnecessary writers and retry with a new backup destination. Then it applies the single extension and marker2, checks the exact schema2/integrity/FKs, and commits. DDL or validation failure rolls back; a killed process recovers the uncommitted schema1 transaction. No knowledge/sidecar distributed transaction or FK is added. Sidecar remains its independent schema1 and is excluded from knowledge backup.

Recovery and detailed path/permission boundaries: [backup/restore](../backup-restore.md). Keep the approved0.3/149 runtime plus verified backup1. To recover, restore backup1 to a new path with the old compatible runtime and confirm doctor/representative records; old0.3 refuses schema2. To recover schema2, use this compatible0.4 binary plus backup2 and a new target. Do not downgrade by changing migrations or delete the failed source before recovery is verified. Private backups preserve data that deletion/history changes do not securely erase. Native Windows and WSL use separate databases; no global configuration, daemon, network or host registration is created.
