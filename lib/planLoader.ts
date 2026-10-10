"use client";
// One shared weekly-plan request. The clinician screen starts it as soon as the prescription is sent,
// so the plan is usually ready by the time the patient opens it. Both screens share the same request.
import { getPatientState, setPatientState } from "./store";
import type { Lang, Plan, Rx } from "./types";

const pending = new Map<string, Promise<boolean>>();
/** Plans already written for a prescription, by language, so switching language back is instant. Memory only. */
const written = new Map<string, Plan>();

/** Requests a plan for this prescription and language. Resolves true when a plan was stored. */
export function ensurePlan(rx: Rx, lang: Lang): Promise<boolean> {
  const key = `${rx.createdAt}|${lang}`;
  const existing = pending.get(key);
  if (existing) return existing;
  const p = (async () => {
    try {
      const res = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rx, lang }) });
      if (!res.ok) return false;
      const data = (await res.json()) as Plan;
      if (!data || !Array.isArray(data.days) || data.days.length === 0) return false;
      // Ignore the answer if the clinician has sent a newer prescription meanwhile.
      if (getPatientState(rx.patientId).rx?.createdAt !== rx.createdAt) return false;
      const plan: Plan = { days: data.days, shopping: data.shopping, tip: data.tip, source: data.source, lang };
      written.set(key, plan);
      setPatientState(rx.patientId, { plan });
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

/** Puts the stored plan into another language: same meals and numbers, only the words change. Resolves true when stored. */
export function translatePlan(rx: Rx, plan: Plan, lang: Lang): Promise<boolean> {
  const key = `${rx.createdAt}|${lang}`;
  const tkey = `t|${key}`;
  const ready = written.get(key);
  if (ready) {
    setPatientState(rx.patientId, { plan: ready });
    return Promise.resolve(true);
  }
  // A sample plan (no AI) exists in both languages already: ask for it again instead of translating.
  if (plan.source !== "ai") return ensurePlan(rx, lang);
  const existing = pending.get(tkey);
  if (existing) return existing;
  if (plan.lang) written.set(`${rx.createdAt}|${plan.lang}`, plan);
  const p = (async () => {
    try {
      const res = await fetch("/api/plan-translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, lang }) });
      if (!res.ok) return false;
      const data = (await res.json()) as { ok?: boolean; plan?: Plan };
      if (!data.ok || !data.plan || !Array.isArray(data.plan.days) || data.plan.days.length !== plan.days.length) return false;
      if (getPatientState(rx.patientId).rx?.createdAt !== rx.createdAt) return false;
      written.set(key, data.plan);
      setPatientState(rx.patientId, { plan: data.plan });
      return true;
    } catch {
      return false;
    } finally {
      pending.delete(tkey);
    }
  })();
  pending.set(tkey, p);
  return p;
}
