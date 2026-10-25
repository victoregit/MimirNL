import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Service, Storage } from "../dist/index.js";
import { fixtureGit } from "./git-fixture.mjs";

test("canonical Git roots preserve identity across native path spellings", async () => {
  const root = mkdtempSync(join(tmpdir(), "mimir-canonical-"));
  const repo = join(root, "MixedCaseRepo");
  mkdirSync(repo);
  fixtureGit(["init", "-q", repo]);
  writeFileSync(join(repo, "guide.md"), "canonical root fixture");
  const service = new Service(new Storage(join(root, "memory.sqlite")));
  const register = (path) =>
    service.call("project_register", { path, authorizeIngestion: true });
  try {
    const first = await register(repo);
    assert.equal(first.ok, true, JSON.stringify(first));
    assert.equal(first.data.path, realpathSync.native(repo));
    const spellings = [repo + "/", repo.replaceAll("\\", "/")];
    if (process.platform === "win32") {
      // The JS realpath implementation preserves input case; Git normalizes it.
      spellings.push(repo[0].toLowerCase() + repo.slice(1), repo.toUpperCase());
    }
    for (const spelling of spellings) {
      const result = await register(spelling);
      assert.equal(result.ok, true, JSON.stringify({ spelling, result }));
      assert.equal(result.data.id, first.data.id);
      assert.equal(result.data.path, first.data.path);
    }
    // A root alias still resolves to the same authorized filesystem identity.
    const alias = join(root, "root-alias");
    symlinkSync(repo, alias, process.platform === "win32" ? "junction" : "dir");
    const aliased = await register(alias);
    assert.equal(aliased.ok, true, JSON.stringify(aliased));
    assert.equal(aliased.data.id, first.data.id);
    const ingest = await service.call("project_ingest", {
      projectId: first.data.id,
      maxCommits: 0,
    });
    assert.equal(ingest.ok, true, JSON.stringify(ingest));
    assert.equal(ingest.data.inserted, 1);

    const child = join(repo, "child");
    mkdirSync(child);
    const subdirectory = await register(child);
    assert.equal(subdirectory.ok, false);
    assert.equal(subdirectory.error.code, "UNSAFE_GIT");

    // Distinct real roots must never collapse to one authorized project.
    const other = join(
      root,
      process.platform === "win32" ? "OtherRepo" : "mixedcaserepo",
    );
    mkdirSync(other);
    fixtureGit(["init", "-q", other]);
    const second = await register(other);
    assert.equal(second.ok, true, JSON.stringify(second));
    assert.notEqual(second.data.id, first.data.id);
    assert.notEqual(second.data.path, first.data.path);

    const traversal = await service.call("project_ingest", {
      projectId: first.data.id,
      includes: ["../OtherRepo"],
    });
    assert.equal(traversal.ok, false);
    assert.equal(traversal.error.code, "INVALID_REQUEST");
    const sensitive = join(root, "credentials");
    mkdirSync(sensitive);
    fixtureGit(["init", "-q", sensitive]);
    const denied = await register(sensitive);
    assert.equal(denied.ok, false);
    assert.equal(denied.error.code, "UNSAFE_PATH");

    // Canonicalization must not authorize a linked Git metadata directory.
    const redirected = join(root, "redirected");
    mkdirSync(redirected);
    symlinkSync(
      join(repo, ".git"),
      join(redirected, ".git"),
      process.platform === "win32" ? "junction" : "dir",
    );
    const unsafe = await register(redirected);
    assert.equal(unsafe.ok, false);
    assert.equal(unsafe.error.code, "UNSAFE_GIT");
  } finally {
    service.close();
    rmSync(root, { recursive: true, force: true });
  }
});
