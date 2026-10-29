import {
  experienceSchema,
  assessmentSchema,
  reviewRequest,
  digest,
} from "../learning/schemas.js";
import * as z from "zod/v4";
import { measurementSchemas } from "../observability/schemas.js";
const id = z.string().uuid();
const projectId = { projectId: id };
const text = z.string().min(1).max(32000);
export const schemas = {
  ...measurementSchemas,
  memory_review: reviewRequest,
  init: z.object({}).strict(),
  project_register: z
    .object({
      path: z.string().min(1).max(4096),
      authorizeIngestion: z.literal(true),
    })
    .strict(),
  project_ingest: z
    .object({
      ...projectId,
      includes: z
        .array(
          z
            .string()
            .min(1)
            .max(200)
            .refine(
              (p) =>
                !p.split(/[\\/]/).includes("..") &&
                !/^(?:[a-z]:|[\\/])/i.test(p),
              "Use relative non-traversing paths",
            ),
        )
        .max(30)
        .default([]),
      excludes: z.array(z.string().min(1).max(200)).max(30).default([]),
      maxFiles: z.number().int().min(1).max(2000).default(500),
      maxBytes: z.number().int().min(100).max(5000000).default(1000000),
      maxCommits: z.number().int().min(0).max(100).default(20),
    })
    .strict(),
  memory_store: z
    .object({
      ...projectId,
      content: text,
      type: z
        .enum(["episodic", "semantic", "procedural", "project", "global"])
        .default("semantic"),
      origin: z.enum(["user", "execution"]).default("user"),
      source: z.string().max(4096).default("manual user input"),
    })
    .strict(),
  memory_update: z
    .object({
      ...projectId,
      id,
      content: text,
      source: z.string().max(4096).default("manual user correction"),
    })
    .strict(),
  memory_get: z
    .object({ ...projectId, id, includeGlobal: z.boolean().default(false) })
    .strict(),
  memory_search: z
    .object({
      ...projectId,
      query: z.string().max(1000),
      attemptId: z.string().uuidv4().optional(),
      type: z
        .enum(["episodic", "semantic", "procedural", "project", "global"])
        .optional(),
      status: z
        .enum(["candidate", "verified", "deprecated", "rejected"])
        .optional(),
      scope: z.enum(["project", "global"]).optional(),
      includeGlobal: z.boolean().default(false),
      limit: z.number().int().min(1).max(50).default(10),
      policy: z.enum(["legacy", "balanced-v1"]).default("legacy"),
      recency: z.enum(["off", "verified-ties-v1"]).default("off"),
      format: z.enum(["full", "compact-v1"]).default("full"),
      telemetry: z.boolean().default(false),
      tokenBudget: z.number().int().min(200).max(100000).default(4000),
    })
    .strict(),
  memory_feedback: z
    .object({
      ...projectId,
      id,
      action: z.enum([
        "approve",
        "deprecate",
        "reject",
        "promote",
        "relate",
        "supersede",
        "note",
      ]),
      note: z.string().max(4000).default(""),
      explicitApproval: z.boolean().default(false),
      expectedVersion: z.number().int().positive().optional(),
      expectedHash: digest.optional(),
      assessment: assessmentSchema.optional(),
      sharingApproval: z.boolean().default(false),
      relatedId: id.optional(),
      scope: z.enum(["project", "global"]).default("project"),
    })
    .strict(),
  experience_observe: z.union([
    z
      .object({ ...projectId, task: text, attempt: text, result: text })
      .strict(),
    z.object({ ...projectId, experience: experienceSchema }).strict(),
  ]),
  memory_stats: z.object({ ...projectId }).strict(),
  memory_delete: z
    .object({
      ...projectId,
      id,
      confirm: z.literal(true),
      scope: z.enum(["project", "global"]).default("project"),
      sharingApproval: z.boolean().default(false),
    })
    .strict(),
  project_delete: z.object({ ...projectId, confirm: z.literal(true) }).strict(),
  doctor: z.object({}).strict(),
};
export type Operation = keyof typeof schemas;
