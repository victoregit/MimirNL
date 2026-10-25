import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";

// npm lifecycle scripts identify the CLI that launched them. Invoke that file
// with the current Node instead of resolving another npm.cmd through PATH.
export function runNpm(args, options = {}) {
  const env = options.env ?? process.env;
  // Official Windows distributions keep npm beside node.exe; POSIX archives
  // install it under the prefix's lib directory, one level above bin/node.
  const nodeDir = dirname(process.execPath);
  const cli =
    env.npm_execpath ??
    [
      join(nodeDir, "node_modules", "npm", "bin", "npm-cli.js"),
      join(nodeDir, "..", "lib", "node_modules", "npm", "bin", "npm-cli.js"),
    ].find((candidate) => existsSync(candidate));
  if (cli === undefined)
    throw new Error(
      "Could not locate bundled npm CLI in the Node installation.",
    );
  if (!isAbsolute(cli))
    throw new Error("npm_execpath must be an absolute CLI path.");
  return execFileSync(process.execPath, [cli, ...args], {
    encoding: "utf8",
    timeout: 120000,
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}
