// Server-only Supabase access. The secret key bypasses row-level security, so it is used only to
// create accounts and to check who is calling; it must never reach the browser.
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

let admin: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient | null {
  if (!url || !secret) return null;
  admin ??= createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}

export type Caller = { id: string; role: "patient" | "clinician" | "promotora" | "business"; placeId: string | null };

/** The signed-in person behind a request's bearer token, with their role. Null if not signed in. */
export async function callerOf(req: Request): Promise<Caller | null> {
  const db = supabaseAdmin();
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!db || !token) return null;
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: prof } = await db.from("profiles").select("role, place_id").eq("id", data.user.id).single();
  if (!prof) return null;
  return { id: data.user.id, role: prof.role, placeId: prof.place_id };
}
