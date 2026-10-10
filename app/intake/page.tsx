"use client";
import { useEffect, useRef, useState } from "react";
import { BigButton, Busy, ChoiceGroup, Notice, Page, Progress, ReadAloud, StepHeading, VoiceInput } from "@/components/ui";
import { common, useT } from "@/lib/i18n";
import { setState, useAppState, useHydrated } from "@/lib/store";
import type { IntakeAnswers, IntakeSummary, Patient } from "@/lib/types";
import patientsData from "@/data/patients.json";

const patients = patientsData as Patient[];

const copy = {
  hint: { es: "Puede saltar una pregunta.", en: "You may skip a question." },
  yourAnswer: { es: "Su respuesta", en: "Your answer" },
  send: { es: "Enviar a mi clínico", en: "Send to my clinician" },
  sending: { es: "Enviando sus respuestas…", en: "Sending your answers…" },
  errTitle: { es: "No se pudo enviar. Sus respuestas están guardadas.", en: "We could not send. Your answers are saved." },
  retry: { es: "Intentar otra vez", en: "Try again" },
  doneTitle: { es: "Gracias. Su clínico ya tiene sus respuestas.", en: "Thank you. Your clinician has your answers." },
  doneLine: { es: "Así su cita será más corta y mejor.", en: "This will make your visit shorter and better." },
  backHome: { es: "Volver a mi página", en: "Back to my page" },
  again: { es: "Contestar de nuevo", en: "Answer again" },
  q1: { es: "¿Cómo se siente hoy?", en: "How are you feeling today?" },
  good: { es: "Bien", en: "Good" },
  ok: { es: "Regular", en: "So-so" },
  bad: { es: "Mal", en: "Bad" },
  q2: { es: "¿Qué le preocupa más de su salud o su comida?", en: "What worries you most about your health or your food?" },
  q3: { es: "¿Qué come en un día normal?", en: "What do you eat on a normal day?" },
  q3h: { es: "Por ejemplo: café con pan, arroz con habichuelas, sopa.", en: "For example: coffee with bread, rice and beans, soup." },
  q4: { es: "¿Puede cocinar en su casa?", en: "Can you cook at home?" },
  yes: common.yes,
  sometimes: { es: "A veces", en: "Sometimes" },
  no: common.no,
  q5: { es: "¿Puede llegar a la tienda o al mercado?", en: "Can you get to the store or the market?" },
  q5yes: { es: "Sí, puedo llegar", en: "Yes, I can get there" },
  q5no: { es: "No, necesito que me lo traigan", en: "No, I need it delivered" },
  q6: { es: "¿Hay comidas que no puede o no quiere comer?", en: "Are there foods you cannot or do not want to eat?" },
  q6h: { es: "Por ejemplo: mariscos, cerdo, leche.", en: "For example: shellfish, pork, milk." },
  helping: { es: "Usted está contestando por", en: "You are answering for" },
  helpingHint: { es: "Lea cada pregunta en voz alta y escriba las palabras de la persona, no las suyas.", en: "Read each question aloud and write down the person's words, not your own." },
  familyHelp: { es: "Un familiar me está ayudando", en: "A family member is helping me" },
  selfAnswer: { es: "Lo contesta el paciente", en: "The patient is answering" },
};

const TOTAL = 6;

