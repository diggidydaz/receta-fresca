"use client";
// Accounts (F10). Only active when the app runs with a server; the browser-only demo has no sign-in.
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BigButton, Busy, ChoiceGroup, Field, Notice, Page } from "./ui";
import { useT } from "@/lib/i18n";
import { formatPhone, normalizePhone, PIN_LENGTH, validPin } from "@/lib/phone";
import { useSession, type Role } from "@/lib/store";
import { accessToken, refresh, signInPatient, signInStaff, signOut, startSync, useSyncStatus, type SignInError } from "@/lib/sync";
import type { L10n } from "@/lib/types";

export const roleHome: Record<Role, string> = { patient: "/paciente", clinician: "/clinico", promotora: "/promotora", business: "/negocio" };

// Screens anyone may open; every other screen needs an account with the right role.
const PUBLIC = ["/", "/acerca", "/familia", "/entrar"];
const ALLOWED: Record<Role, string[]> = {
  patient: ["/paciente", "/intake", "/plan", "/comida", "/canjear"],
  clinician: ["/clinico", "/promotora", "/intake", "/plan"],
  promotora: ["/promotora", "/intake", "/plan"],
  business: ["/negocio", "/negocio/inventario"],
};

const roleName: Record<Role, L10n> = {
  patient: { es: "Paciente", en: "Patient" },
  clinician: { es: "Clínico", en: "Clinician" },
  promotora: { es: "Promotora", en: "Health worker" },
  business: { es: "Negocio", en: "Business" },
};

const copy = {
  signIn: { es: "Entrar", en: "Sign in" },
  who: { es: "¿Quién es usted?", en: "Who are you?" },
  patient: { es: "Soy paciente", en: "I am a patient" },
  staff: { es: "Trabajo en la clínica o en un negocio", en: "I work at the clinic or a business" },
  phone: { es: "Número de teléfono", en: "Phone number" },
  phoneHint: { es: "El número que le dio a su clínica.", en: "The number you gave your clinic." },
  pin: { es: `PIN de ${PIN_LENGTH} números`, en: `${PIN_LENGTH}-digit PIN` },
  pinHint: { es: "Su clínica o su promotora le dio este número.", en: "Your clinic or health worker gave you this number." },
  email: { es: "Correo electrónico", en: "Email" },
  password: { es: "Contraseña", en: "Password" },
  forgot: { es: "¿Olvidó su PIN? Su promotora o su clínica le puede dar uno nuevo.", en: "Forgot your PIN? Your health worker or clinic can give you a new one." },
  errPhone: { es: "Escriba los 10 números del teléfono.", en: "Enter the 10 digits of the phone number." },
  errWrong: { es: "El teléfono o el PIN no son correctos.", en: "The phone number or PIN is not right." },
  errWrongStaff: { es: "El correo o la contraseña no son correctos.", en: "The email or password is not right." },
  errOffline: { es: "No hay conexión. Para entrar la primera vez necesita internet.", en: "No connection. You need internet to sign in the first time." },
  errServer: { es: "No se pudo conectar con el servidor. Trate otra vez en unos minutos.", en: "Could not reach the server. Try again in a few minutes." },
  errProfile: { es: "Esta cuenta no está lista. Llame a su clínica.", en: "This account is not set up. Call your clinic." },
  notForYou: { es: "Esta página no es para su cuenta.", en: "This page is not for your account." },
  myPage: { es: "Ir a mi página", en: "Go to my page" },
  signedInAs: { es: "Conectado", en: "Signed in" },
  signOut: { es: "Salir", en: "Sign out" },
  pending: { es: "Guardado en este teléfono. Se enviará cuando haya conexión.", en: "Saved on this phone. It will be sent when there is a connection." },
  refused: { es: "Un cambio no se pudo guardar en el servidor.", en: "A change could not be saved on the server." },
  leaveUnsent: { es: "Hay cambios que no se han enviado. Si sale ahora, se pierden. ¿Salir de todos modos?", en: "Some changes have not been sent. If you sign out now they are lost. Sign out anyway?" },
};

