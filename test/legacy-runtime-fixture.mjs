import { mkdirSync, writeFileSync, symlinkSync } from "node:fs";
import { join, resolve } from "node:path";
import ts from "typescript";
import { fixtureGit } from "./git-fixture.mjs";
// Read only pinned public engine source. Compile with the existing toolchain;
// no installation, hooks, model calls, private artifacts or real DBs are used.
export function legacyRuntime(root) {
  const pin = "86318afd8ba7eec6744ff5da396e5aaafc42ffa5";
  const files = [
    "cli/index",
    "core/schemas",
    "core/service",
    "index",
    "ingestion/adapters/git",
    "learning/index",
    "mcp/index",
    "optimization/index",
    "retrieval/index",
    "security/index",
    "storage/backup",
    "storage/index",
    "version",
  ];
  mkdirSync(root, { recursive: true });
  const read = (name) =>
    fixtureGit(["-C", resolve("."), "show", pin + ":" + name]).toString();
  writeFileSync(join(root, "package.json"), read("package.json"));
  symlinkSync(
    resolve("node_modules"),
    join(root, "node_modules"),
    process.platform === "win32" ? "junction" : "dir",
  );
  for (const file of files) {
    const output = ts.transpileModule(read("src/" + file + ".ts"), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2023,
        module: ts.ModuleKind.ESNext,
      },
    }).outputText;
    const dest = join(root, "dist", file + ".js");
    mkdirSync(resolve(dest, ".."), { recursive: true });
    writeFileSync(dest, output);
  }
  return join(root, "dist", "cli", "index.js");
}
