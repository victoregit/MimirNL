# Mimir NL

**Release status:** `0.4.0-dev.0`, technical development candidate, unpublished. V04-01 through V04-06 have independent approvals. V04-07 local evidence is prepared; review158 and remote CI of the exact future commit remain pending. No tag or npm release is authorized. See [current learning and recovery](docs/v04/learning.md) and [changelog](CHANGELOG.md).

A second brain for AI. Mimir is a local-first TypeScript memory engine with SQLite persistence, project-isolated text retrieval, authorized read-only Git ingestion, deterministic feedback, and an official MCP v2 stdio server. It runs without an external API or model.

The website lives in the independent Mimir-web repository. This engine provides CLI and MCP interfaces for compatible agents; historical host evidence is recorded in the [0.2 notes](docs/release-0.2.0.md). The [0.3 retrieval contract](docs/core-retrieval-0.3.md) documents optional lexical policy, recency, compact output and local response telemetry. Defaults remain compatible.

EF03 exact context deduplication is an experimental external-API benchmark helper, not automatically enabled in CLI/MCP. One four-call pilot on two known DEV cases reduced input tokens by 4.91% and total tokens by 4.80%, with 4/4 quality gates passing. Both deduplicated calls were slower; cost and latency causes are unknown. This does not establish general savings. See the [release limitations](docs/release-0.3.0.md).

## Install and validate

Use the latest **Node 24 LTS (24.22.1 or newer within 24.x)**, npm, and Git. The bundled SQLite must include the concurrent-WAL corruption fix: 3.51.3+, or backports 3.50.7 / 3.44.6. Startup probes SQLite in memory and rejects unpatched or unknown versions before opening a user database, creating its directory, enabling WAL, or running migrations. CLI errors include the detected Node/SQLite versions and upgrade guidance; successful `doctor` reports `sqlite.walResetPatched`. No native SQLite compilation is required.

In WSL use a native Linux Node installation, not the Windows npm executable inherited on PATH.

WSL/Linux, from the clone:

```bash
npm ci
npm run typecheck
npm test
npm run benchmark
npm link
mimir init
mimir doctor
```

Windows PowerShell, from the clone:

```powershell
npm.cmd ci
npm.cmd run typecheck
npm.cmd test
npm.cmd run benchmark
npm.cmd link
mimir.cmd init
mimir.cmd doctor
```

