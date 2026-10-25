# CI path-boundary investigation — 2026-10-25

Authenticated browser inspection of run [40164374263](https://github.com/victoregit/MimirNL/actions/runs/40164374263), commit `0739e774a898f90bdc7f832afaace3b0aac87531`, established two distinct failures:

- [Linux job](https://github.com/victoregit/MimirNL/actions/runs/40164374263/job/121082280618#step:8:55): project registration in `test/core.test.mjs:101` returned generic `INVALID_REQUEST` during the simultaneous-writers test. The remote output contains no underlying exception code.
- [Windows job](https://github.com/victoregit/MimirNL/actions/runs/40164374263/job/121082280440#step:8:55): restore into the analyzed project unexpectedly succeeded (`test/hardening.test.mjs:281`, expected rejection matching `/analyzed project/`).

## Windows reproduction and correction

A disposable native Windows fixture with an actual generated 8.3 short directory name reproduces the missing rejection. Registration stores the native long root, while the old administrative path validator returned the unresolved short destination. Lexical containment therefore missed the same filesystem location. This reproduces the observed remote assertion; the remote log itself does not print its temporary path spelling.

`assertLocalPath` now resolves existing components with native realpath after rejecting symlinks. Missing components retain their suffix under the canonical existing parent. It rechecks the canonical path for sensitive content and sensitive locations. No case folding, symlink allowance, overwrite, or security assertion was introduced.

`test/ci-paths.test.mjs` uses a real short-path fixture to verify that both restore and backup reject destinations inside the registered project, leave the destination absent, and reject short aliases of a sensitive fixture directory. The short-path test is Windows-specific and is skipped when the filesystem does not generate short names.

Red/green evidence: restoring the prior `return absolute` behavior in the generated build produced `Missing expected rejection` in the short-path regression. The corrected build passed that regression. The temporary build alteration was restored immediately; source code was not reverted.

## Linux status and diagnostics

The exact Linux test passed 15 consecutive targeted runs against the existing clean-commit temporary checkout. Its underlying remote exception remains unidentified, so no Linux root-cause fix is claimed. Unexpected local failures now retain bounded machine codes (`causeCode`, plus numeric SQLite `sqliteCode` where available), while exception text, paths, SQL and stacks remain private. A regression checks that diagnostic output does not expose exception content.

Full Linux validation uses a disposable source copy and separately installed Linux dependencies: 31 tests passed, zero failed, with the Windows-only short-path test skipped. See `ci-path-boundary-linux.txt`. Final native Windows tests passed 32/32 with zero skipped; verification is recorded in `ci-path-boundary-windows.txt`. Types, lint, formatting, schema checks and installed-package feedback/backup/restore/isolation smoke passed on both platforms. Independent review and remote CI remain pending. No commit, push, release, host configuration change or real repository ingestion was performed.
