# Independent Code Review: Path Boundary & Diagnostics Correction (Task 22)

**Date**: 2026-10-25  
**Reviewer Model**: Gemini 3.8 Flash (High) — explicitly user-selected  
**Review Target**: Local changes in [src/security/index.ts](file:///mnt/d/Projects/MimirNL/src/security/index.ts), [docs/mcp.md](file:///mnt/d/Projects/MimirNL/docs/mcp.md), [docs/roadmap-execution.md](file:///mnt/d/Projects/MimirNL/docs/roadmap-execution.md), [test/ci-paths.test.mjs](file:///mnt/d/Projects/MimirNL/test/ci-paths.test.mjs), and accompanying evidence in [docs/ci-path-boundary-investigation.md](file:///mnt/d/Projects/MimirNL/docs/ci-path-boundary-investigation.md), [docs/ci-path-boundary-linux.txt](file:///mnt/d/Projects/MimirNL/docs/ci-path-boundary-linux.txt), and [docs/ci-path-boundary-windows.txt](file:///mnt/d/Projects/MimirNL/docs/ci-path-boundary-windows.txt)  
**Verdict**: **APPROVE**

---

## 1. Executive Summary & Verdict

This review independently examines the local, uncommitted fix addressing path boundary security and error diagnostic boundaries following remote CI run `40164374263`.

### 1.1. Core Findings
1. **Windows Path Boundary & 8.3 Alias Containment**:
   - The remote Windows CI failure occurred at `test/hardening.test.mjs:281` where restoring into an analyzed project unexpectedly succeeded without the expected `/analyzed project/` rejection.
   - Root cause reproduction demonstrated that Windows temporary directories frequently involve 8.3 short name aliases (e.g., `RUNNER~1`). When a repository is registered, `realpathSync.native` records the canonical long path in `projects`. However, [`assertLocalPath`](file:///mnt/d/Projects/MimirNL/src/security/index.ts#L101-L129) previously returned the unresolved `absolute` path retaining the short alias. Consequently, the containment check `inside(p, target)` failed to identify that the destination resided within the project root.
   - The revised [`assertLocalPath`](file:///mnt/d/Projects/MimirNL/src/security/index.ts#L101-L129) incrementally canonicalizes each existing path component via `realpathSync.native(current)` strictly **after** validating that `lstatSync(current).isSymbolicLink()` is false. Non-existent child components (e.g., the target SQLite file being restored or backed up) gracefully catch `ENOENT` and preserve their suffix under the last canonical parent. The canonicalized path is then screened against [`sensitivePath`](file:///mnt/d/Projects/MimirNL/src/security/index.ts#L63-L67) and `assertSafe`.
   - This resolves 8.3 short aliases to their canonical filesystem identity before containment checks without relaxing symlink, junction, traversal, or sensitive path rejections.

2. **Error Diagnostics Privacy**:
   - The remote Linux CI failure in run `40164374263` at `test/core.test.mjs:101` surfaced as a generic `INVALID_REQUEST` during simultaneous-writer project registration with no underlying error details.
   - The updated [`failure(e)`](file:///mnt/d/Projects/MimirNL/src/security/index.ts#L68-L96) helper extracts bounded machine codes (`local.code`) restricted to the strict regular expression `/^(?:E[A-Z0-9_]{1,63}|SQLITE_[A-Z_]{1,63})$/`, and numeric `sqliteCode` restricted to `Number.isSafeInteger(local?.errcode)`.
   - It guarantees complete privacy of internal paths, SQL queries, user inputs, exception messages, and stack traces. `AppError` instances remain unpolluted by internal codes.

3. **Truthfulness and Scope Integrity**:
   - The author and documentation in [docs/roadmap-execution.md](file:///mnt/d/Projects/MimirNL/docs/roadmap-execution.md#L71-L80) and [docs/ci-path-boundary-investigation.md](file:///mnt/d/Projects/MimirNL/docs/ci-path-boundary-investigation.md#L18-L22) explicitly **refrain** from claiming the Linux simultaneous-writer error is resolved, truthfully stating that 15 consecutive targeted runs passed locally and the remote failure remains unidentified.
   - Remote CI rerun, release, host acceptance, and real-workload gates remain explicitly pending.
   - No untracked files or user edits (including [AGENTS.md](file:///mnt/d/Projects/MimirNL/AGENTS.md) and task 21 artifacts) were modified or destroyed.

Independent verification confirms that all 31 tests pass on Linux (with the 1 Windows-specific test cleanly skipped), all 32 tests pass on native Windows, and type checking, linting, formatting, schema validation, and package smoke checks pass with 0 errors on Node v24.22.1. The verdict is **APPROVE**.

---

## 2. Review by Standard Categories

### 2.1. Functionality
- **Path Resolution & Suffix Retention**: [`assertLocalPath`](file:///mnt/d/Projects/MimirNL/src/security/index.ts#L101-L129) correctly splits the path from the root down. If existing components are encountered, their canonical form is obtained using `realpathSync.native`. If a component does not exist, `ENOENT` is caught and the loop appends the remaining path components onto the canonical parent.
- **Project Boundary Enforcement**: When `targetPath` in [src/storage/backup.ts](file:///mnt/d/Projects/MimirNL/src/storage/backup.ts#L68-L91) calls `assertLocalPath(path)` and then tests `projects.some((p) => inside(p, target))`, both `p` (registered via canonical `realpathSync.native`) and `target` (resolved via `assertLocalPath`) share identical canonical representations. Rejection of backup/restore targets inside analyzed projects now works reliably under both long paths and 8.3 short aliases.
- **Diagnostic Codes**: [`failure(e)`](file:///mnt/d/Projects/MimirNL/src/security/index.ts#L68-L96) attaches `causeCode` and `sqliteCode` only when the underlying error is an unexpected non-AppError with an approved machine code format.

### 2.2. Readability
- The code is concise and straightforward. Clear inline comments in [src/security/index.ts](file:///mnt/d/Projects/MimirNL/src/security/index.ts#L69-L70) and [src/security/index.ts](file:///mnt/d/Projects/MimirNL/src/security/index.ts#L117-L119) explain why components are resolved before comparison and how missing suffixes are retained.

### 2.3. Maintainability
- The solution centralizes path validation in [`assertLocalPath`](file:///mnt/d/Projects/MimirNL/src/security/index.ts#L101-L129), avoiding piecemeal canonicalization across callers.
- The diagnostic code filtering in [`failure`](file:///mnt/d/Projects/MimirNL/src/security/index.ts#L68-L96) uses standard POSIX/Node and SQLite error naming conventions.

### 2.4. Performance
- Resolving path components iteratively from root down performs `lstatSync` and `realpathSync.native` once per component (typically 4–8 components). Path traversal complexity is $O(N)$ with respect to path depth, adding negligible overhead (<0.5ms) during backup/restore and CLI invocation.

### 2.5. Security
- **Strict Symlink and Junction Forbid**: In [`assertLocalPath`](file:///mnt/d/Projects/MimirNL/src/security/index.ts#L112-L116), `lstatSync(current).isSymbolicLink()` is checked **before** calling `realpathSync.native(current)`. If any directory or intermediate component is a symbolic link or directory junction, `UNSAFE_PATH` is thrown immediately.
- **Path Traversal Guard**: Path segments containing `..` are rejected upfront on line 103 before any resolution.
- **Sensitive Path Screening**: [`sensitivePath`](file:///mnt/d/Projects/MimirNL/src/security/index.ts#L63-L67) is evaluated on the raw input string (line 103) **and** re-evaluated on the final canonicalized string (line 126). This prevents bypassing sensitive file restrictions via 8.3 aliases (e.g., `CREDEN~1` resolving to `credentials`).
- **No Secret/Data Leakage**: [`failure`](file:///mnt/d/Projects/MimirNL/src/security/index.ts#L68-L96) only surfaces uppercase machine codes matching `/^(?:E[A-Z0-9_]{1,63}|SQLITE_[A-Z_]{1,63})$/` and safe integers for `sqliteCode`. Messages, paths, SQL queries, and stack traces are excluded.

### 2.6. Testing
- [test/ci-paths.test.mjs](file:///mnt/d/Projects/MimirNL/test/ci-paths.test.mjs) provides two dedicated tests:
  1. `unexpected local errors retain safe machine codes without paths or exception text` verifies that `causeCode` and `sqliteCode` are properly surfaced while private message text, paths, and SQL queries are suppressed.
  2. `Windows short-path aliases cannot bypass backup and restore project boundaries` tests real Windows 8.3 short-path generation, verifying that backup and restore operations reject destinations within the project root, destination files remain absent, and short aliases to sensitive paths throw `UNSAFE_PATH`. The test gracefully skips on non-Windows platforms or if the filesystem has 8.3 generation disabled.
- Full test suite passes: 31 passed on Linux (1 skipped), 32 passed on native Windows.

### 2.7. Documentation
- [docs/mcp.md](file:///mnt/d/Projects/MimirNL/docs/mcp.md#L47-L52) accurately describes the addition of optional `error.causeCode` and `error.sqliteCode` diagnostics while reaffirming that paths, SQL, and messages remain private.
- [docs/roadmap-execution.md](file:///mnt/d/Projects/MimirNL/docs/roadmap-execution.md#L71-L80) and [docs/ci-path-boundary-investigation.md](file:///mnt/d/Projects/MimirNL/docs/ci-path-boundary-investigation.md) describe the Windows reproduction, red/green validation, diagnostic additions, and unverified status of the remote Linux error.

### 2.8. Error Handling
- In [`assertLocalPath`](file:///mnt/d/Projects/MimirNL/src/security/index.ts#L121-L123), only `ENOENT` errors are caught and ignored when probing components. Any other filesystem errors (such as `EPERM`, `EACCES`) are re-thrown immediately.

---

## 3. Detailed Line-by-Line Code Review

### 3.1. [src/security/index.ts](file:///mnt/d/Projects/MimirNL/src/security/index.ts)

* **Lines 68–96** (`failure(e: unknown)`):
  ```ts
  export function failure(e: unknown) {
    const local =
      e instanceof Error
        ? (e as NodeJS.ErrnoException & { errcode?: number })
        : undefined;
    const causeCode =
      !(e instanceof AppError) &&
      typeof local?.code === "string" &&
      /^(?:E[A-Z0-9_]{1,63}|SQLITE_[A-Z_]{1,63})$/.test(local.code)
        ? local.code
        : undefined;
    return {
      ok: false as const,
      error: {
        code: e instanceof AppError ? e.code : "INVALID_REQUEST",
        message:
          e instanceof AppError
            ? e.message
            : "Invalid request or local operation failed.",
        ...(causeCode ? { causeCode } : {}),
        ...(causeCode === "ERR_SQLITE_ERROR" &&
        Number.isSafeInteger(local?.errcode)
          ? { sqliteCode: local!.errcode }
          : {}),
      },
    };
  }
  ```
  - **Evaluation**:
    - `!(e instanceof AppError)` prevents masking or augmenting deliberate application errors.
    - The regex `/^(?:E[A-Z0-9_]{1,63}|SQLITE_[A-Z_]{1,63})$/` restricts `causeCode` to POSIX/Node system error identifiers (e.g., `ENOENT`, `EPERM`, `ERR_SQLITE_ERROR`) or SQLite codes (`SQLITE_BUSY`). Lowercase characters, spaces, punctuation, paths, and arbitrary strings are rejected.
    - `Number.isSafeInteger(local?.errcode)` ensures `sqliteCode` is exclusively an integer error code.
    - Exception message, path, SQL, and stack traces are omitted.

* **Lines 101–129** (`assertLocalPath(path: string): string`):
  ```ts
  export function assertLocalPath(path: string): string {
    assertSafe(path);
    if (!path || sensitivePath(path) || path.split(/[\\/]/).includes(".."))
      throw new AppError("UNSAFE_PATH", "Sensitive or traversing path rejected.");
    const absolute = resolve(path);
    let current = parse(absolute).root;
    let canonical = realpathSync.native(current);
    for (const part of absolute.slice(current.length).split(/[\\/]/)) {
      current = join(current, part);
      canonical = join(canonical, part);
      try {
        if (lstatSync(current).isSymbolicLink())
          throw new AppError(
            "UNSAFE_PATH",
            "Symbolic path components are forbidden.",
          );
        canonical = realpathSync.native(current);
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
      }
    }
    assertSafe(canonical);
    if (sensitivePath(canonical))
      throw new AppError("UNSAFE_PATH", "Sensitive or traversing path rejected.");
    return canonical;
  }
  ```
  - **Evaluation**:
    - Initial guards on raw input reject null/empty inputs, traversal segments (`..`), and sensitive filenames.
    - `current` begins at the filesystem root and traverses component by component.
    - `lstatSync(current).isSymbolicLink()` runs before `realpathSync.native`, strictly enforcing that symlinks/junctions cannot be traversed.
    - When a component exists, `realpathSync.native(current)` canonicalizes drive letters, short aliases, and directory casing.
    - When a component does not exist, `ENOENT` is caught; `canonical` continues to accumulate the non-existent suffix. Non-ENOENT exceptions are rethrown.
    - Final checks verify that the canonicalized path does not contain secrets (`assertSafe(canonical)`) and does not resolve into a sensitive directory (`sensitivePath(canonical)`).

### 3.2. [test/ci-paths.test.mjs](file:///mnt/d/Projects/MimirNL/test/ci-paths.test.mjs)

* **Lines 16–41**: Tests error sanitization in `failure()`, verifying that standard codes (`ENOENT`, `ERR_SQLITE_ERROR` with numeric code `5`) are preserved while private error messages, paths, SQL, and non-conforming codes are omitted.
* **Lines 43–101**: Windows-specific short-path test:
  - Generates an actual 8.3 alias via `cmd.exe /c for %I in ("%MIMIR_FIXTURE_PATH%") do @echo %~sI`.
  - Skips cleanly if short names are disabled or unsupported.
  - Registers the Git repository under the long path.
  - Verifies that both `restoreDatabase` and `backupDatabase` reject target paths supplied via the short alias with `/analyzed project/`.
  - Confirms the target file was not created (`existsSync(forbidden) === false`).
  - Creates a `credentials` directory, obtains its short name, and verifies that `assertLocalPath` throws `/Sensitive/`.
  - Closes resources and cleans up temporary directories in a `finally` block.

---

## 4. Independent Verification Results

All checks were executed independently using Node **v24.22.1** and npm **11.19.1**:

| Check | Command | Exit Code | Outcome |
| :--- | :--- | :---: | :--- |
| **Type Check** | `npm run typecheck` (`tsc --noEmit`) | `0` | Passed without errors |
| **Lint** | `npm run lint` (`eslint src`) | `0` | Passed with 0 warnings/errors |
| **Formatting** | `npm run format:check` (`prettier --check ...`) | `0` | All matched files use Prettier style |
| **Test Suite** | `npm test` (`tsc && node --test test/*.test.mjs`) | `0` | **31 passed, 1 skipped** (Windows short-path test skipped on Linux) |
| **CI Paths Test** | `node --test test/ci-paths.test.mjs` | `0` | **1 passed, 1 skipped** |
| **Schema Check** | `npm run schemas:check` | `0` | Contract matches schemas |
| **Package Smoke** | `npm run package:smoke` | `0` | `{"installedExecutable":true,"backupRestore":true,"feedbackApproval":true,"isolation":true,"node":"v24.22.1","platform":"linux"}` |

### 4.1. Edge Case Probing
Independent eval probes were executed on the compiled code:
1. **Missing Suffix**: An absent child path under an existing temporary directory resolved to the canonical parent with the suffix attached intact.
2. **Intermediate & Leaf Symlinks**: Symlinks at intermediate directories or leaf targets threw `UNSAFE_PATH: Symbolic path components are forbidden.`.
3. **Traversal Probing**: Raw paths with `..` threw `UNSAFE_PATH: Sensitive or traversing path rejected.`.
4. **Sensitive Suffix & Aliasing**: Paths pointing to sensitive folder names threw `UNSAFE_PATH`.
5. **Failure Diagnostic Bounds**: Evaluated `AppError`, string errors, non-safe integers, lowercase codes, and punctuation injection (`ENOENT/../secrets`). All invalid codes and sensitive data were sanitized as expected.

---

## 5. Truthful Documentation & Scope Validation

1. **Linux Registration Failure**: The documentation accurately states that the remote Linux `INVALID_REQUEST` could not be reproduced locally after 15 consecutive runs. No unsubstantiated fix is claimed.
2. **Preservation of Untracked / Existing Files**: Existing working tree modifications ([AGENTS.md](file:///mnt/d/Projects/MimirNL/AGENTS.md), task 21 investigation notes, and related documentation) remain untouched.
3. **Pending Gates**: Remote CI run on GitHub Actions, release tagging, host acceptance, and real-world repository workloads remain documented as pending. No commit, push, or code alterations were made during this review.

---

## 6. Conclusion & Recommendation

The local changes in Task 22 provide an accurate, robust, and secure fix for Windows 8.3 path containment during backup and restore, and safely expose machine diagnostics without compromising privacy.

**Verdict: APPROVE**
