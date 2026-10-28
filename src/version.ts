import { readFileSync } from "node:fs";

// Resolve from the module, not caller cwd. Read only when reporting a version,
// so importing retrieval code does not open unrelated package metadata.
export function getPackageVersion(): string {
  return JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  ).version;
}
