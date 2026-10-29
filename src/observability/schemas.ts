import * as z from "zod/v4";
export const uuid = z.string().uuidv4();
const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const duration = z.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const digest = z.string().regex(/^[a-f0-9]{64}$/);
const label = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$/);
export const reason = z.enum([
  "not_available",
  "not_collected",
  "not_applicable",
  "semantics_unconfirmed",
  "no_paired_control",
  "source_not_verified",
]);
export const identity = z
  .object({
    commit: z
      .string()
      .regex(/^[a-f0-9]{40}$/)
      .nullable()
      .default(null),
    dirtyHash: digest.nullable().default(null),
    requestedModel: label.nullable().default(null),
    observedModel: z.null().default(null),
    observedModelReason: reason.default("not_collected"),
    configHash: digest.nullable().default(null),
    promptHash: digest.nullable().default(null),
    configOrigin: z.enum(["provided", "unknown"]).default("unknown"),
  })
  .strict();
export const memoryRef = z
  .object({
    id: uuid,
    version: count.min(1),
    hash: digest,
    status: z.enum(["candidate", "verified", "deprecated", "rejected"]),
    scope: z.enum(["project", "global"]),
  })
  .strict();
const scope = { projectId: uuid, attemptId: uuid };
const base = {
  schemaVersion: z.literal(1).default(1),
  ...scope,
  eventId: uuid,
};
export const hostUsage = z
  .object({
    schemaVersion: z.literal(1).default(1),
    namespace: z.enum(["canonical", "ag_native"]),
    scope: z.enum(["turn", "session"]),
    scopeId: uuid,
    sessionId: uuid,
    collector: label,
    collectorVersion: label,
    semanticsConfirmed: z.boolean(),
    input: count.nullable(),
    output: count.nullable(),
    cachedInput: count.nullable(),
    total: count.nullable(),
    reason: reason.nullable(),
  })
  .strict()
  .superRefine((u, ctx) => {
    const invalid = (message: string) =>
      ctx.addIssue({ code: "custom", message });
    if (u.namespace === "canonical") {
      if (!u.semanticsConfirmed)
        invalid("Canonical semantics must be confirmed");
      const complete =
        u.input !== null &&
        u.output !== null &&
        u.cachedInput !== null &&
        u.total !== null;
      const absent = [u.input, u.output, u.cachedInput, u.total].every(
        (v) => v === null,
      );
      if (!complete && !absent)
        invalid("Canonical counters must be complete or all unknown");
      if (
        complete &&
        (u.cachedInput! > u.input! ||
          !Number.isSafeInteger(u.input! + u.output!) ||
          u.total !== u.input! + u.output!)
      )
        invalid("Inconsistent canonical counters");
    }
    if (
      [u.input, u.output, u.cachedInput, u.total].some((v) => v === null) &&
      u.reason === null
    )
      invalid("Missing counters require reason");
  });
