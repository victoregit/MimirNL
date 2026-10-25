import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  existsSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, delimiter } from "node:path";
import { runNpm } from "../scripts/npm-cli.mjs";
import { spawnSync } from "node:child_process";

test("npm commands use the invoking CLI despite broken npm shims in cwd and PATH", () => {
  const root = mkdtempSync(join(tmpdir(), "mimir npm cli spaces "));
  try {
    const shadow = join(root, "shadow");
    mkdirSync(shadow);
    const marker = join(root, "wrong-npm-used");
    const shim =
      process.platform === "win32"
        ? '@echo off\r\necho broken>"%MIMIR_NPM_MARKER%"\r\nexit /b 97\r\n'
        : '#!/bin/sh\nprintf broken > "$MIMIR_NPM_MARKER"\nexit 97\n';
    for (const folder of [root, shadow]) {
      writeFileSync(
        join(folder, process.platform === "win32" ? "npm.cmd" : "npm"),
        shim,
        { mode: 0o700 },
      );
    }
    const env = Object.fromEntries(
      Object.entries(process.env).filter(
        ([key]) => key.toLowerCase() !== "path",
      ),
    );
    env.PATH =
      shadow + delimiter + (process.env.PATH ?? process.env.Path ?? "");
    env.MIMIR_NPM_MARKER = marker;
    // Establish that the old name-based lookup actually reaches the broken shim.
    const baseline =
      process.platform === "win32"
        ? spawnSync(
            process.env.ComSpec ?? "cmd.exe",
            ["/d", "/s", "/c", '""npm.cmd" "--version""'],
            { cwd: root, env, windowsVerbatimArguments: true },
          )
        : spawnSync("npm", ["--version"], { cwd: root, env });
    assert.equal(baseline.status, 97);
    assert.equal(existsSync(marker), true);
    rmSync(marker);
    const version = runNpm(["--version"], { cwd: root, env }).trim();
    assert.match(version, /^\d+\.\d+\.\d+$/);
    assert.equal(existsSync(marker), false);
    // Strip all casing variants: Windows environment keys are case insensitive,
    // and npm test must not let its inherited lifecycle path mask the fallback.
    const directEnv = Object.fromEntries(
      Object.entries(env).filter(
        ([key]) => key.toLowerCase() !== "npm_execpath",
      ),
    );
    assert.match(
      runNpm(["--version"], { cwd: root, env: directEnv }).trim(),
      /^\d+\.\d+\.\d+$/,
    );
    assert.equal(existsSync(marker), false);
    // An explicit lifecycle CLI takes priority even with broken PATH shims.
    const lifecycleCli = join(root, "lifecycle cli.cjs");
    writeFileSync(lifecycleCli, 'console.log("lifecycle-cli-selected");\n');
    assert.equal(
      runNpm(["--version"], {
        cwd: root,
        env: { ...directEnv, npm_execpath: lifecycleCli },
      }).trim(),
      "lifecycle-cli-selected",
    );
    assert.throws(
      () =>
        runNpm(["--version"], {
          env: { ...env, npm_execpath: "relative-cli.js" },
        }),
      /absolute/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
