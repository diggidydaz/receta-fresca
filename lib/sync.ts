"use client";
// Server mode (F10): sign-in, loading records, live updates between devices, and an outbox so
// changes made offline (F9) reach the server when the phone reconnects.
//
// Every change is saved on the phone first, then sent. Each field carries the time it was changed;
// the server keeps the newest copy, so an old offline edit never undoes a newer one made elsewhere.
import { useSyncExternalStore } from "react";
import { normalizePhone, phoneEmail } from "./phone";
import { applyServerField, getSession, loadServerCache, PATIENT_KEYS, replaceFromServer, sanitizeItems, sanitizeRoster, setServerHooks, setSession, type FieldWrite, type Role, type Session } from "./store";
import { SERVER_MODE, supabase } from "./supabase";
import type { StockUpdate } from "./types";

const OUTBOX = "receta-fresca-outbox:";
const PROFILE = "receta-fresca-profile:";
const REFRESH_MS = 60_000;
const RETRY_MS = 15_000;

type StockWrite = { place_id: string; items: unknown; updated_at: string };
type Outbox = { fields: Record<string, FieldWrite>; stock: Record<string, StockWrite> };

let started = false;
let userId: string | null = null;
let outbox: Outbox = { fields: {}, stock: {} };
let flushing = false;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let lastError = "";
const statusListeners = new Set<() => void>();

// ---------- Sync status for the screen ("saved", "waiting for connection") ----------

export type SyncStatus = { pending: number; error: string };
let status: SyncStatus = { pending: 0, error: "" };
function updateStatus() {
  const pending = Object.keys(outbox.fields).length + Object.keys(outbox.stock).length;
  if (pending !== status.pending || lastError !== status.error) {
    status = { pending, error: lastError };
    statusListeners.forEach((l) => l());
  }
}
const idle: SyncStatus = { pending: 0, error: "" };
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(
    (cb) => { statusListeners.add(cb); return () => { statusListeners.delete(cb); }; },
    () => status,
    () => idle
  );
}

// ---------- Outbox ----------

function saveOutbox() {
  if (!userId) return;
  try { window.localStorage.setItem(OUTBOX + userId, JSON.stringify(outbox)); } catch { /* ignore */ }
  updateStatus();
}

function loadOutbox(uid: string) {
  try {
    const v = JSON.parse(window.localStorage.getItem(OUTBOX + uid) ?? "null") as Outbox | null;
    outbox = v && typeof v === "object" && v.fields && v.stock ? v : { fields: {}, stock: {} };
  } catch {
    outbox = { fields: {}, stock: {} };
  }
  updateStatus();
}

/** Fields with changes on this phone not yet accepted by the server; the server's copy must not replace them. */
const pendingKeys = () => new Set(Object.keys(outbox.fields));

const isOffline = (e: { code?: string; message?: string } | null) =>
  (typeof navigator !== "undefined" && !navigator.onLine) || !e?.code || /fetch|network/i.test(e.message ?? "");

function scheduleRetry() {
  if (retryTimer) return;
  retryTimer = setTimeout(() => { retryTimer = null; void flush(); }, RETRY_MS);
}

async function sendFields(rows: FieldWrite[]): Promise<"ok" | "offline" | "refused"> {
  const { error } = await supabase().rpc("put_fields", { rows });
  if (!error) return "ok";
  return isOffline(error) ? "offline" : "refused";
}

export async function flush(): Promise<void> {
  if (flushing || !userId) return;
  flushing = true;
  try {
    const fields = Object.entries(outbox.fields);
    if (fields.length) {
      let result = await sendFields(fields.map(([, r]) => r));
      // A refused batch is retried one row at a time, so one change the server will not accept
      // (for example, a field this role may not write) does not hold back the others.
      const sent = new Set<string>();
      if (result === "refused") {
        for (const [k, r] of fields) {
          const one = await sendFields([r]);
          if (one === "offline") { result = "offline"; break; }
          if (one === "refused") lastError = "refused";
          sent.add(k);
        }
      } else if (result === "ok") {
        fields.forEach(([k]) => sent.add(k));
        lastError = "";
      }
      // Drop only what was sent, unless it changed again while sending.
      for (const [k, r] of fields) if (sent.has(k) && outbox.fields[k] === r) delete outbox.fields[k];
      if (result === "offline") scheduleRetry();
    }
    for (const [k, row] of Object.entries(outbox.stock)) {
      const { error } = await supabase().from("stock").upsert(row);
      if (error && isOffline(error)) { scheduleRetry(); break; }
      if (error) lastError = "refused";
      if (outbox.stock[k] === row) delete outbox.stock[k];
    }
    saveOutbox();
  } finally {
    flushing = false;
  }
}

