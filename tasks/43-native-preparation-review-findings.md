# Task43 — Independent Review Findings: Windows Native Preparation (Task42)

**Reviewer Model:** Gemini 3.8 Flash (High)  
**Date:** 2026-10-26  
**Target Code Under Review:** `/mnt/d/Projects/MimirNL/.release/task42/prepare-native.mjs`  
**Target Code SHA-256:** `ad7d2ce34b3f1ba5730ee04021f984e814eec1786e0d5e02e574d37fe4472053`  
**Source Candidate Commit:** `27c586c2e12159223dd0cb90d27fcc6691775f28`  
**Findings Document:** `/mnt/d/Projects/MimirNL/tasks/43-native-preparation-review-findings.md`

---

## 1. Executive Summary & Verdict

**Static Review Verdict:** **`APPROVE`**

The proposed native fixture preparation script [`prepare-native.mjs`](file:///mnt/d/Projects/MimirNL/.release/task42/prepare-native.mjs) adheres strictly to the safety, containment, and isolation standards established in Task 42 instructions. It contains robust platform guards, enforces dedicated path isolation under `os.tmpdir()`, operates exclusively on synthetic Git repositories and an isolated SQLite database, touches no WSL or retained live data, makes zero network or model calls, and modifies no global settings, PATH variables, or shell profiles.

The developer is authorized to proceed with the offline deployment of this synthetic fixture.

---

## 2. Review Categories & Code Evaluation

### A. Code Safety & Platform Containment
- **Platform & Runtime Guard ([Line 7](file:///mnt/d/Projects/MimirNL/.release/task42/prepare-native.mjs#L7)):**
  ```js
  if(process.platform!=='win32'||process.version!=='v24.22.1') throw Error('Require native Node24.22.1');
  ```
  Execution is hard-restricted to native Windows (`win32`) and supported Node `v24.22.1`. Accidental execution in WSL/Linux or under unsupported Node versions throws immediately.
- **Fixture Path & Collision Defense ([Lines 8–9](file:///mnt/d/Projects/MimirNL/.release/task42/prepare-native.mjs#L8-L9)):**
  ```js
  const root=resolve(process.argv[2]);
  if((dirname(root)!==realpathSync(tmpdir())||!/^mimir-v02-task42-[a-zA-Z0-9_-]+$/.test(basename(root)))||existsSync(root)) throw Error('Require new dedicated synthetic fixture');
  ```
  Requires that the target fixture directory is a direct child of `os.tmpdir()`, strictly conforms to the naming pattern `mimir-v02-task42-*`, and does not already exist. Overwriting existing fixtures or touching user workspace paths is prevented.
- **No Destructive Operations:** The script only performs `mkdirSync` and `writeFileSync` inside `root`. There are no file deletions, recursive cleans, or unlinking of external files.

### B. Database & Worktree Isolation
- **Database Isolation ([Lines 21–23](file:///mnt/d/Projects/MimirNL/.release/task42/prepare-native.mjs#L21-L23)):**
  Database initialized at `join(root, 'private', 'host.sqlite')`. Never opens, links, or references WSL SQLite databases or retained production databases.
- **Synthetic Git Worktrees ([Lines 13–20](file:///mnt/d/Projects/MimirNL/.release/task42/prepare-native.mjs#L13-L20)):**
  Initializes two dedicated synthetic repositories (`project` and `other`) with synthetic `architecture.md`. Sets repository-local Git identities:
  ```js
  run('git',['-C',p,'config','user.name','Mimir Synthetic Fixture']);
  run('git',['-C',p,'config','user.email','mimir-fixture@example.invalid']);
  ```
  No global Git configuration (`--global` or `--system`) is touched.

### C. Tool Permissions & Inert Host Templates
- **Bounded Tool Scope & Action Boundaries ([Line 24](file:///mnt/d/Projects/MimirNL/.release/task42/prepare-native.mjs#L24)):**
  Exposes seven synthetic operations:
  `['project_register','project_ingest','memory_store','memory_search','memory_get','memory_feedback','memory_stats']`.
  Dedicated mutation/destruction tools (`memory_delete`, `memory_share`, `project_delete`) are excluded from the MCP tool allowlist.
  *Boundary Clarification:* At the API schema level, `memory_feedback` accepts `action: "approve" | "promote" | "note"`. Host-level MCP configuration filters at tool granularity, not argument values; therefore, approval and promotion mutations are forbidden by prompt enforcement (`session-1.txt` specifies `action=note` and forbids approval/sharing flags), rather than action-level configuration enforcement in the MCP schema.
- **Inert MCP Config Templates ([Lines 27–31](file:///mnt/d/Projects/MimirNL/.release/task42/prepare-native.mjs#L27-L31)):**
  Generates `agy-mcp-template.json` and `codex-mcp-value.txt` inside `private/`. Both templates configure standard stdio invocation through the reviewed relay [`v02-audit-relay.mjs`](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs) with `--unique` audit mode, 240-minute lifetime, and explicit approval mode (`default_tools_approval_mode="prompt"`). No global MCP registration or host configuration file is mutated.
- **Bounded Prompts ([Lines 32–34](file:///mnt/d/Projects/MimirNL/.release/task42/prepare-native.mjs#L32-L34)):**
  `session-1.txt` and `session-2.txt` contain strict synthetic verification instructions:
  - Disallows shell, files, network, approve, promote, share, and delete.
  - Limits ingestion bounds (`maxCommits=0, maxFiles=2, maxBytes=10000`).
  - Asserts cross-project data isolation (expecting `NOT_FOUND`).
  - Instructs the host/agent to stop and prompt the operator for any permission decision.
- **Security & ACL Notice ([Line 35](file:///mnt/d/Projects/MimirNL/.release/task42/prepare-native.mjs#L35)):**
  `README.txt` explicitly documents that Windows inherited ACLs are not certified private, templates are inert, and no sensitive data is authorized.

---

## 3. Official Portable Host Payload & Provenance Assessment

Review of evidence in [`.release/task42/download-provenance.json`](file:///mnt/d/Projects/MimirNL/.release/task42/download-provenance.json):
1. **Antigravity CLI (1.4.7):**
   - Source: `https://storage.googleapis.com/antigravity-public/antigravity-cli/1.4.7-5900205422411776/windows-x64/cli_windows_x64.exe`
   - Verified SHA-512: `e9e69f036ef0a9c3329cd0608474711dfdbbf62df10a98e237c9fb528daf36be21b4ee65b796b07e0f10ec266f008bb9e40a9c59ba32e4d13ca87bfeb36d3c2a`
   - Stored portably at `C:\Users\Public\mimir-task42-7fa39eaffa\hosts\agy.exe`.
   - Verified that the official installer script [`agy-install.ps1`](file:///mnt/d/Projects/MimirNL/.release/task42/agy-install.ps1) was NOT invoked with persistent setup/PATH modifications.
2. **OpenAI Codex CLI (0.164.0-win32-x64):**
   - Source: npm registry `@openai/codex/-/codex-0.164.0-win32-x64.tgz`
   - Verified integrity: `sha512-urWPhwh9YavuoAPIkmVYKBTtd5OtGVL4Ki0Fb28dhK/Mz6Pt4LSy+gbRrZFz5+RXrw9ubvXuXDCcd8beYcWhDg==`
   - Stored portably at `C:\Users\Public\mimir-task42-7fa39eaffa\hosts\codex\package\vendor\x86_64-pc-windows-msvc\bin\codex.exe`.
   - No global npm installation performed.
3. **Candidate Build (`C:\Users\Public\mimir-task42-7fa39eaffa\source`):**
   - Exported directly from candidate commit `27c586c2e12159223dd0cb90d27fcc6691775f28`.
   - Unpacked `src/` tree verified bit-for-bit against `git archive 27c586c` (`fe23299e7e762adfeb59d484567f75c7213fd87fde127413ca6491dfe6ed67ab`).
   - Cleanly built with TypeScript under native Node `v24.22.1`.

---

## 4. Assessment of Final Developer Result (Task 42)

The developer final report [`tasks/42-native-host-preparation-result.md`](file:///mnt/d/Projects/MimirNL/tasks/42-native-host-preparation-result.md) is now available and has been evaluated against task requirements:
1. **Preparation Script Frozen:**
   The developer strictly adhered to the review gate by keeping `.release/task42/prepare-native.mjs` frozen and unexecuted. No unauthorized execution or premature native fixture creation took place.
2. **Offline Relay Regression Tests:**
   Existing reviewed native relay tests passed 4/4 (`node --test test/v02-audit-relay.test.mjs`, exit 0) under the exact native build using a new disposable SDK/relay DB, confirming basic runtime/relay compatibility without running unreviewed scripts.
3. **Authorized Native Codex Account Status:**
   Per supervisor authorization, the developer ran `codex login status` against the portable Windows executable. It verified an existing legitimate native login (`logged-in`, exit 0). Only sanitized status was recorded (`.release/task42/codex-login-status-sanitized.json`); no credentials were read or exposed.
4. **Antigravity Authentication Status:**
   Remains unknown / unqueried. No login was launched, preserving the boundary that genuine operator authentication must not be automated or bypassed.

---

## 5. Actual Native Paths, Operational Commands & Operator Dependencies

### Exact Native Binary Paths
- **Node 24.22.1 Runtime:** `C:\Users\Public\mimir-hardening-runtime\node\node-v24.22.1-win-x64\node.exe`
- **Candidate CLI Build:** `C:\Users\Public\mimir-task42-7fa39eaffa\source\dist\cli\index.js`
- **Candidate Audit Relay:** `C:\Users\Public\mimir-task42-7fa39eaffa\source\scripts\v02-audit-relay.mjs`
- **Portable Antigravity CLI:** `C:\Users\Public\mimir-task42-7fa39eaffa\hosts\agy.exe`
- **Portable Codex CLI:** `C:\Users\Public\mimir-task42-7fa39eaffa\hosts\codex\package\vendor\x86_64-pc-windows-msvc\bin\codex.exe`

### Developer Deployment Command (Offline Fixture Preparation)
Executed from the candidate source root `C:\Users\Public\mimir-task42-7fa39eaffa\source` using the **absolute path** to the preparer script (`D:\Projects\MimirNL\.release\task42\prepare-native.mjs`), because `.release` is git-ignored and not included in the exported source tree:

In native PowerShell:
```powershell
$env:PATH = 'C:\Users\Public\mimir-hardening-runtime\node\node-v24.22.1-win-x64;C:\Users\Public\mimir-hardening-runtime\git\cmd;' + $env:PATH
Set-Location 'C:\Users\Public\mimir-task42-7fa39eaffa\source'
$fixture = Join-Path $env:TEMP ('mimir-v02-task42-' + [guid]::NewGuid().ToString('N'))
& 'C:\Users\Public\mimir-hardening-runtime\node\node-v24.22.1-win-x64\node.exe' 'D:\Projects\MimirNL\.release\task42\prepare-native.mjs' $fixture
```

Or in CMD:
```cmd
cd /d C:\Users\Public\mimir-task42-7fa39eaffa\source
C:\Users\Public\mimir-hardening-runtime\node\node-v24.22.1-win-x64\node.exe D:\Projects\MimirNL\.release\task42\prepare-native.mjs "%TEMP%\mimir-v02-task42-%RANDOM%"
```

### Remaining Account & Operator Authentication Dependencies
1. **Codex Authentication:**
   **VERIFIED LOGGED-IN** (`codex login status` exited 0). No new login is required prior to native model-host session testing.
2. **Antigravity Authentication:**
   Remains unqueried / unknown. The operator must authenticate `agy` with an active Google account on Windows if not already stored in Windows Credential Manager.
3. **One-Time Interactive Permission Prompts:**
   The operator must interactively review and approve MCP tool calls during testing; auto-approval bypass flags (`--dangerously-skip-permissions` or `--dangerously-bypass-approvals-and-sandbox`) are forbidden for release acceptance.
