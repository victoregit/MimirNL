# Windows installed-package smoke correction — 2026-10-25

Authenticated browser inspection of [Windows job 121090820730](https://github.com/victoregit/MimirNL/actions/runs/40167285126/job/121090820730), commit `4428f3f`, shows types, lint, formatting, tests and schemas passing. Installed-package smoke fails before installation, in the first `npm pack` call.

The failed subprocess is `cmd.exe /d /s /c` invoking the bare name `npm.cmd`. Node reports `MODULE_NOT_FOUND` for both `D:\a\MimirNL\MimirNL\node_modules\npm\bin\npm-prefix.js` and `npm-cli.js`. The stack points to `scripts/package-smoke.mjs:37` and `:46`. This is npm bootstrap failure, before any installed Mimir executable is exercised. The log does not establish which npm shim was selected or why its base directory was wrong.

## Correction

`scripts/npm-cli.mjs` invokes the lifecycle-provided absolute `npm_execpath` using `process.execPath`. Direct script execution checks the bundled npm CLI in both official Node layouts: `node_modules/npm/bin/npm-cli.js` beside the Windows executable, and `../lib/node_modules/npm/bin/npm-cli.js` relative to the POSIX executable directory. It reports an explicit error if neither exists; an explicitly supplied lifecycle path retains priority and absolute-path validation. `scripts/package-smoke.mjs` uses this helper for both pack and install, while retaining its existing installed-executable checks. No dependency on a second PATH-based npm lookup or cmd quoting is needed for these two commands.

`test/npm-cli.test.mjs` creates broken npm shims in a disposable working directory and at the front of PATH, with a temporary directory containing spaces. The baseline name lookup must select the broken shim (exit 97 and marker), then the explicit CLI invocation must return an npm version without touching the marker. Relative `npm_execpath` is rejected. The regression now removes every casing variant of `npm_execpath` from the child environment before exercising fallback, so `npm test` cannot mask a missing fallback. A fixture CLI in a path containing spaces also verifies explicit lifecycle priority. Both Windows and Linux exercise the fixture.

## Local results

- Task 23 Windows results were author-reported without a saved raw log; task 24 replaces that evidence gap with the native Windows log linked below.
- Linux Node 24.22.1: results and installed-package smoke are recorded in `ci-npm-cli-linux.txt` from a disposable source copy with separate Linux dependencies.

Remote CI confirmation and independent review remain pending. No commit, push, publication, host configuration change or real repository ingestion was performed. Preexisting AGENTS.md and task21 investigation files were preserved.

## Task 24 review correction

The task 23 independent review returned REQUEST_CHANGES because the original fallback only supported the Windows layout, and the npm lifecycle environment masked that defect. The helper and regression above address those findings; independent re-review remains pending.

Task 24 verification uses disposable source copies with separate platform dependencies and official Node v24.22.1. Raw evidence is saved in `ci-npm-fallback-linux.txt` and `ci-npm-fallback-windows.txt`; `ci-npm-fallback-windows-run.cmd` records the native Windows driver. Each driver runs `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run test`, `npm run schemas:check`, and `npm run package:smoke`. Then it explicitly unsets `npm_execpath` and runs `node --test test/npm-cli.test.mjs` and `node scripts/package-smoke.mjs`. The Windows driver first runs `npm ci`; Linux reuses the existing disposable Linux dependency installation. The direct smoke still exercises all original installed-package assertions.

The disposable-copy setup initially omitted `.github/workflows` (format glob failed) and `LICENSE` (Linux smoke packaging assertion failed). Those fixtures were restored before the final successful verification logs; no product assertion was relaxed.

Final task 24 counts: Linux full suite 33 tests, 32 passed, zero failed, one expected Windows-only skip; native Windows full suite 33 tests, 33 passed, zero failed/skipped. The direct focused regression passes one test on each platform. Typecheck, lint, formatting, schemas, lifecycle package smoke and direct package smoke all pass on both platforms; both smoke modes report all four assertions true. Final changed-file formatting and `git diff --check` also pass.
