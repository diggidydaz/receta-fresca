// Follow-up rules for clinicians and promotoras, computed in code from the patient's own record.
import type { PatientState } from "./store";
import type { HvsAnswer, L10n } from "./types";
import { summarizeWeek } from "./week";

/** Days with no order after a prescription before a promotora is asked to follow up (hotspot H3). */
export const NON_REDEMPTION_DAYS = 3;
const DAY = 24 * 60 * 60 * 1000;

export function daysSince(iso: string, now = Date.now()): number {
  return Math.floor((now - new Date(iso).getTime()) / DAY);
}

/** Hunger Vital Sign: positive (food insecurity risk) if either statement is often or sometimes true. */
export function hvsPositive(q1: HvsAnswer, q2: HvsAnswer): boolean {
  return q1 !== "never" || q2 !== "never";
}

export type Alert = { key: "notRedeemed" | "noFood" | "hvs" | "teachBack" | "noIntake"; text: L10n; urgent: boolean };

/** Reasons to reach out to this patient, most urgent first. Empty when nothing needs attention. */
export function alertsFor(p: PatientState, now = new Date()): Alert[] {
  const out: Alert[] = [];
  const w = summarizeWeek(p.log, "es", now);
  if (w.noFood > 0) out.push({ key: "noFood", urgent: true, text: { es: `Dijo ${w.noFood} ${w.noFood === 1 ? "vez" : "veces"} esta semana que no tenía comida`, en: `Said ${w.noFood} ${w.noFood === 1 ? "time" : "times"} this week they had no food` } });
  if (p.rx && !p.order) {
    const d = daysSince(p.rx.createdAt, now.getTime());
    if (d >= NON_REDEMPTION_DAYS) out.push({ key: "notRedeemed", urgent: true, text: { es: `Receta sin recoger hace ${d} días`, en: `Prescription not picked up for ${d} days` } });
  }
  const hvs = p.outcomes.hvs[0];
  if (hvs && hvsPositive(hvs.q1, hvs.q2)) out.push({ key: "hvs", urgent: false, text: { es: "Riesgo de inseguridad alimentaria (Hunger Vital Sign)", en: "Food insecurity risk (Hunger Vital Sign)" } });
  if (p.teachBack && !p.teachBack.correct) out.push({ key: "teachBack", urgent: false, text: { es: "No contestó bien la pregunta del plan: repasar la meta", en: "Missed the plan question: go over the goal again" } });
  if (!p.intakeDone && !p.rx) out.push({ key: "noIntake", urgent: false, text: { es: "No ha contestado las preguntas antes de la cita", en: "Has not answered the pre-visit questions" } });
  return out;
}
