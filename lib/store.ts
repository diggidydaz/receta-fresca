"use client";
// App state, with the same API in both modes:
// - Demo (no Supabase configured): everything lives in this browser (localStorage). Synthetic patients.
// - Server (F10): patient records, the patient list and business stock come from Supabase through
//   lib/sync.ts, are cached here for offline use, and every change is sent back to the server.
// Each patient has their own record, so switching patients never mixes one person's answers,
// prescription, plan or order with another's.
import { useSyncExternalStore } from "react";
import patientsData from "@/data/patients.json";
import { SERVER_MODE } from "./supabase";
import type { AppState, ChwNote, HvsAnswer, L10n, LogEntry, Order, Outcomes, Patient, Rx, StockUpdate, TeachBack } from "./types";

const KEY = "receta-fresca-v2";
const SERVER_CACHE = "receta-fresca-srv:";

export type PatientState = Pick<AppState, "intake" | "intakeDone" | "intakeSummary" | "rx" | "visitSummary" | "plan" | "log" | "order" | "teachBack" | "outcomes" | "chwNotes">;
type Device = Pick<AppState, "lang" | "bigText" | "patientId" | "clinicianAck" | "stock">;
type Stored = Device & { patients: Record<string, PatientState>; roster: Patient[] };

export type Role = "patient" | "clinician" | "promotora" | "business";
export type Session =
  | { status: "demo" }
  | { status: "loading" }
  | { status: "signedOut" }
  | { status: "signedIn"; userId: string; role: Role; name: string; placeId: string | null; patientId: string | null };

/** Most meals kept per patient: enough for several weeks of three meals a day. */
export const LOG_MAX = 200;

export const emptyPatient = (): PatientState => ({ intake: {}, intakeDone: false, intakeSummary: null, rx: null, visitSummary: null, plan: null, log: [], order: null, teachBack: null, outcomes: { a1c: [], hvs: [] }, chwNotes: [] });
export const PATIENT_KEYS = Object.keys(emptyPatient()) as (keyof PatientState)[];
const DEVICE_KEYS: (keyof Device)[] = ["lang", "bigText", "patientId", "clinicianAck", "stock"];
const demoRoster = patientsData as Patient[];
const initialStored: Stored = { lang: "es", bigText: false, patientId: "p1", clinicianAck: false, stock: {}, patients: {}, roster: SERVER_MODE ? [] : demoRoster };

const flatten = (st: Stored): AppState => {
  const { patients, roster, ...device } = st;
  void roster;
  return { ...device, ...(patients[st.patientId] ?? emptyPatient()) };
};
export const initialState: AppState = flatten(initialStored);

