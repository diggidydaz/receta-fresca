// Research-ready export (F17): one row per patient, numbers and categories only.
// No names, no towns, no free text (meal descriptions, notes, intake answers), so a row cannot be read back to a person.
import { hvsPositive } from "./care";
import type { PatientState } from "./store";
import type { Patient } from "./types";
import { summarizeWeek } from "./week";

const COLUMNS = [
  "patient_code", "age_band", "rx_type", "carb_target_g", "rx_weeks", "rx_date", "needs_delivery", "intake_helper",
  "meals_logged_total", "meals_7d", "green_7d", "yellow_7d", "red_7d", "could_not_eat_7d", "no_food_7d",
  "order_status", "teach_back_correct", "a1c_first", "a1c_latest", "a1c_latest_date", "hvs_latest_positive", "chw_notes",
] as const;

const cell = (v: string | number | boolean | null | undefined) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function outcomesCsv(patients: Patient[], records: Record<string, PatientState>, now = new Date()): string {
  const rows = patients.map((pt, i) => {
    const p = records[pt.id];
    if (!p) return null;
    const w = summarizeWeek(p.log, "en", now);
    const a1c = p.outcomes.a1c;
    const hvs = p.outcomes.hvs[0];
    const band = `${Math.floor(pt.age / 10) * 10}-${Math.floor(pt.age / 10) * 10 + 9}`;
    const row: Record<(typeof COLUMNS)[number], string | number | boolean | null> = {
      patient_code: `P${String(i + 1).padStart(3, "0")}`,
      age_band: band,
      rx_type: p.rx?.type ?? null,
      carb_target_g: p.rx?.carbTarget ?? null,
      rx_weeks: p.rx?.weeks ?? null,
      rx_date: p.rx ? p.rx.createdAt.slice(0, 10) : null,
      needs_delivery: p.rx ? p.rx.needsDelivery : null,
      intake_helper: p.intakeDone ? p.intake.helper ?? "self" : null,
      meals_logged_total: p.log.filter((e) => e.kind !== "skipped").length,
      meals_7d: w.meals,
      green_7d: w.green,
      yellow_7d: w.yellow,
      red_7d: w.red,
      could_not_eat_7d: w.skipped,
      no_food_7d: w.noFood,
      order_status: p.order?.status ?? null,
      teach_back_correct: p.teachBack ? p.teachBack.correct : null,
      a1c_first: a1c.length ? a1c[a1c.length - 1].value : null,
      a1c_latest: a1c.length ? a1c[0].value : null,
      a1c_latest_date: a1c.length ? a1c[0].at.slice(0, 10) : null,
      hvs_latest_positive: hvs ? hvsPositive(hvs.q1, hvs.q2) : null,
      chw_notes: p.chwNotes.length,
    };
    return COLUMNS.map((c) => cell(row[c])).join(",");
  }).filter((r): r is string => r !== null);
  return [COLUMNS.join(","), ...rows].join("\n") + "\n";
}

/** Saves text as a file in the browser. */
export function download(name: string, text: string, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
