# Installation and host verification for v0.2

## Current evidence — 2026-10-26 (tasks38/39)

**v0.2 remains open. All actual model-host tests were Linux/WSL.** Package is a **0.2.0 candidate, unreleased**; remote green CI covers only baseline `6590684`, not the uncommitted v0.2 work.

- [Task35](../tasks/35-relay-lifecycle-result.md) adds exclusive per-process `--unique` audits and a finite validated 1..720-minute lifetime (default 240). Independent Flash [Task36 review](../tasks/36-relay-lifecycle-review-findings.md) is **APPROVE**. Recorded checks: Linux 36 pass / 1 Windows-only skip; native Windows focused relay/SDK 4 pass; Python 7 pass. These checks were not rerun for this consolidation.
- Codex restart-read is established by a new-session response, matching metadata and unchanged snapshot. Its dedicated sensitive creation, initial UI cancellation, approval, sanitized promotion, global search and exact L/G cleanup completed at service/audit level. The user says they followed instructions; individual one-time **allow** dialogs were not independently confirmed by exact user enumeration. This limitation remains; no repeat questioning or automatic rerun is required.
- [Task37](../tasks/37-antigravity-sensitive-result.md) establishes supervisor-operated actual WSL Antigravity **1.4.7 / gemini-3.8-flash-high** sensitive acceptance. Concrete user chat choices were relayed separately to actual one-time CLI dialogs (option 1 allow / option 4 deny), without persistent rules: create L, deny first approve (candidate v1 unchanged), approve (verified v2), sanitized promote (local v3 / global v1), global search/inspection with source withheld, then delete exact G and L. L `3084fafa-dcf7-4157-8114-d85bfe1efe33` and G `f4a30c84-cbf3-479e-859a-8c6af368f961` are removed. [Sanitized evidence](../tasks/37-antigravity-sensitive-evidence.json) records 12 metadata events and exact baseline equality. Receipt absence alone does not prove denial; actual choice/dialog transmission and unchanged state are correlated.
- Final recorded state is **2 projects / 3 original candidate memories / 2 feedback notes / 0 globals**, with every protected original hash intact. Temporary registrations were removed and the owned Antigravity process stopped. Metadata is not a full host trace; historical trace gaps and strict configuration isolation remain unclaimed.

Remaining steps are native Windows model-host operator installation/executable availability and acceptance with a **separate native fixture**, final evidence assessment and approved-diff commit, then successful Ubuntu/Windows remote CI for that **exact new commit**. Native Windows core/SDK checks do not establish model-host acceptance. Workspace-only/IDE/Desktop discovery remains untested, without adding an extra milestone gate. No automatic release/publication or host resumption follows this document.

## Historical record / procedure (preserved)

The material below retains its original task/date scope. Earlier pending claims are superseded by the current evidence above; procedural launches are reference steps, not instructions to repeat completed WSL tests.

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

## Tested status and troubleshooting

| Surface                          | Evidence                                                                         | Remaining acceptance                                                          |
| -------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Linux/WSL Mimir CLI/MCP          | Supported disposable Node, SDK subprocess tests, current local checks            | Reviewed relay deployment + human sensitive sessions                          |
| Linux/WSL Codex CLI              | User basic calls and Antigravity-created-record read; current version/help probe | Codex-created-record restart-read, new structured metadata and human workflow |
| Linux/WSL Antigravity CLI        | User basic calls, separate-session persistence; current 1.4.7 help               | New metadata and sensitive human workflow; workspace auto-discovery           |
| Native Windows runtime/core      | Earlier clean checkout install/tests; task31 supported-runtime doctor on new DB  | Native actual host acceptance still untested                                  |
| Native Windows Codex/Antigravity | No executable found by `where` in current native PATH                            | Operator installs/exposes native hosts and runs fixture acceptance            |
| IDE/Desktop                      | No current acceptance evidence                                                   | Explicitly outside CLI demonstration; not claimed as tested                   |

Roadmap v0.2 explicitly requires tested Linux/WSL **and native Windows guides**. The native host dependency leaves that gate open. IDE/Desktop/workspace auto-discovery remain visible boundaries; no extra milestone gate is invented for them.

`node:sqlite`/runtime errors: check exact host executable, not only the parent terminal version. `NOT_FOUND`: verify explicit project UUID and local/global scope; never retry against another real project. MCP connection failures: build first, verify absolute arguments and DB location, run `doctor`, keep stdout exclusively JSON-RPC. Headless permission refusal: return to the genuine interactive human workflow, without persistent allow-rules. Native Windows missing executable: fix the native installation/PATH, not WSL/native DB sharing. Historical intermittent Linux CI failure has not been declared fixed by these guide probes.

## Synthetic relay lifecycle correction (task35)

For the reviewed synthetic relay only, use arguments `["/absolute/checkout/scripts/v02-audit-relay.mjs", "/tmp/mimir-v02-FIXTURE", "--unique", "240"]`. Each process creates an exclusive `audit-session-PID-UUID.jsonl` under the fixture private directory, with POSIX mode 0600. Concurrent discovery clients and restarts get independent files. Collect all session files; no path is emitted on stdout. Explicit `audit-NAME.jsonl` compatibility still refuses collisions and never appends/reuses files. Fixture, native runtime and private-directory validation stay mandatory.

The optional final argument is a hard lifetime in whole minutes, 1..720; default 240. Idle time counts. A sanitized stderr deadline message means restart with unique mode, not host rejection. EOF allows 30 seconds to flush; termination escalates TERM to KILL after one second. Startup stderr gives collision/configuration guidance without paths or raw exceptions. Do not use zero/unbounded settings or reuse a WSL DB from Windows. These opt-in fixture arguments are not general production configuration.
