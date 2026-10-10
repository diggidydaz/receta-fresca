"use client";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { BigButton, Busy, Card, ChoiceGroup, Notice, Page, Tag } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { helperWord, PatientProgress } from "@/components/PatientProgress";
import { useT } from "@/lib/i18n";
import { DEFAULT_TARGET } from "@/lib/foods";
import { ensurePlan } from "@/lib/planLoader";
import { download, outcomesCsv } from "@/lib/export";
import { allPatients, setState, useAppState, useHydrated } from "@/lib/store";
import type { IntakeSummary, Patient, Rx, RxType, VisitSummary } from "@/lib/types";
import patientsData from "@/data/patients.json";

const patients = patientsData as Patient[];

const copy = {
  title: { es: "Recetar comida", en: "Prescribe food" },
  patient: { es: "Paciente", en: "Patient" },
  years: { es: "años", en: "years" },
  sumTitle: { es: "Resumen antes de la cita", en: "Summary before the visit" },
  ai: { es: "Hecho con IA", en: "AI-generated" },
  basic: { es: "Resumen básico, sin IA", en: "Basic summary, no AI" },
  pattern: { es: "Patrón de comida", en: "Eating pattern" },
  barriers: { es: "Barreras", en: "Barriers" },
  flags: { es: "Para preguntar en la cita", en: "To ask at the visit" },
  noSummary: { es: "El paciente no ha contestado las preguntas todavía.", en: "The patient has not answered the questions yet." },
  answerFor: { es: "Contestar por el paciente", en: "Answer for the patient" },
  rxTitle: { es: "Receta", en: "Prescription" },
  typeLegend: { es: "Tipo de comida", en: "Type of food" },
  produce: { es: "Frutas, vegetales y viandas frescas", en: "Fresh fruit, vegetables and root crops" },
  produceHint: { es: "Para pacientes que cocinan", en: "For patients who cook" },
  meals: { es: "Comidas preparadas", en: "Prepared meals" },
  mealsHint: { es: "Para pacientes que no pueden cocinar", en: "For patients who cannot cook" },
  carbLabel: { es: "Meta de carbohidratos por comida (gramos)", en: "Carbohydrate goal per meal (grams)" },
  carbHint: { es: "Usted decide la meta. La aplicación no la calcula.", en: "You decide the goal. The app does not calculate it." },
  less: { es: "Menos", en: "Less" },
  more: { es: "Más", en: "More" },
  grams: { es: "gramos", en: "grams" },
  weeksLegend: { es: "Duración", en: "Length" },
  w4: { es: "4 semanas", en: "4 weeks" },
  w8: { es: "8 semanas", en: "8 weeks" },
  w12: { es: "12 semanas", en: "12 weeks" },
  delivery: { es: "Necesita entrega a domicilio", en: "Needs home delivery" },
  avoid: { es: "Comidas a evitar (separadas por coma)", en: "Foods to avoid (separated by commas)" },
  note: { es: "Nota para el paciente (opcional)", en: "Note for the patient (optional)" },
  send: { es: "Enviar receta", en: "Send prescription" },
  sending: { es: "Enviando la receta…", en: "Sending the prescription…" },
  errTitle: { es: "No se pudo enviar la receta. Los datos siguen aquí.", en: "The prescription could not be sent. Your entries are still here." },
  retry: { es: "Intentar otra vez", en: "Try again" },
  sentTitle: { es: "Receta enviada", en: "Prescription sent" },
  patientSees: { es: "Lo que verá el paciente", en: "What the patient will see" },
  viewAs: { es: "Ver como paciente", en: "View as patient" },
  another: { es: "Hacer otra receta", en: "Write another prescription" },
  progress: { es: "Cómo le va", en: "How it is going" },
  helpedBy: { es: "Contestado con ayuda de", en: "Answered with help from" },
  discTitle: { es: "Antes de empezar: qué hace la IA", en: "Before you start: what the AI does" },
  discDoes: { es: "La IA ayuda con", en: "The AI helps with" },
  discDoes1: { es: "Resumir lo que el paciente contestó antes de la cita. Reporta lo que dijo; no interpreta ni diagnostica.", en: "Summarizing what the patient answered before the visit. It reports what they said; it does not interpret or diagnose." },
  discDoes2: { es: "Armar el plan de la semana con lo que tienen los colmados, fincas y cocinas.", en: "Building the weekly plan from what stores, farms and kitchens have." },
  discDoes3: { es: "Nombrar los platos de una foto, y estimar platos que no están en la tabla de comida local (marcado como cálculo aproximado).", en: "Naming the dishes in a photo, and estimating dishes that are not in the local food table (marked as a rough guess)." },
  discNever: { es: "La IA nunca", en: "The AI never" },
  discNever1: { es: "Decide la meta de carbohidratos. Usted la decide.", en: "Sets the carbohydrate goal. You set it." },
  discNever2: { es: "Recomienda ni ajusta insulina ni medicamentos.", en: "Recommends or adjusts insulin or medication." },
  discNever3: { es: "Decide las luces de colores, la lista de comidas a evitar ni el límite por comida: eso lo hace el código, con su meta.", en: "Decides the traffic lights, the avoid list or the per-meal limit: code does that, from your goal." },
  discYou: { es: "Todo lo hecho con IA dice «Hecho con IA». Si la IA no está disponible, la aplicación usa textos fijos y lo dice. Revise el resumen antes de recetar.", en: "Everything made with AI says \"AI-generated\". If the AI is unavailable, the app uses fixed text and says so. Review the summary before prescribing." },
  discOk: { es: "Entendido, empezar", en: "Understood, start" },
  discMore: { es: "Qué es real y qué es simulado", en: "What is real and what is simulated" },
  exportTitle: { es: "Datos para evaluar el programa", en: "Data to evaluate the program" },
  exportHint: { es: "Una fila por paciente, sin nombres ni textos: metas, luces de la semana, pedidos, A1C y Hunger Vital Sign.", en: "One row per patient, with no names or free text: goals, weekly lights, orders, A1C and Hunger Vital Sign." },
  exportBtn: { es: "Descargar CSV sin nombres", en: "Download CSV without names" },
};

