// Server-only helper for Claude calls. Every call returns schema-shaped JSON or null,
// and every route has a non-AI fallback, so the demo keeps working without a key or network.
import Anthropic from "@anthropic-ai/sdk";

export const MODELS = {
  /** Fast and low cost: short, well-bounded tasks (dish estimate, plain-language rewrite). */
  fast: "claude-haiku-4-5-20251001",
  /** Stronger reasoning: summarizing intake answers, building a weekly plan under constraints. */
  smart: "claude-sonnet-5-5",
} as const;

export const SAFETY = `You are part of Receta Fresca, a food-prescription demo for people with diabetes in Puerto Rico and the US Virgin Islands.
Hard rules:
- Never diagnose. Never recommend, adjust or mention doses of insulin or any medication.
- You give food information and estimates only. A clinician makes every clinical decision.
- All numbers are estimates. Never present them as exact or as medical advice.
- If the person describes symptoms that could be urgent, do not interpret them. Flag them for the clinician.
- Write for an older adult with limited health literacy: short sentences, common words, about a 5th-grade reading level.
- Use Puerto Rican Spanish food words (habichuelas, china, guineo, vianda) when writing in Spanish.
- All patient data here is synthetic.`;

type AskArgs = {
  model: string;
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
  if (!apiKey) return null;
  try {
    const client = new Anthropic({ apiKey, timeout: a.timeoutMs ?? 25000, maxRetries: 0 });
    const res = await client.messages.create({
      model: a.model,
      max_tokens: a.maxTokens ?? 1024,
      system: `${SAFETY}\n\n${a.system}`,
      messages: [{ role: "user", content: a.user }],
      tools: [{ name: a.toolName, description: a.toolDescription, input_schema: a.schema as Anthropic.Tool.InputSchema }],
      tool_choice: { type: "tool", name: a.toolName },
    });
    const block = res.content.find((b) => b.type === "tool_use");
    return block && block.type === "tool_use" ? (block.input as T) : null;
  } catch (err) {
    console.error(`[claude] ${a.toolName} failed`, err instanceof Error ? err.message : err);
    return null;
  }
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
