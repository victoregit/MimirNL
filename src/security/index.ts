import { createHash } from "node:crypto";
import { lstatSync, realpathSync } from "node:fs";
import { resolve, parse, join, relative, isAbsolute } from "node:path";
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export function inside(root: string, path: string): boolean {
  const r = relative(root, path);
  return !r || (!r.startsWith("..") && !isAbsolute(r));
}
// Deliberately reject whole requests: redaction can leave identifying fragments behind.
export function assertSafe(value: unknown): void {
  const pattern =
    /(?:-----BEGIN [A-Z ]*PRIVATE KEY|\bAKIA[A-Z0-9]{16}\b|\b(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{16,}|\bsk-[A-Za-z0-9_-]{16,}|\bBearer\s+[A-Za-z0-9_.-]{12,}|\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|(?:password|passwd|secret|api[_-]?key|access[_-]?token)\s*["']?\s*[:=]\s*["']?[^\s"',;}{]{6,})/i;
  const queue: unknown[] = [value];
  const seen = new WeakSet<object>();
  let entries = 0,
    bytes = 0;
  const reject = () => {
    throw new AppError(
      "SENSITIVE_CONTENT",
      "Potential secret rejected; no request content was stored.",
    );
  };
  while (queue.length) {
    if (++entries > 10000 || bytes > 1000000)
      throw new AppError(
        "INVALID_REQUEST",
        "Request exceeds safety scan bounds.",
      );
    const item = queue.pop();
    // Inspect raw strings rather than their JSON-escaped representation: quoted
    // JSON/YAML configuration assignments must be screened just like plain text.
    if (typeof item === "string") {
      bytes += Buffer.byteLength(item);
      if (pattern.test(item)) reject();
    } else if (item && typeof item === "object" && !seen.has(item)) {
      seen.add(item);
      for (const [key, entry] of Object.entries(item)) {
        if (
          /^(?:password|passwd|secret|api[_-]?key|access[_-]?token)$/i.test(
            key,
          ) &&
          String(entry).length >= 6
        )
          reject();
        queue.push(key, entry);
      }
    }
  }
  if (bytes > 1000000)
    throw new AppError(
      "INVALID_REQUEST",
      "Request exceeds safety scan bounds.",
    );
}
export function sensitivePath(path: string): boolean {
  return /(^|\/)(?:\.env[^/]*|\.ssh|\.aws|credentials(?:\..*)?|\.npmrc|\.netrc|id_rsa|id_ed25519|[^/]*\.(?:pem|key|p12|pfx)|\.git-credentials|\.docker|\.kube)(\/|$)/i.test(
    path.replaceAll("\\", "/"),
  );
}
export function failure(e: unknown) {
  // Keep local exception text and paths private, but retain bounded machine
  // codes so CI and callers can distinguish I/O and SQLite failures.
  const local =
    e instanceof Error
      ? (e as NodeJS.ErrnoException & { errcode?: number })
      : undefined;
  const causeCode =
    !(e instanceof AppError) &&
    typeof local?.code === "string" &&
    /^(?:E[A-Z0-9_]{1,63}|SQLITE_[A-Z_]{1,63})$/.test(local.code)
      ? local.code
      : undefined;
  return {
    ok: false as const,
    error: {
      code: e instanceof AppError ? e.code : "INVALID_REQUEST",
      message:
        e instanceof AppError
          ? e.message
          : "Invalid request or local operation failed.",
      ...(causeCode ? { causeCode } : {}),
      ...(causeCode === "ERR_SQLITE_ERROR" &&
      Number.isSafeInteger(local?.errcode)
        ? { sqliteCode: local!.errcode }
        : {}),
    },
  };
}

// Local administrative paths never follow symlinks, including parent components.
// This protects against accidental redirects; hostile concurrent filesystem writers
// remain outside the local-user trust boundary (portable Node has no openat API).
export function assertLocalPath(path: string): string {
  assertSafe(path);
  if (!path || sensitivePath(path) || path.split(/[\\/]/).includes(".."))
    throw new AppError("UNSAFE_PATH", "Sensitive or traversing path rejected.");
  const absolute = resolve(path);
  let current = parse(absolute).root;
  let canonical = realpathSync.native(current);
  for (const part of absolute.slice(current.length).split(/[\\/]/)) {
    current = join(current, part);
    canonical = join(canonical, part);
    try {
      if (lstatSync(current).isSymbolicLink())
        throw new AppError(
          "UNSAFE_PATH",
          "Symbolic path components are forbidden.",
        );
      // Resolve existing components before comparing administrative destinations
      // with registered native roots (including Windows 8.3 aliases). Missing
      // components retain their suffix under the last existing canonical parent.
      canonical = realpathSync.native(current);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    }
  }
  assertSafe(canonical);
  if (sensitivePath(canonical))
    throw new AppError("UNSAFE_PATH", "Sensitive or traversing path rejected.");
  return canonical;
}
