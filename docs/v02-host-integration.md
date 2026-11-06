# v0.2 isolated host integration — 2026-10-25

## Current evidence — 2026-10-26 (tasks44/45)

**0.2.0 is release-ready for final independent evidence review, unpublished.** Actual CLI model-host acceptance now includes Linux/WSL and native Windows; [CI run 40270527306](https://github.com/victoregit/MimirNL/actions/runs/40270527306) is supervisor-verified **SUCCESS** at exact commit `27c586c2e12159223dd0cb90d27fcc6691775f28`, with Ubuntu and Windows all steps successful (types, lint, formatting, tests, schemas, installed-package smoke and benchmark). Baseline `6590684` remains historical evidence. This CI result does not cover subsequent documentation edits.

- [Task35](../tasks/35-relay-lifecycle-result.md) adds exclusive per-process `--unique` audits and a finite validated 1..720-minute lifetime (default 240). Independent Flash [Task36 review](../tasks/36-relay-lifecycle-review-findings.md) is **APPROVE**. Recorded checks: Linux 36 pass / 1 Windows-only skip; native Windows focused relay/SDK 4 pass; Python 7 pass. These checks were not rerun for this consolidation.
- Codex restart-read is established by a new-session response, matching metadata and unchanged snapshot. Its dedicated sensitive creation, initial UI cancellation, approval, sanitized promotion, global search and exact L/G cleanup completed at service/audit level. The user says they followed instructions; individual one-time **allow** dialogs were not independently confirmed by exact user enumeration. This limitation remains; no repeat questioning or automatic rerun is required.
- [Task37](../tasks/37-antigravity-sensitive-result.md) establishes supervisor-operated actual WSL Antigravity **1.4.7 / gemini-3.8-flash-high** sensitive acceptance. Concrete user chat choices were relayed separately to actual one-time CLI dialogs (option 1 allow / option 4 deny), without persistent rules: create L, deny first approve (candidate v1 unchanged), approve (verified v2), sanitized promote (local v3 / global v1), global search/inspection with source withheld, then delete exact G and L. L `3084fafa-dcf7-4157-8114-d85bfe1efe33` and G `f4a30c84-cbf3-479e-859a-8c6af368f961` are removed. [Sanitized evidence](../tasks/37-antigravity-sensitive-evidence.json) records 12 metadata events and exact baseline equality. Receipt absence alone does not prove denial; actual choice/dialog transmission and unchanged state are correlated.
- Final recorded state is **2 projects / 3 original candidate memories / 2 feedback notes / 0 globals**, with every protected original hash intact. Temporary registrations were removed and the owned Antigravity process stopped. Metadata is not a full host trace; historical trace gaps and strict configuration isolation remain unclaimed.

Exact-commit archive: `.release/task41/mimir-nl-0.2.0.tgz`; SHA-256 `0079d6ea71d6e7189fcf54a5292247503f2f36e7cebb674e8abe40d11121e63f`. Its 37 file contents match the Task40-reviewed archive; Linux file modes differ (`0755` → `0644`). See [Task41 provenance](../tasks/41-exact-commit-release-closeout-result.md). Closeout documentation is excluded from this immutable candidate.

Native Windows acceptance is complete for the bounded synthetic method: official portable Codex **0.164.0** and Antigravity **1.4.7 / gemini-3.8-flash-high**, native Node **24.22.1**, SQLite **3.53.4**, Git **2.56.0**, exported source `27c586c2e12159223dd0cb90d27fcc6691775f28`. [Canonical final evidence](../tasks/44-native-final-evidence.json), [Codex evidence](../tasks/44-native-codex-evidence.json) and [Antigravity evidence](../tasks/44-native-antigravity-evidence.json) correlate actual user host results, metadata audits and native read-only SQLite. Store/search/get/note, restart persistence, scoped `NOT_FOUND`, bounded architecture ingestion, idempotence and untrusted provenance passed. After Antigravity closed, a new native Codex session read its candidate and note. The separate native fixture ended at **2 projects / 3 candidates / 2 notes / 0 globals**, integrity **ok**. Owned host windows are closed; the exact temporary Antigravity entry was removed; Codex configuration was process-only. Synthetic data is retained for evidence, without WSL DB/auth transfer.

Native approve/promote/delete were not tested; sensitive-flow evidence remains the earlier WSL evidence above. Individual UI allow choices were not independently enumerated; metadata is not a full trace. No Windows ACL certification, whole-user configuration isolation, IDE/Desktop discovery or unrestricted security guarantee is claimed. See the [tested installation method](v02-final-installation.md#actual-native-windows-method--task44).

Remaining steps: supervisor-arranged independent final evidence review (Task46), user documentation commit/push, Ubuntu/Windows CI on that exact new SHA, then final-commit tarball/checksum rebuild and authorized GitHub publication. Task40 approved the code candidate; historical CI at `27c586c` does not cover these documentation edits. No new host tests are required by this closeout; no publication has occurred.

## Historical record / procedure (preserved)

The material below retains its original task/date scope. Earlier pending claims are superseded by the current evidence above; procedural launches are historical reference steps, not instructions to repeat completed WSL or native tests. Native-absence and pending claims below describe their original task only; Task44 supersedes them.

Status: **historical task26 attempt; superseded for current basic CLI results by [Antigravity closeout](v02-antigravity-acceptance.md) and [Codex closeout](v02-codex-acceptance.md)**. The headless failure below remains historical evidence. CLI evidence only; no Desktop/IDE/UI acceptance is claimed. No commit, push, release, version bump, global settings/rules change or real repository ingestion was performed. Historical host-smoke evidence is preserved.

## Technical baseline

The supervisor verified [CI run 40170480887](https://github.com/victoregit/MimirNL/actions/runs/40170480887), commit `6590684d27e2adee0b64635c4842684d00eeae1c`: Ubuntu and Windows SUCCESS, including tests, schemas, installed-package smoke and benchmark. v0.1.1 technical gates are closed. Package remains 0.1.0, unpublished. Current baseline suite is Windows 33 passes; Linux 32 passes plus one expected Windows-only skip (reported by the supervisor). Historical reports retain their baseline counts.

## Reusable isolated fixture

[Fixture preparer](../scripts/v02-host-fixture.py) creates two disposable Git worktrees containing only a staged synthetic `architecture.md`, a private parent directory, and an independent database outside both worktrees. It does not invoke models, register projects or import content. It creates workspace Antigravity MCP JSON, a process-local Codex MCP value, two narrowly scoped prompts and a manifest. Reviewable copies of the prepared [Antigravity JSON](v02-antigravity-config.json) and [Codex process-local MCP value](v02-codex-mcp-value.txt) are saved with this report. The tool allowlist includes registration, bounded ingestion, store/search/get, note feedback and stats; no deletion or administrative tools. The prompts forbid approval, promotion, sharing and other tools. Feedback remains a general MCP tool: the prompt restriction is not a server-side action capability boundary.

```bash
python3 scripts/v02-host-fixture.py prepare --node /absolute/supported/node
python3 scripts/v02-host-fixture.py verify-db /printed/private/host.sqlite
python3 -W error::ResourceWarning test/v02-host-fixture.test.py
```

Run these from the Mimir repository. Preparation returns a fresh private directory; repeated preparation never reuses the prior DB. Use one native runtime sequentially across hosts. The current [manifest](v02-fixture-manifest.json) records the retained synthetic fixture at `/tmp/mimir-v02-xx0ph1vg`. It remains available for the operator's interactive acceptance; temporary paths are not installation paths and may disappear on reboot. Close all hosts before deleting that exact disposable directory. No user authentication/config file was copied or read.

The verifier opens SQLite in URI read-only mode, rejects missing databases without creating them, and requires exactly one project candidate with the expected content, the note feedback, no non-note feedback and no global copies. It **cannot** prove discovery, host registration/ingestion, missing-ID/scoped errors, session restart, or the source of writes. Those require correlated structured host events. Its result deliberately does not expose a `passed` host-acceptance boolean.

## Actual Antigravity CLI attempt

Installed `agy --version` returned **1.4.7**. Installed help confirms `--sandbox`, `--model`, `--output-format stream-json`, `--print-timeout` and interactive prompt mode. The current [official MCP guide](https://www.antigravity.google/docs/mcp) documents workspace `.agents/mcp_config.json` and `enabledTools`. These were used only in the synthetic first worktree. `agy mcp list` there returned `No MCP servers configured.` ([sanitized probe](v02-antigravity-list.json)); `agy plugin list --json` returned an empty list. The list result alone does not prove runtime workspace discovery or complete isolation of built-in tools. No global config was edited.

One bounded actual invocation used the documented workspace configuration and selected model:

```bash
cd /tmp/mimir-v02-xx0ph1vg/project
agy --sandbox --model gemini-3.8-flash-high --output-format stream-json --print-timeout 90s --print "$(cat /tmp/mimir-v02-xx0ph1vg/session-1.txt)"
```

The runner launched a new process group with a 100-second outer deadline and termination/kill cleanup; it completed in **22.07 seconds**, exit **0**, without timing out. Full exact argv, synthetic prompt, structured events and stderr are in [session evidence](v02-antigravity-session.json). No retry occurred. No quota error occurred in this attempt; the historical quota report is not the current blocker.

Observed events:

- `init`: model `gemini-3.8-flash-high`, synthetic cwd, `permission_mode=request-review`.
- `step_update`: `call_mcp_tool`, `ServerName=mimir`, `ToolName=project_register`, with only the authorized synthetic first path and `authorizeIngestion=true`.
- The same step reached `DONE`, but the final `SUCCESS` result contained `denied_actions=[{action:mcp, display_name:CallMcpTool}]`. Neither DONE nor SUCCESS establishes execution.
- stderr explicitly reports that headless mode cannot prompt for the `mcp` permission and auto-denied the call. Its suggestions to add allow-rules or skip permissions were **not followed**.
- Independent SQLite verification returned exit **1**, zero memories, zero feedback, zero global copies: [initial check](v02-database-before.json), [final check](v02-database-after.json). The initial check was collected after launching the host while its output was pending; its filename does not establish a pre-invocation timestamp. No project was registered and no ingestion occurred (see [local checks](v02-local-checks.txt)).

This establishes an actual host MCP dispatch attempt, not successful server discovery/execution or acceptance. The allowlist constrains the configured server; Antigravity still advertises built-in tools. The captured events show no shell, browser, file, network or other tool invocation. A second session was not attempted because session one performed no write.

## Codex findings and supported next step

Installed **codex-cli 0.163.0** help confirms `exec --ignore-user-config` (authentication retained), `--ephemeral`, process-local `-c`, `--json`, `--sandbox read-only` and `--cd`. The [official MCP guide](https://learn.chatgpt.com/docs/extend/mcp?surface=cli) documents required startup, tool allowlists and per-tool approval modes. The generated MCP value uses `required=true`, a narrow allowlist and `default_tools_approval_mode="prompt"`; it never requests automatic approval. The [official security guide](https://learn.chatgpt.com/docs/agent-approvals-security) documents interactive `on-request` approval with the human reviewer.

The previous `exec` smoke reached `MCP tool call requires approval, but approval policy is never`. It was **not repeated**. Installed help documents `--ignore-user-config` for exec but does not establish that flag for the interactive TUI. Therefore an equivalent fully isolated, approval-capable interactive launch remains unverified. Loading ordinary user config in a new TUI may load unrelated MCP servers; do not use that as a silent replacement. No model/provider override, reserved environment override, rules change or approval weakening was used.

## Historical task26 operator handoff and gates

The [bounded manual acceptance handoff](v02-manual-acceptance.md) contains exact review commands, two separate 180-second interactive launches against the retained fixture, `/mcp` discovery checks before pasting the task, and the narrowly scoped one-time permission decision needed. Interactive commands are prepared, **not executed**. A broad persistent permission grant is not authorized. Structured event capture remains a separate evidence requirement; the documented interactive `--log-file` option does not establish log completeness.

The generic `call_mcp_tool` event used server/tool names supplied by the prompt. Permission was denied before a successful server response: **workspace discovery remains unverified**. The [Codex parser/schema investigation](v02-codex-investigation.json) confirms that interactive and app-server parsers reject `--ignore-user-config`. An offline protocol schema supports human approval routing fields but does not establish inherited-configuration isolation. No further model calls or blocked-session retries were made.

| Gate                                                  | Current result                                                 |
| ----------------------------------------------------- | -------------------------------------------------------------- |
| v0.1.1 remote CI technical gate                       | Passed, supervisor-verified                                    |
| Synthetic isolated fixture/config/prompts             | Prepared; offline verifier regressions passed                  |
| Actual Antigravity selected-model CLI invocation      | Observed; MCP call auto-denied by headless permission boundary |
| Actual Codex successful MCP operation                 | Pending; historical permission failure, no duplicate attempt   |
| Host registration/ingestion, store/search/get/note    | Pending; no persisted host write                               |
| Host missing-ID/scoped errors and source trust labels | Pending                                                        |
| Separate session and cross-host persistence           | Pending                                                        |
| Sensitive approval/delete/global-share human flow     | Pending genuine interaction; absent from automation allowlist  |
| Native Windows and Desktop/IDE host guides            | Pending actual validation                                      |
| Independent review of task26 artifacts                | Pending supervisor routing; no self-approval                   |

Required operator input: an interactive human permission decision for the prepared Antigravity fixture, plus a supported isolated approval-capable Codex session. Neither requires changing global settings or weakening rules. Full v0.2 remains open.

## Current basic CLI status — 2026-10-25

[Codex basic CLI closeout](v02-codex-acceptance.md) records user-operated store/search/get/note and scoped NOT_FOUND, plus actual Antigravity → Codex read. Independent read-only totals are 2 projects, 3 candidates, 2 notes, 0 globals. Second-session operations are user-summary evidence, not full structured traces. Both temporary registrations were removed per supervisor; ordinary user configuration loaded, so full isolation is not claimed. Sensitive approval/delete/global-share, full traces, Codex-created-record restart-read and workspace-only/native Windows/IDE/Desktop validation remain open. Package is 0.1.0 unpublished; green remote CI applies only to baseline 6590684, not uncommitted v0.2 work. The pending table above is the historical task26 state. Task29 independently approved task28; that review does not cover this documentation closeout.

Current final-gate preparation is documented in [task31 artifacts](v02-final-gates.md), including a review-required opt-in metadata relay, staged human tests, read-only preservation snapshots and platform guides. No actual host acceptance was added by this preparation.