let stored: Stored = initialStored;
let flat: AppState = initialState;
let session: Session = SERVER_MODE ? { status: "loading" } : { status: "demo" };
let loaded = false;
const listeners = new Set<() => void>();

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Accepts only data of the expected shape; anything else is dropped so a bad save can never break a screen. */
export function sanitizePatient(v: unknown): PatientState {
  const e = emptyPatient();
  if (!isObj(v)) return e;
  const rx = isObj(v.rx) && (v.rx.type === "produce" || v.rx.type === "meals") && Array.isArray(v.rx.avoid) && typeof v.rx.carbTarget === "number" ? (v.rx as unknown as Rx) : null;
  const sum = isObj(v.intakeSummary) && ["keyPoints", "barriers", "flags", "avoid"].every((k) => Array.isArray((v.intakeSummary as Record<string, unknown>)[k])) ? (v.intakeSummary as AppState["intakeSummary"]) : null;
  const plan = isObj(v.plan) && Array.isArray(v.plan.days) && Array.isArray(v.plan.shopping) && v.plan.days.every((d) => isObj(d) && Array.isArray(d.meals)) ? (v.plan as AppState["plan"]) : null;
  const visit = isObj(v.visitSummary) && Array.isArray(v.visitSummary.points) ? (v.visitSummary as AppState["visitSummary"]) : null;
  const order = isObj(v.order) && typeof v.order.id === "string" && typeof v.order.placeId === "string" ? sanitizeOrder(v.order) : null;
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

function sanitizeOrder(o: Record<string, unknown>): Order {
  const status = o.status === "preparing" || o.status === "ready" || o.status === "delivered" ? o.status : "received";
  const str = (x: unknown) => (typeof x === "string" ? x : undefined);
  return {
    id: o.id as string, placeId: o.placeId as string, needsDelivery: o.needsDelivery === true, status,
    createdAt: str(o.createdAt) ?? new Date(0).toISOString(),
    voucher: str(o.voucher), expiresAt: str(o.expiresAt), redeemedAt: str(o.redeemedAt),
  };
}

function validEntry(x: unknown): boolean {
  if (!isObj(x) || typeof x.id !== "string" || typeof x.at !== "string") return false;
  if (x.kind === "skipped") return x.reason === "noFood" || x.reason === "unwell" || x.reason === "other";
  const e = x.estimate;
  return typeof x.text === "string" && isObj(e) && (e.light === "green" || e.light === "yellow" || e.light === "red")
    && Array.isArray(e.items) && typeof e.carbsMin === "number" && typeof e.carbsMax === "number";
}

export function sanitizeItems(v: unknown): L10n[] {
  return Array.isArray(v) ? (v.filter((i) => isObj(i) && typeof i.es === "string" && typeof i.en === "string") as L10n[]) : [];
}

function sanitizeStock(v: unknown): Record<string, StockUpdate> {
  const out: Record<string, StockUpdate> = {};
  if (!isObj(v)) return out;
  for (const [id, u] of Object.entries(v)) {
    if (!isObj(u) || typeof u.at !== "string" || !Array.isArray(u.items)) continue;
    out[id] = { items: sanitizeItems(u.items), at: u.at };
  }
  return out;
}

export function sanitizeRoster(v: unknown): Patient[] {
  if (!Array.isArray(v)) return [];
  return v.filter((p) => isObj(p) && typeof p.id === "string" && typeof p.name === "string").map((p) => ({
    id: p.id as string, name: p.name as string, age: typeof p.age === "number" ? p.age : 0, town: typeof p.town === "string" ? p.town : "",
    note: isObj(p.note) && typeof p.note.es === "string" && typeof p.note.en === "string" ? (p.note as L10n) : { es: "", en: "" },
    ...(typeof p.phone === "string" ? { phone: p.phone } : {}),
  }));
}

function sanitize(v: unknown): Stored {
  if (!isObj(v)) return initialStored;
  const patients: Record<string, PatientState> = {};
  if (isObj(v.patients)) for (const [id, p] of Object.entries(v.patients)) patients[id] = sanitizePatient(p);
  return {
    lang: v.lang === "en" ? "en" : "es", bigText: v.bigText === true, patientId: typeof v.patientId === "string" ? v.patientId : "p1",
    clinicianAck: v.clinicianAck === true, stock: sanitizeStock(v.stock), patients,
    roster: SERVER_MODE ? sanitizeRoster(v.roster) : demoRoster,
  };
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) stored = sanitize(JSON.parse(raw));
    // In server mode this key only holds device settings; records come from the server cache.
    if (SERVER_MODE) stored = { ...stored, patients: {}, stock: {}, roster: [] };
  } catch {
    /* storage unavailable or unreadable: keep in-memory state */
  }
  flat = flatten(stored);
}

const cacheKey = () => (session.status === "signedIn" ? SERVER_CACHE + session.userId : null);

function persist() {
  try {
    const { patients, roster, stock, ...device } = stored;
    if (!SERVER_MODE) {
      window.localStorage.setItem(KEY, JSON.stringify(stored));
      return;
    }
    window.localStorage.setItem(KEY, JSON.stringify({ ...device, stock: {}, patients: {} }));
    const ck = cacheKey();
    if (ck) window.localStorage.setItem(ck, JSON.stringify({ patients, roster, stock }));
  } catch {
    /* ignore */
  }
}

function commit(next: Stored) {
  stored = next;
  flat = flatten(stored);
  persist();
  listeners.forEach((l) => l());
}

/** Current language, text size and patient, plus that patient's own record, as one flat object. */
export function getState(): AppState {
  load();
  return flat;
}

// ---------- Writes ----------

export type FieldWrite = { patient_id: string; key: keyof PatientState; value: unknown; at: string };
type ServerHooks = { fields: (rows: FieldWrite[]) => void; stock: (placeId: string, update: StockUpdate) => void };
let hooks: ServerHooks | null = null;

/** lib/sync.ts registers how local changes reach the server. */
export function setServerHooks(h: ServerHooks | null) {
  hooks = h;
}

// 'order' is never sent: the server changes it only through its order and voucher commands.
const SERVER_ONLY: (keyof PatientState)[] = ["order"];

