// Writes the plain-language note the patient sees after the visit, in both languages.
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

  // The facts of the prescription are written from a fixed, reviewed template, never by the model.
  // The model's only job is to restate the clinician's own free-text note in plain words, in both languages.
  if (!rx.note.trim()) return Response.json({ ...fallback, source: "template" });

  const ai = await askJSON<{ note: L10n }>({
    model: MODELS.fast,
    timeoutMs: 12000,
    maxTokens: 300,
    toolName: "restate_note",
    toolDescription: "Restate the clinician's note in plain words for the patient, in Spanish and English.",
    system: `Restate a clinician's short note to a patient in plain words, once in Spanish (es) and once in English (en). Speak to the patient as "usted". At most 25 words each. Keep every fact and instruction; add nothing; do not give medical advice of your own. Each version must be entirely in its own language.`,
    user: `Clinician's note: "${rx.note}"`,
    schema: {
      type: "object",
      properties: { note: { type: "object", properties: { es: { type: "string" }, en: { type: "string" } }, required: ["es", "en"] } },
      required: ["note"],
    },
  });

  if (!ai || !ai.note || typeof ai.note.es !== "string" || typeof ai.note.en !== "string") return Response.json(fallback);
  const base = fallbackVisitSummary({ ...rx, note: "" }).points;
  return Response.json({ points: [...base, { es: `Nota de su clínico: ${ai.note.es}`, en: `Note from your clinician: ${ai.note.en}` }], source: "ai" });
}