/** Starts the server connection and keeps each screen to the accounts it is for. */
export function AccountGate({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const path = usePathname() ?? "/";
  useEffect(() => { startSync(); }, []);

  if (session.status === "demo" || PUBLIC.includes(path)) return <>{session.status === "signedIn" && <AccountBar />}{children}</>;
  if (session.status === "loading") return <Page><Busy /></Page>;
  if (session.status === "signedOut") return <SignIn />;
  if (!ALLOWED[session.role].includes(path)) return <><AccountBar /><WrongRole role={session.role} /></>;
  return <><AccountBar />{children}</>;
}

function WrongRole({ role }: { role: Role }) {
  const { t } = useT();
  return (
    <Page>
      <h1>{t(copy.notForYou)}</h1>
      <BigButton href={roleHome[role]} icon="right">{t(copy.myPage)}</BigButton>
    </Page>
  );
}

/** Who is signed in, whether changes are waiting to be sent, and the way out. */
export function AccountBar() {
  const { t } = useT();
  const session = useSession();
  const sync = useSyncStatus();
  const router = useRouter();
  if (session.status !== "signedIn") return null;
  const out = async () => {
    if (sync.pending > 0 && !window.confirm(t(copy.leaveUnsent))) return;
    await signOut();
    router.push("/");
  };
  return (
    <div className="mx-auto flex w-full max-w-[36rem] flex-col gap-2 px-4 pt-4 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 [overflow-wrap:anywhere]"><span className="font-bold">{t(copy.signedInAs)}:</span> {session.name} · {t(roleName[session.role])}</p>
        <button type="button" onClick={out} className="inline-flex min-h-[48px] items-center rounded-xl border-2 border-rule bg-panel px-4 font-bold hover:bg-brand-soft">{t(copy.signOut)}</button>
      </div>
      <p role="status" className={sync.pending || sync.error ? "rounded-xl border-2 border-rule bg-notice p-3 font-bold" : "sr-only"}>
        {sync.pending ? t(copy.pending) : sync.error ? t(copy.refused) : ""}
      </p>
    </div>
  );
}

const signInErr = (e: SignInError, patient: boolean): L10n =>
  e === "phone" ? copy.errPhone : e === "offline" ? copy.errOffline : e === "server" ? copy.errServer : e === "noProfile" ? copy.errProfile : patient ? copy.errWrong : copy.errWrongStaff;

/** Phone + PIN for patients; email + password for clinic and business staff. */
export function SignIn({ onDone }: { onDone?: () => void }) {
  const { t } = useT();
  const [who, setWho] = useState<"patient" | "staff">("patient");
  const [id, setId] = useState("");
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<SignInError | null>(null);
  const patient = who === "patient";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const r = patient ? await signInPatient(id, secret) : await signInStaff(id, secret);
    setBusy(false);
    setErr(r);
    if (!r) onDone?.();
  };

  return (
    <Page>
      <h1>{t(copy.signIn)}</h1>
      <ChoiceGroup legend={t(copy.who)} name="who" value={who} onChange={(v) => { setWho(v); setId(""); setSecret(""); setErr(null); }}
        options={[{ value: "patient", label: t(copy.patient), icon: "person" }, { value: "staff", label: t(copy.staff), icon: "clipboard" }]} />
      <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
        {patient ? (
          <>
            <Field label={t(copy.phone)} hint={t(copy.phoneHint)} type="tel" inputMode="tel" autoComplete="tel" value={id} onChange={setId}
              error={err === "phone" ? t(copy.errPhone) : undefined} />
            <Field label={t(copy.pin)} hint={t(copy.pinHint)} type="password" inputMode="numeric" autoComplete="current-password" maxLength={PIN_LENGTH} value={secret} onChange={(v) => setSecret(v.replace(/\D/g, ""))} />
          </>
        ) : (
          <>
            <Field label={t(copy.email)} type="email" autoComplete="username" value={id} onChange={setId} />
            <Field label={t(copy.password)} type="password" autoComplete="current-password" value={secret} onChange={setSecret} />
          </>
        )}
        {err && err !== "phone" && <p role="alert" className="text-[1.25rem] font-bold text-stop">{t(signInErr(err, patient))}</p>}
        <button type="submit" disabled={busy} className="inline-flex min-h-[64px] w-full items-center justify-center rounded-2xl border-[3px] border-brand bg-brand px-6 py-4 text-[1.25rem] font-bold text-white hover:bg-brand-dark disabled:opacity-60">
          {busy ? t({ es: "Entrando…", en: "Signing in…" }) : t(copy.signIn)}
        </button>
      </form>
      {patient && <Notice>{t(copy.forgot)}</Notice>}
    </Page>
  );
}

