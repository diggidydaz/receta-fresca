// Builds a one-week plan from what local stores and kitchens have in stock (sample data),
// within the carbohydrate target the clinician set. Traffic lights are computed in code, not by the model.
import placesData from "@/data/places.json";
import { askJSON, clip, lastAiError, lastAiModel, PLAN_MODELS, readBody } from "@/lib/claude";
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

  const kitchenDishes = Array.from(new Set(places.filter((p) => p.kind === "cocina").flatMap((p) => p.stock.map((d) => d[lang]))));
  const mealSchema = (dishEnum?: string[]) => ({
    type: "object",
    properties: {
      dish: dishEnum ? { type: "string", enum: dishEnum } : { type: "string" },
      portion: { type: "string" },
      carbs: { type: "integer", minimum: 0, maximum: 150 },
    },
    required: ["dish", "portion", "carbs"],
  });
  // For prepared meals, lunch and dinner can only be dishes the kitchens really offer: the schema allows nothing else.
  const mainMeal = mealSchema(rx.type === "meals" ? kitchenDishes : undefined);
  type AiMeal = { dish: string; portion: string; carbs: number };

  const ai = await askJSON<{ days: { day: string; desayuno: AiMeal; almuerzo: AiMeal; cena: AiMeal }[]; shopping: { item: string; qty: string }[]; tip: string }>({
    model: PLAN_MODELS,
    timeoutMs: 40000,
    maxTokens: 3000,
    toolName: "write_week_plan",
    toolDescription: "Write a 7-day meal plan of familiar local dishes.",
    system: `Build a 7-day plan (Monday to Sunday; desayuno, almuerzo, cena each day) for an older adult in Puerto Rico. Write in ${lang === "es" ? "Puerto Rican Spanish" : "English (keep local dish names in Spanish)"}.
- Use familiar, traditional dishes. Do not turn the plan into a foreign diet.
- ${rx.type === "produce" ? "Lunch and dinner should be built mainly from the produce in stock below, plus basic pantry items. shopping = what to pick up this week from those stores, with simple quantities for one person." : "Lunch and dinner are chosen from the kitchens' dishes; vary them through the week and do not repeat a dish on the same day. Breakfast is simple and needs no cooking skill. shopping = each kitchen dish used, with how many times it appears this week (for example \"2 veces\"); do not list groceries."}
- Breakfast: simple, not fried, no processed meats (no salami, jamón, salchicha), no sweet breads or pastries (mallorca, quesito).
- Hard limit: no meal may be over ${rx.carbTarget} g of carbohydrate. Check each meal before writing it; if it is over, make the starchy portion smaller or swap it.
- Give portions in household measures (taza, onzas, piezas) and an integer carbohydrate estimate. Use the local food table for carbohydrate values where a dish matches.
- Never include these foods: ${rx.avoid.join(", ") || "(none)"}.
- Dish names at most 8 words. tip = one short, kind, practical sentence about eating, addressed as "usted". No medication, glucose or dosing advice.`,
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
            properties: { day: { type: "string" }, desayuno: mealSchema(), almuerzo: mainMeal, cena: mainMeal },
            required: ["day", "desayuno", "almuerzo", "cena"],
          },
        },
        shopping: { type: "array", maxItems: 14, items: { type: "object", properties: { item: { type: "string" }, qty: { type: "string" } }, required: ["item", "qty"] } },
        tip: { type: "string" },
      },
      required: ["days", "shopping", "tip"],
    },
  });

  const order = ["desayuno", "almuerzo", "cena"] as const;
  const okMeal = (m: unknown): m is AiMeal => typeof m === "object" && m !== null && typeof (m as AiMeal).dish === "string" && typeof (m as AiMeal).portion === "string";
  if (!ai || !Array.isArray(ai.days) || ai.days.length !== 7 || ai.days.some((d) => !d || !order.every((k) => okMeal(d[k])))) {
    return Response.json({ ...fallback, aiError: lastAiError });
  }
  if (rx.type === "meals" && ai.days.some((d) => !kitchenDishes.includes(d.almuerzo.dish) || !kitchenDishes.includes(d.cena.dish))) {
    return Response.json({ ...fallback, aiError: "plan used a dish the kitchens do not offer" });
  }
  const days: PlanDay[] = ai.days.map((d) => ({
    day: clip(d.day, 20),
    meals: order.map((k) => {
      const carbs = Math.max(0, Math.round(Number(d[k].carbs) || 0));
      return { meal: k, dish: clip(d[k].dish, 90), portion: clip(d[k].portion, 90), carbs, light: lightFor(carbs, carbs, rx.carbTarget) };
    }),
  }));
  const plan: Plan = { days, shopping: Array.isArray(ai.shopping) ? ai.shopping : fallback.shopping, tip: ai.tip || fallback.tip, source: "ai" };
  return Response.json({ ...plan, model: lastAiModel, skipped: lastAiError });
}
