"use client";
// One shared weekly-plan request. The clinician screen starts it as soon as the prescription is sent,
// so the plan is usually ready by the time the patient opens it. Both screens share the same request.
import { getPatientState, getState, setPatientState } from "./store";
import type { Lang, Plan, Rx } from "./types";

const pending = new Map<string, Promise<boolean>>();

/** Requests a plan for this prescription and language. Resolves true when a plan was stored. */
export function ensurePlan(rx: Rx, lang: Lang): Promise<boolean> {
  const key = `${rx.createdAt}|${lang}`;
  const existing = pending.get(key);
  if (existing) return existing;
  const p = (async () => {
    try {
      const res = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rx, lang, stock: Object.fromEntries(Object.entries(getState().stock).map(([id, u]) => [id, u.items])) }) });
      if (!res.ok) return false;
      const data = (await res.json()) as Plan;
      if (!data || !Array.isArray(data.days) || data.days.length === 0) return false;
      // Ignore the answer if the clinician has sent a newer prescription meanwhile.
      if (getPatientState(rx.patientId).rx?.createdAt !== rx.createdAt) return false;
      setPatientState(rx.patientId, { plan: { days: data.days, shopping: data.shopping, tip: data.tip, source: data.source, lang } });
      return true;
    } catch {
      return false;
    } finally {
      pending.delete(key);
    }
  })();
  pending.set(key, p);
  return p;
}
