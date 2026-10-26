# Installation and host verification for v0.2

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

## Actual native Windows method — Task44

This is the tested portable CLI method, recorded for reproduction; the retained fixture is completed evidence, not a request to launch it again. The official registry/manifest payloads and integrity checks are documented in [Task42 provenance](../tasks/42-native-host-preparation-result.md) and [Task43 independent preparer review](../tasks/43-native-preparation-review-findings.md). No global installer or persistent PATH change was needed. Codex already had native authentication; do not re-login or transfer WSL credentials.

| Component   | Actual tested value                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------- |
| Source      | `C:\Users\Public\mimir-task42-7fa39eaffa\source`, exported from `27c586c2e12159223dd0cb90d27fcc6691775f28`          |
| Node        | `C:\Users\Public\mimir-hardening-runtime\node\node-v24.22.1-win-x64\node.exe`                                       |
| Git         | `C:\Users\Public\mimir-hardening-runtime\git\cmd` (2.56.0)                                                          |
| Codex       | `C:\Users\Public\mimir-task42-7fa39eaffa\hosts\codex\package\vendor\x86_64-pc-windows-msvc\bin\codex.exe` (0.164.0) |
| Antigravity | `C:\Users\Public\mimir-task42-7fa39eaffa\hosts\agy.exe` (1.4.7, `gemini-3.8-flash-high`)                            |
| Fixture     | `C:\Users\Usuario\AppData\Local\Temp\mimir-v02-task42-a76beea8716741b582616ee1cced4b19`                             |
| Database    | Fixture `private\host.sqlite`, native SQLite 3.53.4; independent of WSL                                             |
| Relay       | Source `scripts\v02-audit-relay.mjs`, fixture argument followed by `--unique 240`                                   |

The preparer was independently approved at SHA-256 `ad7d2ce34b3f1ba5730ee04021f984e814eec1786e0d5e02e574d37fe4472053`. It created a new direct TEMP child, two synthetic Git roots (`project`, `other`), manifest and native DB. It is a retained local preparation artifact, not an installed package command; see Task43 for its exact reviewed invocation. Do not reuse WSL SQLite/WAL files or describe inherited Windows ACLs as certified private.

Reference native PowerShell commands (substitute a new independently prepared fixture when reproducing):

```powershell
$payload = 'C:\Users\Public\mimir-task42-7fa39eaffa'
$node = 'C:\Users\Public\mimir-hardening-runtime\node\node-v24.22.1-win-x64\node.exe'
$env:PATH = 'C:\Users\Public\mimir-hardening-runtime\node\node-v24.22.1-win-x64;C:\Users\Public\mimir-hardening-runtime\git\cmd;' + $env:PATH
$fixture = 'C:\Users\Usuario\AppData\Local\Temp\mimir-v02-task42-a76beea8716741b582616ee1cced4b19'
$codex = "$payload\hosts\codex\package\vendor\x86_64-pc-windows-msvc\bin\codex.exe"
$agy = "$payload\hosts\agy.exe"
& $node "$payload\source\dist\cli\index.js" --db "$fixture\private\host.sqlite" doctor
# Run interactive hosts from a genuine native console:
Set-Location "$fixture\project"
$value = (Get-Content -Raw "$fixture\private\codex-mcp-value.txt").Trim()
& $codex --no-daemon --no-alt-screen --sandbox read-only --ask-for-approval on-request -c "mcp_servers.mimir=$value"
# After Codex exits, use only the reviewed temporary native Antigravity entry:
& $agy --sandbox --model gemini-3.8-flash-high
# At closeout, remove only the entry created for this fixture:
& $agy mcp remove mimir-v02-native-test42
```

Codex used a process-only MCP override, prompt approval mode and the reviewed relay. Task44 supplied the native Git/Node PATH in the MCP child environment. Antigravity used an explicitly authorized temporary native entry `mimir-v02-native-test42`, added only after confirming its absence; it pointed to that same native Node/relay/fixture, with entry-local runtime PATH. The generated `agy-mcp-template.json` describes the server arguments; preserve other servers and use the installed `mcp add --help` syntax when reproducing. Do not run Antigravity before that entry is configured. A tool allowlist does not restrict `memory_feedback` argument values: the bounded prompt allowed only `action=note`, with no approval/sharing flags.

The WSL service PTY could not supply native Codex interactive stdin (`stdin is not a terminal`). Task44 opened a native console using PowerShell `Start-Process -WindowStyle Normal`; the user handled actual dialogs and reported results. This is an intermediate-terminal limitation, not a failed native MCP test or a reason to bypass approvals. Ordinary user configuration still loads.