/** Heading that moves focus to itself when it appears after a user action. */
function DoneHeading({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return <h1 ref={ref} tabIndex={-1} className="outline-none">{children}</h1>;
}

export default function IntakePage() {
  const { t, lang } = useT();
  const s = useAppState();
  const hydrated = useHydrated();
  // The current question survives a reload, so nobody is sent back to the start by accident.
  const [step, setStepRaw] = useState(() => {
    if (typeof window === "undefined") return 1;
    try {
      const n = Number(window.sessionStorage.getItem("rf-intake-step"));
      return Number.isInteger(n) && n >= 1 && n <= TOTAL ? n : 1;
    } catch {
      return 1;
    }
  });
  const setStep = (n: number) => {
    setStepRaw(n);
    try { window.sessionStorage.setItem("rf-intake-step", String(n)); } catch { /* ignore */ }
  };
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!hydrated) return <Page><Busy /></Page>;
  const patient = patients.find((p) => p.id === s.patientId) ?? patients[0];

  const set = (patch: Partial<IntakeAnswers>) => setState({ intake: { ...s.intake, ...patch } });

  const submit = async () => {
    setFailed(false);
    setSending(true);
    try {
      const res = await fetch("/api/intake-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: s.intake, patient, lang }),
      });
      if (!res.ok) throw new Error("bad response");
      const summary = (await res.json()) as IntakeSummary;
      setState({ intakeDone: true, intakeSummary: summary });
      setStep(1);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  if (sending) return <Page><Busy label={t(copy.sending)} /></Page>;

  if (s.intakeDone) {
    return (
      <Page>
        <DoneHeading>{t(copy.doneTitle)}</DoneHeading>
        <p className="text-[1.25rem]">{t(copy.doneLine)}</p>
        <BigButton href="/paciente" icon="home">{t(copy.backHome)}</BigButton>
        <BigButton variant="secondary" icon="refresh" onClick={() => { setState({ intakeDone: false, intakeSummary: null }); setStep(1); }}>
          {t(copy.again)}
        </BigButton>
      </Page>
    );
  }

  const questions = [copy.q1, copy.q2, copy.q3, copy.q4, copy.q5, copy.q6];
  const question = t(questions[step - 1]);

  let body: React.ReactNode = null;
  switch (step) {
    case 1:
      body = (
        <>
          <ChoiceGroup legend={question} hideLegend name="feeling" value={s.intake.feeling} onChange={(v) => set({ feeling: v })}
            options={[
              { value: "good", label: t(copy.good) },
              { value: "ok", label: t(copy.ok) },
              { value: "bad", label: t(copy.bad) },
            ]} />
          {s.intake.feeling === "bad" && <Notice tone="warn"><p className="font-bold">{t(common.callClinician)}</p></Notice>}
        </>
      );
      break;
    case 2:
      body = <VoiceInput label={t(copy.yourAnswer)} value={s.intake.concern ?? ""} onChange={(v) => set({ concern: v })} />;
      break;
    case 3:
      body = <VoiceInput label={t(copy.yourAnswer)} hint={t(copy.q3h)} value={s.intake.typicalDay ?? ""} onChange={(v) => set({ typicalDay: v })} />;
      break;
    case 4:
      body = (
        <ChoiceGroup legend={question} hideLegend name="canCook" value={s.intake.canCook} onChange={(v) => set({ canCook: v })}
          options={[
            { value: "yes", label: t(copy.yes) },
            { value: "sometimes", label: t(copy.sometimes) },
            { value: "no", label: t(copy.no) },
          ]} />
      );
      break;
    case 5:
      body = (
        <ChoiceGroup legend={question} hideLegend name="canTravel" value={s.intake.canTravel} onChange={(v) => set({ canTravel: v })}
          options={[
            { value: "yes", label: t(copy.q5yes) },
            { value: "no", label: t(copy.q5no) },
          ]} />
      );
      break;
    default:
      body = <VoiceInput label={t(copy.yourAnswer)} hint={t(copy.q6h)} value={s.intake.avoid ?? ""} onChange={(v) => set({ avoid: v })} />;
  }

  const helper = s.intake.helper && s.intake.helper !== "self" ? s.intake.helper : null;

  return (
    <Page>
      {helper && (
        <Notice>
          <p className="text-[1.25rem] font-bold">{t(copy.helping)} {patient.name}</p>
          <p>{t(copy.helpingHint)}</p>
        </Notice>
      )}
      <Progress step={step} total={TOTAL} />
      <StepHeading focusKey={step}>{question}</StepHeading>
      <ReadAloud text={question} />
      <p className="text-muted">{t(copy.hint)}</p>
      {body}
      {failed && (
        <Notice tone="warn">
          <p className="font-bold">{t(copy.errTitle)}</p>
        </Notice>
      )}
      <div className="flex flex-col gap-3">
        {step < TOTAL ? (
          <BigButton iconEnd="right" onClick={() => setStep(step + 1)}>{t(common.next)}</BigButton>
        ) : (
          <BigButton icon={failed ? "refresh" : "check"} onClick={submit}>{failed ? t(copy.retry) : t(copy.send)}</BigButton>
        )}
        {step > 1 && <BigButton variant="secondary" icon="left" onClick={() => setStep(step - 1)}>{t(common.back)}</BigButton>}
        {step === 1 && (
          helper
            ? <BigButton variant="quiet" icon="person" onClick={() => set({ helper: "self" })}>{t(copy.selfAnswer)}</BigButton>
            : <BigButton variant="quiet" icon="people" onClick={() => set({ helper: "family" })}>{t(copy.familyHelp)}</BigButton>
        )}
      </div>
    </Page>
  );
}
