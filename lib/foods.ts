// Dish estimator grounded in the local food table. Pure functions: safe on server and client.
import foodsData from "@/data/foods.json";
import type { Estimate, EstimateItem, Food, Lang, Light } from "./types";

export const foods = foodsData as Food[];
export const DEFAULT_TARGET = 45; // grams of carbohydrate per meal; the clinician sets the real one

export function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9&\s]/g, " ").replace(/\s+/g, " ").trim();
}

/** Finds table dishes mentioned in free text. Longest names win so "arroz con gandules" beats "arroz". */
export function matchFoods(text: string): Food[] {
  let rest = ` ${normalize(text)} `;
  const pairs = foods
    .flatMap((f) => [normalize(f.name), ...f.aliases.map(normalize)].map((a) => ({ a, f })))
    .sort((x, y) => y.a.length - x.a.length);
  const found: Food[] = [];
  for (const { a, f } of pairs) {
    const needle = ` ${a} `;
    const plural = ` ${a}s `;
    const hit = rest.includes(needle) ? needle : rest.includes(plural) ? plural : null;
    if (hit) {
      rest = rest.replace(hit, " | ");
      if (!found.includes(f)) found.push(f);
    }
  }
  return found;
}

/** Compares a meal's carbohydrate estimate to the clinician's per-meal target. */
export function lightFor(carbsMin: number, carbsMax: number, target: number): Light {
  const mid = (carbsMin + carbsMax) / 2;
  if (mid <= target) return "green";
  if (mid <= target * 1.33) return "yellow";
  return "red";
}

export function buildEstimate(items: EstimateItem[], target: number, confidence: Estimate["confidence"], lang: Lang): Estimate {
  const carbsMin = items.reduce((n, i) => n + i.carbsMin, 0);
  const carbsMax = items.reduce((n, i) => n + i.carbsMax, 0);
  const light = lightFor(carbsMin, carbsMax, target);
  const message =
    confidence === "table"
      ? lang === "es"
        ? "Valores de nuestra tabla de comida local, por porción típica."
        : "Values from our local food table, per typical serving."
      : lang === "es"
        ? "Este plato no está en nuestra tabla. Es un cálculo aproximado de la inteligencia artificial. Confirme con su clínico."
        : "This dish is not in our table. It is a rough AI guess. Check with your clinician.";
  return { items, carbsMin, carbsMax, light, confidence, message };
}

/** Plain-language provenance for one dish, shown under each estimate. */
export function sourceLabel(f: Food, lang: Lang): string {
  const S = lang === "es";
  const src =
    f.source.match === "direct"
      ? S ? "Fuente: USDA FoodData Central" : "Source: USDA FoodData Central"
      : f.source.match === "closest"
        ? S ? "Fuente: USDA FoodData Central (alimento parecido)" : "Source: USDA FoodData Central (closest food)"
        : S ? "Valor preliminar, todavía sin fuente" : "Draft value, no source yet";
  const rev = f.clinicianReviewed ? (S ? " · Revisado por una profesional de cuidado de diabetes" : " · Reviewed by a diabetes care professional") : "";
  return src + rev;
}

export function estimateFromTable(text: string, target: number, lang: Lang): Estimate | null {
  const hits = matchFoods(text);
  if (hits.length === 0) return null;
  const items: EstimateItem[] = hits.map((f) => ({
    name: f.name,
    serving: f.serving[lang],
    carbsMin: f.carbsMin,
    carbsMax: f.carbsMax,
    swap: f.swap[lang],
    source: sourceLabel(f, lang),
  }));
  return buildEstimate(items, target, "table", lang);
}
