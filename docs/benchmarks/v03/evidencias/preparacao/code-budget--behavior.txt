// UTF-8 bytes are a conservative upper bound, not a model tokenizer or savings metric.
export const estimateTokens = (value: unknown): number =>
  Buffer.byteLength(JSON.stringify(value), "utf8");
export function optimize<T>(
  items: T[],
  budget: number,
): { memories: T[]; estimatedTokens: number; estimator: string } {
  const result = {
    memories: [] as T[],
    estimatedTokens: 0,
    estimator: "conservative UTF-8 byte upper bound; not model tokens",
  };
  for (const item of items) {
    const next = {
      ...result,
      memories: [...result.memories, item],
      estimatedTokens: budget,
    };
    if (estimateTokens({ ok: true, data: next }) <= budget)
      result.memories.push(item);
  }
  result.estimatedTokens = estimateTokens({
    ok: true,
    data: { ...result, estimatedTokens: budget },
  });
  return result;
}
