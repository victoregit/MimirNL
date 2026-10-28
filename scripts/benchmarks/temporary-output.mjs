import { mkdirSync, mkdtempSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { localPath, safePath } from "./offline-files.mjs";

// Resolve the configured system temp root and require an existing, non-symlink
// parent beneath it. relative() checks a component boundary, including drives.
export function temporaryOutput(path, prefix) {
  const temporary = realpathSync(tmpdir());
  if (!path) return mkdtempSync(join(temporary, prefix));
  const full = resolve(path);
  localPath(full);
  safePath(dirname(full));
  const parent = realpathSync(dirname(full));
  const delta = relative(temporary, parent);
  if (isAbsolute(delta) || delta === ".." || delta.startsWith(".." + sep))
    throw Error("Output must be under the system temporary directory");
  mkdirSync(full, { mode: 0o700 });
  return full;
}
