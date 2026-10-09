// Dish estimator. The local food table answers first; Claude (fast model) only guesses dishes
// the table does not know, and that guess is always flagged as low confidence.
import { askJSON, clip, MODELS, readBody } from "@/lib/claude";
import { buildEstimate, DEFAULT_TARGET, parseMeal, tableItems } from "@/lib/foods";
import type { EstimateItem, Lang } from "@/lib/types";

export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await readBody<{ text: string; target: number; lang: Lang }>(req);
  const lang: Lang = body.lang === "en" ? "en" : "es";
  const text = clip(body.text, 300);
  const target = Number.isFinite(body.target) ? Math.min(75, Math.max(15, Number(body.target))) : DEFAULT_TARGET;

  const { found, leftover } = parseMeal(text);
  const known = tableItems(found, lang);
  // Everything recognized from the table: answer at once, no AI call.
  if (known.length > 0 && !leftover) return Response.json(buildEstimate(known, target, "table", lang));
  const ask = known.length > 0 ? leftover : text;
  if (!ask.trim()) return Response.json(nothing(lang));

  const ai = await askJSON<{ items: EstimateItem[] }>({
    model: MODELS.fast,
    timeoutMs: 12000,
    maxTokens: 500,
    toolName: "report_estimate",
    toolDescription: "Report a rough carbohydrate estimate for each dish the person ate.",
    system: `Estimate carbohydrates for Caribbean (Puerto Rico and US Virgin Islands) dishes, per typical serving. Give a range, not a single number. Suggest one small, kind swap per dish, addressed to the person as \"usted\" (never \"tú\"). Do not suggest diet or artificially sweetened products; prefer water, smaller portions, or vegetables. Write in ${lang === "es" ? "Puerto Rican Spanish" : "English"}. If the text is not food or drink, or says they ate nothing, return an empty list.`,
    user: `The person ate: "${ask}"`,
    schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          maxItems: 5,
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              serving: { type: "string", description: "typical serving in plain words" },
              carbsMin: { type: "integer", minimum: 0, maximum: 150 },
              carbsMax: { type: "integer", minimum: 0, maximum: 200 },
              swap: { type: "string", description: "one short, practical swap idea" },
            },
            required: ["name", "serving", "carbsMin", "carbsMax", "swap"],
          },
        },
      },
      required: ["items"],
    },
  });

  const aiLabel = lang === "es" ? "Cálculo aproximado de IA" : "Rough AI guess";
  const guessed: EstimateItem[] = (ai && Array.isArray(ai.items) ? ai.items : [])
    .filter((i) => i && typeof i.name === "string" && Number.isFinite(i.carbsMin) && Number.isFinite(i.carbsMax))
    .map((i) => ({ name: clip(i.name, 80), serving: clip(i.serving, 80), swap: clip(i.swap, 160), carbsMin: Math.min(i.carbsMin, i.carbsMax), carbsMax: Math.max(i.carbsMin, i.carbsMax), source: aiLabel }));

  if (known.length > 0) {
    // Table dishes plus a part the table does not know: add the AI guess, or say plainly what was not counted.
    return Response.json(guessed.length > 0 ? buildEstimate([...known, ...guessed], target, "mixed", lang) : buildEstimate(known, target, "table", lang, leftover));
  }
  if (guessed.length > 0) return Response.json(buildEstimate(guessed, target, "low", lang));
  return Response.json(nothing(lang));
}

function nothing(lang: Lang) {
  return {
    items: [],
    carbsMin: 0,
    carbsMax: 0,
    light: "yellow",
    confidence: "low",
    message:
      lang === "es"
        ? "No pudimos calcular esta comida. Pruebe con el nombre del plato, o pregunte a su clínico."
        : "We could not estimate this meal. Try the name of the dish, or ask your clinician.",
  };
}
