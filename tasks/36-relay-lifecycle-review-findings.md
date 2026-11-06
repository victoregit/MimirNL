# Code Review Findings: Task 35 Relay Lifecycle Correction (Task 36)

**Reviewer Model**: Gemini 3.8 Flash High (`gemini-3.8-flash-high`)  
**Date**: 2026-10-26  
**Review Scope**: Task 35 implementation, regressions, test logs, and affected documentation  
**Verdict**: **APPROVE**

---

## 1. Executive Summary

An independent review was conducted on the Task 35 lifecycle correction implementation and associated artifacts in `/mnt/d/Projects/MimirNL`. The reviewed artifacts include:

- [scripts/v02-audit-relay.mjs](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs): Concurrency-safe per-process unique audit file generation, configurable finite lifetime watchdog, and sanitized lifecycle diagnostics.
- [test/v02-audit-relay.test.mjs](file:///mnt/d/Projects/MimirNL/test/v02-audit-relay.test.mjs): Concurrency/restart regressions with official MCP SDK clients, deterministic timeout/escalation tests, unique name collision resistance, and platform isolation tests.
- Documentation updates:
  - [docs/v02-final-human-workflow.md](file:///mnt/d/Projects/MimirNL/docs/v02-final-human-workflow.md)
  - [docs/v02-final-installation.md](file:///mnt/d/Projects/MimirNL/docs/v02-final-installation.md)
  - [docs/v02-final-gates.md](file:///mnt/d/Projects/MimirNL/docs/v02-final-gates.md)
- Evidence and verification outputs:
  - [docs/v02-task35-linux-tests.txt](file:///mnt/d/Projects/MimirNL/docs/v02-task35-linux-tests.txt)
  - [docs/v02-task35-windows-relay.txt](file:///mnt/d/Projects/MimirNL/docs/v02-task35-windows-relay.txt)
  - [docs/v02-task35-checks.txt](file:///mnt/d/Projects/MimirNL/docs/v02-task35-checks.txt)
  - [docs/v02-task35-before.json](file:///mnt/d/Projects/MimirNL/docs/v02-task35-before.json)
  - [docs/v02-task35-after.json](file:///mnt/d/Projects/MimirNL/docs/v02-task35-after.json)

The implementation addresses the two operational failures observed during previous testing (secondary Codex discovery client colliding on identical explicit audit filename, and premature 15-minute timeout aborting idle interactive human sessions) without compromising security, metadata privacy, protocol transparency, or repository integrity. All tests, linting, formatting, and type checks passed cleanly offline. The protected SQLite fixture database remains in its baseline state with zero mutations.

---

## 2. In-Depth Technical Assessment

### 2.1 Concurrency-Safe Exclusive Audit Creation & Backward Compatibility
- **File & Lines**: [`auditName`](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L146-L152) and [`openSync`](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L222)
  - When `--unique` is provided, `auditName` generates filenames of the format `audit-session-${process.pid}-${randomUUID()}.jsonl`.
  - Using [`randomUUID()`](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L2) from `node:crypto` provides cryptographic collision resistance across concurrent processes and process restarts.
  - The generated filename strictly satisfies the containment regular expression `^audit-[a-zA-Z0-9_-]+\.jsonl$` ([scripts/v02-audit-relay.mjs#L193](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L193)), preventing path traversal.
  - Backward compatibility is preserved: explicit audit names matching `^audit-[a-zA-Z0-9_-]+\.jsonl$` continue to work.
  - Exclusive creation flag `"wx"` with mode `0o600` ensures fail-closed semantics on collisions: existing files are never overwritten, appended to, or reused.
  - Independent testing ([test/v02-audit-relay.test.mjs#L29-L35](file:///mnt/d/Projects/MimirNL/test/v02-audit-relay.test.mjs#L29-L35)) confirms 1,000 generated unique names have 0 collisions and match the expected naming pattern.

### 2.2 Finite Validated Watchdog Lifetime
- **File & Lines**: [`sessionLimit`](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L138-L144) and [`watchdog`](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L155-L159)
  - `sessionLimit` parses the optional `minutes` CLI argument (default: `"240"` = 4 hours).
  - Validation requires integer strings matching `/^[0-9]+$/` within the range `1 <= minutes <= 720` (up to 12 hours). Invalid values (e.g., negative, zero, fractional, NaN, Infinity, scientific notation) throw an explicit error.
  - The watchdog timer calls [`timer.unref()`](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L157) so the timeout does not keep the process alive if streams close early.
  - Dependency injection for `schedule = setTimeout` enables deterministic sub-millisecond testing ([test/v02-audit-relay.test.mjs#L45-L63](file:///mnt/d/Projects/MimirNL/test/v02-audit-relay.test.mjs#L45-L63)) without real-time wall-clock waits or hidden production backdoor flags.

### 2.3 Subprocess Lifecycle & Escalated Termination
- **File & Lines**: [`termination`](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L162-L178), [`signal`](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L250-L258), and [`finish`](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L286-L297)
  - The `termination` helper provides an idempotent termination sequence: it issues `SIGTERM`, followed by a fallback `SIGKILL` after 1,000 ms.
  - On POSIX systems, `child` is spawned detached (`detached: process.platform !== "win32"` at [L247](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L247)), allowing `signal` to dispatch to the negative process group ID (`-child.pid` at [L253](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L253)), reaping all descendant processes.
  - On stream EOF (`stdin.on("end")` at [L277](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L277)), a 30-second flush grace timer is armed before invoking termination.
  - In `finish`, `SIGKILL` is issued as an ultimate cleanup guarantee, all pending timers (`deadline`, `cleanup`, `eofTimer`) are cleared, stdin is unpiped, and the audit file descriptor is cleanly closed via [`closeSync(fd)`](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L295).

### 2.4 Sanitized Lifecycle & Error Diagnostics
- **File & Lines**: [`startupDiagnostic`](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L180-L184) and [`stop`](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L260-L265)
  - `startupDiagnostic` emits safe, actionable messages without exposing absolute filesystem paths, internal stacks, environment variables, or private content.
  - Specifically, on `EEXIST` collision, it advises: `"Synthetic audit relay refused startup: audit exists; use --unique or a new audit basename.\n"`.
  - Stderr lifecycle output emits controlled phrases (e.g., `"Synthetic audit relay stopping: session deadline reached; restart with --unique.\n"` or `"transport closed"`), ensuring no secrets or command strings leak into logs.
  - Protocol stdout is strictly reserved for JSON-RPC messages and remains 100% clean.

### 2.5 Protocol-Byte Fidelity & Observer Containment
- **File & Lines**: [`Observer`](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L36-L135) and stream piping ([L271-L275](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L271-L275))
  - `process.stdin.pipe(child.stdin)` and `child.stdout.pipe(process.stdout)` guarantee raw stream passthrough and native Node.js stream backpressure.
  - The observer listens on separate `data` events and never alters or reserializes protocol bytes.
  - Strict DOS protections are enforced: lines exceeding 64 KiB discard buffered bytes until the next newline ([L55-L62](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L55-L62)), pending requests are capped at 128 ([L85](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L85)), and recorded audit events are capped at 511 + 1 `capture_limit` marker ([L227-L243](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L227-L243)).
  - Child stderr is suppressed (`stdio: ["pipe", "pipe", "ignore"]` at [L246](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs#L246)), preventing un-sanitized child diagnostics from mixing into host streams.

---

## 3. Verification & Regression Testing Evidence

The following checks were executed independently in the workspace using the supported Node 24.22.1 runtime and Python 3:

| Check / Test Command | Result | Notes |
| :--- | :--- | :--- |
| `PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH node --test test/v02-audit-relay.test.mjs` | **PASSED** (4/4) | Verified: (1) unique names & watchdog, (2) deterministic TERM -> KILL escalation, (3) observer bounding & privacy, (4) official MCP SDK 3 concurrent clients + 1 restart client, collision refusal, empty stdout, and EOF shutdown. |
| `python3 -W error::ResourceWarning test/v02-host-fixture.test.py` | **PASSED** (5/5) | Verified fixture preparation, permissions, and database invariants. |
| `python3 -W error::ResourceWarning test/v02-final-snapshot.test.py` | **PASSED** (2/2) | Verified read-only enforcement, missing DB detection, and change detection. |
| `python3 scripts/v02-final-snapshot.py` | **PASSED** | Retained DB `/tmp/mimir-v02-xx0ph1vg`: exactly 2 projects, 3 memories, 2 feedback, 0 globals; original hashes `f0f7a064`, `87869bcb`, `51f48c5b` identical to baseline. |
| `npm run typecheck` (`tsc --noEmit`) | **PASSED** | TypeScript compilation clean with 0 errors. |
| `npm run lint` (`eslint src`) | **PASSED** | Linting clean with 0 errors. |
| `npx prettier --check ...` | **PASSED** | Code formatting confirmed for all changed scripts and documentation. |
| `git diff --check` | **PASSED** | Zero whitespace errors or conflict markers. |

---

## 4. Documentation & Boundary Review

- [docs/v02-final-human-workflow.md](file:///mnt/d/Projects/MimirNL/docs/v02-final-human-workflow.md):
  - Updated to instruct the operator to pass `--unique` and `"240"` as arguments to `v02-audit-relay.mjs`.
  - Explains the per-process audit filename format (`audit-session-PID-UUID.jsonl`) and the collection of all session files.
  - Explicitly documents the Task 35 correction context: previous collision on secondary `/mcp` start and 15-minute idle timeout.
  - Maintains the requirement for one-time human permission dialogs and unchanged baseline preservation.
- [docs/v02-final-installation.md](file:///mnt/d/Projects/MimirNL/docs/v02-final-installation.md):
  - Section 5 ("Synthetic relay lifecycle correction (task35)") details the `--unique` mode, 240-minute default, 1..720 minute validation range, POSIX mode 0600, and sanitized stderr messages.
  - Re-emphasizes platform boundaries: native Windows host acceptance remains open pending operator installation of native Codex and Antigravity executables.
- [docs/v02-final-gates.md](file:///mnt/d/Projects/MimirNL/docs/v02-final-gates.md):
  - Accurately details the Task 35 correction and summarizes the open vs closed gates.
  - Notes that automated SDK tests provide service/transport verification, not human UI or native host acceptance.
  - Preserves version `0.1.0` (unpublished), and confirms remote CI status is based on baseline `6590684`.

---

## 5. Security Constraints & Code Standards Compliance

1. **Credentials & Secrets**: No access or reference to `~/.aws/credentials`, `~/.ssh/*`, `.env`, or `*.pem`.
2. **Network Exfiltration**: No network tools (`curl`, `wget`, `nc`) used; relay operates strictly on local stdio.
3. **Destructive Operations**: No destructive commands executed.
4. **Data Isolation**: The retained test fixture database remains read-only and unaltered.
5. **Hyperlink Standards**: All file and symbol references use valid markdown links with the `file://` scheme.

---

## 6. Verdict and Limitations

### Verdict
**APPROVE**

The Task 35 lifecycle correction in [scripts/v02-audit-relay.mjs](file:///mnt/d/Projects/MimirNL/scripts/v02-audit-relay.mjs), [test/v02-audit-relay.test.mjs](file:///mnt/d/Projects/MimirNL/test/v02-audit-relay.test.mjs), and associated documentation is robust, concurrency-safe, backward-compatible, thoroughly tested, and ready for deployment in the staged human workflow.

### Limitations & Remaining Gates
- **Human UI Approval**: While service-level mutations and subsequent cleanups have been tested, individually observed one-time human allow dialogs in actual host sessions remain to be confirmed by the human operator.
- **Platform Gates**: Native Windows host acceptance remains open until native Codex and Antigravity binaries are exposed and exercised with a separate native fixture.
- **Release Status**: Package version remains `0.1.0` (unpublished); no commits, pushes, or releases are authorized by this review.
