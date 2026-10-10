// Read-only plan link for family or a caregiver (hotspot H10). The plan travels in the URL fragment
// (after "#"), which browsers never send to a server. It carries the plan, the carbohydrate goal and the
// clinician's plain-language points only: no food log, no intake answers. It stops working when the
// prescription ends.
import type { Lang, Plan, Rx } from "./types";

export type FamilyView = {
  v: 1;
  name: string;
  lang: Lang;
  goal: number;
  until: string;                       // ISO date the prescription ends
  points: string[];
  days: { day: string; meals: { meal: "desayuno" | "almuerzo" | "cena"; dish: string; portion: string; carbs: number }[] }[];
  shopping: { item: string; qty: string }[];
  meals: boolean;                      // prepared meals rather than produce
};

const toB64url = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)));

export function familyLink(origin: string, name: string, rx: Rx, plan: Plan, points: string[], lang: Lang): string {
  const until = new Date(new Date(rx.createdAt).getTime() + rx.weeks * 7 * 24 * 60 * 60 * 1000).toISOString();
  const view: FamilyView = {
    v: 1, name, lang: plan.lang ?? lang, goal: rx.carbTarget, until, points, meals: rx.type === "meals",
    days: plan.days.map((d) => ({ day: d.day, meals: d.meals.map(({ meal, dish, portion, carbs }) => ({ meal, dish, portion, carbs })) })),
    shopping: plan.shopping,
  };
  return `${origin}/familia#${toB64url(JSON.stringify(view))}`;
}

const str = (x: unknown, max = 200) => (typeof x === "string" ? x.slice(0, max) : "");

/** Reads a link back. Anything malformed returns null, so a damaged link shows a clear message, not a broken page. */
export function readFamilyLink(hash: string): FamilyView | null {
  try {
    const raw = JSON.parse(fromB64url(hash.replace(/^#/, ""))) as Partial<FamilyView>;
    if (raw.v !== 1 || !Array.isArray(raw.days) || typeof raw.goal !== "number") return null;
    const slots = ["desayuno", "almuerzo", "cena"] as const;
    return {
      v: 1,
      name: str(raw.name, 60),
      lang: raw.lang === "en" ? "en" : "es",
      goal: Math.min(75, Math.max(15, raw.goal)),
      until: str(raw.until, 40),
      points: Array.isArray(raw.points) ? raw.points.slice(0, 8).map((p) => str(p, 400)) : [],
      meals: raw.meals === true,
      days: raw.days.slice(0, 7).map((d) => ({
        day: str(d?.day, 20),
        meals: Array.isArray(d?.meals) ? d.meals.filter((m) => slots.includes(m?.meal)).slice(0, 3).map((m) => ({ meal: m.meal, dish: str(m.dish, 90), portion: str(m.portion, 90), carbs: Math.max(0, Math.round(Number(m.carbs) || 0)) })) : [],
      })),
      shopping: Array.isArray(raw.shopping) ? raw.shopping.slice(0, 20).map((i) => ({ item: str(i?.item, 80), qty: str(i?.qty, 60) })) : [],
    };
  } catch {
    return null;
  }
}

/** True once the prescription behind this link has ended (or the date is unreadable). */
export function linkExpired(view: FamilyView, now = Date.now()): boolean {
  const t = new Date(view.until).getTime();
  return Number.isNaN(t) || t < now;
}
