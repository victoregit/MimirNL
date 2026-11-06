import { after } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fixtureGit } from "./git-fixture.mjs";
import { PIN } from "../scripts/benchmarks/public-bundle.mjs";

// Historical exporters intentionally reject changed source files. Exercise them
// against an isolated pinned checkout while testing current runner code normally.
export function pinnedSourceFixture(root) {
  const dir = mkdtempSync(join(tmpdir(), "mimir-pinned-source-"));
  after(() => rmSync(dir, { recursive: true }));
  const repo = join(dir, "repo");
  fixtureGit(["clone", "--quiet", "--shared", "--no-checkout", root, repo]);
  fixtureGit(["-C", repo, "checkout", "--quiet", "--detach", PIN]);
  return repo;
}
