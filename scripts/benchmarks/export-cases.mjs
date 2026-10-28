import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { validateCases } from "./preflight.mjs";
import {
  PIN,
  ARMS,
  BLOCK,
  fail,
  portable,
  validateProtocol,
  seal,
  canonical,
} from "./public-bundle.mjs";
import {
  readExplicit,
  safePath,
  sameDirectory,
  outputDirectory,
} from "./offline-files.mjs";

export function loadLegacy(markdown) {
  try {
    const blocks = [
      ...markdown.matchAll(/^```json\s*\r?\n([\s\S]*?)^```\s*$/gm),
    ];
    if (blocks.length !== 1) fail();
    const cases = JSON.parse(blocks[0][1]);
    if (!Array.isArray(cases) || cases.length !== 3) fail();
    validateCases(cases);
    return cases;
  } catch {
    fail();
  }
}
// This is the only module allowed to inspect private contract objects. No private
// object is spread/copied into the payload; nested public fields are projected.
export function exportCases({ cases, protocol, root }) {
  try {
    validateCases(cases);
    validateProtocol(protocol);
    if (![6, 9].includes(cases.length)) fail();
    safePath(root);
    // Ignore inherited Git redirection variables; never take a repository root
    // from corpus data, nor use a shell to resolve object names.
    const env = {
      PATH: process.env.PATH,
      SystemRoot: process.env.SystemRoot,
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: "/dev/null",
      GIT_TERMINAL_PROMPT: "0",
      GIT_OPTIONAL_LOCKS: "0",
    };
    const git = (args, encoding = "utf8") =>
      execFileSync(
        "git",
        [
          "--no-replace-objects",
          "-c",
          "core.fsmonitor=false",
          "-c",
          "core.hooksPath=/dev/null",
          "-C",
          root,
          ...args,
        ],
        {
          env,
          encoding,
          stdio: ["ignore", "pipe", "ignore"],
          timeout: 5000,
          maxBuffer: 4000000,
        },
      );
    if (!sameDirectory(root, git(["rev-parse", "--show-toplevel"]).trim()))
      fail();
    const publicCases = cases.map((c) => {
      if (
        c.source.commit_sha !== PIN ||
        c.source.repository !== "MimirNL" ||
        c.split !== "development" ||
        c.illustrative_only
      )
        fail();
      const op = protocol.cases.find(
        (p) => p.case_id === c.case_id && p.case_revision === c.case_revision,
      );
      if (
        !op ||
        canonical(op.pool) !== canonical(c.sources.map((s) => s.source_id)) ||
        canonical(op.pool) !== canonical(c.model_context.allowed_source_ids)
      )
        fail();
      const sources = c.sources.map((s) => {
        portable(s.path);
        const tree = git(["ls-tree", PIN, "--", s.path]);
        if (
          !/^100(?:644|755) blob [0-9a-f]{40}\t/.test(tree) ||
          tree.split("\n").filter(Boolean).length !== 1
        )
          fail();
        const bytes = git(["show", `${PIN}:${s.path}`], null);
        const text = bytes.toString("utf8");
        if (
          !Buffer.from(text).equals(bytes) ||
          !Buffer.from(readExplicit(join(root, s.path))).equals(bytes)
        )
          fail();
        const lines = text.match(/[^\n]*\n|[^\n]+$/g) ?? [];
        if (
          s.end_line > lines.length ||
          lines.slice(s.start_line - 1, s.end_line).join("") !== s.excerpt
        )
          fail();
        return {
          source_id: s.source_id,
          unit_id: s.unit_id,
          path: s.path,
          start_line: s.start_line,
          end_line: s.end_line,
          excerpt: s.excerpt,
          sha256: s.sha256,
        };
      });
      return {
        case_id: c.case_id,
        case_revision: c.case_revision,
        split: c.split,
        source: {
          repository: c.source.repository,
          commit_sha: c.source.commit_sha,
        },
        question: c.model_context.task,
        sources,
        allowed_source_ids: [...c.model_context.allowed_source_ids],
        operation: {
          case_id: op.case_id,
          case_revision: op.case_revision,
          query: op.query,
          k: op.k,
          limit: op.limit,
          tokenBudget: op.tokenBudget,
          context_bytes: op.context_bytes,
          output_words: op.output_words,
          pool: [...op.pool],
        },
      };
    });
    return seal({
      schema_version: "public-cases-1",
      execution: structuredClone(BLOCK),
      protocol_status: "proposed",
      arms: [...ARMS],
      contract_scenarios_replaced: false,
      cases: publicCases,
    });
  } catch {
    fail();
  }
}
export function exportFiles({ expanded, legacy, protocol, root, out }) {
  try {
    const cases = JSON.parse(readExplicit(expanded));
    if (!Array.isArray(cases) || cases.length !== 6) fail();
    const originals = loadLegacy(readExplicit(legacy));
    const bundle = exportCases({
      cases: [...cases, ...originals],
      protocol: JSON.parse(readExplicit(protocol)),
      root,
    });
    outputDirectory(out, "bundle.json", bundle);
    return {
      case_count: bundle.cases.length,
      executable: false,
      sha256: bundle.sha256,
    };
  } catch {
    fail();
  }
}
