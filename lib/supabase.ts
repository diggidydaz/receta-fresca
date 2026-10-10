"use client";
// The browser's connection to Supabase. Only set up when the app is built with a Supabase URL;
// without one the app runs as the browser-only demo (everything in localStorage, no accounts).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when the app saves to the server and people sign in. */
export const SERVER_MODE = Boolean(url && key);

// Through this app's own address (see next.config.ts), or straight to Supabase.
const PROXY = process.env.NEXT_PUBLIC_SUPABASE_PROXY === "1";

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!url || !key) throw new Error("Supabase is not configured");
  client ??= createClient(PROXY ? window.location.origin : url, key, { auth: { persistSession: true, autoRefreshToken: true, storageKey: "receta-fresca-auth" } });
  return client;
}
