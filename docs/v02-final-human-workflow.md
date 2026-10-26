# v0.2 final human gates (prepared, not executed)

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

2026-10-25. Independent Flash review of the new scripts is required before deployment. The supervisor then performs the already authorized temporary same-name registration and guides the human. No model calls, registration or permission choices were made by this task. Preserve the retained fixture and all three original memories. Run hosts sequentially with the same Linux Node runtime; never open this live SQLite/WAL database from Windows.

Current status (2026-10-26): this is a retained procedure, not an instruction to resume sessions now. Codex restart-read and mutation/cleanup already completed; do not repeat them automatically. The temporary global registrations were removed. Any future Codex launch must use the full MCP table scoped to that process (command, relay args with `--unique`, enabled tools, prompt approval, required/startup settings), rather than relying on the historical registration-based examples below. No further host session is authorized by task35.

## Required route (task33)

Run the Codex restart-read **once**, then six phases per host: **create L → deny one approval and verify unchanged → approve L → promote sanitized content → find/inspect G → delete known G and L, verify original hashes**. This is the entire required human route. The optional appendix is not a release gate or a second mandatory checklist. Each actual mutation still requires its own one-time human decision; only the already inspected G/L deletion calls share a prompt.

## Preflight and evidence

Close existing fixture hosts. From `/mnt/d/Projects/MimirNL`, run:

```bash
python3 /mnt/d/Projects/MimirNL/scripts/v02-final-snapshot.py
codex mcp list --json
agy mcp list
```

Compare with [baseline](v02-final-before.json): 2 projects, 3 candidates, 2 notes, 0 globals. Stop on differences until explained. The snapshot hashes full original records, history and feedback without exposing their content. Save each later snapshot locally under the private fixture directory using a new filename and `umask 077`; never overwrite the baseline. Do not print or scan unrelated sessions/configuration. Ordinary user rules/auth/config remain loaded. Zero configured MCP servers was observed previously; inspect the current list before adding anything and stop on a conflicting `mimir-v02-test` entry.

For reviewed opt-in capture, the temporary server command is:

```text
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node
```

Its arguments are:

```json
[
  "/mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs",
  "/tmp/mimir-v02-xx0ph1vg",
  "--unique",
  "240"
]
```

Use `--unique` for human hosts: each relay process (including `/mcp` secondary starts and restarts) exclusively creates its own `audit-session-PID-UUID.jsonl`. Collect the newly created private files for the session ledger; no basename is printed on protocol stdout. Explicit `audit-NAME.jsonl` remains supported for controlled single starts; existing files are refused, never overwritten, appended or reused. The relay reads the fixture manifest, checks the exact native runtime/build/database, and launches only that build with that DB. It forwards original bytes with backpressure, suppresses server stderr, and observes newline JSON-RPC separately. Only six named memory tools, UUIDs, approval booleans, selected actions/scopes and bounded outcomes are recorded. No prompt/content/source/path/query/note/error text/auth/hidden reasoning is recorded. Unknown tools/protocol messages and string RPC IDs are excluded. Frames above 64 KiB and pending calls beyond 128 are excluded from capture, while protocol forwarding continues. Capture stops at 511 metadata rows plus `capture_limit`; any excluded/limited evidence leaves completeness open. The default hard session bound is 240 minutes (four hours), including idle time. An optional third argument sets integer minutes from 1 through 720; zero, nonfinite and fractional limits are refused. It sends TERM, then KILL after one second; timeout is not acceptance. EOF retains a 30-second flush grace. Sanitized startup stderr identifies an existing audit collision and recommends `--unique`; lifecycle stderr reports termination without paths, content or raw errors. POSIX parent directories must already be private; evidence files are created exclusively with mode 0600.

This is receipt evidence, not an authorization boundary. The server still exposes other tools; the host allowlist and deliberate human choices remain necessary. Record a small manual session ledger: host/version, audit basename, phase, one-time UI decision, exact reviewed synthetic arguments and response IDs/status/error codes. Receipt `call` numbers correlate replies. No audit receipt for a denied call alone proves nothing: correlate the human's actual rejection with unchanged DB state and the next approved call in that same session. Metadata capture cannot retroactively fill historical traces or prove complete host behavior.