// ---------- Enrolling a patient (clinician or promotora) ----------

const enrolCopy = {
  title: { es: "Inscribir a un paciente", en: "Enrol a patient" },
  open: { es: "Inscribir paciente nuevo", en: "Enrol a new patient" },
  name: { es: "Nombre", en: "Name" },
  age: { es: "Edad", en: "Age" },
  town: { es: "Pueblo", en: "Town" },
  note: { es: "Nota para el equipo (opcional)", en: "Note for the team (optional)" },
  phone: { es: "Teléfono del paciente", en: "Patient's phone" },
  pin: { es: `PIN de ${PIN_LENGTH} números`, en: `${PIN_LENGTH}-digit PIN` },
  pinHint: { es: "Escójalo con el paciente. Lo usa para entrar.", en: "Choose it with the patient. They use it to sign in." },
  save: { es: "Crear cuenta", en: "Create account" },
  cancel: { es: "Cancelar", en: "Cancel" },
  synthetic: { es: "Solo pacientes de ejemplo: este sistema todavía no está aprobado para datos reales de salud.", en: "Sample patients only: this system is not yet approved for real health data." },
  done: { es: "Cuenta creada. Dígale al paciente:", en: "Account created. Tell the patient:" },
  errName: { es: "Escriba el nombre.", en: "Enter the name." },
  errAge: { es: "Escriba la edad en números.", en: "Enter the age as a number." },
  errPhone: { es: "Escriba los 10 números del teléfono.", en: "Enter the 10 digits of the phone number." },
  errPin: { es: `El PIN debe tener ${PIN_LENGTH} números.`, en: `The PIN must have ${PIN_LENGTH} digits.` },
  phoneTaken: { es: "Ya hay una cuenta con ese teléfono.", en: "There is already an account with that phone." },
  failed: { es: "No se pudo crear la cuenta. Revise la conexión y trate otra vez.", en: "Could not create the account. Check the connection and try again." },
};

type EnrolErr = Partial<Record<"name" | "age" | "phone" | "pin" | "form", L10n>>;

