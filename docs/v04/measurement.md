# Local measurement collector (0.4 development)

V04-01 is an opt-in sidecar approved by independent review150, with real-use acceptance in task151. V04-02/03 learning changes are pending review152; see [learning](learning.md). The real dogfood knowledge DB remains schema1 until approval152; new development databases use schema2 with explicit migration for existing1. There is no daemon, host configuration, ingestion, model call, transcript reader or upload.

## Enable and operate

Pass `--db KNOWLEDGE --measurement-db PRIVATE_LEAF/observability.sqlite` at CLI/stdio startup, or `new Service(storage, {measurementDb})` in a trusted application. Without that option no measurement destination is accessed. Use a dedicated private leaf outside registered repositories; its parent must already exist. A new leaf gets POSIX0700 / private native Windows ACL; files are0600 / inherited private ACL. Existing unsafe leaves/files, symlinks/junctions, traversal, hardlinks, knowledge paths and unknown layouts are refused. Existing parents are never chmodded or given new ACLs. The local operator and filesystem are trusted against concurrent hostile replacement (Node has no portable openat).

All JSON is strict. Event bodies and host usage carry schemaVersion1 (defaulted on input); canonical object keys sort by UTF-16 code units. Generate UUIDv4 attemptId/eventId/sessionId/projectId. The project must already exist in knowledge. Example inputs below are schematic; replace IDs with actual UUIDs.

```sh
mimir --db KNOWLEDGE --measurement-db PRIVATE/observability.sqlite measurement_start '{"projectId":"PROJECT_UUID","attemptId":"ATTEMPT_UUID","eventId":"EVENT_UUID","sessionId":"SESSION_UUID","taskId":"task150","mode":"real_use"}'
mimir --db KNOWLEDGE --measurement-db PRIVATE/observability.sqlite memory_search '{"projectId":"PROJECT_UUID","attemptId":"ATTEMPT_UUID","query":"topic","format":"compact-v1","tokenBudget":4000}'
mimir --db KNOWLEDGE --measurement-db PRIVATE/observability.sqlite measurement_finish '{"projectId":"PROJECT_UUID","attemptId":"ATTEMPT_UUID","eventId":"NEW_EVENT_UUID","status":"succeeded","missingReasons":["not_collected"]}'
mimir --db KNOWLEDGE --measurement-db PRIVATE/observability.sqlite measurement_report '{"projectId":"PROJECT_UUID"}'
```

MCP exposes start/record/finish/report with the same generated [schemas](../mcp-schemas.json). Measurement commands error when disabled. Search correlation is optional; opt-in startup without attemptId does not capture unrelated searches. A known attempt/project mismatch or closed attempt is rejected before search mutates knowledge uses. No memory/tool JSON can choose a filesystem path or enable collection.

`measurement_record` accepts `call`, `memory_use`, `quality`, `host_usage`. Source is always **provided**, never authenticated internal measurement. No externally submitted `search` event or `collectionSource` flag is accepted. Labels are bounded identifiers, evidence references opaque UUIDs, digests lowercase SHA256; no free notes or paths. Call timing from a harness is provided, not internal runtime evidence. `identity.requestedModel` is a request only; observedModel remains null with reason. Config/prompt hashes are provided explicitly, never read from files. Start stores Mimir/Node/platform/config origin internally. ActorKind describes a reported evaluator, not authenticated human approval. Quality never approves knowledge.

Host usage: canonical namespace requires confirmed semantics, safe nonnegative integer counters, cachedInput<=input, total=input+output, or all counters null with reason. Native AG units stay in `ag_native`, never normalized or added to canonical totals. Scope/session IDs prevent duplicate turn/session summation across attempts in a project. Repeated eventId with identical canonical body/source is idempotent; changed payload errors. Overlapping session aggregates and turns error. Unknown values remain null; provided usage never becomes authenticated observation.

## Search boundary and diagnostics

