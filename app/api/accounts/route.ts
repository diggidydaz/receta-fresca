// Patient accounts (F10, hotspot H4): a clinician or promotora enrols the patient at the visit with
// their phone number and a 6-digit PIN. The patient then signs in on their own phone.
import { clip, readBody } from "@/lib/claude";
import { normalizePhone, phoneEmail, validPin } from "@/lib/phone";
import { callerOf, supabaseAdmin } from "@/lib/supabaseAdmin";

const fail = (status: number, error: string) => Response.json({ error }, { status });

type NewPatient = { name: string; age: number; town: string; phone: string; pin: string; note: string };

export async function POST(req: Request) {
  const db = supabaseAdmin();
  if (!db) return fail(503, "noServer");
  const caller = await callerOf(req);
  if (!caller || (caller.role !== "clinician" && caller.role !== "promotora")) return fail(403, "notAllowed");

  const b = await readBody<NewPatient>(req);
  const name = clip(b.name, 80).trim();
  const town = clip(b.town, 60).trim();
  const note = clip(b.note, 200).trim();
  const age = Math.round(Number(b.age));
  const phone = normalizePhone(clip(b.phone, 30));
  const pin = clip(b.pin, 12);
  if (!name) return fail(400, "name");
  if (!phone) return fail(400, "phone");
  if (!validPin(pin)) return fail(400, "pin");
  if (!Number.isFinite(age) || age < 0 || age > 120) return fail(400, "age");

  const { data: created, error } = await db.auth.admin.createUser({ email: phoneEmail(phone), password: pin, email_confirm: true, user_metadata: { role: "patient" } });
  if (error || !created.user) return fail(error?.code === "email_exists" ? 409 : 500, error?.code === "email_exists" ? "phoneTaken" : "create");
  const userId = created.user.id;

  const prof = await db.from("profiles").insert({ id: userId, role: "patient", display_name: name });
  const pat = prof.error ? prof : await db.from("patients").insert({
    user_id: userId, name, age, town, phone, created_by: caller.id,
    note: { es: note, en: note },
    chw_id: caller.role === "promotora" ? caller.id : null,
  }).select("id").single();
  if (pat.error) {
    await db.auth.admin.deleteUser(userId); // leave nothing half-made
    return fail(pat.error.code === "23505" ? 409 : 500, pat.error.code === "23505" ? "phoneTaken" : "create");
  }
  const patientId = (pat.data as { id: string }).id;
  await db.from("audit_log").insert({ actor: caller.id, action: "account.created", patient_id: patientId, detail: { by: caller.role } });
  return Response.json({ patientId });
}

/** A new PIN for a patient who forgot theirs. Staff only. */
export async function PATCH(req: Request) {
  const db = supabaseAdmin();
  if (!db) return fail(503, "noServer");
  const caller = await callerOf(req);
  if (!caller || (caller.role !== "clinician" && caller.role !== "promotora")) return fail(403, "notAllowed");
  const b = await readBody<{ patientId: string; pin: string }>(req);
  const pin = clip(b.pin, 12);
  if (!validPin(pin)) return fail(400, "pin");
  const { data: p } = await db.from("patients").select("user_id").eq("id", clip(b.patientId, 40)).single();
  if (!p?.user_id) return fail(404, "notFound");
  const { error } = await db.auth.admin.updateUserById(p.user_id, { password: pin });
  if (error) return fail(500, "update");
  await db.from("audit_log").insert({ actor: caller.id, action: "account.pinReset", patient_id: clip(b.patientId, 40) });
  return Response.json({ ok: true });
}
