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
// Owners and Allow ACEs share one trust set; no additional principal gains access.
// SQLite may recreate WAL/SHM with a privileged default TokenOwner.
// Only a newly created dedicated leaf receives ACL changes. Existing parents
// are inspected, never repaired. ACL inspection uses SIDs, independent of locale.
function windowsAcl(path: string, create: boolean) {
  const literal = "'" + path.replaceAll("'", "''") + "'";
  const psHome = join(
    process.env.SystemRoot ?? "C:\\Windows",
    "System32",
    "WindowsPowerShell",
    "v1.0",
  );
  // The fixed Windows PowerShell executable must load its own inbox module.
  // Inherited PSModulePath can otherwise select another edition's Security
  // module even with -NoProfile. Resolve from the child's trusted PSHOME.
  const script = `$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue'; $PSModuleAutoLoadingPreference='None'; Import-Module "$PSHOME\\Modules\\Microsoft.PowerShell.Security\\Microsoft.PowerShell.Security.psd1"; $p=${literal}; $sid=[System.Security.Principal.WindowsIdentity]::GetCurrent().User; $trusted=@($sid.Value,'S-1-5-18','S-1-5-32-544'); ${create ? `$acl=Get-Acl -LiteralPath $p; $acl.SetAccessRuleProtection($true,$false); $rule=[System.Security.AccessControl.FileSystemAccessRule]::new($sid,'FullControl','ContainerInherit,ObjectInherit','None','Allow'); $acl.AddAccessRule($rule); Set-Acl -LiteralPath $p -AclObject $acl;` : ""}
 $acl=Get-Acl -LiteralPath $p; if($acl.GetOwner([System.Security.Principal.SecurityIdentifier]).Value -notin $trusted){throw 'owner'}; $ok=$false; foreach($r in $acl.GetAccessRules($true,$true,[System.Security.Principal.SecurityIdentifier])){if($r.AccessControlType -eq 'Allow'){if($r.IdentityReference.Value -notin $trusted){throw 'broad'}; if($r.IdentityReference.Value -eq $sid.Value){$ok=$true}}}; if(-not $ok){throw 'missing'};`;
  try {
    execFileSync(
      join(psHome, "powershell.exe"),
      [
        "-NoProfile",
        "-NonInteractive",
        "-EncodedCommand",
        Buffer.from(script, "utf16le").toString("base64"),
      ],
      {
        stdio: "ignore",
        timeout: 30000,
        windowsHide: true,
        env: { ...process.env, PSModulePath: join(psHome, "Modules") },
      },
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
    else privateExisting(parent, true);
  } else privateExisting(parent, true);
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
