# Task47 portable GitHub CLI release tooling preflight

Completed 2026-10-26. Tooling-only preparation; no release published and no login attempted.

## Verified portable tool

- Version executed: `gh version 2.103.2 (2026-10-23)`, exit 0.
- Absolute executable: `/mnt/d/Projects/MimirNL/.release/tooling/gh/2.103.2/gh_2.103.2_linux_amd64/bin/gh`.
- Official release: https://github.com/cli/cli/releases/tag/v2.103.2
- Official Linux x86_64 asset: https://github.com/cli/cli/releases/download/v2.103.2/gh_2.103.2_linux_amd64.tar.gz
- Official checksums: https://github.com/cli/cli/releases/download/v2.103.2/gh_2.103.2_checksums.txt
- Verified archive SHA-256: `62ccf747115ddc61237efffdde66a3c8f70ba249433dc64f70801089b59c59c8`.

Public GitHub release metadata and assets were fetched over HTTPS using Python's normal HTTP client. The asset matched the named entry in the official checksums before extraction or execution. No separate signature/attestation verification is claimed. Extraction used a new version directory, rejected absolute/traversal/link/special entries, and created files exclusively without overwriting existing files. Downloads, executable, provenance and sanitized auth result remain under ignored `.release/tooling/gh/2.103.2`; `git check-ignore` confirmed the parent tooling location is ignored. No sudo, global install or PATH change.

## Actual authentication availability

Executed only the exact portable `gh --version` and normal `gh auth status --hostname github.com`. Authentication status: **not authenticated / no usable authentication**, status exit **1**. Raw authentication stdout/stderr was captured only in memory for the normal command and neither printed nor retained. The saved summary contains only the boolean status, exit code and raw-output-retained=false. No token, credential file or account name is included in this report. No credential files were directly read/exported, no token requested, and no WSL/native credential copying occurred.

The supervisor's earlier native Git helper check found no existing noninteractive GitHub credential; that check was not repeated here. This tooling result does not establish future release permissions for an account: after a later authorized login, repository release access still needs assessment.

## Prepared operator command — NOT executed

After separate user approval, the operator may start the normal GitHub CLI web/device authentication flow with default tool-managed scopes:

```bash
/mnt/d/Projects/MimirNL/.release/tooling/gh/2.103.2/gh_2.103.2_linux_amd64/bin/gh auth login --hostname github.com --git-protocol https --web
```

Complete only the genuine GitHub device/web flow as the operator; do not paste a token into chat or copy native/WSL credentials. This command may open a browser when later executed. No login/browser/OAuth call occurred in Task47. Recheck normal redacted auth status afterward; do not request token output.

## Scope and remaining steps

Only this new Task47 result and ignored portable-tooling files were written. Task45, application source/code, documentation, scripts, tests, versions, configuration, DBs and previous evidence were not changed. No models/native hosts, broad checks, tests, commit/push/tag, release/API publication, npm or reusable harness were run/created.

Task46 independent evidence review proceeds separately. Remaining release steps are later authorized authentication/access preparation, user commit/push, successful Ubuntu/Windows CI on the exact final SHA, final-commit artifact/checksum rebuild and authorized GitHub publication. This preflight does not approve or execute those steps.
