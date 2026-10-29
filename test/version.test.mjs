import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getPackageVersion } from "../dist/version.js";

test("runtime and lockfile versions follow package metadata", () => {
  const read = (path) =>
    JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
  const pkg = read("../package.json");
  const lock = read("../package-lock.json");
  assert.match(
    pkg.version,
    /^\d+\.\d+\.\d+(?:-[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?$/,
  );
  assert.equal(getPackageVersion(), pkg.version);
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[""].version, pkg.version);
});
