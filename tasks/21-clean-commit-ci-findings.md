# Clean commit CI investigation

Investigated commit `0739e774a898f90bdc7f832afaace3b0aac87531`, reported remote run `40164374263`. No application or test changes made. User-provided remote failure log remains pending.

## Exact Linux checkout

Commands executed from the original repository, then the detached worktree:

```sh
git worktree add --detach /tmp/mimir-task21-clean 0739e774a898f90bdc7f832afaace3b0aac87531
cd /tmp/mimir-task21-clean
export PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH
npm ci
npm test
```

Node 24.22.1, Git 2.53.0, Linux/WSL. Clean tracked status before/after testing. Fresh dependencies: 106 packages, audit zero vulnerabilities. Test/build exit 0: 30 pass, 0 fail/skip. Evidence: `docs/ci-clean-commit-linux.txt`.

## Artifact and environment checks

- `test/git-fixture.mjs` is tracked at the exact commit (blob `d43253f96d29cb725331180216e3a115b712db81`); the new regression imports an available artifact.
- `test/core.test.mjs`, `test/git-fixture.mjs`, and `.github/workflows/ci.yml` have no differences between previous `4386fca` and `0739e77`.
- Commit fixtures explicitly supply `user.name=Fixture` and `user.email=fixture@example.invalid`; no global identity change is necessary.
- The new canonical-root fixture creates no commits; it passes on the exact Linux checkout.
- Fixture Git invocations suppress global/system configuration. No global configuration, hosts, ingestion, commit, or push performed.

## Native Windows checkout

Created a separate complete local clone with fresh dependencies (not a developer source copy):

```sh
git clone --no-hardlinks --no-checkout /mnt/d/Projects/MimirNL /mnt/d/Projects/mimir-task21-clean
git -C /mnt/d/Projects/mimir-task21-clean checkout --detach 0739e774a898f90bdc7f832afaace3b0aac87531
```

Windows commands are recorded in `docs/ci-clean-commit-windows-run.cmd`. An initial command-line PATH assignment selected installed Node 24.21.0; that unsupported attempt is excluded from validation. The corrected batch file explicitly selects the existing supported Node 24.22.1 and portable Git, with version printed before fresh `npm ci` and `npm test`.

## Conclusion

Linux clean-commit reproduction does not reproduce the reported remote failure. Native Windows also passes 30/30 with zero failures/skips, build/test exit 0, fresh npm ci exit 0, and Node 24.22.1 printed. Evidence: `docs/ci-clean-commit-windows.txt`. Both clean checkout HEADs match the exact requested SHA and tracked status remains clean. No evidence-supported defect is identified yet; the first failing remote test, error, and stack are required to narrow the mismatch. Do not weaken canonical-root/security assertions or infer remote green from local results. No red/green fix evidence exists because no supported-runtime failure has been reproduced.
