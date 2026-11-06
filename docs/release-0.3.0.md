# Mimir NL 0.3.0 — candidate, unreleased

The bounded 0.3 technical scope is complete. Independent review137 of the complete curated delta, local commits, exact-commit remote CI, human release acceptance, tag and publication remain pending. No package or GitHub release has been published by this preparation.

## Product and compatibility

The local engine retains persistent SQLite memory, FTS5 retrieval, authorized read-only ingestion, provenance, explicit verification/sharing and CLI/MCP interfaces. Search adds deduplication before limit, duplicate provenance and opt-in lexical policy, verified tie recency, compact responses and local response telemetry. See [retrieval behavior](core-retrieval-0.3.md) and [MCP schemas](mcp-schemas.json). Defaults remain `legacy`, `off`, `full`, `telemetry=false`. Telemetry adds local response metadata; it does not upload or record raw queries. `tokenBudget` continues to bound serialized UTF-8 bytes, not model tokens.

Node >=24.22.1 <25, npm and Git remain required. The patched SQLite startup guard remains enforced. No dependencies or database migrations were added; database schema version remains 1. Existing backup/restore procedures apply. Install from the package or build the clone as documented in the README; use separate dependencies and databases on Linux/WSL and native Windows.

The runtime version now comes from package metadata for CLI init and MCP server/init. This changes current source hashes relative to Core108 through version plumbing only; historical source pins and execution snapshots remain unchanged. ABC tests use the historical Core108 snapshot with current tooling. The original EF03 harness is preserved in a [source archive with provenance](benchmarks/v03/evidencias/ef03-pilot131-source-provenance.md); current tests handle an already-consumed epoch and skip one Linux-binary fingerprint check when its fixed executables are unavailable. Those skips do not establish native pilot support.

## Evidence and limitations

The [bounded evaluation closeout](benchmarks/v03/fechamento-0.3.md) preserves the original evaluation and independent reviews. That evaluation found equal quality and +2.93% input for B; it did not establish savings. Earlier 30–39% experiments used other baselines and units and are not general product claims.

The experimental EF03 helper deduplicates exact context in external-API benchmark prompts; it is not part of automatic product operation. Offline tools and tests remain reproducible without enabling external calls. The [four-call pilot metrics](../tasks/134-ef03-pilot-metrics.json) and [quality review with precision addendum](../tasks/134-ef03-pilot-results-quality-review-findings.md) report two known high-overlap DEV tasks, n=1 per condition:

- Input: 31,029 → 29,505, reduction 1,524 (4.91%). Total: 31,398 → 29,890, reduction 1,508 (4.80%). Four calls consumed 61,288 tokens overall.
- Quality gates: 4/4 PASS, with no factual loss observed in those answers. This is not a universal quality guarantee.
- Exact-v1 transport was slower on both pairs; causality is unknown. Cost, TTFT and effective backend are unavailable.
- Equal cached-input counts identify neither cached content nor a permanent host floor. Uncached=input-cached is arithmetic; its 21.88% reduction uses a different denominator and is not financial savings.

The repository retains scientific snapshots and public evidence for reproducibility. The npm product tarball excludes tasks, benchmark corpora, scripts and large snapshots; evidence links above are repository references. Broader efficiency, real-workload evaluation and traceable learning remain planned for 0.4, with no new telemetry implementation in this closeout.

## Validation and release gates

Current local gate commands are defined in [CONTRIBUTING](../CONTRIBUTING.md): types, lint, formatting, full tests/build, generated schemas, installed-package smoke and deterministic benchmark. Task136 records fresh Linux/native Windows exits and limitations in the repository; earlier 0.2 or Task120 receipts are historical and do not establish current remote CI success. Review137 must inspect version plumbing, package contents, curated evidence and the complete prior core/tooling delta before staging. Publication requires separate authorization.

## Rollback

Before using a candidate with real data, follow [backup/restore](backup-restore.md). This candidate adds no migration; restoring a backup uses a new database path and never replaces an active database. The developer closeout backup preserves pre-version working files separately from user databases; it is not a user-data backup.
