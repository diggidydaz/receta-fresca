// Stores, farms and kitchens, with whatever each business said it has this week laid over the sample stock.
import placesData from "@/data/places.json";
import type { L10n, Place, StockUpdate } from "./types";

export const basePlaces = placesData as Place[];

/** Every place, using the business's own update when there is one. */
export function effectivePlaces(stock: Record<string, StockUpdate>): Place[] {
  return basePlaces.map((p) => (stock[p.id] ? { ...p, stock: stock[p.id].items } : p));
}

/** Items a business can tick on: everything any place of the same type has offered, without repeats. */
export function catalogFor(kind: Place["kind"]): L10n[] {
  const seen = new Set<string>();
  const out: L10n[] = [];
  for (const p of basePlaces) {
    if ((kind === "cocina") !== (p.kind === "cocina")) continue;
    for (const it of p.stock) if (!seen.has(it.es)) { seen.add(it.es); out.push(it); }
  }
  return out;
}

/** Only the stock the server needs, checked: known places, short items, a few at most. */
export function cleanStock(v: unknown): Record<string, L10n[]> {
  const out: Record<string, L10n[]> = {};
  if (typeof v !== "object" || v === null) return out;
  for (const p of basePlaces) {
    const items = (v as Record<string, unknown>)[p.id];
    if (!Array.isArray(items)) continue;
    out[p.id] = items
      .filter((i): i is L10n => typeof i === "object" && i !== null && typeof (i as L10n).es === "string" && typeof (i as L10n).en === "string")
      .slice(0, 20)
      .map((i) => ({ es: i.es.slice(0, 60), en: i.en.slice(0, 60) }))
      .filter((i) => i.es.trim());
  }
  return out;
}