export function EnrolPatient({ onEnrolled }: { onEnrolled: (patientId: string) => void }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({ name: "", age: "", town: "", note: "", phone: "", pin: "" });
  const [err, setErr] = useState<EnrolErr>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ phone: string; pin: string } | null>(null);
  const set = (p: Partial<typeof v>) => setV((o) => ({ ...o, ...p }));

  if (!open) {
    return (
      <div className="flex flex-col gap-3">
        {done && (
          <Notice><p role="status" className="text-[1.25rem]"><span className="font-bold">{t(enrolCopy.done)}</span> {formatPhone(done.phone)} · PIN {done.pin}</p></Notice>
        )}
        <BigButton variant="secondary" icon="person" onClick={() => { setOpen(true); setDone(null); }}>{t(enrolCopy.open)}</BigButton>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const age = Number(v.age);
    const phone = normalizePhone(v.phone);
    const errs: EnrolErr = {};
    if (!v.name.trim()) errs.name = enrolCopy.errName;
    if (!v.age.trim() || !Number.isInteger(age) || age < 0 || age > 120) errs.age = enrolCopy.errAge;
    if (!phone) errs.phone = enrolCopy.errPhone;
    if (!validPin(v.pin)) errs.pin = enrolCopy.errPin;
    setErr(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${await accessToken()}` },
        body: JSON.stringify({ name: v.name, age, town: v.town, note: v.note, phone: v.phone, pin: v.pin }),
      });
      const j = (await res.json().catch(() => ({}))) as { patientId?: string; error?: string };
      if (!res.ok || !j.patientId) {
        setErr(j.error === "phoneTaken" ? { phone: enrolCopy.phoneTaken } : { form: enrolCopy.failed });
        return;
      }
      await refresh();
      setDone({ phone: phone as string, pin: v.pin });
      setV({ name: "", age: "", town: "", note: "", phone: "", pin: "" });
      setOpen(false);
      onEnrolled(j.patientId);
    } catch {
      setErr({ form: enrolCopy.failed });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-2xl border-[3px] border-brand bg-panel p-5">
      <h2>{t(enrolCopy.title)}</h2>
      <Notice>{t(enrolCopy.synthetic)}</Notice>
      <Field label={t(enrolCopy.name)} autoComplete="off" value={v.name} onChange={(x) => set({ name: x })} maxLength={80} error={err.name && t(err.name)} />
      <Field label={t(enrolCopy.age)} inputMode="numeric" value={v.age} onChange={(x) => set({ age: x.replace(/\D/g, "") })} maxLength={3} error={err.age && t(err.age)} />
      <Field label={t(enrolCopy.town)} value={v.town} onChange={(x) => set({ town: x })} maxLength={60} />
      <Field label={t(enrolCopy.phone)} type="tel" inputMode="tel" autoComplete="off" value={v.phone} onChange={(x) => set({ phone: x })} error={err.phone && t(err.phone)} />
      <Field label={t(enrolCopy.pin)} hint={t(enrolCopy.pinHint)} inputMode="numeric" autoComplete="off" maxLength={PIN_LENGTH} value={v.pin} onChange={(x) => set({ pin: x.replace(/\D/g, "") })} error={err.pin && t(err.pin)} />
      <Field label={t(enrolCopy.note)} value={v.note} onChange={(x) => set({ note: x })} maxLength={200} />
      {err.form && <p role="alert" className="text-[1.25rem] font-bold text-stop">{t(err.form)}</p>}
      <button type="submit" disabled={busy} className="inline-flex min-h-[64px] w-full items-center justify-center rounded-2xl border-[3px] border-brand bg-brand px-6 py-4 text-[1.25rem] font-bold text-white hover:bg-brand-dark disabled:opacity-60">
        {busy ? t({ es: "Creando…", en: "Creating…" }) : t(enrolCopy.save)}
      </button>
      <BigButton variant="quiet" onClick={() => { setOpen(false); setErr({}); }}>{t(enrolCopy.cancel)}</BigButton>
    </form>
  );
}

// ---------- New PIN (patient forgot theirs) ----------

const pinCopy = {
  open: { es: "Darle un PIN nuevo", en: "Give a new PIN" },
  label: { es: `PIN nuevo de ${PIN_LENGTH} números`, en: `New ${PIN_LENGTH}-digit PIN` },
  save: { es: "Guardar PIN", en: "Save PIN" },
  done: { es: "PIN cambiado. Dígale al paciente el número nuevo.", en: "PIN changed. Tell the patient the new number." },
  failed: { es: "No se pudo cambiar el PIN. Trate otra vez.", en: "Could not change the PIN. Try again." },
};

export function ResetPin({ patientId }: { patientId: string }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState<"done" | "failed" | "pin" | null>(null);
  if (!open) return (
    <div className="flex flex-col gap-2">
      {msg === "done" && <p role="status" className="font-bold">{t(pinCopy.done)}</p>}
      <BigButton variant="quiet" onClick={() => { setOpen(true); setMsg(null); }}>{t(pinCopy.open)}</BigButton>
    </div>
  );
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validPin(pin)) { setMsg("pin"); return; }
    const res = await fetch("/api/accounts", {
      method: "PATCH",
      headers: { "content-type": "application/json", authorization: `Bearer ${await accessToken()}` },
      body: JSON.stringify({ patientId, pin }),
    }).catch(() => null);
    if (!res?.ok) { setMsg("failed"); return; }
    setMsg("done");
    setPin("");
    setOpen(false);
  };
  return (
    <form onSubmit={save} noValidate className="flex flex-col gap-3">
      <Field label={t(pinCopy.label)} inputMode="numeric" autoComplete="off" maxLength={PIN_LENGTH} value={pin} onChange={(x) => setPin(x.replace(/\D/g, ""))}
        error={msg === "pin" ? t(enrolCopy.errPin) : undefined} />
      {msg === "failed" && <p role="alert" className="font-bold text-stop">{t(pinCopy.failed)}</p>}
      <button type="submit" className="inline-flex min-h-[56px] w-full items-center justify-center rounded-2xl border-[3px] border-brand bg-panel px-6 font-bold text-brand hover:bg-brand-soft">{t(pinCopy.save)}</button>
    </form>
  );
}
