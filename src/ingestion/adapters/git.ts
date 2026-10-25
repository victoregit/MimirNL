import { execFileSync } from "node:child_process";
import {
  lstatSync,
  realpathSync,
  readdirSync,
  existsSync,
  openSync,
  closeSync,
  readSync,
  fstatSync,
  constants,
} from "node:fs";
import { join, relative, extname, basename } from "node:path";
import {
  AppError,
  assertSafe,
  hash,
  inside,
  sensitivePath,
} from "../../security/index.js";
import type { Service } from "../../core/service.js";
export interface IngestOptions {
  includes?: string[];
  excludes: string[];
  maxFiles: number;
  maxBytes: number;
  maxCommits: number;
}
export interface IngestionAdapter {
  root(): string;
  ingest(service: Service, projectId: string, options: IngestOptions): unknown;
}
// A concurrent source change cannot turn a small stat result into an unbounded read.
function boundedRead(path: string, limit: number): Buffer | undefined {
  let fd: number | undefined;
  try {
    fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    if (!fstatSync(fd).isFile()) return undefined;
    const buffer = Buffer.alloc(limit + 1);
    let length = 0;
    while (length < buffer.length) {
      const n = readSync(fd, buffer, length, buffer.length - length, null);
      if (!n) break;
      length += n;
    }
    return length > limit ? undefined : buffer.subarray(0, length);
  } catch {
    return undefined;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}
export class GitAdapter implements IngestionAdapter {
  constructor(private path: string) {}
  private git(args: string[], maxBuffer = 2000000): Buffer {
    // Never inherit Git configuration, alternate worktrees, command hooks, pagers or credential helpers.
    const env: NodeJS.ProcessEnv = {
      PATH: process.env.PATH,
      SystemRoot: process.env.SystemRoot,

      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: process.platform === "win32" ? "NUL" : "/dev/null",
      GIT_TERMINAL_PROMPT: "0",
      GIT_OPTIONAL_LOCKS: "0",
    };
    try {
      return execFileSync(
        "git",
        [
          "-c",
          "core.hooksPath=/dev/null",
          "-c",
          "core.fsmonitor=false",
          "-c",
          "core.quotePath=false",
          "-c",
          "log.showSignature=false",
          ...args,
        ],
        {
          cwd: this.path,
          env,
          maxBuffer,
          timeout: 15000,
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
    } catch {
      throw new AppError(
        "GIT_FAILED",
        "Read-only Git operation failed or exceeded limits.",
      );
    }
  }
  root() {
    const metadata = join(this.path, ".git");
    let count = 0;
    // Restrict this adapter to self-contained repositories. Linked worktrees and
    // alternate object stores need a separate explicit authorization model.
    const visit = (path: string): void => {
      if (++count > 50000)
        throw new AppError(
          "INGEST_LIMIT",
          "Git metadata entry limit exceeded.",
        );
      const stat = lstatSync(path);
      if (stat.isSymbolicLink())
        throw new AppError(
          "UNSAFE_GIT",
          "Git metadata symlinks are forbidden.",
        );
      if (stat.isDirectory())
        for (const entry of readdirSync(path)) visit(join(path, entry));
    };
    if (!existsSync(metadata) || !lstatSync(metadata).isDirectory())
      throw new AppError(
        "UNSAFE_GIT",
        "Only self-contained Git repositories are supported.",
      );
    visit(metadata);
    const config = join(metadata, "config");
    if (lstatSync(config).size > 64000)
      throw new AppError("UNSAFE_GIT", "Git configuration exceeds bounds.");
    const configBytes = boundedRead(config, 64000);
    if (
      !configBytes ||
      /\[\s*include(?:if)?\b|\b(?:excludesfile|attributesfile)\s*=|\[\s*mailmap\s*\]/i.test(
        configBytes.toString("utf8"),
      ) ||
      existsSync(join(metadata, "objects", "info", "alternates"))
    )
      throw new AppError(
        "UNSAFE_GIT",
        "External Git configuration and object stores are forbidden.",
      );
    return realpathSync(
      this.git(["rev-parse", "--show-toplevel"]).toString().trim(),
    );
  }
  ingest(service: Service, projectId: string, o: IngestOptions) {
    const project = service.project(projectId);
    if (
      !project.authorized ||
      realpathSync(String(project.path)) !== this.path ||
      this.root() !== this.path
    )
      throw new AppError(
        "AUTHORIZATION_REQUIRED",
        "Explicit authorization for this canonical repository is required.",
      );
    const list = this.git([
      "ls-files",
      "-z",
      "--cached",
      "--others",
      "--exclude-standard",
    ])
      .toString()
      .split("\0")
      .filter(Boolean);
    if (list.length > o.maxFiles)
      throw new AppError(
        "INGEST_LIMIT",
        "File count exceeds configured bound; no import performed.",
      );
    const ignored = new Set(
      this.git([
        "ls-files",
        "-z",
        "--cached",
        "--ignored",
        "--exclude-standard",
      ])
        .toString()
        .split("\0"),
    );
    const sources: {
      reference: string;
      content: string;
      kind: string;
      language?: string;
      category?: string;
      signal?: string;
    }[] = [];
    const structure: {
      languages: Record<string, number>;
      categories: Record<string, number>;
    } = { languages: {}, categories: {} };
    let bytes = 0,
      skipped = 0;
    for (const file of list) {
      if (
        ignored.has(file) ||
        sensitivePath(file) ||
        /(^|\/)(node_modules|vendor|dist|build|coverage|\.git)(\/|$)/i.test(
          file,
        ) ||
        o.excludes.some((x) =>
          file.toLowerCase().includes(x.replaceAll("\\", "/").toLowerCase()),
        ) ||
        (o.includes?.length &&
          !o.includes.some((x) => {
            const prefix = x
              .replaceAll("\\", "/")
              .replace(/\/$/, "")
              .toLowerCase();
            return (
              file.toLowerCase() === prefix ||
              file.toLowerCase().startsWith(prefix + "/")
            );
          }))
      ) {
        skipped++;
        continue;
      }
      const full = join(this.path, file);
      if (!inside(this.path, full)) {
        skipped++;
        continue;
      }
      let stat;
      try {
        stat = lstatSync(full);
      } catch {
        continue;
      }
      if (!stat.isFile() || stat.isSymbolicLink()) {
        skipped++;
        continue;
      }
      const canonical = realpathSync(full);
      if (
        !inside(this.path, canonical) ||
        relative(this.path, canonical).replaceAll("\\", "/") !== file
      ) {
        skipped++;
        continue;
      }
      if (stat.size > 128000) {
        skipped++;
        continue;
      }
      const data = boundedRead(canonical, 128000);
      if (!data) {
        skipped++;
        continue;
      }
      bytes += data.length;
      if (bytes > o.maxBytes)
        throw new AppError(
          "INGEST_LIMIT",
          "Byte bound exceeded; no import performed.",
        );
      if (data.includes(0)) {
        skipped++;
        continue;
      }
      const content = `File ${file}\n${data.toString("utf8")}`;
      try {
        assertSafe({ file, content });
      } catch {
        skipped++;
        continue;
      }
      const extension = extname(file).toLowerCase();
      const language: string =
        (
          {
            ".ts": "TypeScript",
            ".tsx": "TypeScript",
            ".js": "JavaScript",
            ".jsx": "JavaScript",
            ".py": "Python",
            ".rs": "Rust",
            ".go": "Go",
            ".md": "Markdown",
            ".json": "JSON",
            ".yaml": "YAML",
            ".yml": "YAML",
            ".toml": "TOML",
            ".sh": "Shell",
          } as Record<string, string>
        )[extension] ?? "Text";
      const category = /report|junit|test-results|\.tap$/i.test(file)
        ? "test-report"
        : /\.(?:md|rst|txt)$/i.test(file)
          ? "documentation"
          : /config|package\.json|Cargo\.toml|pyproject|\.gitignore/i.test(
                basename(file),
              )
            ? "configuration"
            : "source";
      structure.languages[language] = (structure.languages[language] ?? 0) + 1;
      structure.categories[category] =
        (structure.categories[category] ?? 0) + 1;
      sources.push({
        reference: file,
        content,
        kind: "file",
        language,
        category,
      });
    }
    if (o.maxCommits && !o.includes?.length) {
      let log = "";
      try {
        log = this.git(
          [
            "log",
            `-${o.maxCommits}`,
            "--format=%H%x00%s%x00%b%x00%x1e",
            "--no-decorate",
            "--no-show-signature",
          ],
          Math.min(o.maxBytes, 2000000),
        ).toString();
      } catch (e) {
        const head = this.git(["rev-parse", "--is-inside-work-tree"])
          .toString()
          .trim();
        if (head !== "true") throw e;
        try {
          this.git(["rev-parse", "--verify", "HEAD"]);
          throw e;
        } catch (inner) {
          if (inner === e) throw e;
        }
      }
      bytes += Buffer.byteLength(log);
      if (bytes > o.maxBytes)
        throw new AppError(
          "INGEST_LIMIT",
          "Commit metadata exceeds byte bound.",
        );
      for (const entry of log.split("\x1e")) {
        const [commit, subject, body] = entry.trim().split("\0");
        if (!commit) continue;
        const content = `Commit ${commit}\n${subject ?? ""}\n${body ?? ""}\nEvidence of change only; correctness unverified.`;
        try {
          assertSafe(content);
        } catch {
          skipped++;
          continue;
        }
        sources.push({
          reference: commit,
          content,
          kind: "commit",
          signal: /\bfix(?:es|ed)?\b|bug|regression/i.test(`${subject} ${body}`)
            ? "fix"
            : "change",
        });
      }
    }
    return service.storage.transaction(() => {
      let inserted = 0,
        updated = 0,
        unchanged = 0,
        deprecated = 0;
      const seen = new Set(
        sources.filter((s) => s.kind === "file").map((s) => s.reference),
      );
      const existing = service.db
        .prepare("SELECT * FROM memories WHERE project_id=? AND origin='git'")
        .all(projectId);
      for (const source of sources) {
        const previous = existing.find((m) => {
          const s = JSON.parse(String(m.source));
          return s.kind === source.kind && s.reference === source.reference;
        });
        if (
          previous &&
          previous.hash === hash(source.content) &&
          previous.status !== "deprecated"
        ) {
          unchanged++;
          continue;
        }
        if (previous) {
          const duplicate = service.db
            .prepare(
              "SELECT id FROM memories WHERE project_id=? AND hash=? AND id<>?",
            )
            .get(projectId, hash(source.content), String(previous.id));
          if (duplicate) {
            unchanged++;
            continue;
          }
          service.db
            .prepare(
              "UPDATE memories SET content=?,hash=?,source=?,status='candidate',version=version+1,updated=? WHERE id=?",
            )
            .run(
              source.content,
              hash(source.content),
              JSON.stringify({
                ...source,
                content: undefined,
                trust: "untrusted",
                claim: "source evidence only",
              }),
              new Date().toISOString(),
              String(previous.id),
            );
          service.snapshot(String(previous.id));
          updated++;
        } else {
          const { content: _, ...provenance } = source;
          service.store(projectId, source.content, "project", "git", {
            ...provenance,
            trust: "untrusted",
            claim: "source evidence only",
          });
          inserted++;
        }
      }
      // Missing or newly excluded/unsafe files invalidate their previous source claim. Bounds fail before this transaction.
      for (const m of existing) {
        const source = JSON.parse(String(m.source));
        if (
          source.kind === "file" &&
          !seen.has(source.reference) &&
          m.status !== "deprecated"
        ) {
          service.db
            .prepare(
              "UPDATE memories SET status='deprecated',version=version+1,updated=? WHERE id=?",
            )
            .run(new Date().toISOString(), String(m.id));
          service.snapshot(String(m.id));
          deprecated++;
        }
      }
      return {
        inserted,
        updated,
        unchanged,
        deprecated,
        skipped,
        bytes,
        files: list.length,
        structure,
      };
    });
  }
}