`npm test` builds first. `npm run build` produces the CLI and public library in `dist/`. `npm link` installs the `mimir` command locally; use `node dist/cli/index.js` instead if linking is undesirable. Windows and WSL use different runtimes and filesystem paths: do not reuse a node_modules installation across them. Tests were run in WSL; see [validation](https://github.com/victoregit/MimirNL/blob/develop/docs/validation.md) for Windows smoke coverage and limits.

## Use a disposable project

The following WSL example creates and authorizes a fixture; it does not ingest an existing user repository:

```bash
fixture=$(mktemp -d)
git init "$fixture"
printf '%s\n' 'Renderer uses a bounded buffer.' > "$fixture/README.md"
project=$(mimir project add "$fixture" --authorize-ingestion)
project_id=$(node -e 'console.log(JSON.parse(process.argv[1]).data.id)' "$project")
mimir ingest "$project_id"
mimir search "renderer buffer" --project "$project_id" --tokens 4000
stored=$(mimir store "User observed a renderer issue" --project "$project_id")
memory_id=$(node -e 'console.log(JSON.parse(process.argv[1]).data.id)' "$stored")
mimir stats --project "$project_id"
```

Equivalent PowerShell fixture:

```powershell
$fixture = Join-Path ([IO.Path]::GetTempPath()) ([guid]::NewGuid().ToString())
New-Item -ItemType Directory $fixture | Out-Null
git init $fixture
Set-Content (Join-Path $fixture 'README.md') 'Renderer uses a bounded buffer.'
$project = mimir.cmd project add $fixture --authorize-ingestion | ConvertFrom-Json
$projectId = $project.data.id
mimir.cmd ingest $projectId
mimir.cmd search 'renderer buffer' --project $projectId --tokens 4000
mimir.cmd stats --project $projectId
```

All memories start as candidates. Use an ID returned by store/search for subsequent commands. JSON operations use the same parameter names as [MCP tools](docs/mcp.md):

```bash
mimir get "$memory_id" --project "$project_id"
mimir feedback "{\"projectId\":\"$project_id\",\"id\":\"$memory_id\",\"action\":\"approve\",\"explicitApproval\":true}"
mimir delete "$memory_id" --project "$project_id" --confirm
mimir project-delete "$project_id" --confirm
```

The fixture commands above set `memory_id` to the stored result ID. Approval means the user reviewed the claim; an imported commit or test report alone never proves correctness. Global sharing additionally requires `action: "promote"` and `sharingApproval: true` on verified knowledge. Search/get include shared knowledge only with `--include-global`. Imported memories stay project-private until that explicit action.

## Storage and limits

Default database: `$XDG_DATA_HOME/mimir-nl/memory.sqlite`, falling back to `~/.local/share/mimir-nl/memory.sqlite` on Linux; `%LOCALAPPDATA%\mimir-nl\memory.sqlite` on Windows. Supply `--db /absolute/private/memory.sqlite` on any command to override. The directory is created privately on POSIX and the database uses mode 0600. Configure Windows ACLs yourself. Keep SQLite WAL databases on a local filesystem; avoid network shares and cross-runtime concurrent access to a WSL-mounted Windows database. The database cannot be registered inside an analyzed repository.

Ingestion supports self-contained Git repositories, bounded text files and commit metadata. It rejects linked worktrees, metadata symlinks, include configuration and alternate object stores. It skips sensitive paths, symlinked files, binaries, dependencies/build outputs and potential secrets; it never executes project tests or scripts. Secret detection is heuristic, not a guarantee. See [security](docs/security.md).

Search uses FTS5 BM25 and literal word queries. Its context budget includes provenance and JSON formatting, using a conservative UTF-8 byte upper bound rather than actual model tokenization. There is no embedding model, automatic ML learning, or measured model-token savings claim.

Read [architecture](docs/architecture.md), [MCP contract](docs/mcp.md), [integrations](https://github.com/victoregit/MimirNL/blob/develop/docs/integrations.md), [dependency evidence](docs/dependencies.md), and [validation](https://github.com/victoregit/MimirNL/blob/develop/docs/validation.md).

## Hardening and recovery

Use `mimir --db EXISTING_DB backup NEW_SNAPSHOT` and `mimir --db NEW_DB restore SNAPSHOT --confirm` with existing private parent folders. Recovery never replaces an active database. See [backup/restore](docs/backup-restore.md), [contribution checks](CONTRIBUTING.md), [security policy](SECURITY.md) and [roadmap execution evidence](https://github.com/victoregit/MimirNL/blob/develop/docs/roadmap-execution.md). The package remains `0.4.0-dev.0`, unpublished. Historical reviews retain their original scope; local green checks do not establish remote CI success or causal efficiency gains.

## License

MIT — see [LICENSE](LICENSE). Dependency licenses and notices remain applicable.

Development0.4 provides [opt-in local measurement](docs/v04/measurement.md), [structured experiences, review, applicability and correction](docs/v04/learning.md). Two later real tasks exercised reuse and maintenance of obsolete operational context, accepted by review156. Personal knowledge remains local; candidates are not verified facts. Generalization requires review of exact content and separate sharing consent. New knowledge DBs use schema2; existing1 requires explicit migration with a fresh verified backup and a compatible recovery runtime. Host tokens/cost/TTFT and causal benefit remain unknown. V04-07 awaits review158 and exact-commit remote CI.
