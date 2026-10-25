import type { DatabaseSync, SQLInputValue } from "node:sqlite";
export interface RetrievalFilter {
  projectId: string;
  includeGlobal: boolean;
  query: string;
  limit: number;
  type?: string;
  status?: string;
  scope?: string;
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
    return this.db
      .prepare(
        `SELECT m.* FROM memory_fts JOIN memories m ON m.id=memory_fts.id WHERE ${where} AND memory_fts MATCH ? ORDER BY bm25(memory_fts),(m.scope='project') DESC,m.id LIMIT ?`,
      )
      .all(...args, words.map((w) => '"' + w + '"').join(" OR "), filter.limit);
  }
}
