# Task42 native preparation result — 2026-10-26

## Final offline deployment — after Task43 static APPROVE

The previously staged preparer is now **deployed offline**, after independently reviewing Task43's STATIC APPROVE and verifying exact SHA256 `ad7d2ce34b3f1ba5730ee04021f984e814eec1786e0d5e02e574d37fe4472053` both in WSL and immediately before native execution. No preparer code changed. Earlier unexecuted/pending statements below are preparation history, superseded by this section. Actual native model-host acceptance remains OPEN.

Actual native fixture root:
`C:\Users\Usuario\AppData\Local\Temp\mimir-v02-task42-a76beea8716741b582616ee1cced4b19`

Within that root:

- Manifest: `manifest.json` (exact native Node/build paths and source commit `27c586c2e12159223dd0cb90d27fcc6691775f28`).
- Synthetic Git repositories: `project` and `other`; each has exact architecture text and explicit local synthetic Git identity.
- Database: `private\host.sqlite`, outside both Git repositories.
- Bounded operator prompts: `private\session-1.txt`, `private\session-2.txt`.
- Inert config values/templates: `private\codex-mcp-value.txt`, `private\agy-mcp-template.json`.
- ACL/authorization limitations: `private\README.txt`. Windows ACLs remain operator-controlled/uncertified; only synthetic data is present.

Actual invocation used the reviewed absolute script path `D:\Projects\MimirNL\.release\task42\prepare-native.mjs`, native Node `C:\Users\Public\mimir-hardening-runtime\node\node-v24.22.1-win-x64\node.exe`, cwd `C:\Users\Public\mimir-task42-7fa39eaffa\source`, and process-local Node/Git PATH. It exited **0**. Full emitted manifest/doctor evidence: `.release/task42/native-fixture-result.json`; nonfatal Git default-branch/CRLF notices: `native-fixture-stderr.txt`. No suggested global Git configuration from those notices was applied.

Doctor: **healthy=true**, win32/x64, Node24.22.1 supported, Git2.56.0.windows.3 available, SQLite3.53.4 integrity `ok`, WAL enabled, foreign keys enabled, FTS5 count0. Private ACL check correctly reports unknown/operator requirement, not certified protection.

One actual official SDK initialize/listTools health check through the exact candidate relay completed **exit0**: server `mimir-nl` **0.2.0**, **13 tools**, **0 memory calls**, client closed, database SHA256 bytes unchanged. Unique audit file `private\audit-session-11056-681af3ad-82a9-4d3b-8be8-c0ab757988e0.jsonl` exists and is empty, consistent with no tool calls. Evidence `.release/task42/native-fixture-sdk-health.txt`. The first health invocation failed at PowerShell/native `-e` argument quoting before connecting (no audit created); corrected by passing the same bounded SDK operation through stdin. Exactly one relay SDK connection was established. No deployed helper script or reviewed code was changed.

Native Codex **0.164.0** remains **logged-in** per the earlier authorized status check; it was not queried again. Antigravity CLI **1.4.7** authentication remains unqueried. No host/model/login launch, memory tool call, global MCP registration, installer/agy install, persistent PATH/config/rules change, commit or publication occurred during this deployment. Account model entitlement and actual interactive permission acceptance remain future operator checks.

Bounded discovery and reversible native runtime/build preparation completed. Actual native model-host acceptance remains OPEN. No login, browser, model/session launch, MCP registration, persistent PATH/config changes, commit, push or publication occurred. No WSL auth/config/database was copied or opened. Existing tracked/untracked work was preserved. `SAVEPOINT_V0.2.md` was absent from the checkout and exact candidate tree; the other required task/review/install documents were read.

## Concrete native executable evidence

PowerShell `Get-Command codex,agy,antigravity` and `where.exe` found no current native PATH commands. Narrow HKCU/HKLM uninstall metadata identified Antigravity desktop **2.26.0** at `C:\Users\Usuario\AppData\Local\Programs\antigravity\Antigravity.exe` and Antigravity IDE **2.5.5** at `C:\Users\Usuario\AppData\Local\Programs\Antigravity IDE`. Desktop resources/bin contained language_server.exe and webm_encoder.exe; IDE bin contained antigravity-ide.cmd pointing to its Electron cli.js. Neither was substituted for agy CLI or launched.

New portable native directory: `C:\Users\Public\mimir-task42-7fa39eaffa` (synthetic payload/build only; inherited ACLs are not certified private).

- Codex executable: `C:\Users\Public\mimir-task42-7fa39eaffa\hosts\codex\package\vendor\x86_64-pc-windows-msvc\bin\codex.exe`. Actual `--version`: **codex-cli 0.164.0**. Actual `--help` and `mcp add --help`: exit **0**.
- Antigravity CLI executable: `C:\Users\Public\mimir-task42-7fa39eaffa\hosts\agy.exe`. Actual `--version`: **1.4.7**. Actual `--help` and `mcp add --help`: exit **0**.
- Help logs: `.release/task42/codex-native-help.txt`, `.release/task42/agy-native-help.txt`. These probes establish native executable availability, not authentication/model access or MCP acceptance.