export const externalEvent = z.discriminatedUnion("kind", [
  z
    .object({ ...base, kind: z.literal("host_usage"), usage: hostUsage })
    .strict(),
  z
    .object({
      ...base,
      kind: z.literal("memory_use"),
      memories: z.array(memoryRef).max(100),
      consulted: z.boolean(),
      usedReported: z.boolean(),
      sourceRefsVerified: z.boolean(),
      evidenceRefs: z.array(uuid).max(20),
      actorKind: z.literal("agent"),
      correlationStatus: z.enum(["matched", "missing", "unknown"]),
    })
    .strict()
    .superRefine((e, c) => {
      if ((e.usedReported || e.sourceRefsVerified) && !e.evidenceRefs.length)
        c.addIssue({ code: "custom", message: "Evidence reference required" });
    }),
  z
    .object({
      ...base,
      kind: z.literal("quality"),
      actorKind: z.enum(["agent", "test", "human"]),
      rating: z.enum(["helpful", "useless", "harmful", "unassessed"]),
      independentAssessment: z.enum(["reported", "unknown"]),
      evidenceRefs: z.array(uuid).max(20),
      adverseOutcome: z.enum([
        "none_reported",
        "regression_reported",
        "unknown",
      ]),
    })
    .strict(),
  z
    .object({
      ...base,
      kind: z.literal("call"),
      callId: uuid,
      operation: label,
      status: z.enum(["succeeded", "failed", "aborted", "not_run"]),
      cliElapsedMs: duration.nullable(),
      internalElapsedMs: duration.nullable(),
      contextBytes: count.nullable(),
      reason: reason.nullable(),
      requestHash: digest,
      errorCode: z.enum([
        "none",
        "local_failure",
        "invalid_request",
        "unknown",
      ]),
    })
    .strict()
    .superRefine((c, ctx) => {
      if (
        [c.cliElapsedMs, c.internalElapsedMs, c.contextBytes].some(
          (v) => v === null,
        ) &&
        c.reason === null
      )
        ctx.addIssue({
          code: "custom",
          message: "Missing measurements require reason",
        });
    }),
]);
export const internalSearch = z
  .object({
    ...base,
    kind: z.literal("search"),
    status: z.literal("succeeded"),
    callId: uuid,
    retrievalId: uuid,
    requestHash: digest,
    internalElapsedMs: duration,
    contextBytes: count,
    contentBytes: count,
    retrieved: count,
    delivered: count,
    memories: z.array(memoryRef).max(100),
    correlationStatus: z.literal("matched"),
  })
  .strict();
export const startSchema = z
  .object({
    ...base,
    taskId: label,
    sessionId: uuid,
    mode: z.enum(["real_use", "controlled_experiment", "synthetic"]),
    identity: identity.default(() => identity.parse({})),
    retryOf: uuid.optional(),
    retryReason: z.enum(["retry", "correction", "unknown"]).optional(),
    ttlDays: count.min(1).max(3650).default(30),
  })
  .strict();
export const finishSchema = z
  .object({
    ...base,
    status: z.enum(["succeeded", "failed", "aborted", "not_run"]),
    outcomeRefs: z.array(uuid).max(20).default([]),
    missingReasons: z.array(reason).max(20).default(["not_collected"]),
  })
  .strict();
export const reportSchema = z
  .object({
    projectId: uuid,
    attemptId: uuid.optional(),
    from: z.iso.datetime().optional(),
    to: z.iso.datetime().optional(),
  })
  .strict();
export const measurementSchemas = {
  measurement_start: startSchema,
  measurement_record: externalEvent,
  measurement_finish: finishSchema,
  measurement_report: reportSchema,
};
export const adminSchemas = {
  measurement_export: z
    .object({
      projectId: uuid,
      attemptIds: z.array(uuid).min(1).max(1000),
      destination: z.string().min(1).max(4096),
    })
    .strict(),
  measurement_delete: z
    .object({
      projectId: uuid,
      attemptIds: z.array(uuid).min(1).max(1000),
      confirm: z.literal(true),
    })
    .strict(),
  measurement_prune: z
    .object({
      projectId: uuid,
      dryRun: z.boolean().default(true),
      confirm: z.boolean().default(false),
      before: z.iso.datetime().optional(),
    })
    .strict(),
};
export type ExternalEvent = z.infer<typeof externalEvent>;
export type SearchEvent = z.infer<typeof internalSearch>;

export const internalFailure = z
  .object({
    schemaVersion: z.literal(1).default(1),
    projectId: uuid,
    attemptId: uuid,
    eventId: uuid,
    kind: z.literal("search_failure"),
    callId: uuid,
    requestHash: digest,
    internalElapsedMs: duration,
    status: z.literal("failed"),
    errorCode: z.literal("local_failure"),
  })
  .strict();

export type HostUsage = z.infer<typeof hostUsage>;
export type MeasurementAttempt = z.infer<typeof startSchema>;
export type MeasurementEvent = z.infer<typeof externalEvent>;
