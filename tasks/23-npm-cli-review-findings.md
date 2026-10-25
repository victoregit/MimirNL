# Independent Code Review: NPM CLI Resolution & Package Smoke Correction (Task 23)

**Date**: 2026-10-25  
**Reviewer Model**: Gemini 3.8 Flash (High) — explicitly user-selected  
**Review Target**: Local changes in [scripts/npm-cli.mjs](file:///mnt/d/Projects/MimirNL/scripts/npm-cli.mjs), [scripts/package-smoke.mjs](file:///mnt/d/Projects/MimirNL/scripts/package-smoke.mjs), [test/npm-cli.test.mjs](file:///mnt/d/Projects/MimirNL/test/npm-cli.test.mjs), and accompanying documentation in [docs/ci-npm-cli-investigation.md](file:///mnt/d/Projects/MimirNL/docs/ci-npm-cli-investigation.md) and [docs/ci-npm-cli-linux.txt](file:///mnt/d/Projects/MimirNL/docs/ci-npm-cli-linux.txt)  
**Verdict**: **REQUEST_CHANGES**

---

## 1. Executive Summary & Verdict

This review independently evaluates the correction for the Windows CI `package:smoke` failure (remote run `40167285126`, job `121090820730`). In that CI run, `cmd.exe /d /s /c` invoking bare `npm.cmd` failed with `MODULE_NOT_FOUND` before package smoke could execute.

The correction introduces a dedicated runner [`runNpm`](file:///mnt/d/Projects/MimirNL/scripts/npm-cli.mjs#L6-L19) in [scripts/npm-cli.mjs](file:///mnt/d/Projects/MimirNL/scripts/npm-cli.mjs) that executes the npm CLI via `process.execPath`, refactors [scripts/package-smoke.mjs](file:///mnt/d/Projects/MimirNL/scripts/package-smoke.mjs) to use [`runNpm`](file:///mnt/d/Projects/MimirNL/scripts/npm-cli.mjs#L6-L19) for `npm pack` and `npm install`, and adds a regression test in [test/npm-cli.test.mjs](file:///mnt/d/Projects/MimirNL/test/npm-cli.test.mjs).

### Core Finding: Non-Portable Direct Invocation Fallback
The fallback logic in [scripts/npm-cli.mjs](file:///mnt/d/Projects/MimirNL/scripts/npm-cli.mjs#L8-L10) assumes the Windows directory layout and is broken on official POSIX/Linux Node installations when `npm_execpath` is absent:

- **Windows Official Layout** (`node.exe` beside `node_modules`):
  - `process.execPath`: `C:\Program Files\nodejs\node.exe`
  - `dirname(process.execPath)`: `C:\Program Files\nodejs`
  - Computed fallback: `C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js` (EXISTS)
- **Linux/macOS Official Layout** (`node-v24.22.1-linux-x64.tar.xz`, per [docs/runtime-download.json](file:///mnt/d/Projects/MimirNL/docs/runtime-download.json)):
  - `process.execPath`: `<prefix>/bin/node`
  - `dirname(process.execPath)`: `<prefix>/bin`
  - Computed fallback: `<prefix>/bin/node_modules/npm/bin/npm-cli.js` (**DOES NOT EXIST**, `MODULE_NOT_FOUND`)
  - Actual location: `<prefix>/lib/node_modules/npm/bin/npm-cli.js` (relative to bin: `../lib/node_modules/npm/bin/npm-cli.js`)

This failure is **not** inferred from the negative test in [test/npm-cli.test.mjs](file:///mnt/d/Projects/MimirNL/test/npm-cli.test.mjs#L55-L61) (which checks relative `npm_execpath`), but is reproduced directly with valid commands when `npm_execpath` is not passed in the environment (the standard state when running scripts directly via `node` rather than `npm run`).

Because running scripts or tests directly with Node is a standard developer workflow and documented as supported in [docs/ci-npm-cli-investigation.md](file:///mnt/d/Projects/MimirNL/docs/ci-npm-cli-investigation.md#L9), this defect must be addressed before approval.

---

## 2. Concrete Reproduction Evidence vs. Supported Install Layout

### 2.1. Supported Official Node.js Install Layouts
As documented in the project's [docs/runtime-download.json](file:///mnt/d/Projects/MimirNL/docs/runtime-download.json), Node.js v24.22.1 is obtained from official distributions (`https://nodejs.org/dist/v24.22.1/node-v24.22.1-linux-x64.tar.xz`).

In all official POSIX tarballs and packages, the directory tree is:
```
<prefix>/
├── bin/
│   ├── node                                     <-- process.execPath
│   └── npm -> ../lib/node_modules/npm/bin/npm-cli.js
└── lib/
    └── node_modules/
        └── npm/
            └── bin/
                └── npm-cli.js                   <-- actual npm entrypoint
```

In [scripts/npm-cli.mjs](file:///mnt/d/Projects/MimirNL/scripts/npm-cli.mjs#L8-L10):
```javascript
  const cli =
    env.npm_execpath ??
    join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
```
Here, `dirname(process.execPath)` evaluates to `<prefix>/bin`.
Joining `"node_modules"` yields `<prefix>/bin/node_modules/npm/bin/npm-cli.js`, which does not exist on Linux.

### 2.2. Exact Failing Command 1: Direct Test Execution via Node
Running the test runner directly without npm:
```bash
$ export PATH="/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH"
$ node --test test/npm-cli.test.mjs
```
**Output**:
```
✖ npm commands use the invoking CLI despite broken npm shims in cwd and PATH (61.903551ms)
  Error: Command failed: /tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node_modules/npm/bin/npm-cli.js --version
  node:internal/modules/cjs/loader:1568
    throw err;
    ^

  Error: Cannot find module '/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node_modules/npm/bin/npm-cli.js'
      at Module._resolveFilename (node:internal/modules/cjs/loader:1564:15)
      at Module._load (node:internal/modules/cjs/loader:1341:5)
      at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5) {
    code: 'MODULE_NOT_FOUND',
    requireStack: []
  }
```

### 2.3. Exact Failing Command 2: Direct Script Execution of Package Smoke
Running the smoke script directly:
```bash
$ node scripts/package-smoke.mjs
```
**Output**:
```
Error: Command failed: /tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node_modules/npm/bin/npm-cli.js pack --json --pack-destination /tmp/mimir-package-APcxKs
node:internal/modules/cjs/loader:1568
  throw err;
  ^
Error: Cannot find module '/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node_modules/npm/bin/npm-cli.js'
    code: 'MODULE_NOT_FOUND'
```

### 2.4. Exact Failing Command 3: Node Invocation with Empty / Lifecycle-Free Env
```bash
$ node -e '
import("./scripts/npm-cli.mjs").then(({ runNpm }) => {
  runNpm(["--version"], { env: {} });
});'
```
**Output**:
```
Error: Command failed: .../bin/node .../bin/node_modules/npm/bin/npm-cli.js --version
Error: Cannot find module '.../bin/node_modules/npm/bin/npm-cli.js'
  code: 'MODULE_NOT_FOUND'
```

### 2.5. Proof of Resolution via POSIX Layout vs Windows Layout
```javascript
// On Linux Node 24.22.1:
const dir = path.dirname(process.execPath); // /tmp/mimir-node-runtime/.../bin
const winStyle = path.join(dir, "node_modules", "npm", "bin", "npm-cli.js");
console.log(fs.existsSync(winStyle)); // FALSE

const posixStyle = path.join(dir, "..", "lib", "node_modules", "npm", "bin", "npm-cli.js");
console.log(fs.existsSync(posixStyle)); // TRUE
```

---

## 3. Review by Standard Categories

### 3.1. Functionality
- **Lifecycle Invocation**: When invoked via `npm run test` or `npm run package:smoke`, `env.npm_execpath` is set to the absolute path of the launching npm CLI. Under this condition, execution succeeds on both platforms.
- **Direct Invocation Fallback**: Broken on Linux/macOS as detailed in Section 2 above.

### 3.2. Security
- **Shell Injection Immunity**: Bypassing `cmd.exe /d /s /c` removes shell command concatenation, parameter splitting, and metacharacter interpretation.
- **Trusted Executable**: Invokes `process.execPath` directly with controlled string arguments.
- **Path Validation**: Rejects non-absolute `npm_execpath`.

### 3.3. Packaged Smoke Integrity
- [scripts/package-smoke.mjs](file:///mnt/d/Projects/MimirNL/scripts/package-smoke.mjs#L44-L178) retains all downstream checks:
  - Packs package using [`runNpm`](file:///mnt/d/Projects/MimirNL/scripts/npm-cli.mjs#L6-L19).
  - Installs tarball into isolated temporary directory using [`runNpm`](file:///mnt/d/Projects/MimirNL/scripts/npm-cli.mjs#L6-L19).
  - Verifies executable permissions (`0o111`) on Linux.
  - Verifies metadata (`package.json`, `LICENSE`, `SECURITY.md`).
  - Executes installed binary [`mimir`](file:///mnt/d/Projects/MimirNL/scripts/package-smoke.mjs#L67) / [`mimir.cmd`](file:///mnt/d/Projects/MimirNL/scripts/package-smoke.mjs#L67) through `command(bin, ...)` for `init`, `doctor`, `project add`, `ingest`, `store`, `update`, `feedback`, `backup`, `restore`, `search`, and `delete`.
- The packaged smoke test remains thorough and meaningful; only the fixture pack/install mechanism is changed.

### 3.4. Test Coverage
- In [test/npm-cli.test.mjs](file:///mnt/d/Projects/MimirNL/test/npm-cli.test.mjs#L32-L53), `process.env.npm_execpath` is retained in `env` during `npm test`. Because of this, the fallback logic on line 10 of [scripts/npm-cli.mjs](file:///mnt/d/Projects/MimirNL/scripts/npm-cli.mjs) is never exercised by `npm test`.
- The test suite needs an explicit test case without `npm_execpath` to verify fallback resolution.

---

## 4. Platform Evidence and Provenance

### 4.1. Independently Verified Linux Evidence (Node v24.22.1)
*Environment: Linux x86_64, Node v24.22.1, npm 11.19.1*
- `npm run format:check`: PASS (0 differences across all tracked files).
- `npm run typecheck`: PASS (TypeScript 5.9.3, 0 errors).
- `npm run lint`: PASS (ESLint 10.13.0, 0 warnings/errors).
- `npm run schemas:check`: PASS (schema contract matches).
- `npm test`: PASS (33 tests total: 32 pass, 0 fail, 1 skipped Windows-specific 8.3 test; 10,279ms).
- `npm run package:smoke`: PASS (`{"installedExecutable":true,"backupRestore":true,"feedbackApproval":true,"isolation":true,"node":"v24.22.1","platform":"linux"}`).
- `node --test test/npm-cli.test.mjs`: **FAIL** (`MODULE_NOT_FOUND`).
- `node scripts/package-smoke.mjs`: **FAIL** (`MODULE_NOT_FOUND`).

### 4.2. Windows Results Provenance Labeling
- **Provenance**: User-reported documentation in [docs/ci-npm-cli-investigation.md](file:///mnt/d/Projects/MimirNL/docs/ci-npm-cli-investigation.md#L15).
- **Status**: No raw Windows execution log (e.g. `ci-npm-cli-windows.txt`) is present in the repository.
- **Analysis**: The Windows layout has `node_modules` in `C:\Program Files\nodejs\node_modules`, which matches `join(dirname(process.execPath), "node_modules", ...)`. This explains why the user's local Windows test passed, while the Linux direct invocation fails.

---

## 5. Required Remediations for Approval

1. **Update [scripts/npm-cli.mjs](file:///mnt/d/Projects/MimirNL/scripts/npm-cli.mjs)**:
   Add support for both POSIX (`../lib/node_modules/npm/bin/npm-cli.js`) and Windows (`node_modules/npm/bin/npm-cli.js`) install layouts in the fallback:
   ```javascript
   import { execFileSync } from "node:child_process";
   import { existsSync } from "node:fs";
   import { dirname, isAbsolute, join } from "node:path";

   export function runNpm(args, options = {}) {
     const env = options.env ?? process.env;
     let cli = env.npm_execpath;
     if (!cli) {
       const dir = dirname(process.execPath);
       const candidates = [
         join(dir, "node_modules", "npm", "bin", "npm-cli.js"),
         join(dir, "..", "lib", "node_modules", "npm", "bin", "npm-cli.js"),
       ];
       cli = candidates.find(existsSync);
       if (!cli) {
         throw new Error("Could not find bundled npm CLI relative to Node executable.");
       }
     }
     if (!isAbsolute(cli))
       throw new Error("npm_execpath must be an absolute CLI path.");
     return execFileSync(process.execPath, [cli, ...args], {
       encoding: "utf8",
       timeout: 120000,
       stdio: ["ignore", "pipe", "pipe"],
       ...options,
     });
   }
   ```

2. **Update [test/npm-cli.test.mjs](file:///mnt/d/Projects/MimirNL/test/npm-cli.test.mjs)**:
   Add an explicit regression test asserting that [`runNpm`](file:///mnt/d/Projects/MimirNL/scripts/npm-cli.mjs#L6-L19) succeeds when `env.npm_execpath` is undefined:
   ```javascript
   const fallbackEnv = { ...env };
   delete fallbackEnv.npm_execpath;
   const fallbackVersion = runNpm(["--version"], { cwd: root, env: fallbackEnv }).trim();
   assert.match(fallbackVersion, /^\d+\.\d+\.\d+$/);
   ```

3. **Verify**:
   Confirm that both `node --test test/npm-cli.test.mjs` and `npm test` pass with 0 errors on Linux and Windows.