function queueFields(rows: FieldWrite[]) {
  for (const r of rows) outbox.fields[`${r.patient_id}|${r.key}`] = r;
  saveOutbox();
  void flush();
}

function queueStock(placeId: string, u: StockUpdate) {
  outbox.stock[placeId] = { place_id: placeId, items: u.items, updated_at: u.at };
  saveOutbox();
  void flush();
}

// ---------- Loading ----------

async function selectAll<T>(table: string, columns: string): Promise<T[] | null> {
  const out: T[] = [];
  const page = 1000;
  for (let from = 0; ; from += page) {
    const { data, error } = await supabase().from(table).select(columns).range(from, from + page - 1);
    if (error) return null;
    out.push(...(data as T[]));
    if (data.length < page) return out;
  }
}

/** Everything this account may see, fresh from the server. Kept as is when offline. */
export async function refresh(): Promise<void> {
  if (!userId) return;
  const [roster, fields, stock] = await Promise.all([
    selectAll<Record<string, unknown>>("patients", "id, name, age, town, note, phone"),
    selectAll<{ patient_id: string; key: string; value: unknown }>("patient_fields", "patient_id, key, value"),
    selectAll<{ place_id: string; items: unknown; updated_at: string }>("stock", "place_id, items, updated_at"),
  ]);
  if (!roster || !fields || !stock) return; // offline or failed: keep the cached copy
  const st: Record<string, StockUpdate> = {};
  for (const s of stock) st[s.place_id] = { items: sanitizeItems(s.items), at: s.updated_at };
  replaceFromServer({ roster: sanitizeRoster(roster), fields, stock: st, full: true }, pendingKeys());
}

function scheduleRefresh(ms = 300) {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => { refreshTimer = null; void refresh(); }, ms);
}

// ---------- Live updates ----------

let channel: ReturnType<ReturnType<typeof supabase>["channel"]> | null = null;

function listen() {
  channel?.unsubscribe();
  channel = supabase()
    .channel("receta")
    .on("postgres_changes", { event: "*", schema: "public", table: "patient_fields" }, (p) => {
      const row = (p.eventType === "DELETE" ? p.old : p.new) as { patient_id?: string; key?: string; value?: unknown };
      if (!row.patient_id || !row.key || !(PATIENT_KEYS as string[]).includes(row.key)) return;
      if (outbox.fields[`${row.patient_id}|${row.key}`]) return; // a newer change from this phone is on its way
      applyServerField(row.patient_id, row.key, p.eventType === "DELETE" ? null : row.value);
      // A business learns of a new customer from the order alone; fetch the prescription and plan that go with it.
      const s = getSession();
      if (row.key === "order" && p.eventType !== "DELETE" && s.status === "signedIn" && s.role === "business") scheduleRefresh();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "patients" }, () => scheduleRefresh())
    .on("postgres_changes", { event: "*", schema: "public", table: "stock" }, (p) => {
      const row = p.new as { place_id?: string; items?: unknown; updated_at?: string };
      if (!row.place_id || outbox.stock[row.place_id]) return;
      replaceFromServer({ stock: { [row.place_id]: { items: sanitizeItems(row.items), at: row.updated_at ?? new Date().toISOString() } } }, pendingKeys());
    })
    .subscribe((state) => {
      // Catch up on anything missed while the connection was down.
      if (state === "SUBSCRIBED") scheduleRefresh(0);
    });
}

// ---------- Sign-in ----------

type Profile = { role: Role; name: string; placeId: string | null; patientId: string | null };

