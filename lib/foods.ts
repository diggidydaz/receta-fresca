// Dish estimator grounded in the local food table. Pure functions: safe on server and client.
import foodsData from "@/data/foods.json";
import type { Estimate, EstimateItem, Food, Lang, Light, Size } from "./types";

export const foods = foodsData as Food[];
export const DEFAULT_TARGET = 45; // grams of carbohydrate per meal; the clinician sets the real one

export function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9&\s]/g, " ").replace(/\s+/g, " ").trim();
}

// Words that carry no food meaning; what is left after removing table dishes and these is "unrecognized".
const FILLER = new Set(
  "dos tres cuatro cinco seis two three four five six poquita medio media mitad pedacito chiquito chiquita mucha doble bastante lleno half little bit double large extra con y de del la el lo los las un una unos unas me mi comi comio almorce desayune cene tome hoy ayer poco poquito mucho plato platos taza tazas pedazo pedazos pieza piezas porcion vaso vasos tambien mas al a en para por que solo como fue i ate had have with and some of the for my lunch breakfast dinner today just only piece pieces cup cups plate glass small big grande pequeno pequena".split(" ")
);
const NOTHING = /^(no (he )?com(i|ido)( nada)?|nada|ninguna|nothing|none|i (did not|didn t) eat( anything)?)$/;

/** Dish name plus simple singular/plural variants, so "maduro", "maduros", "pastel" and "pasteles" all match. */
function variants(a: string): string[] {
  const out = new Set([a, `${a}s`, `${a}es`]);
  if (a.endsWith("es") && a.length > 4) out.add(a.slice(0, -2));
  if (a.endsWith("s") && a.length > 3) out.add(a.slice(0, -1));
  return [...out];
}

/** How much a size choice scales a typical serving. */
export const SIZE_FACTOR: Record<Size, number> = { small: 0.5, normal: 1, large: 1.5 };

// Words just before a dish that say how much of it there was ("un poco de arroz", "doble mofongo").
const SMALL_WORDS = /\b(poco|poquito|poquita|medio|media|mitad|pedacito|chiquito|chiquita|pequeno|pequena|half|little|small|bit)\b/;
const LARGE_WORDS = /\b(mucho|mucha|doble|grande|bastante|lleno|double|large|big|extra)\b/;

/**
 * Recomputes an estimate after the person says how much of each food they ate.
 * `est` must hold the typical-serving values; the result holds the adjusted ones.
 */
export function applySizes(est: Estimate, sizes: Size[], target: number): Estimate {
  const items = est.items.map((it, i) => {
    const f = SIZE_FACTOR[sizes[i] ?? "normal"];
    return { ...it, size: sizes[i] ?? "normal", carbsMin: Math.round(it.carbsMin * f), carbsMax: Math.round(it.carbsMax * f) };
  });
  const carbsMin = items.reduce((n, i) => n + i.carbsMin, 0);
  const carbsMax = items.reduce((n, i) => n + i.carbsMax, 0);
  let light = lightFor(carbsMin, carbsMax, target);
  if (est.unmatched && light === "green") light = "yellow";
  return { ...est, items, carbsMin, carbsMax, light };
}

/** Finds table dishes mentioned in free text, and reports the food words it could not place. */
export function parseMeal(text: string): { found: Food[]; leftover: string; sizes: Record<string, Size> } {
  const norm = normalize(text);
  if (!norm || NOTHING.test(norm)) return { found: [], leftover: "", sizes: {} };
  let rest = ` ${norm} `;
  const pairs = foods
    .flatMap((f) => [normalize(f.name), ...f.aliases.map(normalize)].flatMap(variants).map((a) => ({ a, f })))
    .sort((x, y) => y.a.length - x.a.length); // longest first, so "arroz con gandules" beats "arroz"
  const found: Food[] = [];
  const sizes: Record<string, Size> = {};
  for (const { a, f } of pairs) {
    const needle = ` ${a} `;
    while (rest.includes(needle)) {
      // Look at the few words just before the dish for a size word.
      const before = rest.slice(0, rest.indexOf(needle)).split("|").pop() ?? "";
      const near = before.trim().split(" ").slice(-3).join(" ");
      if (!sizes[f.id]) {
        if (SMALL_WORDS.test(near)) sizes[f.id] = "small";
        else if (LARGE_WORDS.test(near)) sizes[f.id] = "large";
      }
      rest = rest.replace(needle, " | ");
      if (!found.includes(f)) found.push(f);
    }
  }
  const leftover = rest
    .split("|")
    .map((part) => part.split(" ").filter((w) => w && !FILLER.has(w) && !/^\d+$/.test(w)).join(" "))
    .filter(Boolean)
    .join(", ");
  return { found, leftover, sizes };
}

export function matchFoods(text: string): Food[] {
  return parseMeal(text).found;
}

/** Compares a meal's carbohydrate estimate to the clinician's per-meal target. */
export function lightFor(carbsMin: number, carbsMax: number, target: number): Light {
  const mid = (carbsMin + carbsMax) / 2;
  if (mid <= target) return "green";
  if (mid <= target * 1.33) return "yellow";
  return "red";
}

export function buildEstimate(items: EstimateItem[], target: number, confidence: Estimate["confidence"], lang: Lang, unmatched = ""): Estimate {
  const S = lang === "es";
  const carbsMin = items.reduce((n, i) => n + i.carbsMin, 0);
  const carbsMax = items.reduce((n, i) => n + i.carbsMax, 0);
  let light = lightFor(carbsMin, carbsMax, target);
  // If part of the meal could not be counted, the total is too low: never show green for it.
  if (unmatched && light === "green") light = "yellow";
  const message =
    confidence === "table"
      ? S ? "Valores de nuestra tabla de comida local, por porción típica." : "Values from our local food table, per typical serving."
      : confidence === "mixed"
        ? S ? "Parte viene de nuestra tabla de comida local y parte es un cálculo aproximado de la inteligencia artificial. Por porción típica." : "Part comes from our local food table and part is a rough AI guess. Per typical serving."
        : S ? "Este plato no está en nuestra tabla. Es un cálculo aproximado de la inteligencia artificial. Confirme con su clínico." : "This dish is not in our table. It is a rough AI guess. Check with your clinician.";
  return { items, carbsMin, carbsMax, light, confidence, message, ...(unmatched ? { unmatched } : {}) };
}

/** Table values per typical serving. `sizes` carries any size the person's own words suggested. */
export function tableItems(found: Food[], lang: Lang, sizes: Record<string, Size> = {}): EstimateItem[] {
  return found.map((f) => ({ name: f.name, serving: f.serving[lang], carbsMin: f.carbsMin, carbsMax: f.carbsMax, swap: f.swap[lang], source: sourceLabel(f, lang), ...(sizes[f.id] ? { size: sizes[f.id] } : {}) }));
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
  const { found, leftover, sizes } = parseMeal(text);
  if (found.length === 0) return null;
  return buildEstimate(tableItems(found, lang, sizes), target, "table", lang, leftover);
}
