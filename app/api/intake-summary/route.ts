// Turns the patient's pre-visit answers into a one-screen summary for the clinician.
// The model suggests logistics only (cooked meals vs produce, delivery). It never sets clinical targets.
import { askJSON, clip, lastAiError, lastAiModel, readBody, SMART_THEN_FAST } from "@/lib/claude";
import { fallbackIntakeSummary } from "@/lib/fallback";
import type { IntakeAnswers, IntakeSummary, Lang, Patient } from "@/lib/types";

export const maxDuration = 45;

export async function POST(req: Request) {
  const body = await readBody<{ answers: IntakeAnswers; patient: Patient; lang: Lang }>(req);
  const lang: Lang = body.lang === "en" ? "en" : "es";
  const a: IntakeAnswers = body.answers ?? {};
  const fallback = fallbackIntakeSummary(a, lang);

  const answered = [a.feeling, a.concern, a.typicalDay, a.canCook, a.canTravel, a.avoid].some(Boolean);
  if (!answered) return Response.json(fallback);

  const ai = await askJSON<Omit<IntakeSummary, "source">>({
    model: SMART_THEN_FAST,
    timeoutMs: 25000,
    maxTokens: 900,
    toolName: "write_intake_summary",
    toolDescription: "Write a short pre-visit summary for a busy clinician.",
    system: `Summarize a patient's pre-visit answers for a clinician who has 30 seconds to read. Write in ${lang === "es" ? "Spanish" : "English"}.
- Report only what the patient said. Do not add facts, diagnoses or medication advice.
- keyPoints: 3 to 5 short bullets, most important first.
- flags: things the clinician should ask about in person (for example the patient feels unwell, mentions symptoms, or says they skip meals or run out of food). Empty if none. Describe, do not interpret.
- suggestedType: "meals" if the patient cannot cook, otherwise "produce". suggestedDelivery: true if they cannot get to a store.
- avoid: foods the patient said they cannot or will not eat, as single items.`,
    user: `Synthetic patient: ${clip(body.patient?.name, 60)}, ${Number(body.patient?.age) || "?"} years, ${clip(body.patient?.town, 60)}.
Answers:
1. How do you feel today? ${a.feeling ?? "(no answer)"}
2. Biggest worry about health or food: ${clip(a.concern) || "(no answer)"}
3. What do you eat on a normal day? ${clip(a.typicalDay) || "(no answer)"}
4. Can you cook at home? ${a.canCook ?? "(no answer)"}
5. Can you get to the store or market? ${a.canTravel ?? "(no answer)"}
6. Foods you cannot or will not eat: ${clip(a.avoid) || "(no answer)"}`,
    schema: {
      type: "object",
      properties: {
        headline: { type: "string", description: "one sentence, the single most useful thing to know" },
        keyPoints: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 5 },
        foodPattern: { type: "string", description: "one or two sentences on what they usually eat" },
        barriers: { type: "array", items: { type: "string" }, maxItems: 4 },
        flags: { type: "array", items: { type: "string" }, maxItems: 4 },
        suggestedType: { type: "string", enum: ["produce", "meals"] },
        suggestedDelivery: { type: "boolean" },
        avoid: { type: "array", items: { type: "string" }, maxItems: 8 },
      },
      required: ["headline", "keyPoints", "foodPattern", "barriers", "flags", "suggestedType", "suggestedDelivery", "avoid"],
    },
  });

  if (!ai || !Array.isArray(ai.keyPoints)) return Response.json({ ...fallback, aiError: lastAiError });
  return Response.json({ ...({ ...fallback, ...ai, source: "ai" } satisfies IntakeSummary), model: lastAiModel, skipped: lastAiError });
}
