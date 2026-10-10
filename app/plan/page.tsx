"use client";
import { useEffect, useState } from "react";
import { BigButton, Busy, Card, Notice, Page, ReadAloud, Tag, TrafficLight } from "@/components/ui";
import { common, useT } from "@/lib/i18n";
import { ensurePlan, translatePlan } from "@/lib/planLoader";
import { setState, useAppState, useHydrated } from "@/lib/store";

const copy = {
  title: { es: "Mi plan de la semana", en: "My plan for the week" },
  noRx: { es: "Su clínico todavía no le ha enviado una receta.", en: "Your clinician has not sent you a prescription yet." },
  back: { es: "Volver a mi página", en: "Back to my page" },
  said: { es: "Lo que dijo su clínico", en: "What your clinician said" },
  preparing: { es: "Preparando su plan con lo que hay en las tiendas…", en: "Preparing your plan with what the stores have…" },
  wait: { es: "Tarda unos 20 segundos. No cierre esta página.", en: "This takes about 20 seconds. Please keep this page open." },
  otherLang: { es: "Este plan está escrito en inglés.", en: "This plan is written in Spanish." },
  redo: { es: "Hacer el plan en español", en: "Make the plan in English" },
  translating: { es: "Poniendo su plan en español…", en: "Putting your plan into English…" },
  failed: { es: "No pudimos preparar su plan. Intente otra vez.", en: "We could not prepare your plan. Please try again." },
  retry: { es: "Intentar otra vez", en: "Try again" },
  breakfast: { es: "Desayuno", en: "Breakfast" },
  lunch: { es: "Almuerzo", en: "Lunch" },
  dinner: { es: "Cena", en: "Dinner" },
  estimated: { es: "Estimado", en: "Estimate" },
  grams: { es: "g de carbohidratos", en: "g of carbs" },
  prev: { es: "Día anterior", en: "Previous day" },
  nextDay: { es: "Día siguiente", en: "Next day" },
  shopping: { es: "Lista de compra", en: "Shopping list" },
  meals: { es: "Sus comidas de la semana", en: "Your meals for the week" },
  ai: { es: "Hecho con IA", en: "Made with AI" },
  sample: { es: "Plan de ejemplo", en: "Sample plan" },
  pickup: { es: "Recoger mi comida", en: "Pick up my food" },
  ate: { es: "¿Qué comí?", en: "What did I eat?" },
  again: { es: "Hacer un plan nuevo", en: "Make a new plan" },
};

const mealLabel = { desayuno: copy.breakfast, almuerzo: copy.lunch, cena: copy.dinner } as const;