async function loadProfile(uid: string): Promise<Profile | null> {
  const db = supabase();
  const { data: prof, error } = await db.from("profiles").select("role, display_name, place_id").eq("id", uid).maybeSingle();
  if (error || !prof) {
    // Offline: use the copy saved at the last sign-in.
    try { return JSON.parse(window.localStorage.getItem(PROFILE + uid) ?? "null") as Profile | null; } catch { return null; }
  }
  let patientId: string | null = null;
  if (prof.role === "patient") {
    const { data } = await db.from("patients").select("id").eq("user_id", uid).maybeSingle();
    patientId = data?.id ?? null;
  }
  const p: Profile = { role: prof.role as Role, name: prof.display_name ?? "", placeId: prof.place_id ?? null, patientId };
  try { window.localStorage.setItem(PROFILE + uid, JSON.stringify(p)); } catch { /* ignore */ }
  return p;
}

let entering: { uid: string; done: Promise<void> } | null = null;

/** Sets up this account on the phone. Sign-in and the auth listener may both call it; they share one run. */
function enter(uid: string): Promise<void> {
  if (entering?.uid === uid) return entering.done;
  entering = { uid, done: doEnter(uid) };
  return entering.done;
}

async function doEnter(uid: string) {
  userId = uid;
  loadOutbox(uid);
  const prof = await loadProfile(uid);
  if (!prof) {
    // Signed in, but no profile: the account was not set up by the clinic. Treat as signed out.
    await supabase().auth.signOut();
    return;
  }
  const s: Session = { status: "signedIn", userId: uid, ...prof };
  setSession(s);
  loadServerCache(uid);
  setServerHooks({ fields: queueFields, stock: queueStock });
  listen();
  void refresh();
  void flush();
}

function leave() {
  entering = null;
  channel?.unsubscribe();
  channel = null;
  setServerHooks(null);
  userId = null;
  outbox = { fields: {}, stock: {} };
  updateStatus();
  setSession({ status: "signedOut" });
}

/** Starts server mode once per page load. Does nothing in the browser-only demo. */
export function startSync() {
  if (!SERVER_MODE || started || typeof window === "undefined") return;
  started = true;
  const db = supabase();
  void db.auth.getSession().then(({ data }) => (data.session ? enter(data.session.user.id) : leave()));
  // Supabase asks that no other Supabase call run inside this callback, hence the timeout.
  db.auth.onAuthStateChange((event, sess) => {
    setTimeout(() => {
      if (event === "SIGNED_OUT" || !sess) leave();
      else if (event === "SIGNED_IN") void enter(sess.user.id);
    }, 0);
  });
  window.addEventListener("online", () => { void flush(); scheduleRefresh(0); });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { void flush(); scheduleRefresh(0); } });
  setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, REFRESH_MS);
}

export type SignInError = "phone" | "wrong" | "offline" | "server" | "noProfile";

/** Patient sign-in with phone number and PIN. */
export async function signInPatient(phoneRaw: string, pin: string): Promise<SignInError | null> {
  const phone = normalizePhone(phoneRaw);
  if (!phone) return "phone";
  return signInWith(phoneEmail(phone), pin);
}

/** Clinician, promotora or business sign-in with email and password. */
export function signInStaff(email: string, password: string): Promise<SignInError | null> {
  return signInWith(email.trim().toLowerCase(), password);
}

async function signInWith(email: string, password: string): Promise<SignInError | null> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return "offline";
  const { data, error } = await supabase().auth.signInWithPassword({ email, password });
  // No HTTP status means the request never reached the server: either this phone is offline,
  // or it is online but cannot reach the server (down, or a wrong address in the build).
  if (error) return error.status ? "wrong" : navigator.onLine ? "server" : "offline";
  await enter(data.user.id);
  return getSession().status === "signedIn" ? null : "noProfile";
}

/** Signs out and removes this account's records from the phone (phones are often shared). */
export async function signOut(): Promise<void> {
  const uid = userId;
  await supabase().auth.signOut({ scope: "local" });
  if (uid) {
    for (const k of [OUTBOX, PROFILE, "receta-fresca-srv:"]) {
      try { window.localStorage.removeItem(k + uid); } catch { /* ignore */ }
    }
  }
  leave();
}

/** Bearer token for the app's own server routes (account creation). */
export async function accessToken(): Promise<string | null> {
  if (!SERVER_MODE) return null;
  const { data } = await supabase().auth.getSession();
  return data.session?.access_token ?? null;
}
