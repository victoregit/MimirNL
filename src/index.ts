export { Service } from "./core/service.js";
export { Storage, defaultPath } from "./storage/index.js";
export { schemas, type Operation } from "./core/schemas.js";
export {
  GitAdapter,
  type IngestionAdapter,
  type IngestOptions,
} from "./ingestion/adapters/git.js";
export { optimize, estimateTokens } from "./optimization/index.js";
export {
  FtsRetriever,
  type Retriever,
  type RetrievalFilter,
  type EmbeddingProvider,
} from "./retrieval/index.js";

export { backupDatabase, restoreDatabase } from "./storage/backup.js";
