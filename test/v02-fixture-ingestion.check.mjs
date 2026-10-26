import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { Service, Storage } from "../dist/index.js";

// Exercise the generated fixture, including its own untracked MCP config.
// Only this new synthetic directory is written; retained host evidence is untouched.
test("generated host fixture imports only architecture within its two-candidate bound", async () => {
  const manifest = JSON.parse(
    execFileSync(
      "python3",
      [
        new URL("../scripts/v02-host-fixture.py", import.meta.url).pathname,
        "prepare",
        "--node",
        process.execPath,
      ],
      { encoding: "utf8" },
    ),
  );
  const storage = new Storage(manifest.db);
  const service = new Service(storage);
  try {
    const prompt = readFileSync(`${manifest.directory}/session-1.txt`, "utf8");
    assert.match(prompt, /includes=\["architecture.md"\]/);
    assert.match(prompt, /maxFiles=2/);
    assert.match(prompt, /maxBytes=10000/);
    const registered = await service.call("project_register", {
      path: manifest.projects[0],
      authorizeIngestion: true,
    });
    assert.equal(registered.ok, true, JSON.stringify(registered));
    const options = {
      projectId: registered.data.id,
      includes: ["architecture.md"],
      maxCommits: 0,
      maxFiles: 2,
      maxBytes: 10000,
    };
    const limited = await service.call("project_ingest", {
      ...options,
      maxFiles: 1,
    });
    assert.equal(limited.error.code, "INGEST_LIMIT");
    const first = await service.call("project_ingest", options);
    assert.equal(first.ok, true, JSON.stringify(first));
    assert.equal(first.data.files, 2);
    assert.equal(first.data.inserted, 1);
    assert.equal(first.data.skipped, 1);
    const second = await service.call("project_ingest", options);
    assert.equal(second.ok, true, JSON.stringify(second));
    assert.equal(second.data.inserted, 0);
    assert.equal(second.data.unchanged, 1);
  } finally {
    storage.close();
    rmSync(manifest.directory, { recursive: true, force: true });
  }
});
