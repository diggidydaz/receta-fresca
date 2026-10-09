// Keeps foods the patient cannot or will not eat out of every plan, in code, not just by asking the model.
import { normalize } from "./foods";

// A stated category covers its common members ("mariscos" also rules out carrucho and camarones).
const GROUPS: string[][] = [
  ["mariscos", "marisco", "seafood", "shellfish", "carrucho", "conch", "camarones", "camaron", "shrimp", "langosta", "lobster", "pulpo", "octopus", "jueyes", "juey", "cangrejo", "crab", "almejas", "ostras"],
  ["pescado", "fish", "bacalao", "saltfish", "codfish", "chillo", "snapper", "atun", "tuna", "salmon", "sardinas"],
  ["cerdo", "pork", "puerco", "pernil", "lechon", "jamon", "ham", "chicharron", "tocino", "bacon", "salchicha", "salami", "cuajo"],
  ["pollo", "chicken", "gallina"],
  ["res", "beef", "carne de res", "bistec", "carne molida"],
  ["leche", "milk", "lacteos", "dairy", "queso", "cheese", "yogur", "yogurt"],
  ["huevo", "huevos", "egg", "eggs", "revoltillo", "tortilla de huevo"],
  ["habichuelas", "habichuela", "beans", "gandules", "frijoles"],
  ["gluten", "trigo", "wheat", "pan", "bread", "galletas"],
  ["mani", "peanut", "peanuts", "nueces", "nuts"],
];

/** Every term ruled out by the avoid list, including members of any category it names. */
export function avoidTerms(avoid: string[]): string[] {
  const out = new Set<string>();
  for (const raw of avoid) {
    const a = normalize(raw);
    if (!a) continue;
    out.add(a);
    if (a.endsWith("s")) out.add(a.slice(0, -1));
    for (const g of GROUPS) {
      // Only a group's first few words name the category; a member (e.g. "pernil") rules out just itself.
      const heads = g.slice(0, g[0] === "mariscos" ? 4 : g[0] === "pescado" ? 2 : g[0] === "cerdo" ? 3 : g[0] === "leche" ? 4 : g[0] === "habichuelas" ? 3 : 2);
      if (heads.includes(a) || heads.includes(a.replace(/s$/, ""))) g.forEach((t) => out.add(t));
    }
  }
  return [...out];
}

/** True when a dish description mentions anything on the avoid list. */
export function violates(text: string, terms: string[]): boolean {
  if (terms.length === 0) return false;
  const t = ` ${normalize(text)} `;
  return terms.some((term) => t.includes(` ${term} `) || t.includes(` ${term}s `));
}
