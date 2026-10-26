# MCP host configuration

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

Official MCP v2 SDK subprocess communication is tested. Antigravity basic CLI checks now have user-operated evidence; see the current closeout below. Codex basic CLI checks and cross-host read now have user-operated evidence; full acceptance remains open. The example configurations below are templates. The examples below follow official documentation verified 2026-10-24; replace runtime, build and database paths for your machine. Build first with `npm ci && npm run build`. Use the same explicit DB path in CLI and host configuration.

## Codex

The [official OpenAI MCP documentation](https://developers.openai.com/codex/mcp) documents stdio `command` and `args` under `mcp_servers` in the Codex configuration. Example to add yourself:

```toml
[mcp_servers.mimir]
command = "/absolute/path/to/node"
args = ["/mnt/d/Projects/MimirNL/dist/cli/index.js", "--db", "/home/YOUR_USER/.local/share/mimir-nl/memory.sqlite", "mcp", "stdio"]
```

For native Windows use `command = 'C:\Program Files\nodejs\node.exe'`, a native build path such as `D:\Projects\MimirNL\dist\cli\index.js`, and a private native Windows DB path. TOML literal single-quoted strings preserve backslashes. Do not mix Linux paths and native Windows executables.

## Google Antigravity

The [official Antigravity MCP documentation](https://www.antigravity.google/docs/mcp) documents `mcpServers`, stdio command/args and management through its MCP settings. Add a custom server through the UI or the appropriate `mcp_config.json` for your installed surface. The CLI documentation currently lists `~/.gemini/config/mcp_config.json` and workspace `.agents/mcp_config.json`; IDE/App settings may differ.

```json
{
  "mcpServers": {
    "mimir": {
      "command": "/absolute/path/to/node",
      "args": [
        "/mnt/d/Projects/MimirNL/dist/cli/index.js",
        "--db",
        "/home/YOUR_USER/.local/share/mimir-nl/memory.sqlite",
        "mcp",
        "stdio"
      ]
    }
  }
}
```

On Windows use native paths and double each backslash in JSON. Start with a disposable Git fixture. Register it only after explicitly approving ingestion; pass its returned project UUID for every operation. Require host confirmation for approval/sharing/deletion. All stdout is reserved for JSON-RPC; runtime warnings and startup failures go to stderr. There is no HTTP endpoint or API key.

## v0.2 follow-up — 2026-10-25

[Codex basic CLI closeout](v02-codex-acceptance.md) records user-operated store/search/get/note and scoped NOT_FOUND, plus actual Antigravity → Codex read. Independent read-only totals are 2 projects, 3 candidates, 2 notes, 0 globals. Second-session operations are user-summary evidence, not full structured traces. Both temporary registrations were removed per supervisor; ordinary user configuration loaded, so full isolation is not claimed. Sensitive approval/delete/global-share, full traces, Codex-created-record restart-read and workspace-only/native Windows/IDE/Desktop validation remain open. Package is 0.1.0 unpublished; green remote CI applies only to baseline 6590684, not uncommitted v0.2 work. Historical failures above retain their original scope.

Task31 final-gate preparation: [reviewable artifacts and remaining gates](v02-final-gates.md), [staged human workflow](v02-final-human-workflow.md) and [platform installation guides](v02-final-installation.md). These are prepared for independent review; no new host acceptance is claimed. Native supported-runtime/core checks do not close the missing native Codex/Antigravity host gate.