Codex help supports process `-c key=value` TOML overrides, `--no-daemon`, `--no-alt-screen`, `--sandbox read-only`, `--ask-for-approval on-request` and explicit `--cd`. Process overrides do not establish whole-user config/auth isolation. Antigravity help supports `--sandbox`, `--model`, `--log-file`, and stdio MCP registration syntax; no config-home/isolation override appears in the probed top-level help. No bypass flags were used. No mcp add command was executed.

## Trusted distribution / provenance

[Official Codex CLI documentation](https://learn.chatgpt.com/docs/cli) documents npm `@openai/codex`. Registry metadata for **0.164.0** explicitly maps Windows x64 to `@openai/codex@0.164.0-win32-x64`, repository `openai/codex`. The native package was downloaded directly from `https://registry.npmjs.org/@openai/codex/-/codex-0.164.0-win32-x64.tgz`, verified against registry SHA512 integrity, then safely extracted only under the new portable directory. No npm global installation/lifecycle installer ran for Codex.

[Official Antigravity authentication/install documentation](https://antigravity.google/docs/install?tab=cli) and its `https://antigravity.google/cli/install.ps1` establish the native installer. The installer was downloaded/read but NOT executed: it eventually invokes `agy install` to configure the environment. Its official updater manifest returned **1.4.7**, payload `https://storage.googleapis.com/antigravity-public/antigravity-cli/1.4.7-5900205422411776/windows-x64/cli_windows_x64.exe`. Downloaded bytes matched manifest SHA512 `e9e69f036ef0a9c3329cd0608474711dfdbbf62df10a98e237c9fb528daf36be21b4ee65b796b07e0f10ec266f008bb9e40a9c59ba32e4d13ca87bfeb36d3c2a`. Only the payload was placed under hosts/agy.exe. No environment setup/unblock/global registration ran.

Raw manifests, installer, exact URLs, verified integrity and source provenance are retained under `.release/task42/` (`download-provenance.json`, `agy-manifest.json`, `codex-npm.json`, `codex-win32-npm.json`). Hash verification authenticates consistency with the fetched official manifest/registry metadata; no separate signature verification is claimed.

## Exact candidate native build and offline checks

Source exported by `git archive` from exact `27c586c2e12159223dd0cb90d27fcc6691775f28` into `C:\Users\Public\mimir-task42-7fa39eaffa\source`. Repository source was not changed. Native command-local PATH used:

- Node: `C:\Users\Public\mimir-hardening-runtime\node\node-v24.22.1-win-x64\node.exe`, actual **v24.22.1**.
- npm: same directory `npm.cmd`, actual **11.19.1**.
- Git: `C:\Users\Public\mimir-hardening-runtime\git\cmd\git.exe`, actual **2.56.0.windows.3**.

`npm.cmd ci --no-audit --no-fund` installed 106 locked packages; `npm.cmd run build` succeeded. Log `.release/task42/native-build.log`. Exact-source comparison of package/lock and reviewed relay/test files passed (`exact-source-check.json`). The package remains candidate **0.2.0**; no pack or publication was performed.

Existing reviewed native `node --test test/v02-audit-relay.test.mjs` passed **4/4**, exit 0, against that exact build. It exercised a NEW disposable native SDK/relay DB and cleaned it itself; this is not the retained human fixture or host acceptance. Log `.release/task42/native-relay-offline.txt`. No full core or WSL test suite was rerun.

## Reviewable native fixture preparation

New script `.release/task42/prepare-native.mjs` is staged for independent review; **NOT EXECUTED** pending that review. Supported Node syntax check passed. The proposed fixture is a fresh native `%TEMP%\mimir-v02-task42-<unique>` directory, matching the reviewed relay's native tmpdir/basename constraints. The script refuses other platforms/runtimes/existing directories; creates synthetic project/other Git worktrees with local identity `Mimir Synthetic Fixture <mimir-fixture@example.invalid>`, exact `architecture.md` text `Synthetic fixture renderer queue.\n`, and SQLite DB in sibling private/host.sqlite outside both worktrees. It records native runtime/build/DB paths in manifest.json and initializes only that new DB.

It stages inert private Codex process-override value and Antigravity MCP JSON template using the exact reviewed relay with `--unique 240`, plus bounded session-1/session-2 prompts for register/ingest/store/search/get/note/missing/cross-project isolation/restart-read. Sensitive approval, promotion, sharing and deletion are excluded. No global MCP registration is included. Actual fixture creation, doctor and host execution must follow independent review; this result does not claim an existing retained native fixture or passing doctor for it.

Review request was sent to assigning terminal dbfe79b6 before deployment. Supervisor created `tasks/43-native-preparation-review.md`, authorizing the independent reviewer to execute controlled offline fixture preparation only after static safety assessment; that review/operational result is separate from this developer result. This review boundary is explicitly required by Task42 and the assignment's “Any new script review before deployment”; no self-approval or model review session was started.

## Operator dependencies and exact next steps

1. Independently review `.release/task42/prepare-native.mjs`; then run it with supported native Node from the exact exported source working directory, passing a NEW native TEMP child named `mimir-v02-task42-<unique>`. The complete fixture paths/prompts/templates will be emitted/staged there. Verify Windows ACLs on private/ before retaining protected data; this synthetic preparation cannot certify privacy.
2. Native executable installation is no longer blocking: use the exact portable paths above with command-local runtime/Git PATH. No persistent install is required for the bounded test.
3. Account readiness is **unknown**, because no credential/keyring/config reads, login/status calls or model calls were permitted. [Antigravity official authentication docs](https://antigravity.google/docs/install?tab=cli) say local launch attempts native Windows Credential Manager, otherwise opens browser OAuth. Existing desktop installation does not prove CLI account/model access. A genuine operator login may therefore be required; no WSL authentication transfer is appropriate.
4. For later authorized interactive testing, preserve selected Antigravity model **gemini-3.8-flash-high** and `--sandbox`. No models/list request was made; exact account entitlement/model availability is not established by help/version. The official settings page documents workspace `.agents/mcp_config.json` merged with global servers; native automatic discovery and complete isolation remain untested. Do not assume an unverified HOME override or edit global settings.
5. Codex later launch may use `--no-daemon --no-alt-screen --sandbox read-only --ask-for-approval on-request --cd <fixture-project> -c <reviewed fixture MCP override>`. The concrete override is generated by the reviewed preparer. Native account access and actual per-call human permission must be established interactively, not through approval-never or automatic answers.
6. Record genuine bounded calls and restart-read for each host, then assess dedicated sensitive L/G flow separately with concrete human choices. No native host acceptance or release-scope waiver is implied by this preparation.

## Changed files

Only new deliverable `tasks/42-native-host-preparation-result.md` and ignored `.release/task42/` preparation/evidence files were authored in the repository. No tracked source/scripts/tests/docs/AGENTS were edited. External changes are confined to the new portable synthetic native root and its native locked build dependencies. Script deployment remains review-gated. Existing protected WSL fixture/database was not accessed; no new preservation snapshot is claimed.

## Official CMD installer corroboration — supervisor follow-up

Fetched/read `https://antigravity.google/docs/cli/install/` directly again: the current response is an HTML redirect to `/docs/install?tab=cli` (target already fetched/read during preparation). Also fetched/read `https://antigravity.google/cli/install.cmd` as inert provenance, saved `.release/task42/agy-install.cmd`. Its Windows AMD64 flow uses exactly the same official updater `/manifests/windows_amd64.json`, payload URL and SHA512 verification as the PowerShell installer read before the original portable download. It then invokes `agy.exe install`; neither installer was executed. No third-party source supplied the payload, no additional portable download was performed on this follow-up, and no login/model/global PATH change occurred.

## Authorized read-only native Codex account status follow-up

After supervisor explicitly authorized `login status`, the verified native Codex executable returned **logged-in**, exit **0**. Only sanitized status was retained in `.release/task42/codex-login-status-sanitized.json`; raw status output was not printed or saved. No credential files were directly read by this agent, tokens copied, login launched or model called. The CLI may consult its normal native authentication storage internally. Antigravity authentication/status remains unqueried; no documented status command was established and no auth/model launch was made. This supersedes the earlier unknown Codex sign-in status only; model access and native host acceptance remain untested.

## Frozen preparer command for reviewer (not executed by developer)

From native PowerShell, after independent review:

```powershell
$env:PATH = 'C:\Users\Public\mimir-hardening-runtime\node\node-v24.22.1-win-x64;C:\Users\Public\mimir-hardening-runtime\git\cmd;' + $env:PATH
Set-Location 'C:\Users\Public\mimir-task42-7fa39eaffa\source'
$fixture = Join-Path $env:TEMP ('mimir-v02-task42-' + [guid]::NewGuid().ToString('N'))
& 'C:\Users\Public\mimir-hardening-runtime\node\node-v24.22.1-win-x64\node.exe' 'D:\Projects\MimirNL\.release\task42\prepare-native.mjs' $fixture
```

The exact retained fixture path will be chosen/emitted only on reviewed execution. Before execution it does not exist. Generated files: `$fixture\manifest.json`, `$fixture\private\host.sqlite`, `$fixture\private\session-1.txt`, `$fixture\private\session-2.txt`, `$fixture\private\codex-mcp-value.txt`, `$fixture\private\agy-mcp-template.json`; project roots `$fixture\project` and `$fixture\other`. Native build CLI: `C:\Users\Public\mimir-task42-7fa39eaffa\source\dist\cli\index.js`; reviewed relay: same source root `scripts\v02-audit-relay.mjs`. Reviewer terminal `ab9f31a0` is handling static review/offline checks; developer preparer remains frozen and unexecuted. No model calls are needed to report these completed preparation results.
