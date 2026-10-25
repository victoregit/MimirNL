# Contributing

The engine lives in MimirNL; the complete website lives in the independent Mimir-web repository. Keep their dependencies, builds and histories separate. The project is licensed under the MIT license in LICENSE. Dependency licenses and notices remain applicable.

Use Node 24.22.1 or newer within 24.x, npm and Git. The SQLite runtime guard must pass before opening persistent databases. Install dependencies from this repository's lockfile, never from an analyzed project:

```sh
npm ci
npm run typecheck
npm run lint
npm run format:check
npm test
npm run schemas:check
npm run package:smoke
npm run benchmark
```

Run `npm run docs:schemas` after changing service schemas; commit the generated contract together with source changes. Use `npm run format` for formatting. ESLint checks TypeScript correctness and unused variables independently of Prettier. Tests use synthetic temporary Git repositories and databases. The package smoke installs a tarball into a temporary prefix and invokes the installed executable, including backup/restore. The benchmark asserts deterministic relevance and budget bounds; timings are observations, never performance gates or model-token claims.

Never run scripts, hooks, filters or tests from an analyzed project as part of ingestion. Imported text is untrusted data and cannot authorize administrative operations. Add regressions for trust boundaries, isolation, transaction failures and supported platforms. Do not include real repositories, secrets, user configuration or private memory databases in test evidence.

Linux/WSL and native Windows use independent dependencies and databases. Do not share a live WAL database between them. CI config runs both platforms with a pinned runtime and minimal permissions; local success does not establish remote CI success. Publication requires the independent review and release gates; no workflow publishes packages.

Report proposed changes with reproducible commands, actual results, known limitations and migration/rollback effects. Follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), [SECURITY.md](SECURITY.md) and [backup procedures](docs/backup-restore.md).
