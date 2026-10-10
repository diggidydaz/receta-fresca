"use client";
// Demo state lives in this browser only (localStorage). No real patient data, no server database.
// Each synthetic patient has their own record, so switching patients never mixes one person's
// answers, prescription, plan or order with another's.
import { useSyncExternalStore } from "react";
import type { AppState, ChwNote, HvsAnswer, LogEntry, Order, Outcomes, Rx, StockUpdate, TeachBack } from "./types";

const KEY = "receta-fresca-v2";

export type PatientState = Pick<AppState, "intake" | "intakeDone" | "intakeSummary" | "rx" | "visitSummary" | "plan" | "log" | "order" | "teachBack" | "outcomes" | "chwNotes">;
type Device = Pick<AppState, "lang" | "bigText" | "patientId" | "clinicianAck" | "stock">;
type Stored = Device & { patients: Record<string, PatientState> };

/** Most meals kept per patient: enough for several weeks of three meals a day. */
export const LOG_MAX = 200;

export const emptyPatient = (): PatientState => ({ intake: {}, intakeDone: false, intakeSummary: null, rx: null, visitSummary: null, plan: null, log: [], order: null, teachBack: null, outcomes: { a1c: [], hvs: [] }, chwNotes: [] });
const PATIENT_KEYS = Object.keys(emptyPatient()) as (keyof PatientState)[];
const DEVICE_KEYS: (keyof Device)[] = ["lang", "bigText", "patientId", "clinicianAck", "stock"];
const initialStored: Stored = { lang: "es", bigText: false, patientId: "p1", clinicianAck: false, stock: {}, patients: {} };

const flatten = (st: Stored): AppState => {
  const { patients, ...device } = st;
  return { ...device, ...(patients[st.patientId] ?? emptyPatient()) };
};
export const initialState: AppState = flatten(initialStored);

let stored: Stored = initialStored;
let flat: AppState = initialState;
let loaded = false;
const listeners = new Set<() => void>();

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Accepts only data of the expected shape; anything else is dropped so a bad save can never break a screen. */
function sanitizePatient(v: unknown): PatientState {
  const e = emptyPatient();
  if (!isObj(v)) return e;
  const rx = isObj(v.rx) && (v.rx.type === "produce" || v.rx.type === "meals") && Array.isArray(v.rx.avoid) && typeof v.rx.carbTarget === "number" ? (v.rx as unknown as Rx) : null;
  const sum = isObj(v.intakeSummary) && ["keyPoints", "barriers", "flags", "avoid"].every((k) => Array.isArray((v.intakeSummary as Record<string, unknown>)[k])) ? (v.intakeSummary as AppState["intakeSummary"]) : null;
  const plan = isObj(v.plan) && Array.isArray(v.plan.days) && Array.isArray(v.plan.shopping) && v.plan.days.every((d) => isObj(d) && Array.isArray(d.meals)) ? (v.plan as AppState["plan"]) : null;
  const visit = isObj(v.visitSummary) && Array.isArray(v.visitSummary.points) ? (v.visitSummary as AppState["visitSummary"]) : null;
  const order = isObj(v.order) && typeof v.order.id === "string" && typeof v.order.placeId === "string" ? (v.order as unknown as Order) : null;
  const log = Array.isArray(v.log) ? (v.log.filter(validEntry).slice(0, LOG_MAX) as LogEntry[]) : [];
  const tb = isObj(v.teachBack) && typeof v.teachBack.correct === "boolean" && typeof v.teachBack.planAt === "string" ? (v.teachBack as unknown as TeachBack) : null;
  const o = isObj(v.outcomes) ? v.outcomes : {};
  const hvsOk = (x: unknown): x is HvsAnswer => x === "often" || x === "sometimes" || x === "never";
  const outcomes: Outcomes = {
    a1c: Array.isArray(o.a1c) ? o.a1c.filter((x) => isObj(x) && typeof x.value === "number" && typeof x.at === "string") as Outcomes["a1c"] : [],
    hvs: Array.isArray(o.hvs) ? o.hvs.filter((x) => isObj(x) && hvsOk(x.q1) && hvsOk(x.q2) && typeof x.at === "string") as Outcomes["hvs"] : [],
  };
  const chwNotes = Array.isArray(v.chwNotes) ? (v.chwNotes.filter((x) => isObj(x) && typeof x.text === "string" && typeof x.at === "string") as ChwNote[]) : [];
  return { intake: isObj(v.intake) ? (v.intake as AppState["intake"]) : {}, intakeDone: v.intakeDone === true, intakeSummary: sum, rx, visitSummary: visit, plan: rx ? plan : null, log, order: rx ? order : null, teachBack: rx ? tb : null, outcomes, chwNotes };
}