## Codex restart-read first

After review and supervisor temporary registration with the restart audit arguments, run this in a fresh ordinary terminal (no model override):

```bash
cd /tmp/mimir-v02-xx0ph1vg/project
codex --no-daemon --no-alt-screen --sandbox read-only --ask-for-approval on-request \
  -c 'mcp_servers.mimir-v02-test.enabled_tools=["memory_get"]' \
  -c 'mcp_servers.mimir-v02-test.default_tools_approval_mode="prompt"'
```

Inspect `/mcp`: exact temporary name, command, arguments and only `memory_get`. Then paste:

> Use only mimir-v02-test.memory_get. Get projectId=80b93460-27ba-4db2-a49b-980cdb06c2ac, id=f0f7a064-4d94-4e2e-987f-4a75df6d17cb. No other tools or writes. Stop for human permission. Report content, status and note feedback, then stop.

Human approves that one read only. Require `fixture codex bridge amber 842`, candidate, and `codex host check` note; retain the observed tool response. Exit Codex and compare original hashes/totals using the snapshot. This establishes a new session reading the Codex-created record only after actual execution.

## Required sensitive session: six phases per host

After closing restart-read, supervisor uses the reviewed `--unique` mode for the temporary entry. Launch Codex with the same flags, replacing the enabled-tools override with:

```text
-c 'mcp_servers.mimir-v02-test.enabled_tools=["memory_store","memory_get","memory_search","memory_feedback","memory_delete"]'
```

Keep prompt approval mode. The required path is **six short phases per host** below; service flag-omission checks are optional offline evidence, not extra user rounds. Paste one phase at a time. **P** is `80b93460-27ba-4db2-a49b-980cdb06c2ac`; replace **L** and **G** with the actual inspected UUIDs before submitting any prompt that uses them. Human chooses **once** on each tool dialog, never session/persistent allow. Reject any unrelated tool, protected original ID, broad grant or unexpected argument. A missing dialog for a proposed sensitive mutation leaves that human UI gate unverified even if service flags are enforced.

1. **Create one dedicated candidate.** “Only memory_store in projectId=80b93460-27ba-4db2-a49b-980cdb06c2ac, content exactly `fixture final gate sanitized violet 631 codex`, type=semantic, origin=user, source=`synthetic final gate`. No other call. Stop for human permission.” Approve this one creation. Inspect candidate/project status and exact content; record the returned new UUID as **L**. Save a snapshot: 4 memories, 0 globals, original hashes unchanged. If L is an original/prior record or totals are unexpected, stop; do not delete it blindly.
2. **Reject one proposed mutation.** With the actual L substituted: “Propose exactly memory_feedback(projectId=P,id=L,action=approve,explicitApproval=true); wait for the human; after rejection stop, do not retry or use another tool.” Human deliberately rejects this dialog. Save one more snapshot and require it to match phase 1 exactly. Record the actual UI rejection and absence of a corresponding relay receipt. Absence alone cannot establish a human denial.
3. **Explicitly approve L.** Inspect L and its content, then submit: “I explicitly approve verifying only this synthetic candidate. Only memory_feedback(projectId=P,id=L,action=approve,explicitApproval=true), once.” Approve the matching one-time UI call. Require verified, version 2, one approve feedback. No intermediate snapshot or extra read is required when the response supplies these fields.
4. **Explicitly share the sanitized content.** Review the exact content from phase 1: no path, credential or private data. “I authorize sharing exactly this synthetic sanitized content across projects. Only memory_feedback(projectId=P,id=L,action=promote,sharingApproval=true).” Approve this one dialog. The response remains the **local** record, normally version 3; it does not supply the new global ID.
5. **Discover and inspect G.** “Only memory_search(projectId=P,query=`fixture final gate sanitized violet 631 codex`,scope=global,includeGlobal=true,limit=10). No other call.” Inspect the sole exact content match, verified/global status, independent sanitized source (`explicit sharing approval; source withheld`), and lack of private paths/relations/project identity. Record its actual UUID as **G** only after review. G must differ from L and every protected original. If there is no unique exact match, stop without selecting an ID. If a unique returned G omits fields needed for review, allow one explicit memory_get(projectId=P,id=G,includeGlobal=true) using that inspected UUID; never guess the ID. No deletion is authorized by this discovery prompt.
6. **Delete only the two known test records, then verify preservation.** The human now reviews the actual **G and L**, their exact synthetic content and scopes together. Submit one bounded prompt with their concrete UUIDs: “I authorize deleting only these two dedicated synthetic test records. First call memory_delete(projectId=P,id=G,scope=global,confirm=true,sharingApproval=true). Only if its response is deleted=true, call memory_delete(projectId=P,id=L,confirm=true). Stop on any error or mismatch. No other tools or records.” Human inspects and approves each matching one-time dialog separately. Both deletion targets are already known; no unknown-ID operation is batched. Require deleted=true for each call. Close the host and save a final snapshot: exactly 2 projects/3 memories/2 feedback/0 globals, with **all original hashes equal to baseline** and neither L nor G present. Dedicated feedback/history are removed by cascade. No extra NOT_FOUND calls are required; never call project_delete.

