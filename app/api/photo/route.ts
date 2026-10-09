// Looks at a photo of a plate and names the dishes on it. It returns names only, never numbers:
// the person confirms the list, and the carbohydrate values then come from the normal estimate.
// The photo is passed to the model for this one request and is not stored by this app.
import { askJSON, clip, lastAiError, MODELS, readBody } from "@/lib/claude";
import { foods } from "@/lib/foods";
import type { Lang } from "@/lib/types";

export const maxDuration = 30;
const TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export async function POST(req: Request) {
  const body = await readBody<{ image: string; lang: Lang }>(req);
  const lang: Lang = body.lang === "en" ? "en" : "es";
  const m = typeof body.image === "string" ? /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(body.image) : null;
  // About 3 MB of image at most; the app shrinks photos to far less before sending.
  if (!m || m[2].length > 4_200_000) return Response.json({ ok: false, dishes: [], reason: "no usable image" });
  const mediaType = TYPES.find((t) => t === m[1]);
  if (!mediaType) return Response.json({ ok: false, dishes: [], reason: "unsupported image type" });

  const known = foods.map((f) => f.name).join(", ");
  const ai = await askJSON<{ dishes: string[] }>({
    model: [MODELS.smart, MODELS.fast],
    timeoutMs: 20000,
    maxTokens: 300,
    image: { mediaType, data: m[2] },
    toolName: "name_dishes",
    toolDescription: "List the foods and drinks visible in the photo.",
    system: `Name the foods and drinks you can see in a photo of a meal from Puerto Rico or the US Virgin Islands. Names only: no amounts, no nutrition numbers, no advice, no comments about the person.
- Use the everyday local name in ${lang === "es" ? "Puerto Rican Spanish" : "English, keeping local dish names in Spanish"}.
- When a dish matches one on this list, use that exact name: ${known}.
- One entry per distinct food or drink, at most 6, most prominent first. Include sugary drinks.
- Only list what is clearly visible. If you are unsure between two dishes, give the more common one.
- If the photo shows no food or drink, return an empty list.`,
    user: "What foods and drinks are on this plate or table?",
    schema: {
      type: "object",
      properties: { dishes: { type: "array", maxItems: 6, items: { type: "string" } } },
      required: ["dishes"],
    },
  });

  if (!ai || !Array.isArray(ai.dishes)) return Response.json({ ok: false, dishes: [], reason: lastAiError || "no answer" });
  const dishes = ai.dishes.filter((d) => typeof d === "string").map((d) => clip(d, 60).trim()).filter(Boolean).slice(0, 6);
  return Response.json({ ok: true, dishes });
}
