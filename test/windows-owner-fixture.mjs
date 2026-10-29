// Native Windows descriptor fixture, not an elevated-token reproduction. The
// filesystem remains ordinary-user owned; only Get/Set-Acl are substituted in
// each real PowerShell child to model descriptors whose owner or ACEs vary.
import assert from "node:assert/strict";
import childProcess from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { existsSync, mkdirSync, realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const original = childProcess.execFileSync;
const root = realpathSync.native(process.argv[2]);
const powershell = join(
  process.env.SystemRoot ?? "C:\\Windows",
  "System32",
  "WindowsPowerShell",
  "v1.0",
  "powershell.exe",
);
const parentSddl = () =>
  original(
    powershell,
    [
      "-NoProfile",
      "-NonInteractive",
      "-EncodedCommand",
      Buffer.from(
        `$ErrorActionPreference='Stop'; Import-Module (Join-Path $PSHOME 'Modules\\Microsoft.PowerShell.Security\\Microsoft.PowerShell.Security.psd1'); (Get-Acl -LiteralPath '${root.replaceAll("'", "''")}').Sddl`,
        "utf16le",
      ).toString("base64"),
    ],
    { encoding: "utf8" },
  ).trim();
const sddlBefore = parentSddl();
let currentOwner = "'S-1-5-32-544'";
let currentDacl = "('D:PAI(A;OICI;FA;;;'+$user.Value+')')";
const writes = [];
childProcess.execFileSync = (exe, args, options) => {
  const script = Buffer.from(args.at(-1), "base64").toString("utf16le");
  const literal = script.match(/\$p=('(?:[^']|'')*');/)[1];
  const path = literal.slice(1, -1).replaceAll("''", "'");
  const prefix = `
    $ErrorActionPreference='Stop';
    $user=[Security.Principal.WindowsIdentity]::GetCurrent().User;
    $descriptor=[Security.AccessControl.DirectorySecurity]::new();
    $descriptor.SetSecurityDescriptorSddlForm(('O:'+${currentOwner}+'G:BA'+${currentDacl}));
    function Get-Acl { param($LiteralPath) return $script:descriptor }
    function Set-Acl { param($LiteralPath,$AclObject) $script:descriptor=$AclObject }
  `;
  const result = original(
    exe,
    [
      ...args.slice(0, -1),
      Buffer.from(prefix + script, "utf16le").toString("base64"),
    ],
    options,
  );
  if (script.includes("Set-Acl -LiteralPath")) writes.push(path);
  return result;
};
syncBuiltinESMExports();
try {
  const { Measurement } = await import("../dist/observability/index.js");
  const { Storage } = await import("../dist/storage/index.js");
  const { privateDestination, createPrivateFile, privateExisting } =
    await import("../dist/observability/privacy.js");
  const mainStorage = new Storage(join(root, "fixture-main.sqlite"));
  mainStorage.close();

  // 1. Trusted owners ($user, S-1-5-18, S-1-5-32-544) accepted with private DACL,
  // including SQLite WAL/SHM creation, dynamic sidecar recreation and last-close reopen.
  currentDacl =
    "('D:PAI(A;OICI;FA;;;'+$user.Value+')(A;OICI;FA;;;SY)(A;OICI;FA;;;BA)')";
  currentOwner = "'S-1-5-32-544'";
  const dbPath = join(root, "trusted-admin", "measurement.sqlite");
  const m1 = new Measurement(dbPath, mainStorage.path);
  const attemptId = "00000000-0000-4000-8000-000000000003";
  const projectId = "00000000-0000-4000-8000-000000000010";
  m1.start({
    projectId,
    attemptId,
    eventId: "00000000-0000-4000-8000-000000000023",
    taskId: "fixture-admin",
    sessionId: "00000000-0000-4000-8000-000000000030",
    mode: "synthetic",
  });
  assert.equal(existsSync(dbPath + "-wal"), true);
  assert.equal(existsSync(dbPath + "-shm"), true);
  for (const ownerExpr of ["$user.Value", "'S-1-5-18'", "'S-1-5-32-544'"]) {
    currentOwner = ownerExpr;
    assert.equal(privateDestination(dbPath), dbPath);
  }
  const m2 = new Measurement(dbPath, mainStorage.path);
  assert.equal(m2.report({ projectId }).attempts, 1);
  m2.close();
  m1.close();
  const m3 = new Measurement(dbPath, mainStorage.path);
  assert.equal(m3.report({ projectId }).attempts, 1);
  m3.close();

  // 2. Untrusted owners rejected fail-closed without repair.
  const untrustedDir = join(root, "untrusted-owner");
  mkdirSync(untrustedDir);
  const untrustedFile = join(untrustedDir, "measurement.sqlite");
  writeFileSync(untrustedFile, "", { mode: 0o600 });
  const writesBeforeUntrusted = writes.length;
  for (const badOwner of [
    "'S-1-1-0'",
    "'S-1-5-32-545'",
    "'S-1-5-21-999999999-1-1-1001'",
  ]) {
    currentOwner = badOwner;
    currentDacl = "('D:PAI(A;OICI;FA;;;'+$user.Value+')')";
    assert.throws(() => privateDestination(untrustedFile), {
      code: "MEASUREMENT_PRIVACY",
    });
  }
  assert.equal(
    writes.length,
    writesBeforeUntrusted,
    "Untrusted owner must never be repaired",
  );

  // 3. Broad Allow ACEs (Everyone, Users, third-party SID) and missing User Allow rejected.
  currentOwner = "'S-1-5-32-544'";
  for (const badDacl of [
    "('D:PAI(A;OICI;FA;;;'+$user.Value+')(A;OICI;FR;;;WD)')",
    "('D:PAI(A;OICI;FA;;;'+$user.Value+')(A;OICI;FR;;;BU)')",
    "('D:PAI(A;OICI;FA;;;'+$user.Value+')(A;OICI;FA;;;S-1-5-21-999999999-1-1-1001)')",
    "('D:PAI(A;OICI;FA;;;BA)(A;OICI;FA;;;SY)')",
  ]) {
    currentDacl = badDacl;
    assert.throws(() => privateExisting(untrustedFile, false), {
      code: "MEASUREMENT_PRIVACY",
    });
  }
  assert.equal(
    writes.length,
    writesBeforeUntrusted,
    "Unsafe DACL must never be repaired",
  );

  // 4. Newly created dedicated leaf directory receives ACL initialization; existing files do not.
  currentOwner = "'S-1-5-32-544'";
  currentDacl = "('D:PAI(A;OICI;FA;;;'+$user.Value+')')";
  const leafFile = privateDestination(
    join(root, "owner-fixture", "measurement.sqlite"),
  );
  createPrivateFile(leafFile);
  assert.ok(writes.includes(join(root, "owner-fixture")));
  assert.ok(!writes.includes(leafFile));
  assert.equal(parentSddl(), sddlBefore, "Parent SDDL must remain unchanged");

  process.stdout.write(
    JSON.stringify({
      modeledDescriptorPolicy: true,
      trustedOwnersAccepted: ["user", "S-1-5-18", "S-1-5-32-544"],
      walShmLifecycleReopen: true,
      untrustedOwnerRejectedWithoutRepair: true,
      broadAceRejectedWithoutRepair: true,
      parentSddlUnchanged: true,
    }) + "\n",
  );
} finally {
  childProcess.execFileSync = original;
  syncBuiltinESMExports();
}
