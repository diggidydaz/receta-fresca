// Dish estimator. The local food table answers first; Claude (fast model) only guesses dishes
// the table does not know, and that guess is always flagged as low confidence.
import { askJSON, clip, MODELS, readBody } from "@/lib/claude";
import { buildEstimate, DEFAULT_TARGET, estimateFromTable } from "@/lib/foods";
import type { EstimateItem, Lang } from "@/lib/types";

export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await readBody<{ text: string; target: number; lang: Lang }>(req);
  const lang: Lang = body.lang === "en" ? "en" : "es";
  const text = clip(body.text, 300);
  const target = Number.isFinite(body.target) ? Math.min(75, Math.max(15, Number(body.target))) : DEFAULT_TARGET;

  const fromTable = estimateFromTable(text, target, lang);
  if (fromTable) return Response.json(fromTable);

  const ai = await askJSON<{ items: EstimateItem[] }>({
    model: MODELS.fast,
    timeoutMs: 12000,
    maxTokens: 500,
    toolName: "report_estimate",
    toolDescription: "Report a rough carbohydrate estimate for each dish the person ate.",
    system: `Estimate carbohydrates for Caribbean (Puerto Rico and US Virgin Islands) dishes, per typical serving. Give a range, not a single number. Suggest one small, kind swap per dish, addressed to the person as \"usted\" (never \"tú\"). Do not suggest diet or artificially sweetened products; prefer water, smaller portions, or vegetables. Write in ${lang === "es" ? "Puerto Rican Spanish" : "English"}. If the text is not food, return an empty list.`,
    user: `The person ate: "${text}"`,
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

  if (ai && Array.isArray(ai.items) && ai.items.length > 0) {
    const items = ai.items.map((i) => ({ ...i, carbsMin: Math.min(i.carbsMin, i.carbsMax), carbsMax: Math.max(i.carbsMin, i.carbsMax) }));
    return Response.json(buildEstimate(items, target, "low", lang));
  }

  return Response.json({
    items: [],
    carbsMin: 0,
    carbsMax: 0,
    light: "yellow",
    confidence: "low",
    message:
      lang === "es"
        ? "No pudimos calcular este plato ahora. Pregunte a su clínico o pruebe con otro nombre."
        : "We could not estimate this dish right now. Ask your clinician or try another name.",
  });
}
