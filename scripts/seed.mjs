// Creates the synthetic demo accounts on the Supabase in .env.local. Safe to run again.
//   npx supabase start && npx supabase db reset && npm run seed
// Synthetic people only: no BAA is in place, so no real patient may be entered.
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

nextEnv.loadEnvConfig(process.cwd());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local first.");
  process.exit(1);
}
const db = createClient(url, secret, { auth: { persistSession: false } });

export const STAFF_PASSWORD = "receta-demo";
const places = JSON.parse(readFileSync("data/places.json", "utf8"));
const patients = JSON.parse(readFileSync("data/patients.json", "utf8"));

const staff = [
  { email: "clinico@demo.receta.invalid", role: "clinician", name: "Dra. Demo" },
  { email: "promotora@demo.receta.invalid", role: "promotora", name: "Promotora Demo" },
  ...places.map((p) => ({ email: `negocio-${p.id}@demo.receta.invalid`, role: "business", name: p.name, place: p.id })),
];
// Sample patients keep their ids (p1, p2, p3). Phone (787) 555-010N, PIN NNNNNN.
const people = patients.map((p, i) => ({ ...p, phone: `178755501${String(i + 1).padStart(2, "0")}`, pin: String(i + 1).repeat(6) }));

async function ensureUser(email, password) {
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
  if (data?.user) return data.user.id;
  if (error?.code !== "email_exists") throw error;
  for (let page = 1; ; page++) {
    const { data: list } = await db.auth.admin.listUsers({ page, perPage: 200 });
    const u = list.users.find((x) => x.email === email);
    if (u) { await db.auth.admin.updateUserById(u.id, { password }); return u.id; }
    if (list.users.length < 200) throw new Error(`cannot find ${email}`);
  }
}

const must = ({ error }) => { if (error) throw error; };

for (const s of staff) {
  const id = await ensureUser(s.email, STAFF_PASSWORD);
  must(await db.from("profiles").upsert({ id, role: s.role, display_name: s.name, place_id: s.place ?? null }));
  console.log(`${s.role.padEnd(10)} ${s.email}`);
}
const { data: chw } = await db.from("profiles").select("id").eq("role", "promotora").limit(1).single();
for (const p of people) {
  const id = await ensureUser(`${p.phone}@phone.receta.invalid`, p.pin);
  must(await db.from("profiles").upsert({ id, role: "patient", display_name: p.name }));
  must(await db.from("patients").upsert({ id: p.id, user_id: id, name: p.name, age: p.age, town: p.town, note: p.note, phone: p.phone, chw_id: chw?.id ?? null }));
  console.log(`patient    ${p.id} ${p.name}: phone ${p.phone.slice(1)}, PIN ${p.pin}`);
}
console.log(`\nStaff password: ${STAFF_PASSWORD}`);
