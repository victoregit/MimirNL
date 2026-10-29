import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, openSync, closeSync } from "node:fs";
import { dirname, join } from "node:path";
import { AppError, assertLocalPath } from "../security/index.js";
function reject(): never {
  throw new AppError(
    "MEASUREMENT_PRIVACY",
    "Private dedicated measurement destination required.",
  );
}
// Only a newly created dedicated leaf receives ACL changes. Existing parents
// are inspected, never repaired. ACL inspection uses SIDs, independent of locale.
function windowsAcl(path: string, create: boolean) {
  const literal = "'" + path.replaceAll("'", "''") + "'";
  const script = `$ErrorActionPreference='Stop'; $p=${literal}; $sid=[System.Security.Principal.WindowsIdentity]::GetCurrent().User; ${create ? `$acl=Get-Acl -LiteralPath $p; $acl.SetAccessRuleProtection($true,$false); $rule=New-Object System.Security.AccessControl.FileSystemAccessRule($sid,'FullControl','ContainerInherit,ObjectInherit','None','Allow'); $acl.AddAccessRule($rule); Set-Acl -LiteralPath $p -AclObject $acl;` : ""}
 $acl=Get-Acl -LiteralPath $p; if($acl.GetOwner([System.Security.Principal.SecurityIdentifier]).Value -ne $sid.Value){throw 'owner'}; foreach($r in $acl.GetAccessRules($true,$true,[System.Security.Principal.SecurityIdentifier])){if($r.AccessControlType -eq 'Allow' -and $r.IdentityReference.Value -notin @($sid.Value,'S-1-5-18','S-1-5-32-544')){throw 'broad'}}; if(-not ($acl.GetAccessRules($true,$true,[System.Security.Principal.SecurityIdentifier]) | Where-Object {$_.IdentityReference.Value -eq $sid.Value -and $_.AccessControlType -eq 'Allow'})){throw 'missing'};`;
  try {
    execFileSync(
      join(
        process.env.SystemRoot ?? "C:\\Windows",
        "System32",
        "WindowsPowerShell",
        "v1.0",
        "powershell.exe",
      ),
      [
        "-NoProfile",
        "-NonInteractive",
        "-EncodedCommand",
        Buffer.from(script, "utf16le").toString("base64"),
      ],
      { stdio: "ignore", timeout: 30000 },
    );
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ETIMEDOUT")
      throw new AppError(
        "MEASUREMENT_ACL_TIMEOUT",
        "Native ACL validation timed out.",
      );
    reject();
  }
}
export function privateExisting(path: string, directory: boolean) {
  const s = lstatSync(assertLocalPath(path));
  if (
    s.isSymbolicLink() ||
    (directory ? !s.isDirectory() : !s.isFile() || s.nlink !== 1)
  )
    reject();
  if (process.platform === "win32") windowsAcl(path, false);
  else if (
    (s.mode & 0o777) !== (directory ? 0o700 : 0o600) ||
    s.uid !== process.getuid?.()
  )
    reject();
}
export function privateDestination(path: string): string {
  const p = assertLocalPath(path),
    parent = dirname(p);
  if (!existsSync(parent)) {
    // Recursive creation would silently take ownership of an unrelated hierarchy.
    mkdirSync(parent, { mode: 0o700 });
    if (process.platform === "win32") windowsAcl(parent, true);
  }
  privateExisting(parent, true);
  for (const suffix of ["", "-wal", "-shm"]) {
    const file = p + suffix;
    assertLocalPath(file);
    if (existsSync(file)) privateExisting(file, false);
  }
  return p;
}
export function createPrivateFile(path: string) {
  closeSync(openSync(path, "wx", 0o600));
  privateExisting(path, false);
}