The actual sequence was Codex store, new-session get/search/note, second-project registration and scoped `NOT_FOUND`, then `architecture.md` ingestion (`maxCommits=0`, `maxFiles=2`, `maxBytes=10000`) and untrusted-source search. Antigravity read the Codex record/note, stored/searched/read/noted its own candidate, verified scoped `NOT_FOUND`, unchanged idempotent ingestion and provenance. After Antigravity exited, a new Codex session with only `memory_get` enabled read the Antigravity candidate and note. The audit files are metadata receipts, not complete traces; registration/import also rely on actual user outputs and native DB corroboration.

| Surface                                   | Current evidence                                                              | Boundary                                                     |
| ----------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Linux/WSL CLI/MCP and both hosts          | Basic, persistence, cross-host and bounded sensitive flows recorded           | Codex individual allow dialogs not enumerated; no full trace |
| Native Windows runtime and both CLI hosts | Task44 actual basic/persistence/isolation/import/cross-host acceptance passed | No native approve/promote/delete; no ACL certification       |
| IDE/Desktop/workspace auto-discovery      | Untested                                                                      | Outside demonstrated CLI scope; no added milestone gate      |

## Historical record / procedure (preserved)

The material below retains its original task/date scope. Earlier pending claims are superseded by the current evidence above; procedural launches are historical reference steps, not instructions to repeat completed WSL or native tests. Native-absence and pending claims below describe their original task only; Task44 supersedes them.

Prepared 2026-10-25; package is still 0.1.0 and unpublished. Use a source checkout, not an assumed published 0.2 package. No installation or global software/config changes were performed by task31. Host templates are opt-in operator steps after review. Never copy another user's authentication/configuration or use bypass flags.

## Linux / WSL

Install a supported native Linux Node **>=24.22.1 <25**, npm and Git using your normal platform installation process. WSL must use Linux Node/npm/Git together. `command -v node npm git` must not resolve to `/mnt/c/...`; repair your terminal PATH before continuing. On this machine the retained disposable runtime is `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`, not a durable installation.

From a source checkout:

```bash
node --version
npm --version
git --version
npm ci
npm run build
```

Choose an explicit private Linux directory and create it with mode 0700. Use these commands after replacing YOUR_USER:

```bash
mkdir -p /home/YOUR_USER/.local/share/mimir-nl
chmod 700 /home/YOUR_USER/.local/share/mimir-nl
node /absolute/checkout/dist/cli/index.js --db /home/YOUR_USER/.local/share/mimir-nl/memory.sqlite doctor
```

Require `healthy=true`, supported runtime, Git, integrity, WAL and FTS5. This creates/opens only the explicit chosen DB. First acceptance must instead use a disposable synthetic DB outside its Git worktree. The [retained workflow](v02-final-human-workflow.md) has exact fixture paths, prompts and per-call approval steps. It must not be repointed at real memories.

Install/open the user's chosen supported Codex and Antigravity CLI through their official installers; do not run an agent installer silently. Check `codex --version`, `codex --help`, `agy --version`, `agy --help`, `codex mcp add --help` and `agy mcp add --help` locally. Task31 observed Codex 0.164.0 and agy 1.4.7; earlier successful user sessions used Codex 0.163.0. A version/help probe makes no model call.

