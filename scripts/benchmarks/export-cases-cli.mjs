import { pathToFileURL } from "node:url";
import { exportFiles } from "./export-cases.mjs";
export function main(args) {
  if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
    console.log(
      "Usage: export-cases-cli.mjs --expanded ABS --legacy ABS --protocol ABS --root ABS --out NEW-ABS-DIR. Offline only.",
    );
    return 0;
  }
  try {
    const options = {};
    if (args.length !== 10) throw Error();
    for (let i = 0; i < args.length; i += 2) {
      const key = args[i].slice(2);
      if (
        !["--expanded", "--legacy", "--protocol", "--root", "--out"].includes(
          args[i],
        ) ||
        Object.hasOwn(options, key) ||
        !args[i + 1]
      )
        throw Error();
      options[key] = args[i + 1];
    }
    console.log(JSON.stringify(exportFiles(options)));
    return 0;
  } catch {
    console.error("Offline export failed.");
    return 1;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = main(process.argv.slice(2));
