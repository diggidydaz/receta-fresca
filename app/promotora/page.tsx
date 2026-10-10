"use client";
// Caseload for a community health worker (promotora): who needs a call or a visit, notes that the
// clinician also sees, and help with the pre-visit questions. Patients needing attention come first.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { PatientProgress } from "@/components/PatientProgress";
import { EnrolPatient, ResetPin } from "@/components/Account";
import { BigButton, Busy, Card, Notice, Page, Tag } from "@/components/ui";
import { alertsFor, NON_REDEMPTION_DAYS } from "@/lib/care";
import { common, useT } from "@/lib/i18n";
import { formatPhone } from "@/lib/phone";
import { allPatients, emptyPatient, listPatients, setPatientState, setState, useAppState, useHydrated, useSession, type PatientState } from "@/lib/store";
import type { L10n } from "@/lib/types";

const copy = {
  title: { es: "Mis pacientes", en: "My patients" },
  intro: { es: "Primero aparecen las personas que necesitan una llamada o una visita.", en: "People who need a call or a visit come first." },
  years: { es: "años", en: "years" },
  needs: { es: "Necesita seguimiento", en: "Needs follow-up" },
  ok: { es: "Al día", en: "Up to date" },
  intake: { es: "Preguntas antes de la cita", en: "Pre-visit questions" },
  rx: { es: "Receta", en: "Prescription" },
  done: { es: "Hechas", en: "Done" },
  pending: { es: "Faltan", en: "Not yet" },
  sent: { es: "Enviada", en: "Sent" },
  none: { es: "Todavía no", en: "Not yet" },
  help: { es: "Ayudar con las preguntas", en: "Help with the questions" },
  show: { es: "Ver cómo le va", en: "See how it is going" },
  hide: { es: "Ocultar detalles", en: "Hide details" },
  noteLabel: { es: "Nota para el clínico", en: "Note for the clinician" },
  saveNote: { es: "Guardar nota", en: "Save note" },
  quick: { es: "Nota rápida", en: "Quick note" },
  called: { es: "Llamé", en: "I called" },
  visited: { es: "Visité", en: "I visited" },
  helpedFood: { es: "Le ayudé a conseguir comida", en: "I helped them get food" },
  noted: { es: "Nota guardada. El clínico la verá.", en: "Note saved. The clinician will see it." },
  empty: { es: "Escriba la nota primero.", en: "Write the note first." },
  lastNote: { es: "Última nota", en: "Latest note" },
  simTitle: { es: "Para la demostración", en: "For the demo" },
  simHint: { es: `Una receta sin recoger después de ${NON_REDEMPTION_DAYS} días aparece aquí. Este botón hace como si hubieran pasado ${NON_REDEMPTION_DAYS} días.`, en: `A prescription not picked up after ${NON_REDEMPTION_DAYS} days shows here. This button acts as if ${NON_REDEMPTION_DAYS} days had passed.` },
  simGo: { es: `Simular que pasaron ${NON_REDEMPTION_DAYS} días`, en: `Pretend ${NON_REDEMPTION_DAYS} days have passed` },
};

const quickNotes: L10n[] = [copy.called, copy.visited, copy.helpedFood];

function NoteBox({ patientId, p }: { patientId: string; p: PatientState }) {
  const { t, lang } = useT();
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<"noted" | "empty" | null>(null);
  const add = (note: string) => {
    const v = note.trim().slice(0, 500);
    if (!v) { setMsg("empty"); return; }
    setPatientState(patientId, { chwNotes: [{ at: new Date().toISOString(), text: v }, ...p.chwNotes].slice(0, 100) });
    setText(""); setMsg("noted");
  };
  const id = `note-${patientId}`;
  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold">{t(copy.quick)}</p>
      <div className="flex flex-wrap gap-2">
        {quickNotes.map((q, i) => (
          <button key={i} type="button" onClick={() => add(t(q))} className="min-h-[56px] rounded-2xl border-[3px] border-brand bg-panel px-4 font-bold text-brand hover:bg-brand-soft">{t(q)}</button>
        ))}
      </div>
      <label htmlFor={id} className="mt-2 font-bold">{t(copy.noteLabel)}</label>
      <textarea id={id} rows={2} maxLength={500} value={text} onChange={(e) => { setText(e.target.value); setMsg(null); }} className="w-full rounded-2xl border-[3px] border-rule bg-panel p-3 text-[1.1rem]" />
      <BigButton variant="secondary" icon="note" onClick={() => add(text)}>{t(copy.saveNote)}</BigButton>
      <p role="status" className={`font-bold ${msg === "empty" ? "text-stop" : "text-brand"}`}>{msg ? t(copy[msg]) : ""}</p>
      {p.chwNotes[0] && (
        <p className="text-muted">{t(copy.lastNote)}: {p.chwNotes[0].text} · {new Date(p.chwNotes[0].at).toLocaleDateString(lang === "es" ? "es-PR" : "en-US", { day: "numeric", month: "short" })}</p>
      )}
    </div>
  );
}

