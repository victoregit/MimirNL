import * as z from "zod/v4";
import { AppError } from "../security/index.js";
const label = z.string().min(1).max(128);
const digest = z.string().regex(/^[a-f0-9]{64}$/);
export const memoryReference = z
  .object({
    id: z.string().uuid(),
    version: z.number().int().positive(),
    hash: digest,
  })
  .strict();
// Only stable three-component semver and one bounded, inclusive/exclusive interval.
// No prerelease, build, caret, tilde, wildcard, OR, coercion or floating-point ordering.
const exact = /^(0|[1-9]\d{0,8})\.(0|[1-9]\d{0,8})\.(0|[1-9]\d{0,8})$/;
function tuple(s: string): number[] | null {
  return exact.test(s) ? s.split(".").map(Number) : null;
}
function compare(a: number[], b: number[]) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i]! < b[i]! ? -1 : 1;
  }
  return 0;
}
export function versionMatches(
  constraint: string,
  actual: string,
): boolean | null {
  const a = tuple(actual);
  if (!a) return null;
  const v = tuple(constraint);
  if (v) return compare(a, v) === 0;
  const m = /^(>=|>)((?:\d+\.){2}\d+) (<=|<)((?:\d+\.){2}\d+)$/.exec(
    constraint,
  );
  if (!m) return null;
  const lo = tuple(m[2]!),
    hi = tuple(m[4]!);
  if (!lo || !hi || compare(lo, hi) > 0) return null;
  const l = compare(a, lo),
    h = compare(a, hi);
  return (m[1] === ">=" ? l >= 0 : l > 0) && (m[3] === "<=" ? h <= 0 : h < 0);
}
export const applicabilitySchema = z
  .object({
    project: z.string().uuid().nullable(),
    tool: label.nullable(),
    runtime: label.nullable(),
    version: label.nullable(),
  })
  .strict();
export const freshnessSchema = z
  .object({
    expiresAt: z.iso.datetime().nullable(),
    source: z
      .object({ reference: label, expectedHash: digest, observedHash: digest })
      .strict()
      .nullable(),
  })
  .strict();
export const claimSchema = z
  .object({ key: label, value: z.string().min(1).max(4000) })
  .strict();
export const contextSchema = z
  .object({
    applicability: applicabilitySchema,
    freshness: freshnessSchema,
    claim: claimSchema.nullable(),
  })
  .strict();
export type Context = z.infer<typeof contextSchema>;
export type Applicability = z.infer<typeof applicabilitySchema>;
export function applicability(
  context: Context | undefined,
  actual?: Applicability,
): "current" | "stale" | "unknown" {
  if (!context || !actual) return "unknown";
  let unknown = false;
  for (const k of ["project", "tool", "runtime", "version"] as const) {
    const expected = context.applicability[k],
      got = actual[k];
    if (expected === null || got === null) {
      unknown = true;
      continue;
    }
    const match =
      k === "version" ? versionMatches(expected, got) : expected === got;
    if (match === false) return "stale";
    if (match === null) unknown = true;
  }
  return unknown ? "unknown" : "current";
}
export function freshness(
  context?: Context,
  now = Date.now(),
): "current" | "stale" | "unknown" {
  if (!context) return "unknown";
  const f = context.freshness;
  if (f.expiresAt !== null && Date.parse(f.expiresAt) <= now) return "stale";
  if (f.source && f.source.expectedHash !== f.source.observedHash)
    return "stale";
  return f.source || f.expiresAt !== null ? "current" : "unknown";
}
export function conflict(a?: Context, b?: Context) {
  if (
    !a?.claim ||
    !b?.claim ||
    a.claim.key !== b.claim.key ||
    a.claim.value === b.claim.value
  )
    return false;
  const domain = a.applicability;
  // Equality of declared domains, not a guess about overlaps or unknown scopes.
  return (
    Object.values(domain).every((x) => x !== null) &&
    domain.version !== null &&
    versionMatches(domain.version, "0.0.0") !== null &&
    JSON.stringify(domain) === JSON.stringify(b.applicability)
  );
}
export function validateContext(c: Context, projectId: string) {
  if (c.applicability.project !== null && c.applicability.project !== projectId)
    throw new AppError(
      "INVALID_CONTEXT",
      "Applicability project must match the selected project.",
    );
}
// Schema field order is deterministic after parsing. Arrays retain order; NFC and
// CRLF normalization plus edge trimming preserve internal whitespace distinctions.
export function canonicalExperience(value: unknown): unknown {
  if (typeof value === "string")
    return value.normalize("NFC").replace(/\r\n?/g, "\n").trim();
  if (Array.isArray(value)) return value.map(canonicalExperience);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, canonicalExperience(v)]),
    );
  return value;
}

// Structured applicability is part of canonical content, never a second mutable copy.
export function memoryContext(
  row: Record<string, unknown>,
): Context | undefined {
  const source = JSON.parse(String(row.source));
  if (source.format === "experience-v1") {
    const content = JSON.parse(String(row.content));
    return content.context === undefined
      ? undefined
      : contextSchema.parse(content.context);
  }
  const learning =
    typeof row.learning === "string" ? JSON.parse(row.learning) : row.learning;
  return learning?.context;
}
