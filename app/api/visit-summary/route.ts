// Rewrites the prescription as a short, plain-language note for the patient, in both languages.
import { askJSON, clip, MODELS, readBody } from "@/lib/claude";
import { fallbackVisitSummary } from "@/lib/fallback";
import type { L10n, Lang, Rx } from "@/lib/types";

export const maxDuration = 30;

function cleanRx(rx: Partial<Rx> | undefined): Rx | null {
  if (!rx || (rx.type !== "produce" && rx.type !== "meals")) return null;
  return {
    patientId: clip(rx.patientId, 20),
    type: rx.type,
    carbTarget: Math.min(75, Math.max(15, Number(rx.carbTarget) || 45)),
    weeks: Math.min(12, Math.max(1, Number(rx.weeks) || 4)),
    avoid: Array.isArray(rx.avoid) ? rx.avoid.slice(0, 8).map((x) => clip(x, 40)) : [],
    needsDelivery: Boolean(rx.needsDelivery),
    note: clip(rx.note, 400),
    createdAt: clip(rx.createdAt, 40),
  };
}

export async function POST(req: Request) {
  const body = await readBody<{ rx: Rx; patientName: string; lang: Lang }>(req);
  const rx = cleanRx(body.rx);
  if (!rx) return Response.json({ points: [], source: "fallback" });
  const fallback = fallbackVisitSummary(rx);

  const ai = await askJSON<{ points: L10n[] }>({
    model: MODELS.fast,
    timeoutMs: 12000,
    maxTokens: 700,
    toolName: "write_visit_summary",
    toolDescription: "Write what the clinician prescribed, in plain words for the patient.",
    system: `Rewrite a food prescription as 3 to 5 short points the patient can understand and act on. Each point has a Spanish (es) and an English (en) version that say the same thing. Speak to the patient as "usted". One idea per point, at most 18 words. Include every fact given and add none. The carbohydrate number is the patient's goal per meal set by the clinician; say it as a goal (\"Su meta es...\"), not as what the food contains. If the clinician wrote a note, restate it faithfully in plain words.`,
    user: `Prescription:
- Type: ${rx.type === "produce" ? "fresh fruits, vegetables and root vegetables, picked up at a local colmado or farm" : "prepared meals from a local kitchen"}
- Length: ${rx.weeks} weeks
- Goal: about ${rx.carbTarget} grams of carbohydrates per meal (set by the clinician)
- Home delivery: ${rx.needsDelivery ? "yes" : "no, patient picks up"}
- Foods to leave out: ${rx.avoid.join(", ") || "none"}
- Clinician note: ${rx.note || "none"}`,
    schema: {
      type: "object",
      properties: {
        points: {
          type: "array",
          minItems: 3,
          maxItems: 5,
          items: { type: "object", properties: { es: { type: "string" }, en: { type: "string" } }, required: ["es", "en"] },
        },
      },
      required: ["points"],
    },
  });

  if (!ai || !Array.isArray(ai.points) || ai.points.length === 0) return Response.json(fallback);
  return Response.json({ points: ai.points, source: "ai" });
}
