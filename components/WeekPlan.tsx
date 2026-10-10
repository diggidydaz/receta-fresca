"use client";
// The whole week on one page: used for printing and for the family's read-only view.
import { TrafficLight } from "./ui";
import { lightFor } from "@/lib/foods";
import { useT } from "@/lib/i18n";
import type { L10n } from "@/lib/types";

export const mealLabel: Record<"desayuno" | "almuerzo" | "cena", L10n> = {
  desayuno: { es: "Desayuno", en: "Breakfast" },
  almuerzo: { es: "Almuerzo", en: "Lunch" },
  cena: { es: "Cena", en: "Dinner" },
};

type Day = { day: string; meals: { meal: keyof typeof mealLabel; dish: string; portion: string; carbs: number }[] };

export function WeekPlan({ days, goal }: { days: Day[]; goal: number }) {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-4">
      {days.map((d, i) => (
        <section key={i} className="break-inside-avoid rounded-2xl border-2 border-rule bg-panel p-4">
          <h3 className="mb-2">{d.day}</h3>
          <ul className="flex flex-col gap-3">
            {d.meals.map((m, k) => (
              <li key={k} className="flex flex-col gap-1">
                <span className="font-bold">{t(mealLabel[m.meal])}: {m.dish}</span>
                <span>{m.portion}</span>
                <span className="flex flex-wrap items-center gap-2">
                  {t({ es: "Estimado", en: "Estimate" })}: {m.carbs} g <TrafficLight compact light={lightFor(m.carbs, m.carbs, goal)} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
