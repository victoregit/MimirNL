# Bounded manual acceptance for the retained synthetic fixture

Historical task26 procedure prepared 2026-10-25. User-operated follow-up results now appear in [task28 closeout](v02-antigravity-acceptance.md); the earlier empty-DB and unexecuted-session statements below describe the original preparation state. Do not rerun this procedure against the retained DB. The reusable prompt correction is `includes=["architecture.md"], maxFiles=2, maxBytes=10000, maxCommits=0`, counting the workspace config as a candidate. These commands are for Linux/WSL with the existing native Linux runtime. Keep all hosts sequential; do not open this DB using Windows. No persistent permission grant, allow-rule or global settings edit is requested.

## What is and is not established

The actual Antigravity headless event shows the model attempted the generic `call_mcp_tool` dispatcher with `ServerName=mimir` and `ToolName=project_register`. The prompt supplied both names. Permission was denied before any successful server response, and SQLite contains zero projects/memories/feedback. Therefore **workspace server discovery is unverified**. The `DONE` step and overall `SUCCESS` do not change that result. `agy mcp list` reported no configured servers; whether it excludes workspace definitions is unestablished. Do not infer discovery from a generic dispatcher being advertised.

## Review the existing fixture without a model call

Run in an ordinary local terminal:

```bash
cd /mnt/d/Projects/MimirNL
cat /tmp/mimir-v02-xx0ph1vg/manifest.json
cat /tmp/mimir-v02-xx0ph1vg/project/.agents/mcp_config.json
cat /tmp/mimir-v02-xx0ph1vg/session-1.txt
python3 scripts/v02-host-fixture.py verify-db /tmp/mimir-v02-xx0ph1vg/private/host.sqlite
```

The current verifier should exit 1 because no host write occurred. The only worktrees authorized for registration and ingestion are `/tmp/mimir-v02-xx0ph1vg/project` and `/tmp/mimir-v02-xx0ph1vg/other`. Each contains staged synthetic `architecture.md`; the DB is outside both. If the fixture is missing or has unexpected content, stop instead of substituting a real repository.

## Session one: discovery before operations

Launch without an initial task prompt, so the operator can inspect the MCP manager first:

```bash
cd /tmp/mimir-v02-xx0ph1vg/project
timeout --signal=TERM --kill-after=5s 180s agy --sandbox --model gemini-3.8-flash-high --log-file /tmp/mimir-v02-xx0ph1vg/session-1-interactive.log
```

The 180-second bound includes human interaction. A timeout is not acceptance and must not trigger an automatic retry. The help documents `--log-file`; its interactive log structure and completeness are not established. Keep it local and inspect/sanitize before copying any evidence into the repository.

Inside that interactive terminal:

1. Open `/mcp` (the documented interactive MCP manager). Verify a `mimir` server is connected, inspect its connection details and listed tools, and preserve the observable result. The command and args must match the reviewed config, including the exact synthetic DB. If `mimir` is absent, stop: the workspace configuration path has not been validated in this installation. Do not install a global server to compensate.
2. Confirm that the configured Mimir tools are limited to `project_register`, `project_ingest`, `memory_store`, `memory_search`, `memory_get`, `memory_feedback` and `memory_stats`. Stop if unrelated MCP servers or unexpected content appear. Built-in tools can still be advertised; no built-in tool use is authorized by this fixture task.
3. Paste the reviewed contents of `session-1.txt` into the interactive prompt. It authorizes registration of exactly the two fixture worktrees, ingestion of only `architecture.md` with `includes=["architecture.md"]`, `maxFiles=2`, `maxBytes=10000` and `maxCommits=0`, the exact synthetic store value, search/get, note feedback, missing-ID and scoped-denial checks.
4. At a permission dialog, the **human** must inspect the actual pending call and choose a one-time/per-call permission decision only if it matches that task. The first expected request is MCP `project_register` with `path=/tmp/mimir-v02-xx0ph1vg/project` and `authorizeIngestion=true`. Subsequent requests must remain within the reviewed task. Do not choose an always-allow or persistent rule option. If the UI offers only a broad persistent `mcp` grant, stop and report that limitation; no such grant is authorized here.
5. Reject requests to approve/promote/share/delete a memory or project, run shell/file/browser/network tools, access another server/path, or change permissions/settings. Approval of the host permission prompt is distinct from Mimir `explicitApproval` or `sharingApproval`: those flags remain absent/false.

Record successful server responses and tool identities/arguments/results. A connection status alone can establish observed connection/discovery; it cannot establish storage or scope behavior. For full acceptance, preserve structured host events or MCP request/response logs linked to the same session and DB. If the interactive log is only prose/terminal output, leave that evidence gate open. Do not infer that the headless permission denial was an observed human UI.

Exit the host, then run:

```bash
cd /mnt/d/Projects/MimirNL
python3 scripts/v02-host-fixture.py verify-db /tmp/mimir-v02-xx0ph1vg/private/host.sqlite
```

Require exit 0, exactly one matching project candidate, note feedback and zero global copies. Also require a successful registration/ingestion response, provenance/trust labeling for the imported synthetic file, and `NOT_FOUND` responses for the missing ID and wrong project. The database verifier alone does not check those gates. Stop if the host reported a permission denial or the verifier fails.

## Session two: independent session against the same database

Only after session one succeeds and closes, review the second prompt:

```bash
cat /tmp/mimir-v02-xx0ph1vg/session-2.txt
cd /tmp/mimir-v02-xx0ph1vg/project
timeout --signal=TERM --kill-after=5s 180s agy --sandbox --model gemini-3.8-flash-high --log-file /tmp/mimir-v02-xx0ph1vg/session-2-interactive.log
```

Inspect `/mcp` again, then paste `session-2.txt`. It allows registration of the same first worktree to obtain its existing project ID, search/get and confirmation of the persisted note. It does not authorize ingestion or memory writes. Preserve separate structured events, close the host and repeat the independent verifier. No success is currently claimed for either interactive session.

## Codex: bounded investigation result and human dependency

[Local parser/schema evidence](v02-codex-investigation.json) records **zero model calls**. Codex 0.163.0 rejected `codex --ignore-user-config --help` and `codex app-server --ignore-user-config --help`, each exit 2. It supports that flag for `exec`, whose historical MCP call was blocked because approval policy was `never`. That command was not repeated.

The offline `app-server generate-json-schema` command succeeded. `thread/start` has `approvalPolicy`, `approvalsReviewer`, `config`, `cwd`, `ephemeral` and `sandbox` fields. This identifies a possible future human approval client, **not** a validated isolation mechanism or a runnable approval UI. Neither help nor schema proves that replacing a thread's MCP config excludes all inherited servers. No app-server process/thread or custom approval responder was launched.

The prepared [MCP value](v02-codex-mcp-value.txt) has a narrow allowlist, required startup, 30-second tool limits and `default_tools_approval_mode="prompt"`. Use it only with a confirmed isolated launch; do not add it globally or silently fall back to loading unrelated user MCP configuration. No exact safe interactive Codex launch is claimed for this installed version. The required input is a supported installation/session mechanism that both isolates MCP settings and exposes genuine human approvals while retaining user rules and authentication. Until established, Codex and cross-host persistence gates remain open.

Sensitive approve/delete/global-share UI acceptance remains a separate pending task; those operations are outside this fixture's allowed actions. This manual handoff grants no authorization to test them.
