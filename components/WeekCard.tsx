"use client";
// The last 7 days of the food log: one row per day, counted in code. Each light keeps its
// shape and word next to the number, so the pattern never depends on color alone.
import { Icon } from "./Icon";
import { common, useT } from "@/lib/i18n";
import type { L10n, LogEntry, SkipReason } from "@/lib/types";
import { summarizeWeek, weekMessage } from "@/lib/week";

export const skipWord: Record<SkipReason, L10n> = {
  noFood: { es: "No tenía comida", en: "Had no food" },
  unwell: { es: "Se sentía mal", en: "Felt unwell" },
  other: { es: "Otra razón", en: "Another reason" },
};

const chip = {
  green: { cls: "bg-go text-white border-go", icon: "check", word: common.green },
  yellow: { cls: "bg-wait text-ink border-ink", icon: "warn", word: common.yellow },
  red: { cls: "bg-stop text-white border-stop", icon: "hand", word: common.red },
} as const;

function Count({ light, n }: { light: keyof typeof chip; n: number }) {
  const { t } = useT();
  const c = chip[light];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-0.5 text-[0.9rem] font-bold ${c.cls}`}>
      <Icon name={c.icon} size={16} /> {n} {t(c.word)}
    </span>
  );
}

/** `audience` changes only the wording around the numbers: "you" for the patient, the patient's name for staff. */
export function WeekCard({ log, audience, title }: { log: LogEntry[]; audience: "patient" | "staff"; title?: string }) {
  const { t, lang } = useT();
  const w = summarizeWeek(log, lang);
  const heading = title ?? t(audience === "patient" ? { es: "Mi semana", en: "My week" } : { es: "Últimos 7 días", en: "Last 7 days" });
  return (
    <section className="flex flex-col gap-3 rounded-2xl border-2 border-rule bg-panel p-5">
      <h2 className="flex items-center gap-2"><Icon name="chart" /> {heading}</h2>
      <div className="flex flex-wrap gap-2">
        <Count light="green" n={w.green} />
        <Count light="yellow" n={w.yellow} />
        <Count light="red" n={w.red} />
      </div>
      {w.skipped > 0 && (
        <p className="flex items-start gap-2 text-[1.1rem] font-bold text-stop">
          <Icon name="warn" className="mt-0.5" />
          {t(audience === "patient"
            ? { es: `${w.skipped} ${w.skipped === 1 ? "vez" : "veces"} no pudo comer bien`, en: `${w.skipped} ${w.skipped === 1 ? "time" : "times"} you could not eat well` }
            : { es: `No pudo comer bien ${w.skipped} ${w.skipped === 1 ? "vez" : "veces"}${w.noFood ? ` (sin comida: ${w.noFood})` : ""}`, en: `Could not eat well ${w.skipped} ${w.skipped === 1 ? "time" : "times"}${w.noFood ? ` (no food: ${w.noFood})` : ""}` })}
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {w.days.map((d, i) => {
          const empty = d.green + d.yellow + d.red + d.skipped.length === 0;
          return (
            <li key={d.date} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t-2 border-rule/30 pt-2">
              <span className="w-24 shrink-0 font-bold capitalize">{i === 6 ? t({ es: "Hoy", en: "Today" }) : d.label}</span>
              {empty ? (
                <span className="text-muted">{t({ es: "Nada anotado", en: "Nothing noted" })}</span>
              ) : (
                <span className="flex flex-wrap gap-1.5">
                  {d.green > 0 && <Count light="green" n={d.green} />}
                  {d.yellow > 0 && <Count light="yellow" n={d.yellow} />}
                  {d.red > 0 && <Count light="red" n={d.red} />}
                  {d.skipped.map((r, k) => (
                    <span key={k} className="inline-flex items-center gap-1 rounded-full border-2 border-stop bg-panel px-2.5 py-0.5 text-[0.9rem] font-bold text-stop">
                      <Icon name="warn" size={16} /> {t(skipWord[r])}
                    </span>
                  ))}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {audience === "patient" && <p className="text-[1.1rem]">{t(weekMessage(w))}</p>}
    </section>
  );
}