const STEP = 5, MIN = 15, MAX = 75;

type FormValues = { type: RxType; carbTarget: number; weeks: string; needsDelivery: boolean; avoid: string; note: string };

function SummaryCard({ summary }: { summary: IntakeSummary }) {
  const { t } = useT();
  return (
    <>
      <p className="text-[1.25rem] font-bold">{summary.headline}</p>
      <ul className="list-disc pl-6">{summary.keyPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
      <div>
        <h3>{t(copy.pattern)}</h3>
        <p>{summary.foodPattern}</p>
      </div>
      {summary.barriers.length > 0 && (
        <div>
          <h3>{t(copy.barriers)}</h3>
          <ul className="list-disc pl-6">{summary.barriers.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </div>
      )}
      {summary.flags.length > 0 && (
        <Notice tone="warn">
          <p className="font-bold">{t(copy.flags)}</p>
          <ul className="list-disc pl-6">{summary.flags.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </Notice>
      )}
    </>
  );
}

function RxForm({ summary, initial, onSubmit }: { summary: IntakeSummary | null; initial: FormValues | null; onSubmit: (v: FormValues) => void }) {
  const { t } = useT();
  const ids = useId();
  // Initial values come from the summary once, when this form mounts. Later edits are never overwritten.
  const [v, setV] = useState<FormValues>(() => initial ?? ({
    type: summary?.suggestedType ?? "produce",
    carbTarget: DEFAULT_TARGET,
    weeks: "4",
    needsDelivery: summary?.suggestedDelivery ?? false,
    avoid: summary?.avoid.join(", ") ?? "",
    note: "",
  }));
  const set = (p: Partial<FormValues>) => setV((o) => ({ ...o, ...p }));
  const fieldCls = "w-full rounded-2xl border-[3px] border-rule bg-panel px-4 py-3 text-[1.25rem] leading-snug";
  const stepBtn = "flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-brand bg-panel text-[2rem] font-bold text-brand hover:bg-brand-soft disabled:opacity-40";

  return (
    <div className="flex flex-col gap-6">
      <ChoiceGroup<RxType> legend={t(copy.typeLegend)} name="rx-type" value={v.type} onChange={(x) => set({ type: x })}
        options={[
          { value: "produce", label: t(copy.produce), hint: t(copy.produceHint), icon: "leaf" },
          { value: "meals", label: t(copy.meals), hint: t(copy.mealsHint), icon: "plate" },
        ]} />

      <div role="group" aria-labelledby={`${ids}-carb`} aria-describedby={`${ids}-carbh`} className="flex flex-col gap-3">
        <p id={`${ids}-carb`} className="text-[1.25rem] font-bold">{t(copy.carbLabel)}</p>
        <p id={`${ids}-carbh`} className="-mt-2 text-muted">{t(copy.carbHint)}</p>
        <div className="flex items-center justify-between gap-4">
          <button type="button" aria-label={t(copy.less)} disabled={v.carbTarget <= MIN} onClick={() => set({ carbTarget: Math.max(MIN, v.carbTarget - STEP) })} className={stepBtn}>
            <span aria-hidden="true">−</span>
          </button>
          <p aria-live="polite" className="text-center text-[2.5rem] font-bold leading-none">
            {v.carbTarget} <span className="text-[1.25rem] text-muted">{t(copy.grams)}</span>
          </p>
          <button type="button" aria-label={t(copy.more)} disabled={v.carbTarget >= MAX} onClick={() => set({ carbTarget: Math.min(MAX, v.carbTarget + STEP) })} className={stepBtn}>
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>

      <ChoiceGroup legend={t(copy.weeksLegend)} name="rx-weeks" value={v.weeks} onChange={(x) => set({ weeks: x })}
        options={[
          { value: "4", label: t(copy.w4) },
          { value: "8", label: t(copy.w8) },
          { value: "12", label: t(copy.w12) },
        ]} />

      <label className={`flex min-h-[64px] cursor-pointer items-center gap-4 rounded-2xl border-[3px] px-5 py-3 ${v.needsDelivery ? "border-brand bg-brand-soft" : "border-rule bg-panel"}`}>
        <input type="checkbox" checked={v.needsDelivery} onChange={(e) => set({ needsDelivery: e.target.checked })} className="h-8 w-8 shrink-0 accent-brand" />
        <span className="text-[1.25rem] font-bold">{t(copy.delivery)}</span>
      </label>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${ids}-avoid`} className="text-[1.25rem] font-bold">{t(copy.avoid)}</label>
        <input id={`${ids}-avoid`} type="text" value={v.avoid} onChange={(e) => set({ avoid: e.target.value })} className={`${fieldCls} min-h-[56px]`} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${ids}-note`} className="text-[1.25rem] font-bold">{t(copy.note)}</label>
        <textarea id={`${ids}-note`} rows={3} value={v.note} onChange={(e) => set({ note: e.target.value })} className={fieldCls} />
      </div>

      <BigButton icon="check" onClick={() => onSubmit(v)}>{t(copy.send)}</BigButton>
    </div>
  );
}

export default function ClinicoPage() {
  const { t, lang } = useT();
  const s = useAppState();
  const hydrated = useHydrated();
  const [view, setView] = useState<"form" | "sending" | "done">("form");
  const [failed, setFailed] = useState<FormValues | null>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (view === "done") doneRef.current?.focus();
  }, [view]);

  if (!hydrated) return <Page><Busy /></Page>;

  if (!s.clinicianAck) {
    const li = (x: { es: string; en: string }, icon: string) => <li className="flex items-start gap-3"><Icon name={icon} className="mt-0.5 text-brand" /><span>{t(x)}</span></li>;
    return (
      <Page>
        <h1>{t(copy.discTitle)}</h1>
        <Card className="flex flex-col gap-3">
          <h2>{t(copy.discDoes)}</h2>
          <ul className="flex flex-col gap-3">{li(copy.discDoes1, "check")}{li(copy.discDoes2, "check")}{li(copy.discDoes3, "check")}</ul>
        </Card>
        <Card className="flex flex-col gap-3">
          <h2>{t(copy.discNever)}</h2>
          <ul className="flex flex-col gap-3">{li(copy.discNever1, "hand")}{li(copy.discNever2, "hand")}{li(copy.discNever3, "hand")}</ul>
        </Card>
        <Notice><p>{t(copy.discYou)}</p></Notice>
        <BigButton icon="check" onClick={() => setState({ clinicianAck: true })}>{t(copy.discOk)}</BigButton>
        <BigButton variant="quiet" href="/acerca" icon="info">{t(copy.discMore)}</BigButton>
      </Page>
    );
  }

  const patient = patients.find((p) => p.id === s.patientId) ?? patients[0];
  const summary = s.intakeSummary;

  const send = async (v: FormValues) => {
    setFailed(null);
    const rx: Rx = {
      patientId: s.patientId,
      type: v.type,
      carbTarget: v.carbTarget,
      weeks: Number(v.weeks),
      avoid: v.avoid.split(",").map((x) => x.trim()).filter(Boolean),
      needsDelivery: v.needsDelivery,
      note: v.note.trim(),
      createdAt: new Date().toISOString(),
    };
    setState({ rx, plan: null, order: null, visitSummary: null });
    void ensurePlan(rx, lang); // start the weekly plan now so it is ready when the patient opens it
    setView("sending");
    try {
      const res = await fetch("/api/visit-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rx, patientName: patient.name, lang }),
      });
      if (!res.ok) throw new Error("bad response");
      const visitSummary = (await res.json()) as VisitSummary;
      setState({ visitSummary });
      setView("done");
    } catch {
      setFailed(v);
      setView("form");
    }
  };

  if (view === "sending") return <Page><Busy label={t(copy.sending)} /></Page>;

  if (view === "done") {
    return (
      <Page>
        <h1 ref={doneRef} tabIndex={-1} className="outline-none">{t(copy.sentTitle)}</h1>
        <Card className="flex flex-col gap-3">
          <h2>{t(copy.patientSees)}</h2>
          <ul className="list-disc pl-6">
            {(s.visitSummary?.points ?? []).map((p, i) => <li key={i}>{t(p)}</li>)}
          </ul>
        </Card>
        <BigButton href="/paciente" icon="person">{t(copy.viewAs)}</BigButton>
        <BigButton variant="secondary" icon="refresh" onClick={() => setView("form")}>{t(copy.another)}</BigButton>
      </Page>
    );
  }

  return (
    <Page>
      <h1>{t(copy.title)}</h1>

      <ChoiceGroup legend={t(copy.patient)} name="patient" value={s.patientId} onChange={(id) => setState({ patientId: id })}
        options={patients.map((p) => ({ value: p.id, label: p.name, hint: `${p.age} ${t(copy.years)} · ${p.town} · ${t(p.note)}`, icon: "person" }))} />

      {(s.rx || s.log.length > 0) && (
        <Card className="flex flex-col gap-4">
          <h2>{t(copy.progress)}</h2>
          <PatientProgress patientId={s.patientId} p={s} role="clinician" />
        </Card>
      )}

      <Card className="flex flex-col gap-4">
        <h2>{t(copy.sumTitle)}</h2>
        <div className="flex flex-wrap gap-2">
          {summary && <Tag>{t(summary.source === "fallback" ? copy.basic : copy.ai)}</Tag>}
          {summary?.lang && summary.lang !== lang && <Tag>{t({ es: "Escrito en inglés", en: "Written in Spanish" })}</Tag>}
          {summary && s.intake.helper && s.intake.helper !== "self" && <Tag>{t(copy.helpedBy)} {t(helperWord[s.intake.helper])}</Tag>}
        </div>
        {summary ? (
          <SummaryCard summary={summary} />
        ) : (
          <>
            <Notice><p className="font-bold">{t(copy.noSummary)}</p></Notice>
            <BigButton variant="secondary" icon="clipboard" onClick={() => { setState({ intake: { ...s.intake, helper: "clinic" } }); router.push("/intake"); }}>{t(copy.answerFor)}</BigButton>
          </>
        )}
      </Card>

      <h2>{t(copy.rxTitle)}</h2>
      {failed && <Notice tone="warn"><p className="font-bold">{t(copy.errTitle)}</p></Notice>}
      <RxForm key={`${s.patientId}-${summary ? "with-summary" : "no-summary"}`} summary={summary} initial={failed} onSubmit={send} />

      <Card className="flex flex-col gap-3">
        <h2>{t(copy.exportTitle)}</h2>
        <p>{t(copy.exportHint)}</p>
        <BigButton variant="secondary" icon="chart" onClick={() => download(`receta-fresca-${new Date().toISOString().slice(0, 10)}.csv`, outcomesCsv(patients, allPatients(s)))}>{t(copy.exportBtn)}</BigButton>
        <div><Tag>{t({ es: "Datos de ejemplo", en: "Sample data" })}</Tag></div>
      </Card>
    </Page>
  );
}
