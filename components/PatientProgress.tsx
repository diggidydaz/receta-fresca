"use client";
// "How it is going": what a patient has done since the prescription, for the clinician and the promotora.
// Everything here is counted in code from the patient's own record; nothing is written by a model.
import { useId, useState } from "react";
import { Icon } from "./Icon";
import { BigButton, ChoiceGroup, Notice, TrafficLight } from "./ui";
import { WeekCard } from "./WeekCard";
import placesData from "@/data/places.json";
import { alertsFor, hvsPositive } from "@/lib/care";
import { useT } from "@/lib/i18n";
import { setPatientState, type PatientState } from "@/lib/store";
import type { Helper, HvsAnswer, L10n, LogEntry, OrderStatus, Place } from "@/lib/types";

type MealEntry = Exclude<LogEntry, { kind: "skipped" }>;

const places = placesData as Place[];

const copy = {
  alerts: { es: "Para dar seguimiento", en: "To follow up" },
  allGood: { es: "Nada urgente por ahora.", en: "Nothing urgent for now." },
  recent: { es: "Últimas comidas anotadas", en: "Latest meals noted" },
  noMeals: { es: "Todavía no ha anotado comidas.", en: "No meals noted yet." },
  order: { es: "Pedido", en: "Order" },
  noOrder: { es: "Todavía no ha escogido dónde recoger.", en: "Has not chosen where to pick up yet." },
  teach: { es: "Pregunta del plan", en: "Plan question" },
  teachOk: { es: "La contestó bien", en: "Answered correctly" },
  teachNo: { es: "No la contestó bien; se le explicó otra vez", en: "Did not answer correctly; it was explained again" },
  teachNone: { es: "Todavía no la ha contestado", en: "Not answered yet" },
  helped: { es: "Las preguntas de antes de la cita se contestaron con ayuda de", en: "The pre-visit questions were answered with help from" },
  notes: { es: "Notas de la promotora", en: "Community health worker notes" },
  outcomes: { es: "Resultados de la visita", en: "Visit results" },
  a1c: { es: "A1C (%)", en: "A1C (%)" },
  a1cHint: { es: "Valor del laboratorio. Entre 4 y 15.", en: "Lab value. Between 4 and 15." },
  a1cBad: { es: "Escriba un número entre 4 y 15.", en: "Type a number between 4 and 15." },
  save: { es: "Guardar", en: "Save" },
  saved: { es: "Guardado.", en: "Saved." },
  hvs: { es: "Hunger Vital Sign (2 preguntas)", en: "Hunger Vital Sign (2 questions)" },
  hvs1: { es: "En los últimos 12 meses, nos preocupaba que la comida se acabara antes de tener dinero para comprar más.", en: "Within the past 12 months, we worried whether our food would run out before we got money to buy more." },
  hvs2: { es: "En los últimos 12 meses, la comida que compramos no duró y no teníamos dinero para comprar más.", en: "Within the past 12 months, the food we bought just didn't last and we didn't have money to get more." },
  often: { es: "Con frecuencia es cierto", en: "Often true" },
  sometimes: { es: "A veces es cierto", en: "Sometimes true" },
  never: { es: "Nunca es cierto", en: "Never true" },
  hvsPick: { es: "Conteste las dos preguntas.", en: "Answer both questions." },
  positive: { es: "Positivo: riesgo de inseguridad alimentaria", en: "Positive: food insecurity risk" },
  negative: { es: "Negativo", en: "Negative" },
  sample: { es: "Datos de ejemplo, guardados solo en este navegador.", en: "Sample data, kept only in this browser." },
};

const statusWord: Record<OrderStatus, L10n> = {
  received: { es: "Recibido", en: "Received" },
  preparing: { es: "Preparando", en: "Preparing" },
  ready: { es: "Listo", en: "Ready" },
  delivered: { es: "Entregado", en: "Delivered" },
};
export const helperWord: Record<Helper, L10n> = {
  self: { es: "el paciente", en: "the patient" },
  promotora: { es: "una promotora de salud", en: "a community health worker" },
  family: { es: "un familiar", en: "a family member" },
  clinic: { es: "personal de la clínica", en: "clinic staff" },
};

