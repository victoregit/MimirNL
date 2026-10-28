import type { DatabaseSync, SQLInputValue } from "node:sqlite";
export interface RetrievalFilter {
  projectId: string;
  includeGlobal: boolean;
  query: string;
  limit: number;
  type?: string;
  status?: string;
  scope?: string;
  policy?: "legacy" | "balanced-v1";
  recency?: "off" | "verified-ties-v1";
}
export interface Retriever {
  search(filter: RetrievalFilter): Record<string, unknown>[];
}
// Future embedding adapters must be explicitly configured, local by default, and obey the same project boundary.
export interface EmbeddingProvider {
  embed(text: string): Promise<readonly number[]>;
}
export class FtsRetriever implements Retriever {
  constructor(private db: DatabaseSync) {}
  search(filter: RetrievalFilter) {
    const words = filter.query.match(/[\p{L}\p{N}_]+/gu)?.slice(0, 40) ?? [];
    if (!words.length) return [];
    const args: SQLInputValue[] = [
      filter.projectId,
      Number(filter.includeGlobal),
    ];
    let where =
      "(m.project_id=? OR (?=1 AND m.scope='global' AND m.status='verified'))";
    for (const field of ["type", "status", "scope"] as const)
      if (filter[field]) {
        where += ` AND m.${field}=?`;
        args.push(filter[field]);
      }
    if (!filter.status) where += " AND m.status IN ('candidate','verified')";
    const rows = this.db
      .prepare(
        `SELECT m.* FROM memory_fts JOIN memories m ON m.id=memory_fts.id WHERE ${where} AND memory_fts MATCH ? ORDER BY bm25(memory_fts),(m.scope='project') DESC,CASE WHEN ?='verified-ties-v1' AND m.status='verified' AND julianday(m.updated)<=julianday('now') THEN julianday(m.updated) ELSE 0 END DESC,m.id`,
      )
      .iterate(
        ...args,
        words.map((w) => '"' + w + '"').join(" OR "),
        filter.recency ?? "off",
      );
    // Coverage is lexical evidence, never an assertion that the source answers the question.
    const terms = [...new Set(words.map((w) => w.toLowerCase()))];
    const groups = new Map<string, Record<string, unknown>>();
    for (const row of rows) {
      if (filter.policy === "balanced-v1") {
        const contentTerms = new Set(
          String(row.content)
            .toLowerCase()
            .match(/[\p{L}\p{N}_]+/gu) ?? [],
        );
        if (
          terms.filter((term) => contentTerms.has(term)).length <
          Math.ceil(terms.length / 4)
        )
          continue;
      }
      const key = String(row.hash);
      const previous = groups.get(key);
      if (previous) {
        (previous.duplicateProvenance as unknown[]).push({
          id: row.id,
          project_id: row.project_id,
          scope: row.scope,
          source: JSON.parse(String(row.source)),
        });
      } else if (groups.size < filter.limit) {
        groups.set(key, { ...row, duplicateProvenance: [] });
      }
    }
    return [...groups.values()].slice(0, filter.limit);
  }
}