Codex stdio template ([official MCP guide](https://learn.chatgpt.com/docs/extend/mcp), checked 2026-10-25):

```toml
[mcp_servers.mimir]
command = "/absolute/path/to/node"
args = ["/absolute/checkout/dist/cli/index.js", "--db", "/home/YOUR_USER/.local/share/mimir-nl/memory.sqlite", "mcp", "stdio"]
enabled_tools = ["memory_get"]
default_tools_approval_mode = "prompt"
required = true
startup_timeout_sec = 30
tool_timeout_sec = 30
```

Use a fresh interactive terminal with `codex --no-daemon --no-alt-screen --sandbox read-only --ask-for-approval on-request`. Inspect `/mcp` and exact paths before a task. This loads ordinary user configuration/rules/authentication; it does not promise whole-user isolation. The sandbox controls host commands, not SQLite write capabilities of a configured MCP subprocess. A narrow tool allowlist and actual one-time human permission remain essential. Do not pass interactive `--ignore-user-config`, replay a headless approval-never failure, or choose persistent allow rules. The staged workflow expands the allowlist only for its specific synthetic tests.

Antigravity template ([official MCP guide](https://www.antigravity.google/docs/mcp)):

```json
{
  "mcpServers": {
    "mimir": {
      "command": "/absolute/path/to/node",
      "args": [
        "/absolute/checkout/dist/cli/index.js",
        "--db",
        "/home/YOUR_USER/.local/share/mimir-nl/memory.sqlite",
        "mcp",
        "stdio"
      ],
      "enabledTools": ["memory_get"],
      "timeoutSeconds": 30
    }
  }
}
```

Use the installation's MCP settings or inspect `agy mcp add --help`; existing successful evidence used an explicitly authorized temporary CLI registration, subsequently removed. Workspace `.agents/mcp_config.json` automatic discovery has not been established on this installation. Launch the synthetic session with `agy --sandbox --model gemini-3.8-flash-high` and inspect `/mcp`. Retain the user-selected model. Require one-time choices; a host offering only broad persistent permission cannot pass this test.

## Native Windows (separate database and runtime)

Use native Windows Node **>=24.22.1 <25**, npm and Git for Windows. Open a new Command Prompt after an operator installation/PATH change. Run:

```bat
where node
where npm
where git
where codex
where agy
node --version
call npm.cmd --version
git --version
cd /d D:\Projects\MimirNL
call npm.cmd ci
call npm.cmd run build
```

Stop if the runtime is unsupported. The default machine PATH returned Node 24.21.0 and lacked Git/Codex/agy; it is insufficient. An existing disposable test runtime under `C:\Users\Public\mimir-hardening-runtime` supplies Node 24.22.1, npm 11.19.1 and Git 2.56.0.windows.3. Task31 used those only with a command-local PATH and a new synthetic DB: [native probe](v02-final-native-probe.txt). No software was installed and no persistent PATH was changed. Public fixture paths are for synthetic test data; for actual data use an operator-controlled private directory with suitable Windows ACLs. `doctor` reports the ACL requirement; it cannot certify ACLs.

After choosing a private native directory and native checkout, run (replace YOUR_USER):

```bat
node D:\Projects\MimirNL\dist\cli\index.js --db C:\Users\YOUR_USER\AppData\Local\mimir-nl\memory.sqlite doctor
```

For Codex, native TOML strings can preserve backslashes:

```toml
[mcp_servers.mimir]
command = 'C:\Program Files\nodejs\node.exe'
args = ['D:\Projects\MimirNL\dist\cli\index.js', '--db', 'C:\Users\YOUR_USER\AppData\Local\mimir-nl\memory.sqlite', 'mcp', 'stdio']
enabled_tools = ["memory_get"]
default_tools_approval_mode = "prompt"
required = true
```

For Antigravity, use the same native values with JSON-escaped backslashes:

```json
{
  "mcpServers": {
    "mimir": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "D:\\Projects\\MimirNL\\dist\\cli\\index.js",
        "--db",
        "C:\\Users\\YOUR_USER\\AppData\\Local\\mimir-nl\\memory.sqlite",
        "mcp",
        "stdio"
      ],
      "enabledTools": ["memory_get"]
    }
  }
}
```

Substitute a supported executable if `Program Files` still contains Node 24.21.0. These are templates, not registered settings. Native host installation/action is still required: install or expose supported native Codex and Antigravity executables, verify each `--help`/`--version`, then run the same staged synthetic scenario with a NEW native fixture/DB and record actual human dialogs. Never point Windows Node to `/tmp/...`, and never point WSL Node to a native live SQLite/WAL DB. The Python fixture preparer remains Linux/WSL-only. Task35 focused relay tests construct a separate disposable native fixture with the exact native runtime/build/DB manifest; they do not establish native host acceptance or certify ACLs. For human evidence, use an independently reviewed native fixture adaptation or a reviewed host export for only the explicit synthetic session. Do not weaken checks to reuse the WSL DB.

## Historical troubleshooting

The old pending matrix is superseded by the current platform matrix above.

`node:sqlite`/runtime errors: check exact host executable, not only the parent terminal version. `NOT_FOUND`: verify explicit project UUID and local/global scope; never retry against another real project. MCP connection failures: build first, verify absolute arguments and DB location, run `doctor`, keep stdout exclusively JSON-RPC. Headless permission refusal: return to the genuine interactive human workflow, without persistent allow-rules. Native Windows missing executable: fix the native installation/PATH, not WSL/native DB sharing. Historical intermittent Linux CI failure has not been declared fixed by these guide probes.

## Synthetic relay lifecycle correction (task35)

For the reviewed synthetic relay only, use arguments `["/absolute/checkout/scripts/v02-audit-relay.mjs", "/tmp/mimir-v02-FIXTURE", "--unique", "240"]`. Each process creates an exclusive `audit-session-PID-UUID.jsonl` under the fixture private directory, with POSIX mode 0600. Concurrent discovery clients and restarts get independent files. Collect all session files; no path is emitted on stdout. Explicit `audit-NAME.jsonl` compatibility still refuses collisions and never appends/reuses files. Fixture, native runtime and private-directory validation stay mandatory.

The optional final argument is a hard lifetime in whole minutes, 1..720; default 240. Idle time counts. A sanitized stderr deadline message means restart with unique mode, not host rejection. EOF allows 30 seconds to flush; termination escalates TERM to KILL after one second. Startup stderr gives collision/configuration guidance without paths or raw exceptions. Do not use zero/unbounded settings or reuse a WSL DB from Windows. These opt-in fixture arguments are not general production configuration.