function when(iso: string, lang: string) {
  return new Date(iso).toLocaleString(lang === "es" ? "es-PR" : "en-US", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function Outcomes({ patientId, p }: { patientId: string; p: PatientState }) {
  const { t, lang } = useT();
  const ids = useId();
  const [a1c, setA1c] = useState("");
  const [a1cErr, setA1cErr] = useState(false);
  const [q1, setQ1] = useState<HvsAnswer | undefined>();
  const [q2, setQ2] = useState<HvsAnswer | undefined>();
  const [hvsErr, setHvsErr] = useState(false);
  const [msg, setMsg] = useState("");
  const hvsOpts = (["often", "sometimes", "never"] as const).map((v) => ({ value: v, label: t(copy[v]) }));

  const saveA1c = () => {
    const v = Number(a1c.replace(",", "."));
    if (!a1c.trim() || !Number.isFinite(v) || v < 4 || v > 15) { setA1cErr(true); return; }
    setA1cErr(false);
    setPatientState(patientId, { outcomes: { ...p.outcomes, a1c: [{ value: Math.round(v * 10) / 10, at: new Date().toISOString() }, ...p.outcomes.a1c] } });
    setA1c(""); setMsg(t(copy.saved));
  };
  const saveHvs = () => {
    if (!q1 || !q2) { setHvsErr(true); return; }
    setHvsErr(false);
    setPatientState(patientId, { outcomes: { ...p.outcomes, hvs: [{ q1, q2, at: new Date().toISOString() }, ...p.outcomes.hvs] } });
    setQ1(undefined); setQ2(undefined); setMsg(t(copy.saved));
  };
  const lastHvs = p.outcomes.hvs[0];

  return (
    <section className="flex flex-col gap-4">
      <h3 className="flex items-center gap-2"><Icon name="clipboard" /> {t(copy.outcomes)}</h3>
      <div className="flex flex-col gap-2">
        <label htmlFor={`${ids}-a1c`} className="text-[1.25rem] font-bold">{t(copy.a1c)}</label>
        <p id={`${ids}-a1ch`} className="-mt-1 text-muted">{t(copy.a1cHint)}</p>
        <input id={`${ids}-a1c`} inputMode="decimal" value={a1c} onChange={(e) => { setA1c(e.target.value); setA1cErr(false); }} aria-describedby={`${ids}-a1ch`} aria-invalid={a1cErr}
          className="min-h-[56px] w-full rounded-2xl border-[3px] border-rule bg-panel px-4 py-3 text-[1.25rem]" />
        {a1cErr && <p role="alert" className="font-bold text-stop">{t(copy.a1cBad)}</p>}
        <BigButton variant="secondary" icon="check" onClick={saveA1c}>{t(copy.save)} A1C</BigButton>
        {p.outcomes.a1c.length > 0 && (
          <ul className="list-disc pl-6">
            {p.outcomes.a1c.slice(0, 4).map((x, i) => <li key={i}>{x.value}% · {when(x.at, lang)}</li>)}
          </ul>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-[1.25rem] font-bold">{t(copy.hvs)}</p>
        <ChoiceGroup<HvsAnswer> legend={t(copy.hvs1)} name={`${ids}-hvs1`} value={q1} onChange={(v) => { setQ1(v); setHvsErr(false); }} options={hvsOpts} />
        <ChoiceGroup<HvsAnswer> legend={t(copy.hvs2)} name={`${ids}-hvs2`} value={q2} onChange={(v) => { setQ2(v); setHvsErr(false); }} options={hvsOpts} />
        {hvsErr && <p role="alert" className="font-bold text-stop">{t(copy.hvsPick)}</p>}
        <BigButton variant="secondary" icon="check" onClick={saveHvs}>{t(copy.save)}</BigButton>
        {lastHvs && <p className="font-bold">{t(hvsPositive(lastHvs.q1, lastHvs.q2) ? copy.positive : copy.negative)} · {when(lastHvs.at, lang)}</p>}
      </div>
      <p role="status" className="font-bold text-brand">{msg}</p>
    </section>
  );
}

export function PatientProgress({ patientId, p, role }: { patientId: string; p: PatientState; role: "clinician" | "promotora" }) {
  const { t, lang } = useT();
  const alerts = alertsFor(p);
  const meals = p.log.filter((e): e is MealEntry => e.kind !== "skipped").slice(0, 5);
  const place = p.order ? places.find((x) => x.id === p.order?.placeId) : undefined;
  const helper = p.intake.helper && p.intake.helper !== "self" ? p.intake.helper : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h3>{t(copy.alerts)}</h3>
        {alerts.length === 0 ? (
          <p>{t(copy.allGood)}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {alerts.map((a) => (
              <li key={a.key} className={`flex items-start gap-2 rounded-xl border-2 p-3 font-bold ${a.urgent ? "border-stop text-stop" : "border-rule"}`}>
                <Icon name="warn" className="mt-0.5" /> {t(a.text)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <WeekCard log={p.log} audience="staff" />

      <div className="flex flex-col gap-2">
        <h3>{t(copy.recent)}</h3>
        {meals.length === 0 ? <p>{t(copy.noMeals)}</p> : (
          <ul className="flex flex-col gap-2">
            {meals.map((e) => (
              <li key={e.id} className="flex flex-col items-start gap-1 border-t-2 border-rule/30 pt-2">
                <span className="text-muted">{when(e.at, lang)}</span>
                <span className="max-w-full [overflow-wrap:anywhere]">{e.text}</span>
                <span className="flex flex-wrap items-center gap-2"><TrafficLight compact light={e.estimate.light} /> {e.estimate.carbsMin}-{e.estimate.carbsMax} g</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-3">
        <p><strong>{t(copy.order)}:</strong> {p.order ? `${p.order.id} · ${place?.name ?? ""} · ${t(statusWord[p.order.status])}` : t(copy.noOrder)}</p>
        <p><strong>{t(copy.teach)}:</strong> {t(!p.teachBack ? copy.teachNone : p.teachBack.correct ? copy.teachOk : copy.teachNo)}</p>
        {helper && <p>{t(copy.helped)} {t(helperWord[helper])}.</p>}
      </div>

      {role === "clinician" && p.chwNotes.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2"><Icon name="note" /> {t(copy.notes)}</h3>
          <ul className="flex flex-col gap-2">
            {p.chwNotes.slice(0, 5).map((n, i) => <li key={i} className="border-t-2 border-rule/30 pt-2"><span className="block text-muted">{when(n.at, lang)}</span>{n.text}</li>)}
          </ul>
        </div>
      )}

      {role === "clinician" && <Outcomes patientId={patientId} p={p} />}
      <Notice><p>{t(copy.sample)}</p></Notice>
    </div>
  );
}