function validEntry(x: unknown): boolean {
  if (!isObj(x) || typeof x.id !== "string" || typeof x.at !== "string") return false;
  if (x.kind === "skipped") return x.reason === "noFood" || x.reason === "unwell" || x.reason === "other";
  return typeof x.text === "string" && isObj(x.estimate);
}

function sanitizeStock(v: unknown): Record<string, StockUpdate> {
  const out: Record<string, StockUpdate> = {};
  if (!isObj(v)) return out;
  for (const [id, u] of Object.entries(v)) {
    if (!isObj(u) || typeof u.at !== "string" || !Array.isArray(u.items)) continue;
    const items = u.items.filter((i) => isObj(i) && typeof i.es === "string" && typeof i.en === "string") as StockUpdate["items"];
    out[id] = { items, at: u.at };
  }
  return out;
}

function sanitize(v: unknown): Stored {
  if (!isObj(v)) return initialStored;
  const patients: Record<string, PatientState> = {};
  if (isObj(v.patients)) for (const [id, p] of Object.entries(v.patients)) patients[id] = sanitizePatient(p);
  return { lang: v.lang === "en" ? "en" : "es", bigText: v.bigText === true, patientId: typeof v.patientId === "string" ? v.patientId : "p1", clinicianAck: v.clinicianAck === true, stock: sanitizeStock(v.stock), patients };
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) stored = sanitize(JSON.parse(raw));
  } catch {
    /* storage unavailable or unreadable: keep in-memory state */
  }
  flat = flatten(stored);
}

function commit(next: Stored) {
  stored = next;
  flat = flatten(stored);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

/** Current language, text size and patient, plus that patient's own record, as one flat object. */
export function getState(): AppState {
  load();
  return flat;
}

function applyTo(st: Stored, patientId: string, patch: Partial<AppState>): Stored {
  const next: Stored = { ...st, patients: { ...st.patients } };
  const rec: PatientState = { ...(st.patients[patientId] ?? emptyPatient()) };
  let touched = false;
  for (const [k, val] of Object.entries(patch)) {
    if ((PATIENT_KEYS as string[]).includes(k)) {
      (rec as Record<string, unknown>)[k] = val;
      touched = true;
    } else if ((DEVICE_KEYS as string[]).includes(k)) {
      (next as Record<string, unknown>)[k] = val;
    }
  }
  if (touched) next.patients[patientId] = rec;
  return next;
}

/** Updates settings and the current patient's record. */
export function setState(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
  load();
  const p = typeof patch === "function" ? patch(flat) : patch;
  commit(applyTo(stored, stored.patientId, p));
}

/** Updates one named patient's record, whoever is selected now (used by background work such as the plan request). */
export function setPatientState(patientId: string, patch: Partial<PatientState>) {
  load();
  commit(applyTo(stored, patientId, patch));
}

export function getPatientState(patientId: string): PatientState {
  load();
  return stored.patients[patientId] ?? emptyPatient();
}

/** Every patient's own record, for screens that look across patients (promotora, export). */
export function allPatients(st: AppState): Record<string, PatientState> {
  void st; // re-evaluated whenever state changes
  return stored.patients;
}

/** Every patient's open order with its prescription and plan, newest first: what a store or kitchen sees. */
export function listOrders(st: AppState): { patientId: string; order: Order; rx: Rx; plan: AppState["plan"] }[] {
  void st; // re-evaluated whenever state changes
  return Object.entries(stored.patients)
    .filter(([, p]) => p.order && p.rx)
    .map(([patientId, p]) => ({ patientId, order: p.order as Order, rx: p.rx as Rx, plan: p.plan }))
    .sort((a, b) => b.order.createdAt.localeCompare(a.order.createdAt));
}

/** Clears the demo but keeps language and text size. */
export function resetDemo() {
  load();
  commit({ ...initialStored, lang: stored.lang, bigText: stored.bigText });
}

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY && e.newValue) {
      try {
        stored = sanitize(JSON.parse(e.newValue));
        flat = flatten(stored);
        cb();
      } catch {
        /* ignore */
      }
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, () => initialState);
}

/** True after the browser state has been read; use to avoid flashing default content. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
