"use client";
import Link from "next/link";
import patients from "@/data/patients.json";
import { Icon } from "@/components/Icon";
import { useState } from "react";
import { BigButton, Busy, ChoiceGroup, Notice, Page, Tag } from "@/components/ui";
import { common, useT } from "@/lib/i18n";
import { setState, useAppState, useHydrated } from "@/lib/store";
import type { L10n } from "@/lib/types";

const copy = {
  hello: { es: "Hola,", en: "Hello," },
  what: { es: "¿Qué quiere hacer?", en: "What would you like to do?" },
  done: { es: "Hecho", en: "Done" },
  waiting: { es: "Falta la receta de su clínico", en: "Waiting for your clinician's prescription" },
  notMe: { es: "No soy esta persona", en: "I am not this person" },
  who: { es: "¿Quién es usted?", en: "Who are you?" },
  demoNote: { es: "En esta demostración hay tres pacientes de ejemplo.", en: "This demo has three sample patients." },
  ready: { es: "Su receta está lista", en: "Your prescription is ready" },
};

export default function PatientHome() {
  const { t } = useT();
  const s = useAppState();
  const hydrated = useHydrated();
  const [picking, setPicking] = useState(false);
  if (!hydrated) return <Page><Busy /></Page>;
  const patient = patients.find((p) => p.id === s.patientId) ?? patients[0];
  const hasRx = Boolean(s.rx);

  const items: { href: string; icon: string; title: L10n; hint: L10n; status?: L10n }[] = [
    { href: "/intake", icon: "calendar", title: { es: "Antes de mi cita", en: "Before my visit" }, hint: { es: "Conteste 6 preguntas. Puede hablar.", en: "Answer 6 questions. You can speak." }, status: s.intakeDone ? copy.done : undefined },
    { href: "/plan", icon: "leaf", title: { es: "Mi plan de la semana", en: "My plan for the week" }, hint: hasRx ? copy.ready : copy.waiting },
    { href: "/comida", icon: "plate", title: { es: "¿Qué comí?", en: "What did I eat?" }, hint: { es: "Diga su comida y vea su luz", en: "Say your meal and see your light" } },
    { href: "/canjear", icon: "bag", title: { es: "Recoger mi comida", en: "Get my food" }, hint: hasRx ? { es: "Escoja colmado, finca o cocina", en: "Choose a store, farm or kitchen" } : copy.waiting },
  ];

  return (
    <Page>
      <div>
        <p className="text-[1.25rem] font-bold text-muted">{t(copy.hello)}</p>
        <h1>{patient.name}</h1>
        <p className="mt-2 text-[1.25rem]">{t(copy.what)}</p>
      </div>
      {picking ? (
        <div className="flex flex-col gap-3">
          <ChoiceGroup
            legend={t(copy.who)}
            name="who"
            value={s.patientId}
            onChange={(id) => { setState({ patientId: id }); setPicking(false); }}
            options={patients.map((p) => ({ value: p.id, label: p.name, hint: `${p.town}`, icon: "person" }))}
          />
          <div className="flex flex-col items-start gap-1"><Tag>{t(common.simulated)}</Tag><p className="text-muted">{t(copy.demoNote)}</p></div>
        </div>
      ) : (
        <BigButton variant="quiet" icon="person" onClick={() => setPicking(true)}>{t(copy.notMe)}</BigButton>
      )}
      <nav aria-label={t(copy.what)} className="flex flex-col gap-4">
        {items.map((r) => (
          <Link key={r.href} href={r.href} className="flex min-h-[96px] items-center gap-4 rounded-2xl border-[3px] border-brand bg-panel p-5 hover:bg-brand-soft">
            <Icon name={r.icon} size={44} className="text-brand" />
            <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
              <span className="block text-[1.563rem] font-bold leading-tight text-brand">{t(r.title)}</span>
              <span className="block text-muted">{t(r.hint)}</span>
              {r.status && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full border-2 border-go bg-go px-3 py-0.5 text-[0.85rem] font-bold text-white">
                  <Icon name="check" size={16} /> {t(r.status)}
                </span>
              )}
            </span>
            <Icon name="right" className="text-brand" />
          </Link>
        ))}
      </nav>
      <Notice>{t(common.callClinician)}</Notice>
      <BigButton variant="quiet" href="/" icon="home">{t(common.home)}</BigButton>
    </Page>
  );
}
