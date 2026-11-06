# Independent Code Review: Windows Canonical Git Root Fix (Task 19)

**Date**: 2026-10-25  
**Reviewer Model**: Gemini 3.8 Flash (High) — explicitly user-selected  
**Review Target**: Task 19 Windows Canonical Git Root Fix (`src/core/service.ts`, `src/ingestion/adapters/git.ts`, `test/canonical-root.test.mjs`)  
**Verdict**: **APPROVE**

---

## 1. Executive Summary & Verdict

The code changes implemented in Task 19 resolve the remote Windows CI error `UNSAFE_PATH: Register the canonical Git worktree root.` accurately, minimally, and without compromising security boundaries.

The root cause was reproduced natively on Windows: Node's JavaScript `fs.realpathSync()` preserves the caller-supplied drive-letter and directory casing (e.g., `c:\...` or `C:\USERS\...`), whereas Git's `rev-parse --show-toplevel` reports the filesystem's canonical casing (`C:\Users\...`). Comparing them strictly via `adapter.root() !== path` produced false `UNSAFE_PATH` rejections.

By replacing `realpathSync` with `realpathSync.native` across all four relevant call sites (`src/core/service.ts:163`, `src/ingestion/adapters/git.ts:136`, `src/ingestion/adapters/git.ts:144`, and `src/ingestion/adapters/git.ts:231`), Node delegates canonicalization to the OS filesystem driver (`GetFinalPathNameByHandleW` on Windows). This resolves path casing to true filesystem identity while preserving strict equality checks (`===`/`!==`), preventing path traversal, maintaining sensitive path guards, and respecting Linux case sensitivity.

All full check gates pass natively on both Windows and Linux (30/30 tests, types, lint, format check, schemas check, package smoke, benchmark). The review verdict is **APPROVE**.

---

## 2. Line-by-Line Code Review

### 2.1. [src/core/service.ts](file:///mnt/d/Projects/MimirNL/src/core/service.ts)

* **Lines 162–164**:
  ```ts
  // Native realpath resolves Windows drive and directory casing to filesystem identity.
  const path = realpathSync.native(String(d.path));
  assertSafe(path);
  ```
  * **Evaluation**: Calling `realpathSync.native` at the project registration boundary resolves the input path to its underlying canonical filesystem identity before validation.
  * **Security**: `assertSafe(path)` immediately validates against null bytes and control characters.
  * **Line 165–171**: Sensitive path checks (`sensitivePath(path)`), directory verification (`statSync(path).isDirectory()`), and DB isolation (`inside(path, this.storage.path)`) are performed against the canonical path.
  * **Lines 172–178**:
    ```ts
    const adapter = new GitAdapter(path);
    if (adapter.root() !== path)
      throw new AppError(
        "UNSAFE_PATH",
        "Register the canonical Git worktree root.",
      );
    ```
    * Because both `path` and `adapter.root()` are resolved with `realpathSync.native`, strict string inequality `!==` correctly evaluates whether the registered path is the exact root of the repository, eliminating false rejections caused by casing discrepancies while rejecting subdirectories and external paths.
  * **Lines 179–184**: The canonical path is stored in the database. Duplicate registrations using different path casing or trailing slashes deduplicate cleanly on the primary key `path`.

### 2.2. [src/ingestion/adapters/git.ts](file:///mnt/d/Projects/MimirNL/src/ingestion/adapters/git.ts)

* **Lines 136–138** (`root()`):
  ```ts
  return realpathSync.native(
    this.git(["rev-parse", "--show-toplevel"]).toString().trim(),
  );
  ```
  * **Evaluation**: Resolves the output of `git rev-parse --show-toplevel` using `realpathSync.native`. This aligns Git's reported worktree root with Node's view of the canonical filesystem path.
  * **Security**: Preceding checks (Lines 95–135) ensuring bounds on `.git/config`, forbidding `include`/`includeIf`, custom exclude/attribute files, mailmaps, and alternate object stores remain fully active.

* **Lines 141–150** (`ingest()` authorization recheck):
  ```ts
  const project = service.project(projectId);
  if (
    !project.authorized ||
    realpathSync.native(String(project.path)) !== this.path ||
    this.root() !== this.path
  )
    throw new AppError(
      "AUTHORIZATION_REQUIRED",
      "Explicit authorization for this canonical repository is required.",
    );
  ```
  * **Evaluation**: Consistent use of `realpathSync.native` ensures stored project paths and adapter paths match without loosening strict comparison semantics. Subdirectory ingestion attempts remain strictly rejected.

* **Lines 227–238** (`ingest()` file processing loop):
  ```ts
  if (!stat.isFile() || stat.isSymbolicLink()) {
    skipped++;
    continue;
  }
  const canonical = realpathSync.native(full);
  if (
    !inside(this.path, canonical) ||
    relative(this.path, canonical).replaceAll("\\", "/") !== file
  ) {
    skipped++;
    continue;
  }
  ```
  * **Evaluation**: Canonicalizes candidate files using `realpathSync.native(full)` and strictly verifies containment (`inside`) and normalized relative path match (`relative(...)`). Symlinks continue to be skipped (`stat.isSymbolicLink()`), preventing directory escapes or file aliasing.

---

## 3. Regression Test Suite Review: [test/canonical-root.test.mjs](file:///mnt/d/Projects/MimirNL/test/canonical-root.test.mjs)

The regression test file contains comprehensive positive and negative test cases verifying path canonicalization and edge cases:

1. **Path Identity Preservation (Lines 16–28)**:
   Registers a repository with mixed-case path components (`MixedCaseRepo`) and asserts `first.data.path === realpathSync.native(repo)`.
