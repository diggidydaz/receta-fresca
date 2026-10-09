"use client";
import { useEffect, useRef, useState } from "react";
import { BigButton, Busy, Card, Notice, Page, ReadAloud, Tag, TrafficLight, VoiceInput } from "@/components/ui";
import { DEFAULT_TARGET } from "@/lib/foods";
import { common, useT } from "@/lib/i18n";
import { setState, useAppState, useHydrated } from "@/lib/store";
import type { Estimate, LogEntry } from "@/lib/types";

const copy = {
  title: { es: "¿Qué comió?", en: "What did you eat?" },
  label: { es: "Diga o escriba lo que comió", en: "Say or type what you ate" },
  hint: { es: "Por ejemplo: arroz con gandules y pernil", en: "For example: rice with pigeon peas and roast pork" },
  go: { es: "Ver mi estimado", en: "See my estimate" },
  empty: { es: "Escriba o diga lo que comió.", en: "Type or say what you ate." },
  failed: { es: "No pudimos hacer el estimado. Intente otra vez.", en: "We could not make the estimate. Please try again." },
  retry: { es: "Intentar otra vez", en: "Try again" },
  working: { es: "Calculando su estimado…", en: "Working out your estimate…" },
  result: { es: "Su estimado", en: "Your estimate" },
  goal: { es: "Su meta por comida", en: "Your goal per meal" },
  serving: { es: "Porción típica", en: "Typical serving" },
  idea: { es: "Idea", en: "Idea" },
  low: { es: "Cálculo aproximado de IA", en: "Rough AI guess" },
  table: { es: "De nuestra tabla de comida local", en: "From our local food table" },
  another: { es: "Anotar otra comida", en: "Add another meal" },
  today: { es: "Lo que ha comido hoy", en: "What you have eaten today" },
  none: { es: "Todavía no ha anotado comidas.", en: "You have not added any meals yet." },
  back: { es: "Volver a mi página", en: "Back to my page" },
};

export default function ComidaPage() {
  const { t, lang } = useT();
  const s = useAppState();
  const hydrated = useHydrated();
  const [text, setText] = useState("");
  const [empty, setEmpty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [est, setEst] = useState<Estimate | null>(null);
  const headRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { if (est) headRef.current?.focus(); }, [est]);

  if (!hydrated) return <Page><Busy /></Page>;

  const target = s.rx?.carbTarget ?? DEFAULT_TARGET;

  const submit = async () => {
    const q = text.trim();
    if (!q) { setEmpty(true); return; }
    setEmpty(false); setFailed(false); setBusy(true); setEst(null);
    try {
      const res = await fetch("/api/estimate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: q, target, lang }) });
      if (!res.ok) throw new Error("bad");
      const data = (await res.json()) as Estimate;
      if (!data || !Array.isArray(data.items) || !data.light) throw new Error("bad");
      setEst(data);
      const entry: LogEntry = { id: Date.now().toString(), text: q, at: new Date().toISOString(), estimate: data };
      setState((st) => ({ log: [entry, ...st.log].slice(0, 20) }));
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const readText = est
    ? [
        t(est.light === "green" ? common.green : est.light === "yellow" ? common.yellow : common.red),
        t({ es: `Entre ${est.carbsMin} y ${est.carbsMax} gramos de carbohidratos`, en: `Between ${est.carbsMin} and ${est.carbsMax} grams of carbs` }),
        ...est.items.map((i) => `${i.name}. ${t(copy.idea)}: ${i.swap}`),
      ].join(". ")
    : "";

  return (
    <Page>
      <h1>{t(copy.title)}</h1>
      <div className="flex flex-col gap-2">
        <VoiceInput label={t(copy.label)} hint={t(copy.hint)} value={text} onChange={(v) => { setText(v); if (v.trim()) setEmpty(false); }} />
        {empty && <p role="alert" className="text-[1.25rem] font-bold text-stop">{t(copy.empty)}</p>}
      </div>
      <BigButton icon="plate" onClick={submit}>{t(copy.go)}</BigButton>

      {busy && <Busy label={t(copy.working)} />}
      {failed && (
        <>
          <Notice tone="warn"><p role="alert" className="text-[1.25rem]">{t(copy.failed)}</p></Notice>
          <BigButton variant="secondary" icon="refresh" onClick={submit}>{t(copy.retry)}</BigButton>
        </>
      )}

      <div aria-live="polite" className="flex flex-col gap-4">
        {est && (
          <>
            <h2 ref={headRef} tabIndex={-1} className="outline-none">{t(copy.result)}</h2>
            <TrafficLight light={est.light} />
            <p className="text-[1.563rem] font-bold leading-tight">
              {t({ es: `Entre ${est.carbsMin} y ${est.carbsMax} gramos de carbohidratos`, en: `Between ${est.carbsMin} and ${est.carbsMax} grams of carbs` })}
            </p>
            <p className="text-[1.25rem]">{t(copy.goal)}: {target} g</p>
            {est.items.map((it, i) => (
              <Card key={i} className="flex flex-col gap-1">
                <p className="text-[1.25rem] font-bold">{it.name}</p>
                <p>{t(copy.serving)}: {it.serving}</p>
                <p>{it.carbsMin}-{it.carbsMax} g</p>
                <p>{t(copy.idea)}: {it.swap}</p>
                {it.source && <p className="text-[0.85rem] text-muted">{it.source}</p>}
              </Card>
            ))}
            <Notice><p className="text-[1.1rem]">{est.message}</p></Notice>
            <div><Tag>{t(est.confidence === "low" ? copy.low : copy.table)}</Tag></div>
            <p className="text-[0.9rem] text-muted">{t(common.notAdvice)}</p>
            <ReadAloud text={readText} />
            <BigButton variant="secondary" icon="refresh" onClick={() => { setText(""); setEst(null); setEmpty(false); setFailed(false); }}>{t(copy.another)}</BigButton>
          </>
        )}
      </div>

      <section className="flex flex-col gap-3">
        <h2>{t(copy.today)}</h2>
        {s.log.length === 0 ? (
          <p className="text-[1.25rem]">{t(copy.none)}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {s.log.map((e) => (
              <li key={e.id} className="flex flex-col items-start gap-2 rounded-2xl border-2 border-rule bg-panel p-4">
                <span className="text-[1.25rem]">{e.text}</span>
                <TrafficLight compact light={e.estimate.light} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <BigButton href="/paciente" variant="quiet" icon="left">{t(copy.back)}</BigButton>
    </Page>
  );
}
