// Builds a one-week plan from what local stores and kitchens have in stock (sample data),
// within the carbohydrate target the clinician set. Traffic lights are computed in code, not by the model.
import placesData from "@/data/places.json";
import { askJSON, clip, lastAiError, lastAiModel, MODELS, readBody } from "@/lib/claude";
import { fallbackPlan } from "@/lib/fallback";
import { foods, lightFor } from "@/lib/foods";
import type { Lang, Place, Plan, PlanDay, Rx } from "@/lib/types";

export const maxDuration = 60;
const places = placesData as Place[];

export async function POST(req: Request) {
  const body = await readBody<{ rx: Rx; lang: Lang }>(req);
  const lang: Lang = body.lang === "en" ? "en" : "es";
  const r = body.rx;
  if (!r || (r.type !== "produce" && r.type !== "meals")) return Response.json({ days: [], shopping: [], tip: "", source: "fallback" });
  const rx: Rx = {
    ...r,
    carbTarget: Math.min(75, Math.max(15, Number(r.carbTarget) || 45)),
    avoid: Array.isArray(r.avoid) ? r.avoid.slice(0, 8).map((x) => clip(x, 40)) : [],
    note: clip(r.note, 400),
  };
  const fallback = fallbackPlan(rx, lang);

  const stock = places
    .filter((p) => (rx.type === "produce" ? p.kind !== "cocina" : p.kind === "cocina"))
    .map((p) => `${p.name} (${p.kind}, ${p.town}): ${p.stock.map((s) => s[lang]).join(", ")}`)
    .join("\n");
  const table = foods.map((f) => `${f.name}: ${f.carbsMin}-${f.carbsMax} g per ${f.serving.en}`).join("; ");

  const ai = await askJSON<{ days: { day: string; meals: { meal: string; dish: string; portion: string; carbs: number }[] }[]; shopping: { item: string; qty: string }[]; tip: string }>({
    model: MODELS.fast, // measured live: gives a complete, on-target week in about 16 s; the larger model was too slow for a demo
    timeoutMs: 40000,
    maxTokens: 3000,
    toolName: "write_week_plan",
    toolDescription: "Write a 7-day meal plan of familiar local dishes.",
    system: `Build a 7-day plan (Monday to Sunday; desayuno, almuerzo, cena each day) for an older adult in Puerto Rico. Write in ${lang === "es" ? "Puerto Rican Spanish" : "English (keep local dish names in Spanish)"}.
- Use familiar, traditional dishes. Do not turn the plan into a foreign diet.
- ${rx.type === "produce" ? "Lunch and dinner should be built mainly from the produce in stock below, plus basic pantry items. shopping = what to pick up this week, with simple quantities for one person." : "Lunch and dinner must be dishes the local kitchens below offer. Breakfast is simple and made at home without cooking skill. shopping = the kitchen dishes for the week with how many times each appears."}
- Hard limit: no meal, including breakfast, may be over ${rx.carbTarget} g of carbohydrate. Check each meal's total before writing it; if it is over, make the starchy portion smaller or swap it. Avoid sweet breads and pastries (mallorca, quesito).
- Give portions in household measures (taza, onzas, piezas) and an integer carbohydrate estimate.
- Never include these foods: ${rx.avoid.join(", ") || "(none)"}.
- Use the local food table for carbohydrate values where a dish matches.
- Dish names at most 8 words. tip = one short, kind, practical sentence about eating. No medication, glucose or dosing advice.`,
    user: `In stock this week (sample data):\n${stock}\n\nLocal food table (estimates): ${table}\n\nClinician note: ${rx.note || "none"}`,
    schema: {
      type: "object",
      properties: {
        days: {
          type: "array",
          minItems: 7,
          maxItems: 7,
          items: {
            type: "object",
            properties: {
              day: { type: "string" },
              meals: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: {
                  type: "object",
                  properties: {
                    meal: { type: "string", enum: ["desayuno", "almuerzo", "cena"] },
                    dish: { type: "string" },
                    portion: { type: "string" },
                    carbs: { type: "integer", minimum: 0, maximum: 150 },
                  },
                  required: ["meal", "dish", "portion", "carbs"],
                },
              },
            },
            required: ["day", "meals"],
          },
        },
        shopping: { type: "array", maxItems: 14, items: { type: "object", properties: { item: { type: "string" }, qty: { type: "string" } }, required: ["item", "qty"] } },
        tip: { type: "string" },
      },
      required: ["days", "shopping", "tip"],
    },
  });

  if (!ai || !Array.isArray(ai.days) || ai.days.length !== 7 || ai.days.some((d) => !Array.isArray(d.meals) || d.meals.length !== 3)) {
    return Response.json({ ...fallback, aiError: lastAiError });
  }
  const order = ["desayuno", "almuerzo", "cena"] as const;
  const days: PlanDay[] = ai.days.map((d) => ({
    day: d.day,
    meals: d.meals.map((m, i) => {
      const carbs = Math.max(0, Math.round(Number(m.carbs) || 0));
      return { meal: order[i], dish: m.dish, portion: m.portion, carbs, light: lightFor(carbs, carbs, rx.carbTarget) };
    }),
  }));
  const plan: Plan = { days, shopping: Array.isArray(ai.shopping) ? ai.shopping : fallback.shopping, tip: ai.tip || fallback.tip, source: "ai" };
  return Response.json({ ...plan, model: lastAiModel, skipped: lastAiError });
}
