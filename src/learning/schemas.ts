import * as z from "zod/v4";
import { sensitivePath } from "../security/index.js";
const text = z.string().min(1).max(4000);
const label = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.+-]{0,127}$/);
export const digest = z.string().regex(/^[a-f0-9]{64}$/);
const version = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const missing = z.enum([
  "not_collected",
  "not_available",
  "not_applicable",
  "unknown",
]);
export const sourceSchema = z
  .object({
    reference: z
      .string()
      .min(1)
      .max(240)
      .refine(
        (p) =>
          !p.split(/[\\/]/).includes("..") &&
          !/^(?:[a-z]:|[\\/])/i.test(p) &&
          !sensitivePath(p),
        "Use a non-sensitive project-relative or opaque reference",
      ),
    commit: z
      .string()
      .regex(/^[a-f0-9]{40}$/)
      .nullable(),
    hash: digest.nullable(),
    version: version.nullable(),
    verification: z.enum([
      "agent_reported",
      "test_reported",
      "human_reported",
      "unknown",
    ]),
    sourceVersionKnown: z.boolean(),
    reason: missing.nullable(),
  })
  .strict()
  .superRefine((s, c) => {
    if (
      s.sourceVersionKnown &&
      s.commit === null &&
      s.hash === null &&
      s.version === null
    )
      c.addIssue({
        code: "custom",
        message: "Known source version requires commit/hash/version",
      });
    if (!s.sourceVersionKnown && s.reason === null)
      c.addIssue({
        code: "custom",
        message: "Unknown source version requires reason",
      });
  });
export const experienceSchema = z
  .object({
    schemaVersion: z.literal(1),
    problem: text,
    environment: z
      .object({
        platform: label.nullable(),
        runtime: label.nullable(),
        tool: label.nullable(),
        reason: missing.nullable(),
      })
      .strict()
      .superRefine((e, c) => {
        if (
          [e.platform, e.runtime, e.tool].some((x) => x === null) &&
          e.reason === null
        )
          c.addIssue({
            code: "custom",
            message: "Unknown environment requires reason",
          });
      }),
    action: text,
    observedResult: text,
    tests: z
      .array(
        z
          .object({
            reference: z.string().uuid(),
            status: z.enum(["pass", "fail", "not_run", "unknown"]),
            evidenceRefs: z.array(z.string().uuid()).max(20),
          })
          .strict(),
      )
      .max(30),
    sources: z.array(sourceSchema).max(20),
    confidence: z
      .object({
        value: z.number().finite().min(0).max(1).nullable(),
        reason: missing.nullable(),
      })
      .strict()
      .superRefine((v, c) => {
        if (v.value === null && v.reason === null)
          c.addIssue({
            code: "custom",
            message: "Missing confidence requires reason",
          });
      }),
    identity: z
      .object({
        requestedModel: label.nullable(),
        observedModel: z.null(),
        observedModelReason: missing,
        actorKind: z.enum(["agent", "test", "human"]),
        actorRef: z.string().uuid(),
        provenance: z.literal("provided"),
      })
      .strict(),
  })
  .strict();
export const assessmentSchema = z
  .object({
    schemaVersion: z.literal(1),
    actorKind: z.enum(["agent", "test", "human"]),
    actorRef: z.string().uuid(),
    judgment: z.enum(["helpful", "useless", "harmful", "unassessed"]),
    evidenceRefs: z.array(z.string().uuid()).max(20),
    testStatus: z.enum(["pass", "fail", "not_run", "unknown"]),
    sourceVersionKnown: z.boolean(),
    sourceRefs: z.array(sourceSchema).max(20),
  })
  .strict()
  .superRefine((a, c) => {
    if (
      a.sourceVersionKnown &&
      (!a.sourceRefs.length || a.sourceRefs.some((s) => !s.sourceVersionKnown))
    )
      c.addIssue({
        code: "custom",
        message: "Known sources require versioned references",
      });
  });
export const reviewSchema = z
  .object({
    state: z.enum(["pending", "in_review", "decided"]),
    subjectVersion: version,
    subjectHash: digest,
    decision: z.enum(["verified", "rejected", "deprecated"]).nullable(),
    authorization: z.enum([
      "none",
      "legacy_explicit_flag",
      "explicit_version_consent",
      "status_action",
    ]),
    actorKind: z.enum(["agent", "test", "human", "unknown"]),
    actorRef: z.string().uuid().nullable(),
    evidenceRefs: z.array(z.string().uuid()).max(20),
    at: z.iso.datetime(),
  })
  .strict();
export const learningSchema = z
  .object({
    schemaVersion: z.literal(1),
    review: reviewSchema.nullable(),
    assessments: z
      .array(
        z
          .object({
            assessment: assessmentSchema,
            memoryVersion: version,
            memoryHash: digest,
            at: z.iso.datetime(),
            provenance: z.literal("provided"),
          })
          .strict(),
      )
      .max(100),
  })
  .strict();
export function parseLearning(value: unknown): z.infer<typeof learningSchema> {
  const raw = typeof value === "string" ? JSON.parse(value) : value;
  if (
    raw &&
    typeof raw === "object" &&
    !Array.isArray(raw) &&
    Object.keys(raw).length === 0
  )
    return { schemaVersion: 1, review: null, assessments: [] };
  return learningSchema.parse(raw);
}
export function pendingLearning(subjectVersion: number, subjectHash: string) {
  return learningSchema.parse({
    schemaVersion: 1,
    review: {
      state: "pending",
      subjectVersion,
      subjectHash,
      decision: null,
      authorization: "none",
      actorKind: "unknown",
      actorRef: null,
      evidenceRefs: [],
      at: new Date().toISOString(),
    },
    assessments: [],
  });
}
export const reviewRequest = z
  .object({
    projectId: z.string().uuid(),
    id: z.string().uuid(),
    action: z.enum(["begin", "decide"]),
    expectedVersion: version,
    expectedHash: digest,
    actorKind: z.enum(["agent", "test", "human"]),
    actorRef: z.string().uuid(),
    decision: z.enum(["verified", "rejected", "deprecated"]).optional(),
    explicitHumanConsent: z.boolean().default(false),
    evidenceRefs: z.array(z.string().uuid()).max(20).default([]),
  })
  .strict();
