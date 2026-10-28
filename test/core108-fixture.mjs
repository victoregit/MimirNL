import assert from "node:assert/strict";
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { pinnedSourceFixture } from "./pinned-source-fixture.mjs";

// ABC's frozen exporter intentionally rejects changes to Core108, including
// package version plumbing. Test current tooling with the actual historical
// engine in an isolated pinned Git fixture, never by blessing new source hashes.
export function core108Fixture(currentRoot) {
  const root = pinnedSourceFixture(currentRoot);
  const tar = readFileSync(
    join(
      currentRoot,
      "docs/benchmarks/v03/evidencias/task103-executed-snapshot.tar",
    ),
  );
  assert.equal(
    createHash("sha256").update(tar).digest("hex"),
    "f37365350929052e21eee560f9de13d35e93ff563e819a19579b90efb1abec80",
  );
  // This is a fixed, hash-checked regular-file tar. Validate every header before
  // writing only source/build members, rejecting links, traversal and duplicates.
  const seen = new Set();
  for (let offset = 0; offset + 512 <= tar.length; ) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const field = (start, end) =>
      header.subarray(start, end).toString("utf8").replace(/\0.*$/s, "");
    const size = Number.parseInt(field(124, 136).trim(), 8);
    assert.ok(Number.isSafeInteger(size) && size >= 0);
    const start = offset + 512;
    assert.ok(start + size <= tar.length);
    offset = start + Math.ceil(size / 512) * 512;
    // Python's historical archive uses PAX only for fractional mtime. Never
    // accept path/link overrides or extract metadata pseudo-members.
    if (field(156, 157) === "x") {
      assert.match(
        tar.subarray(start, start + size).toString("utf8"),
        /^\d+ mtime=\d+(?:\.\d+)?\n$/,
      );
      continue;
    }
    const path = field(0, 100);
    assert.match(path, /^[\w.\-/]+$/);
    assert.ok(
      path.split("/").every((part) => part && part !== "." && part !== ".."),
    );
    assert.ok(!seen.has(path));
    seen.add(path);
    assert.ok(["", "0"].includes(field(156, 157)));
    assert.equal(field(345, 500), "");
    if (/^(src|dist)\//.test(path)) {
      const destination = join(root, path);
      mkdirSync(join(destination, ".."), { recursive: true });
      writeFileSync(destination, tar.subarray(start, start + size));
    }
  }
  // Current tools retain the Windows path/security fixes. Public inputs and
  // dependencies are copied explicitly; no private evaluator or user Git config.
  for (const tree of [
    "scripts/benchmarks",
    "docs/benchmarks/v03",
    "node_modules/zod",
  ])
    cpSync(join(currentRoot, tree), join(root, tree), { recursive: true });
  return root;
}
