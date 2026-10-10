"use client";
import { useEffect, useState } from "react";
import { BigButton, Busy, Card, Notice, Page, ReadAloud, Tag, TrafficLight } from "@/components/ui";
import { TeachBack } from "@/components/TeachBack";
import { WeekPlan } from "@/components/WeekPlan";
import patientsData from "@/data/patients.json";
import { familyLink } from "@/lib/share";
import type { Patient } from "@/lib/types";
import { common, useT } from "@/lib/i18n";
import { ensurePlan } from "@/lib/planLoader";
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
  listenDay: { es: "Escuchar las comidas de este día", en: "Listen to this day's meals" },
  print: { es: "Imprimir mi plan", en: "Print my plan" },
  share: { es: "Compartir con mi familia", en: "Share with my family" },
  shareHint: { es: "Su familia verá el plan y su meta. No verá lo que usted come.", en: "Your family will see the plan and your goal. They will not see what you eat." },
  copied: { es: "Enlace copiado. Péguelo en un mensaje a su familia.", en: "Link copied. Paste it into a message to your family." },
  copyHere: { es: "Copie este enlace y envíelo a su familia:", en: "Copy this link and send it to your family:" },
  printTitle: { es: "Plan de la semana", en: "Plan for the week" },
  goal: { es: "Meta por comida", en: "Goal per meal" },
};

const mealLabel = { desayuno: copy.breakfast, almuerzo: copy.lunch, cena: copy.dinner } as const;

export default function PlanPage() {
  const { t, lang } = useT();
  const s = useAppState();
  const hydrated = useHydrated();
  const [day, setDay] = useState(0);
  const [failed, setFailed] = useState(false);
  const [shared, setShared] = useState<{ link: string; copied: boolean } | null>(null);
  const { rx, plan } = s;

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
  const patient = (patientsData as Patient[]).find((p) => p.id === s.patientId);

  const share = async () => {
    if (!plan || !rx) return;
    const link = familyLink(window.location.origin, patient?.name ?? "", rx, plan, (summary?.points ?? []).map((p) => t(p)), lang);
    const title = t({ es: "Plan de la semana de Receta Fresca", en: "Receta Fresca weekly plan" });
    try {
      if (navigator.share) { await navigator.share({ title, url: link }); setShared({ link, copied: false }); return; }
    } catch { /* cancelled or unsupported: fall through to copying */ }
    let copied = false;
    try { await navigator.clipboard.writeText(link); copied = true; } catch { /* show the link to copy by hand */ }
    setShared({ link, copied });
  };
  const idx = plan ? Math.min(day, plan.days.length - 1) : 0;
  const current = plan?.days[idx];

  return (
    <Page>
      <div className="flex flex-col gap-6 print:hidden">
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

        {plan && current && (
          <>
            {plan.lang && plan.lang !== lang && (
              <Notice>
                <p className="text-[1.1rem]">{t(copy.otherLang)}</p>
                <div className="mt-3">
                  <BigButton variant="secondary" icon="refresh" onClick={() => { setDay(0); setFailed(false); setState({ plan: null }); }}>{t(copy.redo)}</BigButton>
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
            <div className="flex flex-col gap-1">
              <p className="font-bold">{t(copy.listenDay)}</p>
              <ReadAloud key={idx} text={[current.day, ...current.meals.map((m) => `${t(mealLabel[m.meal])}: ${m.dish}. ${m.portion}. ${t(copy.estimated)}: ${m.carbs} ${t(copy.grams)}`)].join(". ")} />
            </div>

            <Card className="flex flex-col gap-3">
              <h2>{t(rx.type === "meals" ? copy.meals : copy.shopping)}</h2>
              <ul className="list-disc space-y-2 pl-6 text-[1.25rem]">
                {plan.shopping.map((it, i) => <li key={i}>{it.item} — {it.qty}</li>)}
              </ul>
            </Card>

            {plan.tip && <Notice><p className="text-[1.1rem]">{plan.tip}</p></Notice>}
            <div><Tag>{t(plan.source === "ai" ? copy.ai : copy.sample)}</Tag></div>
            <p className="text-[0.9rem] text-muted">{t(common.notAdvice)}</p>

            <TeachBack goal={rx.carbTarget} planAt={rx.createdAt} />

            <div className="flex flex-col gap-3">
              <BigButton variant="secondary" icon="print" onClick={() => window.print()}>{t(copy.print)}</BigButton>
              <BigButton variant="secondary" icon="share" onClick={() => void share()}>{t(copy.share)}</BigButton>
              <p className="-mt-1 text-muted">{t(copy.shareHint)}</p>
              <div aria-live="polite">
                {shared && (shared.copied ? (
                  <Notice><p className="font-bold">{t(copy.copied)}</p></Notice>
                ) : (
                  <Notice>
                    <label htmlFor="family-link" className="font-bold">{t(copy.copyHere)}</label>
                    <input id="family-link" readOnly value={shared.link} onFocus={(e) => e.target.select()} className="mt-2 w-full rounded-xl border-2 border-rule bg-panel p-2 text-[0.9rem]" />
                  </Notice>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <BigButton href="/canjear" icon="bag">{t(copy.pickup)}</BigButton>
              <BigButton href="/comida" variant="secondary" icon="plate">{t(copy.ate)}</BigButton>
              <BigButton variant="quiet" icon="refresh" onClick={() => { setDay(0); setFailed(false); setState({ plan: null }); }}>{t(copy.again)}</BigButton>
            </div>
          </>
        )}
        {back}
      </div>

      {plan && (
        <div className="hidden flex-col gap-4 print:flex">
          <h1>{t(copy.printTitle)}{patient ? ` · ${patient.name}` : ""}</h1>
          <p className="text-[1.25rem] font-bold">{t(copy.goal)}: {rx.carbTarget} g</p>
          {summary && <ul className="list-disc pl-6">{summary.points.map((p, i) => <li key={i}>{t(p)}</li>)}</ul>}
          <WeekPlan days={plan.days} goal={rx.carbTarget} />
          <section className="break-inside-avoid">
            <h2>{t(rx.type === "meals" ? copy.meals : copy.shopping)}</h2>
            <ul className="list-disc pl-6">{plan.shopping.map((it, i) => <li key={i}>{it.item} — {it.qty}</li>)}</ul>
          </section>
          <p>{t(common.notAdvice)} {t(common.callClinician)}</p>
        </div>
      )}
    </Page>
  );
}
