// Server-only helper for Claude calls. Every call returns schema-shaped JSON or null,
// and every route has a non-AI fallback, so the demo keeps working without a key or network.
import Anthropic from "@anthropic-ai/sdk";

export const MODELS = {
  /** Fast and low cost: short, well-bounded tasks (dish estimate, plain-language rewrite). */
  fast: "claude-haiku-4-5-20251001",
  /** Stronger reasoning: summarizing intake answers, building a weekly plan under constraints. */
  smart: "claude-sonnet-5-5",
} as const;

/** Stronger model first; if this API key cannot use it, the fast model does the job instead. */
export const SMART_THEN_FAST = [MODELS.smart, "claude-sonnet-4-5", MODELS.fast];

export const SAFETY = `You are part of Receta Fresca, a food-prescription demo for people with diabetes in Puerto Rico and the US Virgin Islands.
Hard rules:
- Never diagnose. Never recommend, adjust or mention doses of insulin or any medication.
- You give food information and estimates only. A clinician makes every clinical decision.
- All numbers are estimates. Never present them as exact or as medical advice.
- If the person describes symptoms that could be urgent, do not interpret them. Flag them for the clinician.
- Always address the person as "usted" in Spanish, never "tú".
- Write for an older adult with limited health literacy: short sentences, common words, about a 5th-grade reading level.
- Use Puerto Rican Spanish food words (habichuelas, china, guineo, vianda) when writing in Spanish.
- All patient data here is synthetic.`;

/** Last failure reason, without secrets. Returned to the client as `aiError` so problems are visible in the demo. */
export let lastAiError = "";
/** Which model produced the last answer, and any earlier model that was skipped. For diagnostics only. */
export let lastAiModel = "";

type AskArgs = {
  /** One model, or several to try in order if an earlier one is unavailable to this API key. */
  model: string | string[];
  system: string;
  user: string;
  toolName: string;
  toolDescription: string;
  schema: Record<string, unknown>;
  maxTokens?: number;
  timeoutMs?: number;
};

export async function askJSON<T>(a: AskArgs): Promise<T | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  lastAiError = "";
  lastAiModel = "";
  if (!apiKey) {
    lastAiError = "no API key configured";
    return null;
  }
  const models = Array.isArray(a.model) ? a.model : [a.model];
  const client = new Anthropic({ apiKey, timeout: a.timeoutMs ?? 25000, maxRetries: 0 });
  for (const model of models) {
    try {
      const res = await client.messages.create({
        model,
        max_tokens: a.maxTokens ?? 1024,
        system: `${SAFETY}\n\n${a.system}`,
        messages: [{ role: "user", content: a.user }],
        tools: [{ name: a.toolName, description: a.toolDescription, input_schema: a.schema as Anthropic.Tool.InputSchema }],
        tool_choice: { type: "tool", name: a.toolName },
      });
      const block = res.content.find((b) => b.type === "tool_use");
      if (block && block.type === "tool_use") {
        lastAiModel = model;
        return block.input as T;
      }
      lastAiError = `${model}: no structured answer`;
    } catch (err) {
      const status = err instanceof Anthropic.APIError ? err.status : undefined;
      const msg = err instanceof Error ? err.message.slice(0, 200) : "unknown error";
      lastAiError = `${model}: ${status ?? ""} ${msg}`.trim();
      console.error(`[claude] ${a.toolName} failed`, lastAiError);
      // Only move to the next model when this one is unavailable; a timeout or outage ends the attempt.
      if (status !== 404 && status !== 403 && status !== 400) break;
    }
  }
  return null;
}

/** Reads a JSON body without throwing. */
export async function readBody<T>(req: Request): Promise<Partial<T>> {
  try {
    return (await req.json()) as Partial<T>;
  } catch {
    return {};
  }
}

/** Trims untrusted text before it goes into a prompt. */
export function clip(s: unknown, max = 600): string {
  return typeof s === "string" ? s.slice(0, max) : "";
}