function applyTo(st: Stored, patientId: string, patch: Partial<AppState>): Stored {
  const next: Stored = { ...st, patients: { ...st.patients } };
  const rec: PatientState = { ...(st.patients[patientId] ?? emptyPatient()) };
  const at = new Date().toISOString();
  const rows: FieldWrite[] = [];
  let touched = false;
  for (const [k, val] of Object.entries(patch)) {
    if ((PATIENT_KEYS as string[]).includes(k)) {
      (rec as Record<string, unknown>)[k] = val;
      touched = true;
      if (!SERVER_ONLY.includes(k as keyof PatientState)) rows.push({ patient_id: patientId, key: k as keyof PatientState, value: val ?? null, at });
    } else if ((DEVICE_KEYS as string[]).includes(k)) {
      (next as Record<string, unknown>)[k] = val;
    }
  }
  if (touched) next.patients[patientId] = rec;
  if (SERVER_MODE && hooks) {
    if (rows.length) hooks.fields(rows);
    if (patch.stock) for (const [id, u] of Object.entries(patch.stock)) if (u !== st.stock[id]) hooks.stock(id, u);
  }
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

// ---------- Server data in (used by lib/sync.ts only) ----------

/** Loads what was cached for this account, so the app opens offline. */
export function loadServerCache(userId: string) {
  load();
  try {
    const raw = window.localStorage.getItem(SERVER_CACHE + userId);
    if (!raw) return;
    const v = JSON.parse(raw) as Record<string, unknown>;
    const s = sanitize({ ...stored, patients: v.patients, roster: v.roster, stock: v.stock });
    commit({ ...stored, patients: s.patients, roster: s.roster, stock: s.stock });
  } catch {
    /* ignore a bad cache */
  }
}

/** Replaces records with what the server has. `keep` lists fields with local changes not yet sent, which win. */
export function replaceFromServer(data: { roster?: Patient[]; fields?: { patient_id: string; key: string; value: unknown }[]; stock?: Record<string, StockUpdate>; full?: boolean }, keep: Set<string>) {
  load();
  const patients: Record<string, PatientState> = {};
  if (data.fields) {
    const raw: Record<string, Record<string, unknown>> = {};
    for (const f of data.fields) (raw[f.patient_id] ??= {})[f.key] = f.value;
    const ids = data.full ? Object.keys(raw) : [...new Set([...Object.keys(stored.patients), ...Object.keys(raw)])];
    for (const id of ids) {
      const local = stored.patients[id] ?? emptyPatient();
      const merged: Record<string, unknown> = data.full ? {} : { ...local };
      Object.assign(merged, raw[id] ?? {});
      for (const k of PATIENT_KEYS) if (keep.has(`${id}|${k}`)) merged[k] = local[k];
      patients[id] = sanitizePatient(merged);
    }
  }
  const roster = data.roster ?? stored.roster;
  // Staff keep the patient they had chosen if it is still on their list; otherwise the first one.
  const patientId = roster.length && !roster.some((p) => p.id === stored.patientId) ? roster[0].id : stored.patientId;
  commit({
    ...stored,
    patientId,
    patients: data.fields ? patients : stored.patients,
    roster,
    stock: data.stock ? { ...(data.full ? {} : stored.stock), ...data.stock } : stored.stock,
  });
}

/** One field changed or was removed on the server. */
export function applyServerField(patientId: string, key: string, value: unknown) {
  load();
  if (!(PATIENT_KEYS as string[]).includes(key)) return;
  const rec = { ...(stored.patients[patientId] ?? emptyPatient()), [key]: value ?? emptyPatient()[key as keyof PatientState] };
  commit({ ...stored, patients: { ...stored.patients, [patientId]: sanitizePatient(rec) } });
}

export function setSession(next: Session) {
  load();
  session = next;
  // A patient always sees their own record; staff keep their choice if it is on their list.
  if (next.status === "signedIn" && next.patientId) stored = { ...stored, patientId: next.patientId };
  if (next.status === "signedOut") stored = { ...stored, patients: {}, roster: [], stock: {} };
  commit(stored);
}

export function getSession(): Session {
  return session;
}

// ---------- Reads across patients ----------

/** Every patient's own record, for screens that look across patients (promotora, export). */
export function allPatients(st: AppState): Record<string, PatientState> {
  void st; // re-evaluated whenever state changes
  return stored.patients;
}

/** The people this account may see: the sample patients in the demo, or the clinic's list from the server. */
export function listPatients(st: AppState): Patient[] {
  void st; // re-evaluated whenever state changes
  return stored.roster;
}

/** Every patient's open order with its prescription and plan, newest first: what a store or kitchen sees. */
export function listOrders(st: AppState): { patientId: string; order: Order; rx: Rx; plan: AppState["plan"] }[] {
  void st; // re-evaluated whenever state changes
  return Object.entries(stored.patients)
    .filter(([, p]) => p.order && p.rx)
    .map(([patientId, p]) => ({ patientId, order: p.order as Order, rx: p.rx as Rx, plan: p.plan }))
    .sort((a, b) => b.order.createdAt.localeCompare(a.order.createdAt));
}

/** Clears the demo but keeps language and text size. Demo mode only: server records are not touched. */
export function resetDemo() {
  load();
  if (SERVER_MODE) return;
  commit({ ...initialStored, lang: stored.lang, bigText: stored.bigText });
}

// ---------- React ----------

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (!SERVER_MODE && e.key === KEY && e.newValue) {
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

const serverSession: Session = SERVER_MODE ? { status: "loading" } : { status: "demo" };
export function useSession(): Session {
  return useSyncExternalStore(subscribe, getSession, () => serverSession);
}

/** True after the browser state has been read; use to avoid flashing default content. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
