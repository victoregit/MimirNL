import {
  lstatSync,
  realpathSync,
  readFileSync,
  openSync,
  closeSync,
  fstatSync,
  constants,
  mkdirSync,
  writeFileSync,
  renameSync,
  rmSync,
  chmodSync,
} from "node:fs";
import { isAbsolute, join, parse, sep, dirname } from "node:path";
import { fail, portable } from "./public-bundle.mjs";

// Validate native filesystem components before normalization can erase traversal.
// Repository paths still use portable() directly and retain their strict grammar.
export function localPath(path) {
  if (typeof path !== "string" || !isAbsolute(path)) fail();
  if (process.platform === "win32" && !/^[a-z]:[\\/]/i.test(path)) fail();
  const tail = path.slice(parse(path).root.length);
  if (!tail) fail();
  const parts =
    process.platform === "win32" ? tail.split(/[\\/]/) : tail.split(sep);
  for (const part of parts) portable(part);
  return parts;
}
// Walk every component; neither an explicit input nor a parent may be a symlink.
export function safePath(path) {
  const parts = localPath(path);
  let current = parse(path).root;
  for (const part of parts) {
    current = join(current, part);
    const st = lstatSync(current);
    if (st.isSymbolicLink()) fail();
  }
  return path;
}
// Native aliases (notably Windows 8.3 names) must identify exactly the same
// directory. Validate both spellings before realpath can erase unsafe components,
// then validate expanded names too so an alias cannot hide a sensitive component.
export function sameDirectory(left, right) {
  safePath(left);
  safePath(right);
  const a = realpathSync.native(left);
  const b = realpathSync.native(right);
  safePath(a);
  safePath(b);
  return a === b && lstatSync(a).isDirectory();
}
export function readExplicit(path) {
  let fd;
  try {
    safePath(path);
    fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    const st = fstatSync(fd);
    if (!st.isFile() || st.size > 16000000) fail();
    const bytes = readFileSync(fd);
    const text = bytes.toString("utf8");
    if (!Buffer.from(text).equals(bytes)) fail();
    return text;
  } catch {
    fail();
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}
export function writePrivate(path, value) {
  try {
    writeFileSync(path, JSON.stringify(value, null, 2) + "\n", {
      flag: "wx",
      mode: 0o600,
    });
  } catch {
    fail();
  }
}
// Publish one complete JSON atomically inside an exclusively owned directory.
// Cleanup is limited to this invocation's directory, never a preexisting path.
export function outputDirectory(out, name, value) {
  let owned = false;
  try {
    if (
      typeof out !== "string" ||
      !isAbsolute(out) ||
      !/^[a-z][a-z0-9-]*\.json$/.test(name)
    )
      fail();
    localPath(out);
    safePath(dirname(out));
    mkdirSync(out, { mode: 0o700 });
    owned = true;
    chmodSync(out, 0o700);
    writePrivate(join(out, "pending.json"), value);
    renameSync(join(out, "pending.json"), join(out, name));
    return out;
  } catch {
    if (owned) rmSync(out, { recursive: true, force: true });
    fail();
  }
}
