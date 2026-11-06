import { readFileSync, writeFileSync } from "node:fs";
import { schemas } from "../dist/index.js";
import * as z from "zod/v4";
import { format } from "prettier";
const path = new URL("../docs/mcp-schemas.json", import.meta.url);
const output = await format(
  JSON.stringify(
    Object.fromEntries(
      Object.entries(schemas).map(([name, schema]) => [
        name,
        z.toJSONSchema(schema),
      ]),
    ),
    null,
    2,
  ),
  { parser: "json" },
);
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== output)
    throw new Error("MCP schemas drift: run npm run docs:schemas");
} else writeFileSync(path, output);
