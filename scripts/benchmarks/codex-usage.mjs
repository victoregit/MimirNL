// Pure, single-turn adapter. Never retain event contents or host identifiers.
export function createUsageCollector({ chronology = "synthetic-test" } = {}) {
  if (!["synthetic-test", "local-stdin-monotonic"].includes(chronology))
    throw new Error("Invalid chronology.");
  let count = 0,
    started = false,
    thread = false,
    terminal = null,
    usage = null;
  let first = null,
    message = null,
    completed = null,
    last = 0;
  const invalid = () => {
    throw new Error("Invalid or ambiguous event stream.");
  };
  const object = (v) =>
    v !== null && typeof v === "object" && !Array.isArray(v);
  function time(ms) {
    if (!Number.isFinite(ms) || ms < last || ms < 0) invalid();
    last = ms;
  }
  return {
    observe(event, elapsedMs) {
      time(elapsedMs);
      if (!object(event) || typeof event.type !== "string" || !event.type)
        invalid();
      if (terminal) invalid();
      count++;
      first ??= elapsedMs;
      switch (event.type) {
        case "thread.started":
          if (thread || started || count !== 1) invalid();
          thread = true;
          break;
        case "turn.started":
          if (started) invalid();
          started = true;
          break;
        case "item.started":
        case "item.updated":
        case "item.completed":
          if (
            !started ||
            !object(event.item) ||
            typeof event.item.type !== "string"
          )
            invalid();
          if (
            event.type === "item.completed" &&
            event.item.type === "agent_message"
          )
            message ??= elapsedMs;
          break;
        case "turn.completed": {
          if (!started || !object(event.usage)) invalid();
          const u = event.usage;
          const values = [
            u.input_tokens,
            u.cached_input_tokens,
            u.output_tokens,
          ];
          if (
            !values.every((n) => Number.isSafeInteger(n) && n >= 0) ||
            u.cached_input_tokens > u.input_tokens ||
            !Number.isSafeInteger(u.input_tokens + u.output_tokens)
          )
            invalid();
          usage = {
            input_tokens: u.input_tokens,
            cached_input_tokens: u.cached_input_tokens,
            output_tokens: u.output_tokens,
            total_tokens: u.input_tokens + u.output_tokens,
          };
          terminal = "completed";
          completed = elapsedMs;
          break;
        }
        case "turn.failed":
          if (
            !started ||
            !object(event.error) ||
            typeof event.error.message !== "string"
          )
            invalid();
          terminal = "failed";
          break;
        case "error":
          if (typeof event.message !== "string") invalid();
          // Codex may emit an error followed by turn.failed; it is not a terminal turn.
          break;
        default:
          break;
      }
    },
    finish(elapsedMs) {
      time(elapsedMs);
      return {
        schema_version: 1,
        status: terminal ?? "incomplete",
        events_observed: count,
        turn_started: started,
        usage_status: usage ? "host-reported" : "unavailable",
        usage,
        cost: { status: "unavailable" },
        timing: {
          chronology,
          method: "elapsed-since-collector-start",
          elapsed_ms: elapsedMs,
          first_event_ms: first,
          first_agent_message_completed_ms: message,
          turn_completed_ms: completed,
          ttft: { status: "unavailable" },
        },
        scope: "one-turn-only",
        execution_proof: false,
      };
    },
  };
}
