// Weekly pattern from the food log, computed in code (never by a model).
// A "week" is the last 7 calendar days ending today, in the device's own time zone.
import type { Lang, Light, LogEntry, SkipReason } from "./types";

export type DaySummary = {
  date: string;            // YYYY-MM-DD, local
  label: string;           // short weekday name in the person's language
  green: number;
  yellow: number;
  red: number;
  skipped: SkipReason[];   // times the person said they could not eat well that day
};

export type WeekSummary = {
  days: DaySummary[];      // oldest first, today last
  green: number;
  yellow: number;
  red: number;
  meals: number;
  skipped: number;
  noFood: number;          // "I had no food": a food-security signal for the clinician and promotora
  daysLogged: number;
};

/** Local calendar date of a timestamp, as YYYY-MM-DD. */
export function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function isToday(iso: string, now = new Date()): boolean {
  return dayKey(new Date(iso)) === dayKey(now);
}

export function summarizeWeek(log: LogEntry[], lang: Lang, now = new Date()): WeekSummary {
  const days: DaySummary[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    days.push({ date: dayKey(d), label: d.toLocaleDateString(lang === "es" ? "es-PR" : "en-US", { weekday: "short" }), green: 0, yellow: 0, red: 0, skipped: [] });
  }
  const byDate = new Map(days.map((d) => [d.date, d]));
  for (const e of log) {
    const day = byDate.get(dayKey(new Date(e.at)));
    if (!day) continue;
    if (e.kind === "skipped") day.skipped.push(e.reason);
    else day[e.estimate.light as Light] += 1;
  }
  const sum = (f: (d: DaySummary) => number) => days.reduce((n, d) => n + f(d), 0);
  const green = sum((d) => d.green), yellow = sum((d) => d.yellow), red = sum((d) => d.red);
  return {
    days,
    green,
    yellow,
    red,
    meals: green + yellow + red,
    skipped: sum((d) => d.skipped.length),
    noFood: sum((d) => d.skipped.filter((r) => r === "noFood").length),
    daysLogged: days.filter((d) => d.green + d.yellow + d.red + d.skipped.length > 0).length,
  };
}

/**
 * One kind, factual sentence about the week for the patient. Fixed text chosen by rules,
 * so it never judges, never gives medical advice, and reads the same every time.
 */
export function weekMessage(w: WeekSummary): { es: string; en: string } {
  if (w.meals === 0 && w.skipped === 0) return { es: "Todavía no hay comidas anotadas esta semana. Cuando anote una, aparecerá aquí.", en: "No meals noted this week yet. When you note one, it will show here." };
  if (w.noFood > 0) return { es: "Algunos días no tuvo comida. Su clínico y su promotora lo verán para poder ayudarle.", en: "Some days you did not have food. Your clinician and community health worker will see this so they can help." };
  if (w.meals > 0 && w.green / w.meals >= 0.6) return { es: `Buena semana: ${w.green} de ${w.meals} comidas fueron verdes. Siga así.`, en: `Good week: ${w.green} of ${w.meals} meals were green. Keep it up.` };
  if (w.red > w.green) return { es: "Esta semana hubo más comidas rojas que verdes. Las ideas de cada comida pueden ayudar. Puede hablarlo con su clínico.", en: "This week had more red meals than green ones. The idea under each meal can help. You can talk it over with your clinician." };
  return { es: `Esta semana anotó ${w.meals} comidas en ${w.daysLogged} días. Cada comida anotada ayuda a su clínico a entender.`, en: `This week you noted ${w.meals} meals on ${w.daysLogged} days. Every meal you note helps your clinician understand.` };
}