Search data, ranking, defaults and hard byte budget are unchanged. The old `estimatedTokens` remains the conservative byte bound, not host tokens. Measurement `contextBytes` counts exactly `JSON.stringify(data)` UTF-8, excluding the service `{ok,data}` wrapper and transport newline; contentBytes counts delivered content. InternalElapsedMs uses the same retrieval clock as the legacy retrieval row; it does not include all serialization or sidecar writing. No causal attribution of CLI minus internal time is made.

Capture diagnostics are **outside** the bounded data envelope: CLI emits a separate JSON line `{measurement:{captureStatus,callId,reason?}}` to stderr; MCP uses `_meta.measurement`; Service.call accepts `{onCapture(status)}` as its third argument. These diagnostics contain no raw query or content. Consumers wanting capture confirmation must consume that channel; the plain result remains the legacy API. Failed writes (busy, read-only, disk failure) return `captureStatus:failed` there while preserving successful search data; no persisted failure event is claimed. Invalid startup/layout/scope is a contract error. Diagnostics delivery itself has no durability guarantee. There is no atomic transaction across the two databases.

## Administrative operations (CLI only)

These operations are absent from the MCP catalogue and Service.call dispatch:

- `measurement_export '{"projectId":"UUID","attemptIds":["UUID"],"destination":"PRIVATE/export.json"}'`: consistent version1 allowlisted logical snapshot; private temporary file, fsync, exclusive hard-link publication, no overwrite. Errors never claim a valid export. Runtime, IDs, counts, hashes and reports can still identify local work; hashes of short text are not strong anonymization.
- `measurement_restore EXPORT.json --confirm`: use `--measurement-db NEW_PATH` plus existing `--db KNOWLEDGE`. Validate the complete logical backup in memory before creating a new sidecar. Refuse existing destination. Restore is separate from knowledge backup/restore, with no knowledge migration. Logical JSON backups have no signature: restore always marks imported events provided with origin=restore, recomputes their integrity hashes, and marks runtime identity restored_provided. Imported search claims appear under provided.restoredSearchStatus, never measured internal coverage; new runtime capture remains independent.
- `measurement_delete '{"projectId":"UUID","attemptIds":["UUID"]}' --confirm`: deletes the selected sidecar attempts/events/usage transactionally; no knowledge deletion.
- `measurement_prune '{"projectId":"UUID"}'`: default dry-run (also explicit `--dry-run`), selects expired attempts. Start TTL defaults to30 days (1–3650). To delete, pass `dryRun:false` and `--confirm`. Optional `before` is an explicit UTC cutoff for administrative retention. No background pruning.

Deletion is not secure erasure. WAL, filesystem snapshots and exported backups retain copies until their own retention expires. Exports are private backups, not automatically public artifacts. Restore accepts at most16MB /1000 attempts /100000 events; events at most64KiB, memory references at most100, evidence references20. Do not place personal information in identifiers.

## Persistence, reports and interpretation

The dedicated sidecar has an exact role marker `mimir-observability`, independent schema1, attempts/events/usage tables and no FTS/cross-database foreign keys. Future or altered schemas and corrupt event/state/usage data are refused read-only before journal configuration. WAL,250ms busy_timeout and BEGIN IMMEDIATE serialize sequence allocation. EventHash detects payload/sequence/time/source corruption, not a host signature; an operator who can rewrite the database can recompute it. A killed process leaves an incomplete running attempt, not a fabricated failed/succeeded result. Explicit finish is required.

Reports are project scoped, optionally attempt/from/to scoped. They retain all outcome states and incomplete running attempts. Internal retrieval/delivery/bytes/time, provided CLI calls, version-deduplicated consulted/used/source-verification reports, actor-specific quality and missing assessments are separate. Coverage includes numerator and denominator; authenticated host usage coverage is always0 because this increment authenticates no host collector. Host counters with no complete reports are null, never0. Sums may overlap task wall duration and must not be added to it. Active work is null; wall durations are server timestamp differences and may reflect clock adjustment. CausalBenefit stays null (`no_paired_control`); no tokens-saved claim is calculated. Synthetic fixtures validate mechanics, not real benefit. Task149's earlier calls remain manual external evidence; no retroactive automatic capture is claimed.
