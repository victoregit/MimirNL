# Mimir NL — Roadmap

> **Remember. Learn. Evolve.**  
> An open-source, local-first memory and learning layer for AI agents.

**Status:** Early development (`v0.1.0`)  
**Repositories:** `MimirNL` (core) and `Mimir-web` (website)  
**Planning model:** milestone-based, not date-based. Scope and priorities may change with test results and community feedback.

## Product principles

1. **Private by default:** local-first; explicit authorization for reading projects, sharing memories, or contacting external services.
2. **Model-agnostic:** one reusable memory layer for Codex, Antigravity, and other compatible agents.
3. **Evidence over claims:** a stored observation is not a verified lesson; learning must be traceable and correctable.
4. **Measured value:** compare response quality, retrieved-context size, elapsed time, and token usage against baselines.
5. **Incremental and reversible:** reuse prior work, avoid full re-indexing, preserve provenance, and support safe rollback.
6. **Core without website:** the engine must operate independently of `Mimir-web`.

## Overview

| Milestone | Focus                                                                          | Status                                               |
| --------- | ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| v0.1.0    | Persistent memory, FTS5 retrieval, Git import, CLI/MCP, deterministic feedback | ✅ Implemented and automated tests passed\*          |
| v0.1.1    | Security, license, code review, backup, release hygiene                        | Hardening review approved; remote CI/release pending |
| v0.2.0    | End-to-end Codex and Antigravity integration on real hosts                     | Planned                                              |
| v0.3.0    | Real-workload retrieval quality, context/token optimization, observability     | Planned                                              |
| v0.4.0    | Evidence-based learning and controlled cross-project knowledge reuse           | Planned                                              |
| v0.5.0    | Richer historical import and optional semantic/hybrid search                   | Planned                                              |
| v0.6.0    | General-purpose plugin/adaptor architecture beyond software repositories       | Planned                                              |
| v0.7.0    | Knowledge graph visualization and optional community contributions             | Planned                                              |
| v1.0.0    | Stable, documented, independently reviewed public release                      | Planned                                              |

\* The v0.1 report records 17 passing automated tests and real MCP SDK client tests. It does **not** establish independent review, actual Codex/Antigravity host acceptance, or real-world token savings.

## ✅ v0.1.0 — Functional foundation (completed per implementation report)

- [x] TypeScript core with persistent SQLite database, WAL, migrations, and versioned memories.
- [x] Project-local/global scopes, validation states, provenance, feedback, and history.
- [x] SQLite FTS5/BM25 retrieval with filters, context budgets, and isolation.
- [x] Shared CLI and MCP services; MCP stdio integration tested with the official SDK client.
- [x] Authorized, read-only and incremental Git repository ingestion.
- [x] Deterministic observation/feedback loop and controlled sharing.
- [x] Automated acceptance suite (17 tests) and synthetic retrieval benchmark.

**Historical v0.1.0 boundaries:** actual host acceptance was not established; independent review was pending at that baseline (scoped hardening review is now approved below); no embeddings; no HTTP transport; no model training; no real-task token savings demonstrated. License remains `UNLICENSED` in the v0.1 report.

## 🔜 v0.1.1 — Hardening and open-source readiness (P0)

**Goal:** make the foundation safe and credible before importing sensitive real repositories or publishing a release.

- [x] Independent code and security review; findings reconciled, resolved or advisory behavior documented ([final scoped APPROVE](tasks/14-rereview-findings.md)).
- [x] Select an OSI-approved license and add `LICENSE`, contribution guidance, code of conduct, and security disclosure policy.
- [x] Expand secret detection, import allow/deny rules, tests for path traversal, symlinks, and prompt injection in source content.
- [x] Document exact data retention/deletion behavior (logical deletion is not secure physical erasure).
- [x] Implement documented backup/restore and migration recovery procedures.
- [x] Establish reproducible CI for build, typecheck, lint, unit/integration tests, and package smoke tests.
- [x] Run native-Windows Git/MCP and SQLite tests using a supported Node/SQLite combination.
- [x] Document Windows vs WSL file-system/bank separation (no unsafe shared WAL across runtimes).

**Evidence:** [hardening execution](docs/roadmap-execution.md): 29/29 tests on Linux and native Windows (25 top-level plus four subtests), backup/restore and installed executable validated, MIT applied. CI workflow exists; no remote GitHub Actions run is claimed. [Independent re-review](tasks/14-rereview-findings.md) returned scoped **APPROVE** on 2026-10-25. The full v0.1.1 milestone remains unreleased pending remote CI; package version remains 0.1.0.

**Finding reconciliation:** the feedback mapping already existed; the initial incomplete CLI payload and raw internal-operation probe did not establish a CLI defect. Actual CLI and installed-package approval regressions now cover that path. Hard-link errors are structured, and includes-scope deprecation/reactivation is documented and tested. Historical findings and the original implementation report remain preserved; the final re-review supersedes their pending-review status. Host acceptance, human approval flows and real-workload gates remain pending.

**Exit criteria:** review findings addressed or documented, license present, CI green, backup restoration verified, secure import defaults proven by tests.

## v0.2.0 — Codex and Antigravity in practice (P0)

**Goal:** prove that both hosts can use the same memory engine in day-to-day development.

- [ ] Configure the MCP stdio server in a real Codex installation.
- [ ] Configure the MCP stdio server in a real Google Antigravity installation.
- [ ] Verify discovery/calls of MCP tools, storage/search/feedback, and clear errors with both clients.
- [ ] Test the same memory repository across sessions and both hosts, with scoped permissions.
- [ ] Publish tested installation guides for Linux/WSL and native Windows.
- [x] Add integration diagnostics (`mimir doctor`) and troubleshooting for host/runtime mismatches.
- [ ] Verify human approval flow for sensitive write, delete, and global-sharing operations.