2. **Alternative Spelling Equivalents (Lines 29–39)**:
   Tests trailing slashes (`repo + "/"`), forward slash normalization (`repo.replaceAll("\\", "/")`), and on `win32`, lowercase drive letter (`repo[0].toLowerCase() + repo.slice(1)`) and full uppercase (`repo.toUpperCase()`). Asserts identical project ID and canonical path.
3. **Directory Alias / Junction Authorization (Lines 40–52)**:
   Creates a junction/symlink alias pointing to the repository root. Asserts registration resolves to the canonical project ID and ingestion succeeds (`inserted === 1`).
4. **Subdirectory Rejection (Lines 53–58)**:
   Attempts to register child directory `repo/child`. Asserts operation fails with `UNSAFE_GIT` (due to missing self-contained `.git` metadata).
5. **Distinct Root Isolation & Linux Case Sensitivity (Lines 59–70)**:
   Registers a distinct repository (`OtherRepo` on Windows, `mixedcaserepo` on Linux). Asserts distinct IDs and paths are assigned, confirming Linux case sensitivity is preserved.
6. **Path Traversal Guard (Lines 71–76)**:
   Tests traversal attack via `includes: ["../OtherRepo"]`. Asserts failure with `INVALID_REQUEST`.
7. **Sensitive Path Guard (Lines 77–83)**:
   Attempts to register a sensitive name (`credentials`). Asserts rejection with `UNSAFE_PATH`.
8. **Symlinked Git Metadata Rejection (Lines 84–95)**:
   Attempts to register a directory where `.git` is a junction/symlink pointing to another repo. Asserts failure with `UNSAFE_GIT`.

---

## 4. Verification & Evidence Evaluation

The evidence files in `docs/` document the full reproduction, red/green cycle, and final gates:

1. **Reproduction Baseline (`docs/ci-canonical-root-windows-baseline.txt`)**:
   * Lowercase drive `c:\...`: `equal: false`, error: `{"code":"UNSAFE_PATH","message":"Register the canonical Git worktree root."}`.
   * Uppercase path `C:\USERS\...`: `equal: false`, error: `{"code":"UNSAFE_PATH","message":"Register the canonical Git worktree root."}`.
   * Exact matching case & forward slashes: `equal: true`, ok.
2. **Red Test Evidence (`docs/ci-canonical-root-windows-red.txt`)**:
   * Test `canonical Git roots preserve identity across native path spellings` failed with exit code 1 at `test/canonical-root.test.mjs:36:14` on `c:\...` spelling with exact error `UNSAFE_PATH: Register the canonical Git worktree root.`.
3. **Green Test Evidence (`docs/ci-canonical-root-windows-green.txt`)**:
   * Targeted test passes with exit code 0 after applying `realpathSync.native`.
4. **Windows Native Full Gates (`docs/ci-canonical-root-windows-final.txt`)**:
   * Environment: Node v24.22.1, npm 11.19.1, Git 2.56.0.windows.3.
   * `typecheck`: Passed (`tsc --noEmit`).
   * `lint`: Passed (`eslint src`).
   * `format:check`: Passed (`prettier --check ...`).
   * `test`: All 30 tests passed (26 top-level + 4 subtests), 0 failed, 0 skipped.
   * `schemas:check`: Passed.
   * `package:smoke`: Passed (`installedExecutable: true, backupRestore: true, feedbackApproval: true, isolation: true`).
   * `benchmark`: Passed.
5. **Linux Native Full Gates (`docs/ci-canonical-root-windows-linux-final.txt`)**:
   * All gates passed on Linux Node v24.22.1: `typecheck`, `lint`, `format:check`, all 30 tests passed, `schemas:check`, `package:smoke`, and `benchmark`.
6. **Documentation & Roadmap (`docs/roadmap-execution.md` & `docs/ci-canonical-root-windows-summary.txt`)**:
   * Updated with accurate descriptions of the baseline reproduction, minimal fix, verification, and remaining pending gates.

---

## 5. Review Categories Assessment

| Category | Assessment |
| :--- | :--- |
| **Functionality** | Exceeds requirements. Correctly normalizes drive and path casing to filesystem identity, fixing the remote CI failure. |
| **Readability** | High. Changes are minimal (5 insertions, 4 deletions), clear, and well-commented. |
| **Maintainability** | Clean consistency across all four root/file `realpathSync` call sites. |
| **Performance** | Optimal. `realpathSync.native` delegates to OS-level system calls in libuv (C++). |
| **Security** | Preserved completely. Strict string comparisons (`===`/`!==`) remain intact; no case-insensitive lowering or fuzzy checks; traversal, metadata, and sensitive path protections remain robust. |
| **Testing** | Rigorous. Covers equivalence classes, platform differences, symlinks/junctions, and attack vectors. |
| **Documentation** | Thorough and precise without over-claiming remote CI status. |
| **Error Handling** | Unchanged; expected errors (`UNSAFE_PATH`, `UNSAFE_GIT`, `INVALID_REQUEST`) are consistently raised for unsafe paths. |

---

## 6. Open / Pending Gates

* **Remote CI Rerun**: Remote GitHub Actions run remains pending.
* **Release Gate**: Package version remains `0.1.0`; `v0.1.1` release remains pending.
* **Host & Real-Workload Gates**: Acceptance on actual external host and real-world repository ingestion remain pending.
* **Git Status**: Working directory changes remain uncommitted and unpushed, pending supervisor orchestration.

---

## 7. Conclusion

The canonical Git root fix in Task 19 is fully verified, architecturally sound, and safe.

**Verdict: APPROVE**