Close Codex before repeating only these six phases in Antigravity, using `--unique` and content `fixture final gate sanitized violet 631 agy` in creation and search. Supervisor configures the same reviewed relay with `enabledTools` restricted to the five tools above; inspect `/mcp` first. Launch from the synthetic first project with `agy --sandbox --model gemini-3.8-flash-high`. Keep the user-selected model and actual human one-time decisions. A broad persistent `mcp` permission is not acceptance; stop if a one-time choice is unavailable. No automated permission responder, headless approval-never replay or bypass flag is part of this workflow.

The required proof per host is: one dedicated creation, one observed UI denial plus unchanged snapshot, actual one-time approval/share/delete dialogs and matching responses, safe G discovery, and final original-preservation snapshot. The separate Codex restart-read above runs once; it is not repeated for each host. The final review should assess this concise core path rather than require exhaustive manual service regression.

## Optional appendix — not required user rounds

These are already covered by automated core/package/SDK tests and are **not required human rounds**, nor a reason to repeat the full workflow in both hosts. Prefer offline evidence from `test/core.test.mjs`, the installed-package smoke and `test/v02-audit-relay.test.mjs` (which includes an omitted-confirm schema error). If a reviewer identifies a specific evidence gap, a human may choose only that additional check on the dedicated L/G while they exist, with one-time UI permission and no automatic repair/retry:

| Optional call                                                      | Expected result / safe timing                                                         |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| memory_feedback(P,L,action=approve), omit explicitApproval         | APPROVAL_REQUIRED; before phase 3                                                     |
| memory_feedback(P,L,action=promote), omit sharingApproval          | SHARING_APPROVAL_REQUIRED; after phase 3, before phase 4                              |
| memory_delete(P,L), omit confirm                                   | Structured schema error/isError=true; record actual SDK/service shape, before phase 6 |
| memory_delete(P,G,scope=global,confirm=true), omit sharingApproval | SHARING_APPROVAL_REQUIRED; after G inspection, before phase 6                         |

For any elected negative check, compare a before/after snapshot and require no state change. Permitting a deliberately invalid service call does not authorize supplying its missing flag. Optional cross-project global reads or post-deletion NOT_FOUND reads also remain outside the required core path.

After both sessions, supervisor removes only `mimir-v02-test` from each host and verifies its absence. Retain fixture, audit metadata and snapshots; export only the manually reviewed synthetic ledger and sanitized JSON. If interrupted, retain leftovers and list their exact IDs; resume only after independent comparison. Do not automatically clean up unknown records or restore over the DB.

## Task35 correction status (2026-10-26)

The former explicit filename collided when Codex `/mcp` launched a second client; its 15-minute deadline also closed healthy idle sessions. Task35 adds opt-in unique files and a finite human-session lifetime. Automated SDK tests are transport/service evidence only. Codex restart-read and synthetic mutation/cleanup completed; protected state returned to baseline. Actual one-time allow dialogs remain user-unconfirmed. Antigravity sensitive acceptance and native Windows host acceptance remain pending. No further human/model sessions were run for this correction; future deployment awaits supervisor independent review and authorization.
