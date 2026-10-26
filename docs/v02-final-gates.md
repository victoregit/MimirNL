# v0.2 final gate preparation — 2026-10-25

## Current evidence — 2026-10-26 (tasks38/39)

**v0.2 remains open. All actual model-host tests were Linux/WSL.** Package is a **0.2.0 candidate, unreleased**; remote green CI covers only baseline `6590684`, not the uncommitted v0.2 work.

- [Task35](../tasks/35-relay-lifecycle-result.md) adds exclusive per-process `--unique` audits and a finite validated 1..720-minute lifetime (default 240). Independent Flash [Task36 review](../tasks/36-relay-lifecycle-review-findings.md) is **APPROVE**. Recorded checks: Linux 36 pass / 1 Windows-only skip; native Windows focused relay/SDK 4 pass; Python 7 pass. These checks were not rerun for this consolidation.
- Codex restart-read is established by a new-session response, matching metadata and unchanged snapshot. Its dedicated sensitive creation, initial UI cancellation, approval, sanitized promotion, global search and exact L/G cleanup completed at service/audit level. The user says they followed instructions; individual one-time **allow** dialogs were not independently confirmed by exact user enumeration. This limitation remains; no repeat questioning or automatic rerun is required.
- [Task37](../tasks/37-antigravity-sensitive-result.md) establishes supervisor-operated actual WSL Antigravity **1.4.7 / gemini-3.8-flash-high** sensitive acceptance. Concrete user chat choices were relayed separately to actual one-time CLI dialogs (option 1 allow / option 4 deny), without persistent rules: create L, deny first approve (candidate v1 unchanged), approve (verified v2), sanitized promote (local v3 / global v1), global search/inspection with source withheld, then delete exact G and L. L `3084fafa-dcf7-4157-8114-d85bfe1efe33` and G `f4a30c84-cbf3-479e-859a-8c6af368f961` are removed. [Sanitized evidence](../tasks/37-antigravity-sensitive-evidence.json) records 12 metadata events and exact baseline equality. Receipt absence alone does not prove denial; actual choice/dialog transmission and unchanged state are correlated.
- Final recorded state is **2 projects / 3 original candidate memories / 2 feedback notes / 0 globals**, with every protected original hash intact. Temporary registrations were removed and the owned Antigravity process stopped. Metadata is not a full host trace; historical trace gaps and strict configuration isolation remain unclaimed.

Remaining steps are native Windows model-host operator installation/executable availability and acceptance with a **separate native fixture**, final evidence assessment and approved-diff commit, then successful Ubuntu/Windows remote CI for that **exact new commit**. Native Windows core/SDK checks do not establish model-host acceptance. Workspace-only/IDE/Desktop discovery remains untested, without adding an extra milestone gate. No automatic release/publication or host resumption follows this document.

## Historical record / procedure (preserved)

The material below retains its original task/date scope. Earlier pending claims are superseded by the current evidence above; procedural launches are reference steps, not instructions to repeat completed WSL tests.

