# Dependency verification

Verified 2026-10-24 before coding via official npm registry JSON and https://ts.sdk.modelcontextprotocol.io/v2/ .

- @modelcontextprotocol/server 2.4.0 and client 2.4.0: root ESM exports and /stdio confirmed; official docs specify McpServer, serveStdio and zod/v4. SDK requires Node >=20.
- zod 4.6.7: /v4 export confirmed.
- TypeScript latest 7.0.2; implementation selects mature 5.9.3 compiler, verified via registry during install.
- Node 24 LTS required for built-in SQLite; no native database dependency.
  Exact direct dependencies and transitive integrity are locked in package-lock.json. Installation and declaration inspection will verify concrete APIs; no SDK v1 substitution.

## Installed and API evidence

`npm ci` completed successfully from the lockfile (18 installed packages, 0 npm audit findings at installation time). `npm ls --depth=0` confirmed server/client 2.4.0, Zod 4.6.7, TypeScript 5.9.3, @types/node 24.10.0, and formatting-only Prettier 3.6.2. The package build and real SDK initialize/list/call tests validate the concrete published APIs, not just documentation examples. Both SDK packages export ESM roots and `/stdio`.

Registry verification used `https://registry.npmjs.org/@modelcontextprotocol%2fserver`, corresponding client/Zod/TypeScript/@types metadata, and npm install resolution for exact pins. Official SDK reference: https://ts.sdk.modelcontextprotocol.io/v2/ . Official Node SQLite reference retrieved successfully: https://nodejs.org/download/release/v24.22.1/docs/api/sqlite.html . `DatabaseSync`, prepared statements and transactions are used directly; WAL/FTS5 availability is probed by executable tests.

WSL validation now uses official Linux x64 Node **v24.22.1**, npm **11.19.1**, and bundled SQLite **3.53.4**. Runtime: `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`, used through a command-local PATH prefix. The official [release index](https://nodejs.org/dist/index.json) listed this as the latest Node 24 Krypton LTS (release date 2026-10-20). The archive SHA-256 was checked against official HTTPS `SHASUMS256.txt`; exact metadata, URLs and digest are recorded in [runtime-download.json](runtime-download.json). This verifies checksum consistency, not a separate signature verification.

[SQLite WAL documentation, section 11](https://www.sqlite.org/wal.html#walresetbug) confirms that concurrent WAL writers/checkpointers can corrupt databases through SQLite 3.51.2. Fixes are 3.51.3+ and backports 3.50.7 / 3.44.6. Earlier tests on Node 24.10.0 / SQLite 3.50.4 do **not** establish upstream safety and are superseded by patched-runtime results. Startup now rejects that actual old Linux runtime before database/directory creation; see [sqlite-runtime-rejection.txt](sqlite-runtime-rejection.txt). Unknown version strings fail closed. Successful doctor reports the detected version and patch status; rejected startup reports `UNSUPPORTED_SQLITE` with versions and upgrade guidance before doctor can open a database.

Package engines require `>=24.22.1 <25`; latest Node 24 LTS remains recommended. Native Windows Node v24.21.0 / SQLite 3.53.4 was previously smoke-tested, but is below the new package runtime baseline and Windows Git was unavailable. Dependency downloads are installation-time network operations; the engine performs no outbound application requests.
