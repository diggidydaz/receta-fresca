"use client";
// Orders and vouchers (F15). In server mode only the server issues, moves and redeems them
// (see supabase/migrations); in the browser-only demo the same steps run on this device.
// Redemption is its own step (hotspot H2): the business enters the code the patient shows.
// Marking an order delivered does not redeem it, and redeeming does not mark it delivered.
import { allPatients, applyServerField, getState, setPatientState } from "./store";
import { SERVER_MODE, supabase } from "./supabase";
import type { Order, OrderStatus, Rx } from "./types";

export type OrderError = "offline" | "refused";
export type RedeemReason = "unknown" | "otherPlace" | "used" | "void" | "expired" | "offline";
export type RedeemResult = { ok: true; patientId: string } | { ok: false; reason: RedeemReason };

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O or 1/I/L: easy to read aloud and type

function demoCode(): string {
  const r = crypto.getRandomValues(new Uint8Array(8));
  const c = Array.from(r, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `RF-${c.slice(0, 4)}-${c.slice(4)}`;
}

/** "rf 7k2m q9xp" → "RF-7K2M-Q9XP" */
export function normalizeCode(raw: string): string {
  let c = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (c.startsWith("RF")) c = c.slice(2);
  return `RF-${c.slice(0, 4)}-${c.slice(4, 8)}`;
}

export const rxEnds = (rx: Rx) => new Date(new Date(rx.createdAt).getTime() + rx.weeks * 7 * 86400_000).toISOString();

const offline = (e: { code?: string; message?: string }) => !navigator.onLine || !e.code || /fetch|network/i.test(e.message ?? "");

/** The patient chooses where to get their food. The order comes back with its voucher code. */
export async function placeOrder(patientId: string, placeId: string, needsDelivery: boolean): Promise<OrderError | null> {
  if (SERVER_MODE) {
    const { data, error } = await supabase().rpc("place_order", { p_patient: patientId, p_place: placeId, p_delivery: needsDelivery });
    if (error) return offline(error) ? "offline" : "refused";
    applyServerField(patientId, "order", data);
    return null;
  }
  const rx = getState().rx;
  if (!rx) return "refused";
  const order: Order = {
    id: "RF-" + String(Math.floor(Math.random() * 10000)).padStart(4, "0"),
    placeId, needsDelivery, status: "received", createdAt: new Date().toISOString(),
    voucher: demoCode(), expiresAt: rxEnds(rx),
  };
  setPatientState(patientId, { order });
  return null;
}

/** Choose a different place, before the business has started and before the voucher is used. */
export async function cancelOrder(patientId: string): Promise<OrderError | null> {
  if (SERVER_MODE) {
    const { error } = await supabase().rpc("cancel_order", { p_patient: patientId });
    if (error) return offline(error) ? "offline" : "refused";
    applyServerField(patientId, "order", null);
    return null;
  }
  setPatientState(patientId, { order: null });
  return null;
}

/** The business moves an order one step forward: preparing, ready, delivered. */
export async function advanceOrder(patientId: string, order: Order, next: OrderStatus): Promise<OrderError | null> {
  if (SERVER_MODE) {
    const { data, error } = await supabase().rpc("set_order_status", { p_patient: patientId, p_status: next });
    if (error) return offline(error) ? "offline" : "refused";
    applyServerField(patientId, "order", data);
    return null;
  }
  setPatientState(patientId, { order: { ...order, status: next } });
  return null;
}

/** The business enters the code the patient shows. Accepted once. */
export async function redeemVoucher(raw: string): Promise<RedeemResult> {
  const code = normalizeCode(raw);
  if (SERVER_MODE) {
    const { data, error } = await supabase().rpc("redeem_voucher", { p_code: code });
    if (error) return { ok: false, reason: offline(error) ? "offline" : "unknown" };
    const r = data as { ok: boolean; reason?: RedeemReason; patient_id?: string; order?: unknown };
    if (!r.ok) return { ok: false, reason: r.reason ?? "unknown" };
    if (r.patient_id && r.order) applyServerField(r.patient_id, "order", r.order);
    return { ok: true, patientId: r.patient_id ?? "" };
  }
  // Demo: every order on this device; any place may redeem, since there are no business accounts.
  for (const [patientId, p] of Object.entries(allPatients(getState()))) {
    const o = p.order;
    if (!o || o.voucher !== code) continue;
    if (o.redeemedAt) return { ok: false, reason: "used" };
    if (o.expiresAt && o.expiresAt < new Date().toISOString()) return { ok: false, reason: "expired" };
    setPatientState(patientId, { order: { ...o, redeemedAt: new Date().toISOString() } });
    return { ok: true, patientId };
  }
  return { ok: false, reason: "unknown" };
}