export default function PromotoraPage() {
  const { t } = useT();
  const s = useAppState();
  const hydrated = useHydrated();
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const demo = useSession().status === "demo";
  if (!hydrated) return <Page><Busy /></Page>;

  const records = allPatients(s);
  const empty = emptyPatient();
  const rows = listPatients(s)
    .map((pt) => {
      const p = records[pt.id] ?? empty;
      const alerts = alertsFor(p);
      return { pt, p, alerts, urgent: alerts.filter((a) => a.urgent).length };
    })
    .sort((a, b) => b.urgent - a.urgent || b.alerts.length - a.alerts.length);

  const helpWithIntake = (id: string) => {
    setState({ patientId: id });
    const p = records[id] ?? empty;
    setPatientState(id, { intake: { ...p.intake, helper: "promotora" } });
    router.push("/intake");
  };

  // Demo only: move every unredeemed prescription back in time so the follow-up flag can be shown live.
  const simulate = () => {
    const back = NON_REDEMPTION_DAYS * 24 * 60 * 60 * 1000;
    for (const [id, p] of Object.entries(records)) {
      if (!p.rx || p.order) continue;
      const createdAt = new Date(new Date(p.rx.createdAt).getTime() - back).toISOString();
      setPatientState(id, { rx: { ...p.rx, createdAt }, teachBack: p.teachBack ? { ...p.teachBack, planAt: createdAt } : null });
    }
  };

  return (
    <Page>
      <h1>{t(copy.title)}</h1>
      <p className="-mt-3 text-[1.1rem]">{t(copy.intro)}</p>
      <div><Tag>{t(common.simulated)}</Tag></div>

      {rows.map(({ pt, p, alerts, urgent }) => (
        <Card key={pt.id} className={`flex flex-col gap-3 ${urgent ? "border-[3px] border-stop" : ""}`}>
          <h2 className="flex items-center gap-2"><Icon name="person" /> {pt.name}</h2>
          <p className="text-muted">{[`${pt.age} ${t(copy.years)}`, pt.town, t(pt.note), pt.phone && formatPhone(pt.phone)].filter(Boolean).join(" · ")}</p>
          <p className={`flex items-center gap-2 font-bold ${alerts.length ? "text-stop" : "text-brand"}`}>
            <Icon name={alerts.length ? "warn" : "check"} /> {t(alerts.length ? copy.needs : copy.ok)}
          </p>
          {alerts.length > 0 && <ul className="list-disc pl-6">{alerts.map((a) => <li key={a.key} className={a.urgent ? "font-bold" : ""}>{t(a.text)}</li>)}</ul>}
          <p>{t(copy.intake)}: <strong>{t(p.intakeDone ? copy.done : copy.pending)}</strong> · {t(copy.rx)}: <strong>{t(p.rx ? copy.sent : copy.none)}</strong></p>
          {!p.intakeDone && <BigButton icon="clipboard" onClick={() => helpWithIntake(pt.id)}>{t(copy.help)}</BigButton>}
          <NoteBox patientId={pt.id} p={p} />
          <BigButton variant="quiet" icon={open === pt.id ? "left" : "chart"} aria-expanded={open === pt.id} aria-controls={`prog-${pt.id}`} onClick={() => setOpen(open === pt.id ? null : pt.id)}>
            {t(open === pt.id ? copy.hide : copy.show)}
          </BigButton>
          <div id={`prog-${pt.id}`} hidden={open !== pt.id}>
            {open === pt.id && <PatientProgress patientId={pt.id} p={p} role="promotora" />}
          </div>
          {!demo && <ResetPin patientId={pt.id} />}
        </Card>
      ))}

      {!demo && <EnrolPatient onEnrolled={() => {}} />}
      {demo && (
        <Notice>
          <p className="font-bold">{t(copy.simTitle)}</p>
          <p>{t(copy.simHint)}</p>
          <div className="mt-3"><BigButton variant="secondary" icon="refresh" onClick={simulate}>{t(copy.simGo)}</BigButton></div>
        </Notice>
      )}
      <BigButton variant="quiet" href="/" icon="home">{t(common.home)}</BigButton>
    </Page>
  );
}
