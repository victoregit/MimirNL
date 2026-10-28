import { AppError } from "../security/index.js";
// UTF-8 bytes are a conservative upper bound, not a model tokenizer or savings metric.
export const estimateTokens = (value: unknown): number =>
  Buffer.byteLength(JSON.stringify(value), "utf8");
export function optimize<T>(
  items: T[],
  budget: number,
  metadata: Record<string, unknown> = {},
): { memories: T[]; estimatedTokens: number; estimator: string } {
  const result = {
    ...metadata,
    memories: [] as T[],
    estimatedTokens: 0,
    estimator: "conservative UTF-8 byte upper bound; not model tokens",
  };
  if (
    estimateTokens({ ok: true, data: { ...result, estimatedTokens: budget } }) >
    budget
  )
    throw new AppError(
      "BUDGET_TOO_SMALL",
      "Budget cannot contain the empty response envelope.",
    );
  for (const item of items) {
    const next = {
      ...result,
      memories: [...result.memories, item],
      estimatedTokens: budget,
    };
    if (estimateTokens({ ok: true, data: next }) <= budget)
      result.memories.push(item);
  }
  if (items.length && !result.memories.length && metadata.reason)
    Object.assign(result, { reason: "budget_excluded" });
  result.estimatedTokens = estimateTokens({
    ok: true,
    data: { ...result, estimatedTokens: budget },
  });
  return result;
}
