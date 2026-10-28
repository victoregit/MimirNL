# Mimir NL — Roadmap

## Current status — 2026-10-28 (Task136)

0.3.0 is a candidate, unreleased: the bounded technical scope is complete. Tasks105/120 are [approved111](tasks/111-v03-final-review-findings.md); the efficiency work and EF03 pilot have scoped reviews124/126/128/130/132/134, with [precision addendum135](tasks/135-ef03-review-metric-clarification.md). Review137 of the curated complete delta, commits, exact-commit remote CI, human acceptance and publication remain pending. See [current release notes](docs/release-0.3.0.md).

The four-call EF03 pilot on two known DEV tasks observed -4.91% input, -4.80% total and 4/4 quality PASS; both deduplicated calls were slower, cost unknown. No general efficiency gain is established. Broader efficiency remains open for 0.4 real use: propose opt-in local records of task/source provenance, user correction/approval, quality, comparable input/output counts and elapsed time, with retention and sharing consent specified before implementation. No new telemetry is implemented here. Broad unchecked 0.3 goals below remain unevaluated beyond the bounded evidence.

## Historical evidence — 2026-10-26 (tasks44/45)

**0.2.0 is release-ready for final independent evidence review, unpublished.** Actual CLI model-host acceptance now includes Linux/WSL and native Windows; [CI run 40270527306](https://github.com/victoregit/MimirNL/actions/runs/40270527306) is supervisor-verified **SUCCESS** at exact commit `27c586c2e12159223dd0cb90d27fcc6691775f28`, with Ubuntu and Windows all steps successful (types, lint, formatting, tests, schemas, installed-package smoke and benchmark). Baseline `6590684` remains historical evidence. This CI result does not cover subsequent documentation edits.

- [Task35](tasks/35-relay-lifecycle-result.md) adds exclusive per-process `--unique` audits and a finite validated 1..720-minute lifetime (default 240). Independent Flash [Task36 review](tasks/36-relay-lifecycle-review-findings.md) is **APPROVE**. Recorded checks: Linux 36 pass / 1 Windows-only skip; native Windows focused relay/SDK 4 pass; Python 7 pass. These checks were not rerun for this consolidation.
- Codex restart-read is established by a new-session response, matching metadata and unchanged snapshot. Its dedicated sensitive creation, initial UI cancellation, approval, sanitized promotion, global search and exact L/G cleanup completed at service/audit level. The user says they followed instructions; individual one-time **allow** dialogs were not independently confirmed by exact user enumeration. This limitation remains; no repeat questioning or automatic rerun is required.
- [Task37](tasks/37-antigravity-sensitive-result.md) establishes supervisor-operated actual WSL Antigravity **1.4.7 / gemini-3.8-flash-high** sensitive acceptance. Concrete user chat choices were relayed separately to actual one-time CLI dialogs (option 1 allow / option 4 deny), without persistent rules: create L, deny first approve (candidate v1 unchanged), approve (verified v2), sanitized promote (local v3 / global v1), global search/inspection with source withheld, then delete exact G and L. L `3084fafa-dcf7-4157-8114-d85bfe1efe33` and G `f4a30c84-cbf3-479e-859a-8c6af368f961` are removed. [Sanitized evidence](tasks/37-antigravity-sensitive-evidence.json) records 12 metadata events and exact baseline equality. Receipt absence alone does not prove denial; actual choice/dialog transmission and unchanged state are correlated.
- Final recorded state is **2 projects / 3 original candidate memories / 2 feedback notes / 0 globals**, with every protected original hash intact. Temporary registrations were removed and the owned Antigravity process stopped. Metadata is not a full host trace; historical trace gaps and strict configuration isolation remain unclaimed.

Exact-commit archive: `.release/task41/mimir-nl-0.2.0.tgz`; SHA-256 `0079d6ea71d6e7189fcf54a5292247503f2f36e7cebb674e8abe40d11121e63f`. Its 37 file contents match the Task40-reviewed archive; Linux file modes differ (`0755` → `0644`). See [Task41 provenance](tasks/41-exact-commit-release-closeout-result.md). Closeout documentation is excluded from this immutable candidate.

Native Windows acceptance is complete for the bounded synthetic method: official portable Codex **0.164.0** and Antigravity **1.4.7 / gemini-3.8-flash-high**, native Node **24.22.1**, SQLite **3.53.4**, Git **2.56.0**, exported source `27c586c2e12159223dd0cb90d27fcc6691775f28`. [Canonical final evidence](tasks/44-native-final-evidence.json), [Codex evidence](tasks/44-native-codex-evidence.json) and [Antigravity evidence](tasks/44-native-antigravity-evidence.json) correlate actual user host results, metadata audits and native read-only SQLite. Store/search/get/note, restart persistence, scoped `NOT_FOUND`, bounded architecture ingestion, idempotence and untrusted provenance passed. After Antigravity closed, a new native Codex session read its candidate and note. The separate native fixture ended at **2 projects / 3 candidates / 2 notes / 0 globals**, integrity **ok**. Owned host windows are closed; the exact temporary Antigravity entry was removed; Codex configuration was process-only. Synthetic data is retained for evidence, without WSL DB/auth transfer.

Native approve/promote/delete were not tested; sensitive-flow evidence remains the earlier WSL evidence above. Individual UI allow choices were not independently enumerated; metadata is not a full trace. No Windows ACL certification, whole-user configuration isolation, IDE/Desktop discovery or unrestricted security guarantee is claimed. See the [tested installation method](docs/v02-final-installation.md#actual-native-windows-method--task44).

Remaining steps: supervisor-arranged independent final evidence review (Task46), user documentation commit/push, Ubuntu/Windows CI on that exact new SHA, then final-commit tarball/checksum rebuild and authorized GitHub publication. Task40 approved the code candidate; historical CI at `27c586c` does not cover these documentation edits. No new host tests are required by this closeout; no publication has occurred.

> **Remember. Learn. Evolve.**  
> An open-source, local-first memory and learning layer for AI agents.

**Status:** Early development (`v0.3.0` candidate, unreleased)

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

| Milestone | Focus                                                                          | Status                                                      |
| --------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| v0.1.0    | Persistent memory, FTS5 retrieval, Git import, CLI/MCP, deterministic feedback | ✅ Implemented and automated tests passed\*                 |
| v0.1.1    | Security, license, code review, backup, release hygiene                        | Technical gates passed; release unpublished                 |
| v0.2.0    | End-to-end Codex and Antigravity integration on real hosts                     | Release-ready; final review/commit CI/publication pending   |
| v0.3.0    | Real-workload retrieval quality, context/token optimization, observability     | Bounded technical scope complete; review137/release pending |
| v0.4.0    | Evidence-based learning and controlled cross-project knowledge reuse           | Planned                                                     |
| v0.5.0    | Richer historical import and optional semantic/hybrid search                   | Planned                                                     |
| v0.6.0    | General-purpose plugin/adaptor architecture beyond software repositories       | Planned                                                     |
| v0.7.0    | Knowledge graph visualization and optional community contributions             | Planned                                                     |
| v1.0.0    | Stable, documented, independently reviewed public release                      | Planned                                                     |

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

**Evidence:** [hardening execution](docs/roadmap-execution.md): [GitHub Actions run 40170480887](https://github.com/victoregit/MimirNL/actions/runs/40170480887) at `6590684d27e2adee0b64635c4842684d00eeae1c` succeeded on Ubuntu and Windows on 2026-10-25 (supervisor-verified public API). Both jobs passed tests, schemas, installed-package smoke and benchmark. Current suite: Windows 33 passed; Linux 32 passed and one expected Windows-only skip. Scoped hardening and subsequent portability reviews are approved. v0.1.1 technical exit criteria are met; package remains **0.1.0**, unreleased. Historical 17/23/29-test reports remain baseline evidence.

**Finding reconciliation:** the feedback mapping already existed; the initial incomplete CLI payload and raw internal-operation probe did not establish a CLI defect. Actual CLI and installed-package approval regressions now cover that path. Hard-link errors are structured, and includes-scope deprecation/reactivation is documented and tested. Historical findings and the original implementation report remain preserved; the final re-review supersedes their pending-review status. Host acceptance, human approval flows and real-workload gates remain pending.

**Exit criteria:** review findings addressed or documented, license present, CI green, backup restoration verified, secure import defaults proven by tests.

## v0.2.0 — Codex and Antigravity in practice (P0)

**Goal:** prove that both hosts can use the same memory engine in day-to-day development.

- [x] Configure the MCP stdio server in a real Codex CLI installation (temporary explicitly authorized registration, subsequently removed).
- [x] Configure the MCP stdio server in a real Google Antigravity CLI installation (temporary authorized registration, subsequently removed; workspace-only/IDE discovery untested).
- [x] Verify basic CLI discovery/calls, storage/search/note feedback, and clear errors with both clients (user evidence and DB correlation; full structured traces remain open).
- [x] Test the same memory repository across sessions and both CLI hosts, with scoped permissions (Antigravity separate-session, Antigravity → Codex read and Codex-created-record restart-read established).
- [x] Publish tested installation guides for Linux/WSL and native Windows (repository guide; bounded Task44 portable CLI method).
- [x] Add integration diagnostics (`mimir doctor`) and troubleshooting for host/runtime mismatches.
- [x] Verify human approval flow for sensitive write, delete, and global-sharing operations (bounded WSL evidence; provenance limits below).

**Current work:** bounded host and installation criteria are evidenced by Task44 and the guides above. The human-flow criterion is supported by Task37 actual user allow/deny choices relayed to WSL Antigravity dialogs, plus Codex actual initial cancellation, service/audit state transitions, cleanup and the operator report that instructions were followed. Codex individual allow dialogs were not enumerated; this is an evidence-provenance limitation, not a claim that every UI choice was observed. Native sensitive flows were not tested. Final independent review must assess this bounded evidence; these checkboxes do not self-approve release. User commit/push, exact-new-SHA CI, artifact rebuild and publication remain pending.

**Exit criteria:** an end-to-end demonstration in each host on disposable projects, with reproducible steps, logs, and no unauthorized access.

## v0.3.0 — Useful context, not just more context (P0)

**Goal:** demonstrate when memory helps and when it hurts.

**Current v0.3 work:** bounded technical closure105/120 is approved by [review111](tasks/111-v03-final-review-findings.md) and [record122](tasks/122-resume-technical-closeout.md). Broad effectiveness and efficiency remain open. The [efficiency program](docs/benchmarks/v03/plano-eficiencia.md) orders offline decomposition/instrumentation, redundancy diagnosis, then isolated context-selection interventions and a separately authorized small pilot. Plan review124 is pending. No code changes or new benchmark are authorized by this update.

**Historical closure planning (Tasks97–105; pending statuses superseded by111/122):**

**Current v0.3 work:** incomplete. [Task97 audit](tasks/97-v03-closure-gap-audit-result.md) reconciles evidence50–96 and remaining gaps; [Task98 APPROVE](tasks/98-v03-closure-plan-review-findings.md) approves the finite closure plan. [Amendment0.2](docs/benchmarks/v03/contrato-0.2.md) and [closure plan](docs/benchmarks/v03/fechamento-0.2.md) are delivered for independent Task100 review. Existing A/B exploration is not the contractual ABC experiment. The authorized continuation retains Mimir+cache without fabricating human acceptance or legacy accepted/validated flags. Tasks101–105 still require reviewed corpus/metrics/core/executor, new measurements and durable evidence.

**Historical explicit scope amendment (bounded study; technical gate now approved111):** the proposed technical closure is a bounded experimental12-case study (9development+3separate evaluation), with empty-history C equivalent to A. It does not demonstrate broad real-workload representativeness, long-history benefit or multicase Antigravity effectiveness. Broad representativeness remains open. Technical completion after final independent review and publication are separate; publication/commit/push require specific authorization. No checkbox below is completed by this amendment.

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

1. **P0:** v0.1.1 technical gates are complete; release remains unpublished and does not block authorized v0.2 work.
2. **P0:** assess completed native/WSL v0.2 evidence/diff independently, then user commit/push and verify exact-new-SHA Ubuntu/Windows CI; preserve the completed WSL evidence and its limits.
3. **P0:** review137 the curated 0.3.0 candidate and prepare coherent local commits; remote CI and publication remain separate gates. Preserve all historical execution pins.
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

Historical task31 final-gate preparation (review and WSL progress superseded above): [reviewable artifacts and remaining gates](docs/v02-final-gates.md), [staged human workflow](docs/v02-final-human-workflow.md) and [platform installation guides](docs/v02-final-installation.md). These are prepared for independent review; no new host acceptance is claimed. Native supported-runtime/core checks do not close the missing native Codex/Antigravity host gate.

## Registro histórico Task120 — pendência111 superada pelo parecer111/registro122

A avaliação limitada104 e a revisão110 estão consolidadas no [fechamento corrente](docs/benchmarks/v03/fechamento-0.3.md). Snapshot histórico preservado antes da portabilidade/formatação; código corrente segue revisão independente111 antes do fechamento definitivo105. Zero chamadas novas, 54 históricas. Qualidade igual nos três cenários, B com +2,93% de tokens de entrada; cache ambiente, histórico C vazio e modelo/custo/TTFT indisponíveis impedem alegar economia ou ganho de qualidade. Sem commit, push ou publicação; histórico anterior preservado.
