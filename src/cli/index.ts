#!/usr/bin/env node
import { Measurement } from "../observability/index.js";
import { adminSchemas } from "../observability/schemas.js";
import { lstatSync } from "node:fs";
import { assertLocalPath } from "../security/index.js";
import { backupDatabase, restoreDatabase } from "../storage/backup.js";
import { AppError } from "../security/index.js";
import { Service } from "../core/service.js";
import { Storage } from "../storage/index.js";
import { startMcp } from "../mcp/index.js";
import { failure } from "../security/index.js";
const args = process.argv.slice(2);
function take(name: string) {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  const v = args[i + 1];
  if (!v || v.startsWith("--")) throw new Error("Missing option value");
  args.splice(i, 2);
  return v;
}
try {
  const db = take("--db");
  const measurementDb = take("--measurement-db");
  if (
    measurementDb &&
    db &&
    assertLocalPath(measurementDb) === assertLocalPath(db)
  )
    throw new AppError(
      "MEASUREMENT_PATH",
      "Separate measurement database required.",
    );
  if (args[0] === "measurement_restore") {
    if (!db || !measurementDb || args.length !== 3 || args[2] !== "--confirm")
      throw new AppError(
        "CONFIRMATION_REQUIRED",
        "Use --db KNOWLEDGE --measurement-db NEW_PATH measurement_restore EXPORT --confirm.",
      );
    if (!lstatSync(assertLocalPath(db)).isFile())
      throw new AppError("INVALID_REQUEST", "Knowledge database must exist.");
    const knowledge = new Storage(db);
    try {
      const roots = knowledge.db
        .prepare("SELECT path FROM projects")
        .all()
        .map((r) => String(r.path));
      process.stdout.write(
        JSON.stringify({
          ok: true,
          data: Measurement.restore(
            args[1]!,
            measurementDb,
            knowledge.path,
            roots,
          ),
        }) + "\n",
      );
    } finally {
      knowledge.close();
    }
  } else if (args[0] === "restore") {
    if (args.length !== 3 || !db || args[2] !== "--confirm")
      throw new AppError(
        "CONFIRMATION_REQUIRED",
        "Use --db NEW_PATH restore BACKUP --confirm.",
      );
    const result = await restoreDatabase(args[1]!, db);
    process.stdout.write(JSON.stringify({ ok: true, data: result }) + "\n");
  } else if (args[0] === "backup") {
    if (args.length !== 2 || !db)
      throw new AppError(
        "INVALID_REQUEST",
        "Use --db EXISTING_PATH backup NEW_SNAPSHOT.",
      );
    if (!lstatSync(assertLocalPath(db)).isFile())
      throw new AppError("INVALID_BACKUP", "Source database must exist.");
    const storage = new Storage(db);
    try {
      process.stdout.write(
        JSON.stringify({
          ok: true,
          data: await backupDatabase(storage, args[1]!),
        }) + "\n",
      );
    } finally {
      storage.close();
    }
  } else {
    const service = new Service(new Storage(db), { measurementDb });
    if (args[0] === "mcp" && args[1] === "stdio") {
      await startMcp(service);
    } else {
      const projectId = take("--project");
      const tokens = take("--tokens");
      const limit = take("--limit");
      const flag = (name: string) => {
        const i = args.indexOf(name);
        if (i < 0) return false;
        args.splice(i, 1);
        return true;
      };
      const includeGlobal = flag("--include-global");
      const authorizeIngestion = flag("--authorize-ingestion");
      const confirm = flag("--confirm");
      const dryRun = flag("--dry-run");
      let op = args.shift() ?? "doctor";
      let input: unknown = {};
      if (op === "project" && args[0] === "add") {
        args.shift();
        op = "project_register";
        input = { path: args.shift(), authorizeIngestion };
      } else if (op === "ingest") {
        op = "project_ingest";
        input = { projectId: projectId ?? args.shift() };
      } else if (op === "search") {
        op = "memory_search";
        input = {
          projectId,
          query: args.shift() ?? "",
          includeGlobal,
          ...(tokens ? { tokenBudget: Number(tokens) } : {}),
          ...(limit ? { limit: Number(limit) } : {}),
        };
      } else if (op === "update") {
        op = "memory_update";
        input = { projectId, id: args.shift(), content: args.shift() };
      } else if (op === "get") {
        op = "memory_get";
        input = { projectId, id: args.shift(), includeGlobal };
      } else if (op === "stats") {
        op = "memory_stats";
        input = { projectId };
      } else if (op === "delete") {
        op = "memory_delete";
        input = { projectId, id: args.shift(), confirm };
      } else if (op === "project-delete") {
        op = "project_delete";
        input = { projectId: projectId ?? args.shift(), confirm };
      } else if (op === "store") {
        op = "memory_store";
        input = { projectId, content: args.shift() };
      } else if (op === "feedback") {
        op = "memory_feedback";
        input = JSON.parse(args.shift() ?? "{}");
      } else if (args.length) {
        input = JSON.parse(args.shift()!);
      }
      if (args.length) throw new Error("Unexpected arguments");
      let result: unknown;
      if (Object.hasOwn(adminSchemas, op)) {
        if (op === "measurement_delete" && !confirm)
          throw new AppError(
            "CONFIRMATION_REQUIRED",
            "Use --confirm for administrative deletion.",
          );
        if (
          op === "measurement_prune" &&
          (input as { dryRun?: boolean }).dryRun === false &&
          !confirm
        )
          throw new AppError(
            "CONFIRMATION_REQUIRED",
            "Use --confirm for administrative pruning.",
          );
        if (!service.measurement)
          throw new AppError(
            "MEASUREMENT_DISABLED",
            "Configure measurement at trusted startup.",
          );
        const data = adminSchemas[op as keyof typeof adminSchemas].parse({
          ...(input as object),
          ...(confirm ? { confirm: true } : {}),
          ...(op === "measurement_prune" && dryRun ? { dryRun: true } : {}),
        });
        service.project(data.projectId);
        if (op === "measurement_export")
          result = { ok: true, data: service.measurement.export(data) };
        if (op === "measurement_delete")
          result = { ok: true, data: service.measurement.delete(data) };
        if (op === "measurement_prune")
          result = { ok: true, data: service.measurement.prune(data) };
      } else
        result = await service.call(op, input, {
          onCapture: (status) =>
            process.stderr.write(
              JSON.stringify({ measurement: status }) + "\n",
            ),
        });
      const response = result as {
        ok: boolean;
        data?: { healthy?: boolean };
      };
      process.stdout.write(JSON.stringify(response) + "\n");
      service.close();
      if (!response.ok || response.data?.healthy === false)
        process.exitCode = 1;
    }
  }
} catch (e) {
  process.stderr.write(JSON.stringify(failure(e)) + "\n");
  process.exitCode = 1;
}