Status: **prepared for independent review; v0.2 remains open**. No actual host/model call, global registration/configuration write, sensitive decision, commit, push, version bump or publication occurred in task31. Existing work and historical evidence remain intact. Package is 0.1.0 unpublished. Remote green CI is still only baseline `6590684` ([run 40170480887](https://github.com/victoregit/MimirNL/actions/runs/40170480887)); current uncommitted work has local results only.

## Reviewable deliverables

- [Staged human workflow](v02-final-human-workflow.md): exact Codex restart-read launch, six-phase core per host: dedicated candidate, deliberate UI denial with unchanged snapshot, explicit approval, sanitized promotion, safe global ID discovery, then separately approved deletion of the two known IDs and final preservation check. Flag-omission negatives are optional/offline evidence. Repeat separately in Antigravity with the user's selected model. No scripted permission answering or unknown-ID cleanup.
- [Installation guides and tested matrix](v02-final-installation.md): Linux/WSL and native Windows runtime/build/host configuration, boundaries and concrete native host dependency.
- [Opt-in fixture-only relay](../scripts/v02-audit-relay.mjs): pass-through MCP bytes, bounded metadata-only request/response correlation, exclusive private files, runtime/fixture containment validation and process-group cleanup. Independent review is required before supervisor uses it in a real host.
- [Read-only snapshot](../scripts/v02-final-snapshot.py) and [before state](v02-final-before.json): sanitized totals, lifecycle fields and hashes of all original memories/history/feedback. New synthetic L/G IDs come only from reviewed actual responses; no protected original is used for mutations.
- [Offline relay regressions](../test/v02-audit-relay.test.mjs): real SDK/subprocess initialize/list/call, service error/schema error, raw fragmented request and byte-for-byte direct-versus-relay response, privacy, frame/pending bounds, exclusive evidence output and signal shutdown. Task35 also runs the SDK integration on native Windows with a separate disposable native fixture, preserving exact manifest/runtime validation. The Python preparer remains Linux/WSL-only.
- [Snapshot regressions](../test/v02-final-snapshot.test.py): absent DB refusal without creation, no write/content disclosure, feedback-change detection and protected-original absence failure in a fresh disposable DB.

The relay captures minimized structured metadata, not full content traces. A manual ledger must supply reviewed synthetic arguments/content and actual human decisions. A denied call never reaching this relay cannot be proved from receipt logs alone. Historical trace gaps remain historical; fresh traces plus snapshots can establish new scenarios without inventing past evidence.

## Local verification

[Sanitized check summary](v02-final-checks.txt): Linux and native Windows suites each passed 34 tests with 1 explicit platform skip; final relay-focused checks passed after the last source edits. Python fixture/snapshot tests passed (5/2), as did ingestion regression, typecheck, lint, format, schema check, installed-package smoke and benchmark. [After state](v02-final-after.json) is identical to the before snapshot: all protected original hashes and totals unchanged. These are local offline/core checks, not actual host or human approval evidence.

## Native Windows findings

Default native PATH: Node 24.21.0 (unsupported), npm present, Git/Codex/agy absent. An existing disposable native runtime was found in `C:\Users\Public\mimir-hardening-runtime`, with Node 24.22.1, npm 11.19.1, Git 2.56.0.windows.3. Command-local PATH only; no installation or persistent change. [Native doctor probe](v02-final-native-probe.txt) passed on new `C:\Users\Public\mimir-task31-native\private\host.sqlite`, independent of the retained WSL DB. It reports Windows ACLs as an operator responsibility. [Current native test output](v02-final-native-tests.txt) records core validation; this is not native host acceptance.

Supervisor follow-up (read-only, supervisor-reported): PowerShell `Get-Command codex,agy -ErrorAction SilentlyContinue` returned no executables, exit 1. This corroborates absence on the current native Windows PATH; it does not prove that no application exists elsewhere. The worker did not repeat the broad probe or install software. Actual native core/SDK tests above remain distinct from unverified native host acceptance.

The operator still needs supported native Codex and Antigravity executables visible from a native terminal (or their exact installed executable paths), followed by actual native synthetic host tests. No native executable was found with `where`; WSL executables cannot establish native acceptance. IDE/Desktop discovery remains untested and outside the current CLI evidence, while the roadmap's native Windows guide gate explicitly remains open.

## Remaining gates and next action

1. Supervisor assigns independent Flash review of the final scripts/tests/docs. Do not deploy the relay or run real host/model tests before review approval; fix findings first.
2. Supervisor performs the already authorized narrow temporary registration only after that review. Human follows [workflow](v02-final-human-workflow.md), one step/permission at a time, on the retained Linux fixture, preserving originals. Run Codex restart-read once and the six-phase core per host. Save actual one-time UI decisions, matching relay metadata/responses and denial/final preservation snapshots. Flag-omission negatives remain optional/offline evidence, not required human rounds.
3. Complete native host installation/PATH action and separate native fixture acceptance. Keep installation-guide checkbox open until the required platform evidence exists. Do not mark v0.2 complete because the Linux portion passes.
4. Supervisor reviews final diff, local checks and actual human evidence. Re-run affected checks only if implementation changes. Do not infer remote validation from local success or claim the earlier intermittent Linux failure was fixed.
5. After final authorized commit/push by supervisor, verify both Ubuntu and Windows jobs for that exact commit. `gh run list --workflow ci.yml --commit <new-full-sha>` then `gh run watch <new-run-id> --exit-status`; inspect failure details if needed. Baseline green cannot substitute for this run. No npm/GitHub release publication is authorized here.

Reference commands for the final supervisor check gate, from a supported native Linux toolchain. The local checks above already passed; this documentation-only trim does not require rerunning them. Re-run only checks affected by a subsequent implementation change or an unresolved finding:

```bash
npm run build
npm run typecheck
npm run lint
npm run format:check
npm run schemas:check
npm test
python3 -W error::ResourceWarning test/v02-host-fixture.test.py
python3 -W error::ResourceWarning test/v02-final-snapshot.test.py
node --test test/v02-fixture-ingestion.check.mjs
npm run package:smoke
npm run benchmark
git diff --check
git diff --cached --stat
```

Inspect staged paths explicitly; preserve AGENTS/task21 and all pre-existing work. Stage only the reviewed final scope. Commit/push are supervisor steps after evidence/review; this worker performs neither. A release/version decision follows actual satisfied gates, not these prepared commands.

## Task35 lifecycle correction (2026-10-26)

The explicit-file collision during secondary Codex discovery and hard 15-minute idle-session closure were operational failures. The correction retains exclusive explicit files, adds opt-in per-process `--unique` files, and uses a finite 240-minute default with a validated 1..720-minute override. Sanitized stderr provides startup/lifecycle guidance. See [task35 evidence](../tasks/35-relay-lifecycle-result.md) for actual current verification and boundaries; earlier counts above are historical.

Codex restart-read and synthetic mutation/cleanup are complete at service/audit level. Actual one-time allow dialogs remain user-unconfirmed. Antigravity sensitive and native Windows host acceptance remain pending. Task35 performs no host/model session and does not close these gates. Independent review of this correction is supervisor-owned and pending.
