# Task35 result — 2026-10-26

Implemented bounded relay correction; independent supervisor-routed review remains pending. No host/model sessions, user dialog automation, global configuration edits, app source/features/version edits, commits, pushes or publication. Existing tracked and untracked work, including AGENTS.md, preserved. A concurrently appearing tasks/36-relay-lifecycle-review.md was left untouched.

## Changes

- `/mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs`: opt-in `--unique` allocates `audit-session-PID-UUID.jsonl` per process using cryptographic UUIDs and the existing exclusive `wx`/0600 creation. Explicit filenames remain compatible and refuse collisions; neither mode appends, overwrites or reuses evidence. Collision is fail-closed even in unique mode (no fallback overwrite).
- Optional final CLI argument is integer lifetime minutes, 1..720, default 240 (four hours including idle). No environment/global settings or unbounded bypass. Deterministic injectable timer/termination helpers verify deadline and TERM-to-KILL escalation without real waits. Existing EOF flush grace (30 seconds), process-group cleanup, byte piping/backpressure, manifest/runtime validation, private POSIX directories and observer bounds remain.
- Sanitized stderr reports audit collision/configuration guidance, deadline/EOF/transport termination and child startup failure without paths, protocol content, raw exception strings or stacks. stdout remains protocol-only.
- `/mnt/d/Projects/MimirNL/test/v02-audit-relay.test.mjs`: unique names/config limits/watchdog helpers, three overlapping official SDK connects/listTools plus a restart, four distinct exclusive audit files, POSIX permissions, disposable DB byte preservation, explicit collision preserving bytes with empty stdout, existing fragmented byte fidelity/privacy tests and real EOF shutdown. Native integration creates a new native temporary fixture/DB with an exact native manifest; never shares the retained WSL DB.
- Directly affected docs: `/mnt/d/Projects/MimirNL/docs/v02-final-human-workflow.md`, `/mnt/d/Projects/MimirNL/docs/v02-final-installation.md`, `/mnt/d/Projects/MimirNL/docs/v02-final-gates.md`. Record incident and correction, current completed/pending evidence, process-only future Codex configuration and no automatic session resumption.

## Actual final verification

All commands ran from `/mnt/d/Projects/MimirNL`.

- Supported Linux runtime `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node` (24.22.1), `PATH=... npm test`: **37 total, 36 pass, 1 Windows-only skip, 0 fail**. Build included. Log `/mnt/d/Projects/MimirNL/docs/v02-task35-linux-tests.txt`.
- Supported native Windows runtime `/mnt/c/Users/Public/mimir-hardening-runtime/node/node-v24.22.1-win-x64/node.exe` (24.22.1), `--test test/v02-audit-relay.test.mjs`: **4 total, 4 pass, 0 skip/fail**. Log `/mnt/d/Projects/MimirNL/docs/v02-task35-windows-relay.txt`.
- `npm run typecheck`, `npm run lint`, focused Prettier checks for both changed JS files and all three affected docs, `git diff --check`: passed. Python fixture tests **5 pass**, snapshot tests **2 pass**. Log `/mnt/d/Projects/MimirNL/docs/v02-task35-checks.txt`. Initial Python unittest discovery matched zero importable files due to dotted filenames; corrected by executing both test files directly, yielding the seven actual tests above.
- Read-only protected snapshot `/mnt/d/Projects/MimirNL/docs/v02-task35-before.json` and `/mnt/d/Projects/MimirNL/docs/v02-task35-after.json` compare exactly equal to each other and `/mnt/d/Projects/MimirNL/docs/v02-final-before.json`: **2 projects / 3 memories / 2 feedback / 0 globals**, every original record/history/feedback hash equal. No retained DB mutation. Disposable fixture DB also compared byte-for-byte unchanged around concurrent SDK discovery/restart.

## Limits and remaining gates

This is automated SDK/service/transport evidence, not actual host or human UI acceptance. The watchdog regression uses deterministic injected timers; no four-hour or twelve-hour wall-clock wait was performed. Native Windows focused tests verify relay/SDK behavior only; POSIX mode assertions do not certify Windows ACLs, and native Windows descendant process-group behavior is not claimed (existing native direct-child cleanup retained). No new broad benchmark/package/schema checks were needed for this isolated script/docs change; full Linux suite and directly relevant checks above ran once on the final code.

Codex synthetic mutation and cleanup completed previously; actual one-time allow dialogs remain user-unconfirmed. Antigravity sensitive flow and native Windows host acceptance remain pending. No invented host acceptance or approval; supervisor must request independent Flash review and control any future human test authorization.
