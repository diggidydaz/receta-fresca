// Dish estimator grounded in the local food table. Pure functions: safe on server and client.
import foodsData from "@/data/foods.json";
import type { Estimate, EstimateItem, Food, Lang, Light } from "./types";

export const foods = foodsData as Food[];
export const DEFAULT_TARGET = 45; // grams of carbohydrate per meal; the clinician sets the real one

export function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9&\s]/g, " ").replace(/\s+/g, " ").trim();
}

// Words that carry no food meaning; what is left after removing table dishes and these is "unrecognized".
const FILLER = new Set(
  "con y de del la el lo los las un una unos unas me mi comi comio almorce desayune cene tome hoy ayer poco poquito mucho plato platos taza tazas pedazo pedazos pieza piezas porcion vaso vasos tambien mas al a en para por que solo como fue i ate had have with and some of the for my lunch breakfast dinner today just only piece pieces cup cups plate glass small big grande pequeno pequena".split(" ")
);
const NOTHING = /^(no (he )?com(i|ido)( nada)?|nada|ninguna|nothing|none|i (did not|didn t) eat( anything)?)$/;

/** Dish name plus simple singular/plural variants, so "maduro", "maduros", "pastel" and "pasteles" all match. */
function variants(a: string): string[] {
  const out = new Set([a, `${a}s`, `${a}es`]);
  if (a.endsWith("es") && a.length > 4) out.add(a.slice(0, -2));
  if (a.endsWith("s") && a.length > 3) out.add(a.slice(0, -1));
  return [...out];
}

/** Finds table dishes mentioned in free text, and reports the food words it could not place. */
export function parseMeal(text: string): { found: Food[]; leftover: string } {
  const norm = normalize(text);
  if (!norm || NOTHING.test(norm)) return { found: [], leftover: "" };
  let rest = ` ${norm} `;
  const pairs = foods
    .flatMap((f) => [normalize(f.name), ...f.aliases.map(normalize)].flatMap(variants).map((a) => ({ a, f })))
    .sort((x, y) => y.a.length - x.a.length); // longest first, so "arroz con gandules" beats "arroz"
  const found: Food[] = [];
  for (const { a, f } of pairs) {
    const needle = ` ${a} `;
    while (rest.includes(needle)) {
      rest = rest.replace(needle, " | ");
      if (!found.includes(f)) found.push(f);
    }
  }
  const leftover = rest
    .split("|")
    .map((part) => part.split(" ").filter((w) => w && !FILLER.has(w) && !/^\d+$/.test(w)).join(" "))
    .filter(Boolean)
    .join(", ");
  return { found, leftover };
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

export function tableItems(found: Food[], lang: Lang): EstimateItem[] {
  return found.map((f) => ({ name: f.name, serving: f.serving[lang], carbsMin: f.carbsMin, carbsMax: f.carbsMax, swap: f.swap[lang], source: sourceLabel(f, lang) }));
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
  const { found, leftover } = parseMeal(text);
  if (found.length === 0) return null;
  return buildEstimate(tableItems(found, lang), target, "table", lang, leftover);
}
