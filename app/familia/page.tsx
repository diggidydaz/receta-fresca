"use client";
// Read-only weekly plan for family or a caregiver. Everything comes from the link itself (the part after "#"),
// so nothing about the patient is stored on this device or sent to a server.
import { useSyncExternalStore } from "react";
import { BigButton, Busy, Card, Notice, Page, Tag } from "@/components/ui";
import { WeekPlan } from "@/components/WeekPlan";
import { common, useT } from "@/lib/i18n";
import { linkExpired, readFamilyLink } from "@/lib/share";
import { useHydrated } from "@/lib/store";

const copy = {
  title: { es: "Plan de la semana", en: "Plan for the week" },
  of: { es: "de", en: "for" },
  readOnly: { es: "Solo para ver. Lo compartió la persona desde Receta Fresca.", en: "View only. Shared by the person from Receta Fresca." },
  bad: { es: "Este enlace no se puede abrir. Pida a la persona que lo comparta otra vez.", en: "This link cannot be opened. Ask the person to share it again." },
  expired: { es: "Esta receta ya terminó, así que el plan ya no se muestra.", en: "This prescription has ended, so the plan is no longer shown." },
  goal: { es: "Meta por comida, puesta por su clínico", en: "Goal per meal, set by their clinician" },
  said: { es: "Lo que dijo el clínico", en: "What the clinician said" },
  shopping: { es: "Lista de compra", en: "Shopping list" },
  meals: { es: "Comidas de la semana", en: "Meals for the week" },
  help: { es: "Cómo puede ayudar: cocinar juntos, acompañar a recoger la comida, o recordar anotar lo que comió.", en: "How you can help: cook together, go along to pick up the food, or remind them to note what they ate." },
  until: { es: "Válido hasta", en: "Valid until" },
};

const subscribe = (cb: () => void) => { window.addEventListener("hashchange", cb); return () => window.removeEventListener("hashchange", cb); };

export default function FamiliaPage() {
  const { t, lang } = useT();
  const hydrated = useHydrated();
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => "");
  if (!hydrated) return <Page><Busy /></Page>;

  const view = readFamilyLink(hash);
  if (!view) return <Page><h1>{t(copy.title)}</h1><Notice tone="warn"><p className="text-[1.25rem] font-bold">{t(copy.bad)}</p></Notice><BigButton href="/" variant="quiet" icon="home">{t(common.home)}</BigButton></Page>;
  const until = new Date(view.until);
  if (linkExpired(view)) {
    return <Page><h1>{t(copy.title)}</h1><Notice><p className="text-[1.25rem] font-bold">{t(copy.expired)}</p></Notice></Page>;
  }

  return (
    <Page>
      <h1>{t(copy.title)}{view.name ? ` ${t(copy.of)} ${view.name}` : ""}</h1>
      <div className="flex flex-wrap gap-2"><Tag>{t(copy.readOnly)}</Tag></div>
      <p className="text-[1.25rem] font-bold">{t(copy.goal)}: {view.goal} g</p>
      <p className="text-muted">{t(copy.until)}: {until.toLocaleDateString(lang === "es" ? "es-PR" : "en-US", { day: "numeric", month: "long", year: "numeric" })}</p>
      {view.lang !== lang && <Notice><p>{t({ es: "Este plan está escrito en inglés.", en: "This plan is written in Spanish." })}</p></Notice>}
      {view.points.length > 0 && (
        <Card className="flex flex-col gap-2">
          <h2>{t(copy.said)}</h2>
          <ul className="list-disc space-y-1 pl-6">{view.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </Card>
      )}
      <WeekPlan days={view.days} goal={view.goal} />
      <Card className="flex flex-col gap-2">
        <h2>{t(view.meals ? copy.meals : copy.shopping)}</h2>
        <ul className="list-disc space-y-1 pl-6">{view.shopping.map((it, i) => <li key={i}>{it.item} — {it.qty}</li>)}</ul>
      </Card>
      <Notice><p>{t(copy.help)}</p></Notice>
      <p className="text-[0.9rem] text-muted">{t(common.notAdvice)}</p>
    </Page>
  );
}
