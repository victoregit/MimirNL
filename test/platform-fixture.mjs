import assert from "node:assert/strict";
import { symlinkSync, statSync } from "node:fs";
import { test } from "node:test";

// Only the setup requiring a Windows privilege may be skipped. Callers keep
// running collision, malformed-input, cleanup and canary assertions afterward.
export function withSymlink(target, path, check) {
  try {
    symlinkSync(target, path);
  } catch (error) {
    if (process.platform !== "win32" || error.code !== "EPERM") throw error;
    test(
      "symlink rejection: setup requires Windows symlink privilege",
      {
        skip: "Windows returned EPERM while creating the test symlink",
      },
      () => {},
    );
    return;
  }
  check();
}

// Windows chmod exposes read/write flags, not POSIX ownership or ACL privacy.
// Keep exact private-mode assertions on POSIX; never claim ACL isolation here.
export function assertPrivateMode(path, expected) {
  const mode = statSync(path).mode & 0o777;
  if (process.platform === "win32") assert.equal(mode & 0o600, 0o600);
  else assert.equal(mode, expected);
}
