import { runtimeEnvelope, canonical, hash } from "./contract-v02.mjs";
import { exact, fail } from "./public-bundle.mjs";

// Future/offline assembly only: frozen ABC manifests and live execution do not
// consume this API. A future executor must bind this identity in its own plan.
export function assembleOfflineContext(
  bundle,
  task,
  base,
  retrieved = [],
  options = { base_overlap: "preserve" },
) {
  exact(options, ["base_overlap"]);
  if (!["preserve", "exact-v1"].includes(options.base_overlap)) fail();
  // Validate the complete bundle, selections and legacy input budget FIRST.
  // Unknown metadata/revisions fail closed, before anything can be omitted.
  const envelope = runtimeEnvelope(bundle, task, base, retrieved);
  const before = Buffer.byteLength(JSON.stringify(envelope));
  if (options.base_overlap === "exact-v1") {
    // The strict source schema contains all public provenance fields. Compare
    // canonical complete objects, without Unicode normalization or hash-only
    // equivalence. Filtering keeps remaining order and never mutates the input.
    const available = new Set(envelope.sources.map(canonical));
    envelope.retrieved = envelope.retrieved.filter(
      (source) => !available.has(canonical(source)),
    );
  }
  const prompt = JSON.stringify(envelope);
  const configuration = {
    schema_version: "offline-context-129-v1",
    base_overlap: options.base_overlap,
  };
  return {
    envelope,
    prompt,
    configuration,
    configuration_sha256: hash(canonical(configuration)),
    context_bytes: Buffer.byteLength(prompt),
    omitted_count: retrieved.length - envelope.retrieved.length,
    avoided_bytes: before - Buffer.byteLength(prompt),
    executable: false,
  };
}