export default function PlanPage() {
  const { t, lang } = useT();
  const s = useAppState();
  const hydrated = useHydrated();
  const [day, setDay] = useState(0);
  const [failed, setFailed] = useState(false);
  const [noTranslation, setNoTranslation] = useState(false);
  const { rx, plan } = s;
  // The plan is always shown in the language of the screen. A plan written in the other language is translated first.
  const wrongLang = Boolean(plan?.lang && plan.lang !== lang);

  useEffect(() => {
    if (!hydrated || !rx || !plan || !wrongLang || noTranslation) return;
    let live = true;
    void translatePlan(rx, plan, lang).then((ok) => { if (live && !ok) setNoTranslation(true); });
    return () => { live = false; };
  }, [hydrated, rx, plan, wrongLang, noTranslation, lang]);

  useEffect(() => {
    if (!hydrated || !rx || plan || failed) return;
    let live = true;
    void ensurePlan(rx, lang).then((ok) => { if (live && !ok) setFailed(true); });
    return () => { live = false; };
  }, [hydrated, rx, plan, failed, lang]);

  if (!hydrated) return <Page><Busy /></Page>;

  const back = <BigButton href="/paciente" variant="quiet" icon="left">{t(copy.back)}</BigButton>;

  if (!rx) {
    return (
      <Page>
        <h1>{t(copy.title)}</h1>
        <Notice><p className="text-[1.25rem]">{t(copy.noRx)}</p></Notice>
        {back}
      </Page>
    );
  }

  const summary = s.visitSummary;
  const idx = plan ? Math.min(day, plan.days.length - 1) : 0;
  const current = plan?.days[idx];

  return (
    <Page>
      <h1>{t(copy.title)}</h1>

      {summary && (
        <Card className="flex flex-col gap-3">
          <h2>{t(copy.said)}</h2>
          <ul className="list-disc space-y-2 pl-6 text-[1.25rem]">
            {summary.points.map((p, i) => <li key={i}>{t(p)}</li>)}
          </ul>
          <ReadAloud text={summary.points.map((p) => t(p)).join(". ")} />
        </Card>
      )}

      {failed && !plan && (
        <>
          <Notice tone="warn"><p className="text-[1.25rem]">{t(copy.failed)}</p></Notice>
          <BigButton icon="refresh" onClick={() => setFailed(false)}>{t(copy.retry)}</BigButton>
        </>
      )}
      {!plan && !failed && (
        <>
          <Busy label={t(copy.preparing)} />
          <p className="text-[1.1rem]">{t(copy.wait)}</p>
        </>
      )}

      {plan && wrongLang && !noTranslation && <Busy label={t(copy.translating)} />}

      {plan && current && (!wrongLang || noTranslation) && (
        <>
          {wrongLang && (
            <Notice>
              <p className="text-[1.1rem]">{t(copy.otherLang)}</p>
              <div className="mt-3">
                <BigButton variant="secondary" icon="refresh" onClick={() => { setDay(0); setFailed(false); setNoTranslation(false); setState({ plan: null }); }}>{t(copy.redo)}</BigButton>
              </div>
            </Notice>
          )}
          <div aria-live="polite" className="flex flex-col gap-4">
            <h2>{current.day}</h2>
            {current.meals.map((m, i) => (
              <Card key={`${idx}-${i}`} className="flex flex-col gap-2">
                <h3>{t(mealLabel[m.meal])}</h3>
                <p className="text-[1.563rem] font-bold leading-tight">{m.dish}</p>
                <p className="text-[1.1rem]">{m.portion}</p>
                <p className="text-[1.1rem]">{t(copy.estimated)}: {m.carbs} {t(copy.grams)}</p>
                <div><TrafficLight compact light={m.light} /></div>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
            <BigButton variant="secondary" icon="left" disabled={idx === 0} onClick={() => setDay(idx - 1)}>{t(copy.prev)}</BigButton>
            <BigButton variant="secondary" iconEnd="right" disabled={idx >= plan.days.length - 1} onClick={() => setDay(idx + 1)}>{t(copy.nextDay)}</BigButton>
          </div>
          <p className="text-center text-[1.25rem] font-bold">
            {t({ es: `Día ${idx + 1} de ${plan.days.length}`, en: `Day ${idx + 1} of ${plan.days.length}` })}
          </p>

          <Card className="flex flex-col gap-3">
            <h2>{t(rx.type === "meals" ? copy.meals : copy.shopping)}</h2>
            <ul className="list-disc space-y-2 pl-6 text-[1.25rem]">
              {plan.shopping.map((it, i) => <li key={i}>{it.item} — {it.qty}</li>)}
            </ul>
          </Card>

          {plan.tip && <Notice><p className="text-[1.1rem]">{plan.tip}</p></Notice>}
          <div><Tag>{t(plan.source === "ai" ? copy.ai : copy.sample)}</Tag></div>
          <p className="text-[0.9rem] text-muted">{t(common.notAdvice)}</p>

          <div className="flex flex-col gap-3">
            <BigButton href="/canjear" icon="bag">{t(copy.pickup)}</BigButton>
            <BigButton href="/comida" variant="secondary" icon="plate">{t(copy.ate)}</BigButton>
            <BigButton variant="quiet" icon="refresh" onClick={() => { setDay(0); setFailed(false); setState({ plan: null }); }}>{t(copy.again)}</BigButton>
          </div>
        </>
      )}
      {back}
    </Page>
  );
}
