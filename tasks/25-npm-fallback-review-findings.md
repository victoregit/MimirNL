# Independent Code Review: NPM CLI Fallback & Cross-Platform Resolution (Task 25)

**Date**: 2026-10-25  
**Reviewer Model**: Gemini 3.8 Flash (High) — explicitly user-selected  
**Review Target**: Local changes in [scripts/npm-cli.mjs](file:///mnt/d/Projects/MimirNL/scripts/npm-cli.mjs), [scripts/package-smoke.mjs](file:///mnt/d/Projects/MimirNL/scripts/package-smoke.mjs), [test/npm-cli.test.mjs](file:///mnt/d/Projects/MimirNL/test/npm-cli.test.mjs), and accompanying documentation in [docs/ci-npm-cli-investigation.md](file:///mnt/d/Projects/MimirNL/docs/ci-npm-cli-investigation.md), [docs/ci-npm-fallback-linux.txt](file:///mnt/d/Projects/MimirNL/docs/ci-npm-fallback-linux.txt), [docs/ci-npm-fallback-windows.txt](file:///mnt/d/Projects/MimirNL/docs/ci-npm-fallback-windows.txt), and [docs/ci-npm-fallback-windows-run.cmd](file:///mnt/d/Projects/MimirNL/docs/ci-npm-fallback-windows-run.cmd)  
**Verdict**: **APPROVE**

---

## 1. Executive Summary & Verdict

This final re-review evaluates the task 24 corrections addressing the issues identified in [tasks/23-npm-cli-review-findings.md](file:///mnt/d/Projects/MimirNL/tasks/23-npm-cli-review-findings.md) (REQUEST_CHANGES).

### 1.1. Summary of Changes & Findings
1. **Cross-Platform Fallback Resolution**:
   In [scripts/npm-cli.mjs](file:///mnt/d/Projects/MimirNL/scripts/npm-cli.mjs#L11-L21), the helper [`runNpm`](file:///mnt/d/Projects/MimirNL/scripts/npm-cli.mjs#L7-L30) now inspects both official Node distribution layouts when `npm_execpath` is absent:
   - Windows layout: `join(nodeDir, "node_modules", "npm", "bin", "npm-cli.js")`
   - POSIX layout: `join(nodeDir, "..", "lib", "node_modules", "npm", "bin", "npm-cli.js")`
   Candidate paths are checked via `existsSync`. If neither exists, a descriptive `Error` is raised. Absolute path validation is maintained for lifecycle `npm_execpath`.

2. **Unmasked Fallback & Regression Coverage**:
   In [test/npm-cli.test.mjs](file:///mnt/d/Projects/MimirNL/test/npm-cli.test.mjs#L55-L83):
   - Every casing variant of `npm_execpath` is stripped from `directEnv` to ensure that inherited npm lifecycle environment variables cannot mask fallback resolution during `npm test`.
   - A dedicated test case verifies fallback invocation succeeds and returns a valid semver version.
   - An explicit custom `npm_execpath` test verifies that lifecycle CLI priority is respected even in paths containing spaces.
   - Relative `npm_execpath` validation (`assert.throws(..., /absolute/)`) is preserved.

3. **Packaged Smoke Integrity**:
   [scripts/package-smoke.mjs](file:///mnt/d/Projects/MimirNL/scripts/package-smoke.mjs#L44-L178) preserves all downstream assertions. The installed `mimir` / `mimir.cmd` binary is executed through the shell shim for `init`, `doctor`, `project add`, `ingest`, `store`, `update`, `backup`, `restore`, `search`, and `delete`. Direct invocation of the smoke script with `npm_execpath` unset passes completely on both platforms.

4. **Evidence & Provenance**:
   The previous Windows evidence gap is closed: raw execution logs and the driver script are committed in [docs/ci-npm-fallback-windows.txt](file:///mnt/d/Projects/MimirNL/docs/ci-npm-fallback-windows.txt) and [docs/ci-npm-fallback-windows-run.cmd](file:///mnt/d/Projects/MimirNL/docs/ci-npm-fallback-windows-run.cmd). Independent Linux checks confirm that direct executions and the full test suite pass cleanly on Node v24.22.1.

The previous defects are completely resolved without regressions or security weakening. The verdict is **APPROVE**.

---

## 2. Issue Disposition from Task 23 Review

| Task 23 Finding | Status | Verification & Resolution Details |
|---|---|---|
| Non-portable fallback in `scripts/npm-cli.mjs` (`MODULE_NOT_FOUND` on POSIX) | **RESOLVED** | Probes both Windows (`node_modules/npm/bin/npm-cli.js`) and POSIX (`../lib/node_modules/npm/bin/npm-cli.js`) using `existsSync`. Direct execution of `node scripts/package-smoke.mjs` passes with code 0 on Linux and Windows. |
| Fallback logic masked in `test/npm-cli.test.mjs` by inherited `npm_execpath` | **RESOLVED** | `directEnv` filters out case-insensitive `npm_execpath` keys before testing fallback. Direct test runner `node --test test/npm-cli.test.mjs` passes independently with code 0. |
| Inaccurate documentation regarding bundled fallback layout | **RESOLVED** | [docs/ci-npm-cli-investigation.md](file:///mnt/d/Projects/MimirNL/docs/ci-npm-cli-investigation.md#L9-L10) updated to accurately reflect both Windows and POSIX layouts. |
| Windows log provenance gap (author-reported only) | **RESOLVED** | Raw Windows execution log [docs/ci-npm-fallback-windows.txt](file:///mnt/d/Projects/MimirNL/docs/ci-npm-fallback-windows.txt) and reproducible driver script [docs/ci-npm-fallback-windows-run.cmd](file:///mnt/d/Projects/MimirNL/docs/ci-npm-fallback-windows-run.cmd) added. |

---

## 3. Review by Standard Categories

### 3.1. Functionality
- **Cross-Platform Resolution**:
  [`runNpm`](file:///mnt/d/Projects/MimirNL/scripts/npm-cli.mjs#L7-L30) correctly resolves the npm CLI under all operational conditions:
  1. Under `npm run`: Uses `env.npm_execpath` provided by the outer npm process.
  2. Outside `npm run` on POSIX (Linux/macOS): Resolves `<prefix>/lib/node_modules/npm/bin/npm-cli.js` via `nodeDir/../lib/node_modules/npm/bin/npm-cli.js`.
  3. Outside `npm run` on Windows: Resolves `<prefix>\node_modules\npm\bin\npm-cli.js` via `nodeDir/node_modules/npm/bin/npm-cli.js`.
  4. Unsupported/missing layout: Throws `Error("Could not locate bundled npm CLI in the Node installation.")`.
- Both lifecycle execution (`npm run package:smoke`) and direct execution (`node scripts/package-smoke.mjs`) succeed cleanly.

### 3.2. Readability
- The code in [scripts/npm-cli.mjs](file:///mnt/d/Projects/MimirNL/scripts/npm-cli.mjs) is clean and concise.
- Inline comments explain the structural differences between official Windows and POSIX Node archive layouts.
- In [test/npm-cli.test.mjs](file:///mnt/d/Projects/MimirNL/test/npm-cli.test.mjs#L55-L56), explanatory comments clarify why case-insensitive stripping of `npm_execpath` is necessary.

### 3.3. Maintainability
- Centralizes npm CLI discovery in a single reusable module.
- Avoids hardcoded OS branching by checking candidate paths via `existsSync`, making it resilient to slight variations in installation layouts across platforms.

### 3.4. Performance
- Executing Node directly via `execFileSync(process.execPath, [cli, ...args])` avoids `cmd.exe` or `/bin/sh` process spawn overhead.
- Candidate path inspection performs at most two `existsSync` checks only during the fallback path when `npm_execpath` is unset.
- Execution timeout remains bounded at 120,000ms.

### 3.5. Security
- **No Shell Boundaries**: Invocations of `npm pack` and `npm install` bypass `cmd.exe /c` entirely. Arguments containing spaces or unusual characters are passed directly via OS process creation APIs without shell interpretation.
- **Path Validation**: Rejects non-absolute `npm_execpath` (`isAbsolute(cli)` check).
- **Trusted Runtime**: The binary executed is strictly `process.execPath` (the current validated Node runtime).
- **Stream Redirection**: Standard streams default to `["ignore", "pipe", "pipe"]`, preventing terminal hijacking.

### 3.6. Testing
- [test/npm-cli.test.mjs](file:///mnt/d/Projects/MimirNL/test/npm-cli.test.mjs):
  1. Tests that broken shadow shims in cwd and PATH are intercepted by baseline name lookup (exit 97).
  2. Verifies that [`runNpm`](file:///mnt/d/Projects/MimirNL/scripts/npm-cli.mjs#L7-L30) bypasses broken shims and succeeds with `env`.
  3. Verifies that [`runNpm`](file:///mnt/d/Projects/MimirNL/scripts/npm-cli.mjs#L7-L30) bypasses broken shims and succeeds with `directEnv` (all `npm_execpath` variants removed).
  4. Verifies lifecycle priority by pointing `npm_execpath` to a custom script in a path with spaces and asserting its stdout.
  5. Verifies rejection of relative `npm_execpath`.
- Independent execution confirms tests pass both inside `npm test` and via standalone `node --test test/npm-cli.test.mjs`.

### 3.7. Documentation
- [docs/ci-npm-cli-investigation.md](file:///mnt/d/Projects/MimirNL/docs/ci-npm-cli-investigation.md) is updated thoroughly:
  - Details the Windows job failure (`MODULE_NOT_FOUND` in bare `npm.cmd` call).
  - Documents the task 23 review findings and their resolution in task 24.
  - Cites the exact Windows and Linux log files and execution scripts.
  - Truthfully maintains that remote CI confirmation remains pending and no unauthorized commits/pushes were made.

### 3.8. Packaged Smoke Integrity
- As in previous reviews, [scripts/package-smoke.mjs](file:///mnt/d/Projects/MimirNL/scripts/package-smoke.mjs#L63-L178) continues to test:
  - Packaged executable existence and executable permissions (`0o111`).
  - Metadata verification (`package.json`, `LICENSE`, `SECURITY.md`).
  - Real CLI invocations (`init`, `doctor`, `project add`, `ingest`, `store`, `update`, `feedback`, `backup`, `restore`, `search`, `delete`) exercising SQLite database initialization, transactions, WAL snapshots, and approval persistence.
- Downstream smoke tests remain completely unaffected and robust.

---

## 4. Verification Evidence

### 4.1. Independently Verified Linux Checks (Node v24.22.1)
- `node --test test/npm-cli.test.mjs` (direct, `npm_execpath` unset): **PASS** (1 test passed, 219.58ms).
- `node scripts/package-smoke.mjs` (direct, `npm_execpath` unset): **PASS**:
  ```json
  {"installedExecutable":true,"backupRestore":true,"feedbackApproval":true,"isolation":true,"node":"v24.22.1","platform":"linux"}
  ```
- `npm run format:check`: **PASS** (All matched files use Prettier code style).
- `git diff --check`: **PASS** (No whitespace or patch errors).
- `npm test`: **PASS** (33 tests: 32 passed, 0 failed, 1 skipped Windows-specific 8.3 alias test; 10,465ms).
- `npm run package:smoke`: **PASS** (Lifecycle smoke test passes).

### 4.2. Verified Windows Native Evidence (Node v24.22.1)
Source: [docs/ci-npm-fallback-windows.txt](file:///mnt/d/Projects/MimirNL/docs/ci-npm-fallback-windows.txt) (executed via [docs/ci-npm-fallback-windows-run.cmd](file:///mnt/d/Projects/MimirNL/docs/ci-npm-fallback-windows-run.cmd)):
- `npm run typecheck`: **PASS** (0 errors).
- `npm run lint`: **PASS** (0 warnings/errors).
- `npm run format:check`: **PASS** (Prettier code style verified).
- `npm run test`: **PASS** (33 tests: 33 passed, 0 failed, 0 skipped; 17,377ms).
- `npm run schemas:check`: **PASS** (Contract schemas match).
- `npm run package:smoke`: **PASS** (`installedExecutable`, `backupRestore`, `feedbackApproval`, `isolation` all true).
- `node --test test/npm-cli.test.mjs` (`npm_execpath` unset): **PASS** (1 test passed, 583.52ms).
- `node scripts/package-smoke.mjs` (`npm_execpath` unset): **PASS** (All 4 smoke assertions true).

---

## 5. Conclusion

All findings from [tasks/23-npm-cli-review-findings.md](file:///mnt/d/Projects/MimirNL/tasks/23-npm-cli-review-findings.md) are satisfactorily resolved. The code is secure, portable across official Node.js distribution layouts on both Windows and POSIX, and backed by comprehensive regression tests and dual-platform execution logs.

Verdict: **APPROVE**.