**Attempt:** [isolated Codex CLI evidence](docs/host-acceptance.md) records a failed tool call due to approval policy; host acceptance remains pending.

**Exit criteria:** an end-to-end demonstration in each host on disposable projects, with reproducible steps, logs, and no unauthorized access.

## v0.3.0 — Useful context, not just more context (P0)

**Goal:** demonstrate when memory helps and when it hurts.

- [ ] Build a benchmark corpus from authorized, representative tasks and repositories.
- [ ] Evaluate Precision@k/Recall@k, source accuracy, stale-memory rate, retrieval latency, and task outcomes.
- [ ] Compare workflows **with memory**, **without memory**, and **full-history context** using the same task sets.
- [ ] Measure real tokenizer input/output tokens and billing-cost estimates per model/provider where available.
- [ ] Improve ranking, deduplication, recency weighting, and compact provenance-aware formatting.
- [ ] Add fallback to no memory when relevance is too low and enforce hard context budgets.
- [ ] Expose opt-in, privacy-preserving local metrics with no default telemetry upload.

**Exit criteria:** published, reproducible results and clear trade-offs; no unverified percentage-saving claims.

## v0.4.0 — Learning from outcomes (P1)

**Goal:** turn recorded experiences into reliable, reusable lessons.

- [ ] Define a structured experience record: problem, environment, attempted action, observed result, tests, source, confidence.
- [ ] Add feedback from actual test outcomes and explicit human decisions.
- [ ] Detect duplicate/conflicting lessons; track supersession, applicability, and outdated versions.
- [ ] Implement a candidate → review → verified/deprecated/rejected workflow.
- [ ] Promote cross-project knowledge only through controlled generalization and approval.
- [ ] Evaluate whether reused lessons improved outcomes or introduced regressions.
- [ ] Include rollback of incorrect knowledge and tests against self-reinforcing false memories.

**Exit criteria:** repeatable tests show a validated lesson can improve a later task, and an invalid lesson can be corrected without contaminating other projects.

## v0.5.0 — Deeper knowledge, optional intelligence (P1)

**Goal:** learn more from existing work without forcing users onto cloud APIs.

- [ ] Improve Git history understanding (commits, changes, linked decisions) without assuming every commit is a correct fix.
- [ ] Add modular importers for local documentation and structured notes.
- [ ] Add incremental reconciliation of renamed/moved/deleted sources.
- [ ] Introduce optional embeddings and hybrid lexical/semantic retrieval behind replaceable interfaces.
- [ ] Evaluate a graph of memory relationships with provenance and permission boundaries.
- [ ] Benchmark resource consumption and verify that optional AI features offer measurable gains.

**Exit criteria:** lexical-only mode remains fully supported, while optional retrieval methods are independently testable and reversible.

## v0.6.0 — Universal memory platform (P1)

**Goal:** make Mimir useful beyond software engineering.

- [ ] Publish stable contracts for import adapters, knowledge types, retrieval providers, and learning/evaluation plugins.
- [ ] Support selected general formats (e.g. Markdown, PDF text, structured exports) via permissioned importers.
- [ ] Separate data provenance, tenant/project scopes, and per-source access policies.
- [ ] Provide examples for research, study notes, and general task workflows.
- [ ] Keep runtime and AI-provider choices optional; do not assume every workload needs an LLM.

**Exit criteria:** at least two non-code workflows work end-to-end with explicit source permissions and documented examples.

## v0.7.0 — Explainable visual memory and community (P2)

**Goal:** make knowledge understandable, without exposing private memories.

- [ ] Expose an authenticated, read-only visualization API with filtered memory-node/relationship data.
- [ ] Connect an **optional** graph explorer in the independent `Mimir-web` repository.
- [ ] Distinguish decorative neural animation from the real knowledge graph.
- [ ] Explore opt-in export/import of sanitized, licensed knowledge packs.
- [ ] Add provenance review, moderation, compatibility checks, and protections against malicious contributed memories.

**Exit criteria:** the core works without a website or shared service; no private knowledge is published by default.

## v1.0.0 — Stable open-source release (release gate)

- [ ] Stable documented CLI, MCP tools, migration paths, and data model.
- [ ] Cross-platform install/upgrade/recovery procedures verified.
- [ ] Independent security review completed; critical issues resolved.
- [ ] Versioned documentation, examples, contribution guidelines, and release process available.
- [ ] Real-world quality, latency, and token metrics published with methodology and limitations.
- [ ] Backward-compatibility policy and clear support matrix established.

**Exit criteria:** external contributors can install, connect, test, improve, and safely operate Mimir without relying on private developer knowledge.

## Implementation order — next actions

1. **P0:** complete remote CI and release verification (`v0.1.1`); scoped hardening review, license and backups are complete.
2. **P0:** test actual Codex and Antigravity clients on disposable projects (`v0.2.0`).
3. **P0:** import a real repository _only after_ privacy review, and establish measurement baselines (`v0.3.0`).
4. **P1:** validate incremental learning and cross-project reuse (`v0.4.0`).
5. **P1/P2:** expand retrieval, adapters, visualization, and community workflows (`v0.5–v0.7`).

## Non-goals (until validated)

- Retraining foundation-model weights.
- Automatically reading all user files or sending private content to external services.
- Assuming “more stored memories” means better AI performance.
- Claiming autonomous intelligence, verified learnings, or token savings without evidence.
- Making the public website a dependency of the local engine.

---

_Baseline source: `RELATORIO_IMPLEMENTACAO_V0.1.md`, dated 2026-10-24. Later checkboxes reflect only linked evidence; unchecked release/host/review gates remain pending._
