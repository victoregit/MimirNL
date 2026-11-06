import { INSTRUCTION, promptFor } from "./multicase-runner.mjs";
import { hash } from "./public-bundle.mjs";

// Reuse the frozen public projection; insertion order here is intentional.
// This prefix contains only the fixed instruction and empty history.
export const STABLE_PREFIX = `{"instruction":${JSON.stringify(INSTRUCTION)},"history":[],"sources":`;
export const STABLE_LAYOUT = Object.freeze({
  version: "instruction-sources-question-2",
  prefix_bytes: Buffer.byteLength(STABLE_PREFIX),
  prefix_sha256: hash(STABLE_PREFIX),
});
export function stablePrompt(c, sources) {
  const publicEnvelope = JSON.parse(promptFor(c, sources));
  return `${STABLE_PREFIX}${JSON.stringify(publicEnvelope.sources)},"question":${JSON.stringify(publicEnvelope.question)}}`;
}
