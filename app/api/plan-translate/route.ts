// Puts an existing weekly plan into the other language, so the whole screen reads in one language.
// Only the words change: the meals, the carbohydrate numbers and the traffic lights stay exactly as they were.
import { askJSON, clip, lastAiError, MODELS, readBody } from "@/lib/claude";
import type { Lang, Light, Plan, PlanMeal } from "@/lib/types";

export const maxDuration = 45;

const MEALS = ["desayuno", "almuerzo", "cena"];
const LIGHTS = ["green", "yellow", "red"];

export async function POST(req: Request) {
  const body = await readBody<{ plan: Plan; lang: Lang }>(req);
  const lang: Lang = body.lang === "en" ? "en" : "es";
  const p = body.plan;
  const fail = (aiError: string) => Response.json({ ok: false, aiError });
  if (!p || !Array.isArray(p.days) || p.days.length === 0 || p.days.length > 7 || !Array.isArray(p.shopping)) return fail("no plan to translate");

  // Rebuild the plan from checked values only, so nothing unexpected is passed through.
  const days = p.days.map((d) => ({
    day: clip(d?.day, 20),
    meals: (Array.isArray(d?.meals) ? d.meals : []).slice(0, 3).filter((m) => m && MEALS.includes(m.meal) && LIGHTS.includes(m.light)).map((m) => ({
      meal: m.meal as PlanMeal["meal"],
      dish: clip(m.dish, 90),
      portion: clip(m.portion, 90),
      carbs: Math.max(0, Math.round(Number(m.carbs) || 0)),
      light: m.light as Light,
    })),
  }));
  const shopping = p.shopping.slice(0, 14).map((i) => ({ item: clip(i?.item, 80), qty: clip(i?.qty, 60) }));
  const tip = clip(p.tip, 200);

  const unique = Array.from(new Set([...days.flatMap((d) => [d.day, ...d.meals.flatMap((m) => [m.dish, m.portion])]), ...shopping.flatMap((i) => [i.item, i.qty]), tip].filter((s) => s.trim())));
  if (unique.length === 0) return fail("no text to translate");

  const ai = await askJSON<{ texts: string[] }>({
    model: MODELS.fast,
    timeoutMs: 30000,
    maxTokens: 3000,
    toolName: "write_translations",
    toolDescription: "Return every numbered text translated, in the same order.",
    system: `Translate each numbered text ${lang === "es" ? "from English into Puerto Rican Spanish" : "from Spanish into English"}. The texts are day names, dishes, portions, shopping items, quantities and one short tip from a weekly meal plan.
- Return exactly ${unique.length} texts, in the same order, one per input text.
- Every text must end up entirely in ${lang === "es" ? "Spanish" : "English"}. Do not leave a mix of languages.
- Translate dish names in full (for example "Pollo guisado con ensalada" = "Stewed chicken with salad"). Keep the original word only for a dish that has no name in the other language (mofongo, pasteles, sofrito, tostones).
- Keep every number and amount exactly as it is. Translate the units (taza = cup, onzas = oz, libra = lb, mazo = bunch, veces = times).
- A text that is already in the target language is returned unchanged.
- Do not add advice, notes or explanations.${lang === "es" ? ' Address the person as "usted".' : ""}`,
    user: unique.map((s, i) => `${i + 1}. ${s}`).join("\n"),
    schema: {
      type: "object",
      properties: { texts: { type: "array", minItems: unique.length, maxItems: unique.length, items: { type: "string" } } },
      required: ["texts"],
    },
  });
  if (!ai || !Array.isArray(ai.texts) || ai.texts.length !== unique.length || ai.texts.some((s) => typeof s !== "string" || !s.trim())) {
    return fail(lastAiError || "translation did not match the plan");
  }
  const map = new Map(unique.map((s, i) => [s, ai.texts[i].replace(/^\d+\.\s*/, "").trim()]));
  const tr = (s: string, max: number) => clip(map.get(s) ?? s, max);
  const plan: Plan = {
    days: days.map((d) => ({ day: tr(d.day, 20), meals: d.meals.map((m) => ({ ...m, dish: tr(m.dish, 90), portion: tr(m.portion, 90) })) })),
    shopping: shopping.map((i) => ({ item: tr(i.item, 80), qty: tr(i.qty, 60) })),
    tip: tr(tip, 200),
    source: p.source === "ai" ? "ai" : "fallback",
    lang,
  };
  return Response.json({ ok: true, plan });
}
