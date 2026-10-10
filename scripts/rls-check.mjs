// Checks the server's access rules and voucher commands directly (no browser).
//   npx supabase db reset && npm run seed && npm run rls-check
// Each line prints PASS or FAIL; exits non-zero on any failure.
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

nextEnv.loadEnvConfig(process.cwd());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) { console.error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."); process.exit(1); }

let failed = 0, passed = 0;
const check = (name, ok, extra = "") => { if (ok) passed++; else failed++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${!ok && extra ? ` — ${extra}` : ""}`); };

async function as(email, password) {
  const c = createClient(url, anon, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`${email}: ${error.message}`);
  return c;
}
const staffPw = "receta-demo";
const clin = await as("clinico@demo.receta.invalid", staffPw);
const chw = await as("promotora@demo.receta.invalid", staffPw);
const p1 = await as("17875550101@phone.receta.invalid", "111111");
const p2 = await as("17875550102@phone.receta.invalid", "222222");
const c1 = await as("negocio-c1@demo.receta.invalid", staffPw);
const c2 = await as("negocio-c2@demo.receta.invalid", staffPw);
const k1 = await as("negocio-k1@demo.receta.invalid", staffPw);
const now = () => new Date().toISOString();
const put = (c, patient_id, key, value, at = now()) => c.rpc("put_fields", { rows: [{ patient_id, key, value, at }] });
const est = { items: [], carbsMin: 40, carbsMax: 50, light: "green", confidence: "table", message: "" };
const field = async (c, pid, key) => (await c.from("patient_fields").select("value").eq("patient_id", pid).eq("key", key).maybeSingle()).data?.value;

// Wrong PIN is refused.
{
  const c = createClient(url, anon, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email: "17875550101@phone.receta.invalid", password: "000000" });
  check("wrong PIN refused", Boolean(error));
}
// Nobody can sign themselves up.
{
  const c = createClient(url, anon, { auth: { persistSession: false } });
  const { error } = await c.auth.signUp({ email: "17870000000@phone.receta.invalid", password: "123456" });
  check("self sign-up disabled", Boolean(error));
}

// Clean slate for p1 and p2.
await put(clin, "p1", "rx", null);
await put(clin, "p2", "rx", null);

// Who sees which patients.
check("clinician sees all 3 patients", (await clin.from("patients").select("id")).data?.length >= 3);
check("patient sees only self", JSON.stringify((await p1.from("patients").select("id")).data?.map((r) => r.id)) === '["p1"]');
check("business sees no patients without an order", (await c1.from("patients").select("id")).data?.length === 0);

// Field writes.
const rx = { patientId: "p1", type: "produce", carbTarget: 45, weeks: 4, avoid: [], needsDelivery: false, note: "", createdAt: now() };
check("clinician writes rx", !(await put(clin, "p1", "rx", rx)).error);
check("patient reads own rx", (await field(p1, "p1", "rx"))?.carbTarget === 45);
check("other patient cannot read it", (await field(p2, "p1", "rx")) === undefined);
const forged = await put(p1, "p1", "rx", { ...rx, carbTarget: 90 }, new Date(Date.now() + 1000).toISOString());
check("patient cannot write own rx", Boolean(forged.error) && (await field(clin, "p1", "rx"))?.carbTarget === 45, forged.error?.message);
check("patient cannot write another's log", Boolean((await put(p1, "p2", "log", [])).error));
check("patient cannot write order directly", Boolean((await put(p1, "p1", "order", { id: "X", placeId: "c1", status: "delivered" })).error));
check("promotora cannot write rx", Boolean((await put(chw, "p1", "rx", rx)).error));
check("promotora writes notes", !(await put(chw, "p1", "chwNotes", [{ at: now(), text: "llamé" }])).error);
check("business cannot write fields", Boolean((await put(c1, "p1", "log", [])).error));

// Last writer wins by the writer's clock: an older offline edit does not replace a newer one.
const t0 = new Date(Date.now() - 60_000).toISOString();
await put(p1, "p1", "log", [{ id: "new", text: "arroz", at: now(), estimate: est }]);
await put(p1, "p1", "log", [{ id: "old", text: "pan", at: t0, estimate: est }], t0);
check("stale write ignored", (await field(p1, "p1", "log"))?.[0]?.id === "new");

// Orders and vouchers.
check("wrong kind of place refused", Boolean((await p1.rpc("place_order", { p_patient: "p1", p_place: "k1", p_delivery: false })).error));
check("cannot order for another patient", Boolean((await p2.rpc("place_order", { p_patient: "p1", p_place: "c1", p_delivery: false })).error));
const placed = await p1.rpc("place_order", { p_patient: "p1", p_place: "c1", p_delivery: false });
const code = placed.data?.voucher;
check("patient places order and gets voucher", !placed.error && /^RF-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/.test(code ?? ""), placed.error?.message);
check("placing again returns the same order", (await p1.rpc("place_order", { p_patient: "p1", p_place: "c2", p_delivery: false })).data?.voucher === code);
check("business sees its customer", (await c1.from("patients").select("id")).data?.some((r) => r.id === "p1"));
check("business reads rx for the order", (await field(c1, "p1", "rx"))?.carbTarget === 45);
check("business cannot read the food log", (await field(c1, "p1", "log")) === undefined);
check("other business sees nothing", (await c2.from("patients").select("id")).data?.length === 0);
check("other business cannot move status", Boolean((await c2.rpc("set_order_status", { p_patient: "p1", p_status: "preparing" })).error));
check("status cannot skip steps", Boolean((await c1.rpc("set_order_status", { p_patient: "p1", p_status: "delivered" })).error));
check("business moves status forward", (await c1.rpc("set_order_status", { p_patient: "p1", p_status: "preparing" })).data?.status === "preparing");
check("cannot cancel once started", Boolean((await p1.rpc("cancel_order", { p_patient: "p1" })).error));
check("patient cannot redeem", Boolean((await p1.rpc("redeem_voucher", { p_code: code })).error));
check("other place cannot redeem", (await c2.rpc("redeem_voucher", { p_code: code })).data?.reason === "otherPlace");
check("unknown code refused", (await c1.rpc("redeem_voucher", { p_code: "RF-2222-2222" })).data?.reason === "unknown");
const typed = code.replace(/-/g, " ").toLowerCase();
const r1 = await c1.rpc("redeem_voucher", { p_code: typed });
check("business redeems (typed loosely)", r1.data?.ok === true, JSON.stringify(r1.data ?? r1.error));
check("second redemption refused", (await c1.rpc("redeem_voucher", { p_code: code })).data?.reason === "used");
check("patient sees it redeemed", Boolean((await field(p1, "p1", "order"))?.redeemedAt));
check("redeeming did not mark it delivered", (await field(p1, "p1", "order"))?.status === "preparing");

// A new prescription voids an unredeemed voucher and clears the order.
await put(clin, "p2", "rx", { ...rx, patientId: "p2", type: "meals" });
const o2 = (await p2.rpc("place_order", { p_patient: "p2", p_place: "k1", p_delivery: true })).data;
await new Promise((r) => setTimeout(r, 5));
await put(clin, "p2", "rx", { ...rx, patientId: "p2", type: "meals", createdAt: now() });
check("new rx clears the order", (await field(p2, "p2", "order")) === undefined);
check("old voucher is void", (await k1.rpc("redeem_voucher", { p_code: o2?.voucher })).data?.reason === "void");

// Expired prescription cannot be ordered.
await put(clin, "p2", "rx", { ...rx, patientId: "p2", weeks: 1, createdAt: new Date(Date.now() - 9 * 86400_000).toISOString() });
check("expired rx cannot be ordered", Boolean((await p2.rpc("place_order", { p_patient: "p2", p_place: "c1", p_delivery: false })).error));

// Stock: each business writes only its own.
check("business updates own stock", !(await c1.from("stock").upsert({ place_id: "c1", items: [{ es: "Yuca", en: "Cassava" }], updated_at: now() })).error);
check("business cannot update another's stock", Boolean((await c1.from("stock").upsert({ place_id: "c2", items: [], updated_at: now() })).error));

// Audit trail.
const audit = (await clin.from("audit_log").select("action").eq("patient_id", "p1")).data?.map((r) => r.action) ?? [];
check("audit has issue and redeem", audit.includes("voucher.issued") && audit.includes("voucher.redeemed"));
check("patients cannot read audit", ((await p1.from("audit_log").select("id")).data ?? []).length === 0);

// Accounts API (needs the app running): set APP=http://localhost:3100 to include.
if (process.env.APP) {
  const token = async (c) => (await c.auth.getSession()).data.session.access_token;
  const post = async (c, body, method = "POST") => fetch(`${process.env.APP}/api/accounts`, { method, headers: { "content-type": "application/json", authorization: `Bearer ${await token(c)}` }, body: JSON.stringify(body) });
  const phone = "787" + String(Date.now()).slice(-7);
  const made = await post(clin, { name: "Paciente Prueba", age: 60, town: "Ponce", phone, pin: "424242" });
  const madeJson = await made.json();
  check("clinician creates patient account", made.ok && typeof madeJson.patientId === "string", JSON.stringify(madeJson));
  check("same phone refused", (await post(clin, { name: "Otra", age: 60, town: "", phone, pin: "424242" })).status === 409);
  check("patient cannot create accounts", (await post(p1, { name: "X", age: 1, town: "", phone: "7870000001", pin: "123456" })).status === 403);
  check("short PIN refused", (await post(clin, { name: "X", age: 1, town: "", phone: "7870000002", pin: "12" })).status === 400);
  const newbie = await as(`1${phone}@phone.receta.invalid`, "424242");
  check("new patient signs in and sees self", (await newbie.from("patients").select("id")).data?.[0]?.id === madeJson.patientId);
  check("promotora resets PIN", (await post(chw, { patientId: madeJson.patientId, pin: "515151" }, "PATCH")).ok);
  await as(`1${phone}@phone.receta.invalid`, "515151");
  check("new PIN works", true);
}

console.log(`\n${passed}/${passed + failed} passed`);
process.exit(failed ? 1 : 0);
