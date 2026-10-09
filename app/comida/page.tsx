"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { BigButton, Busy, Card, Notice, Page, ReadAloud, Tag, TrafficLight, VoiceInput } from "@/components/ui";
import { applySizes, DEFAULT_TARGET, normalize } from "@/lib/foods";
import { common, useT } from "@/lib/i18n";
import { setState, useAppState, useHydrated } from "@/lib/store";
import type { Estimate, L10n, LogEntry, Size } from "@/lib/types";

const sizeChoices: { value: Size; label: L10n; hint: L10n }[] = [
  { value: "small", label: { es: "Poco", en: "A little" }, hint: { es: "la mitad", en: "half" } },
  { value: "normal", label: { es: "Normal", en: "Normal" }, hint: { es: "porción típica", en: "typical" } },
  { value: "large", label: { es: "Mucho", en: "A lot" }, hint: { es: "una y media", en: "one and a half" } },
];

const copy = {
  howMuch: { es: "¿Cuánto comió?", en: "How much did you eat?" },
  adjust: { es: "Diga cuánto comió de cada cosa. El total cambia solo.", en: "Say how much of each thing you ate. The total updates by itself." },
  photo: { es: "Tomar una foto de mi plato", en: "Take a photo of my plate" },
  photoHint: { es: "La foto no se guarda.", en: "The photo is not saved." },
  looking: { es: "Mirando su foto…", en: "Looking at your photo…" },
  saw: { es: "Esto es lo que vimos en su foto. Borre lo que no comió, añada lo que falte, y toque «Ver mi estimado».", en: "This is what we saw in your photo. Delete what you did not eat, add what is missing, then tap \"See my estimate\"." },
  sawNothing: { es: "No pudimos reconocer comida en la foto. Diga o escriba lo que comió.", en: "We could not recognize food in the photo. Say or type what you ate." },
  photoFailed: { es: "No pudimos mirar la foto. Diga o escriba lo que comió.", en: "We could not look at the photo. Say or type what you ate." },
  photoAlt: { es: "Su foto del plato", en: "Your photo of the plate" },
  unmatched: { es: "No pudimos contar esta parte", en: "We could not count this part" },
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
  mixed: { es: "Tabla local y cálculo de IA", en: "Local table and AI guess" },
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
  const [raw, setRaw] = useState<Estimate | null>(null); // typical-serving values from the server
  const [sizes, setSizes] = useState<Size[]>([]);
  const [logId, setLogId] = useState<string | null>(null);
  const [hints, setHints] = useState<Record<string, Size>>({}); // sizes the photo suggested, by dish name
  const headRef = useRef<HTMLHeadingElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [looking, setLooking] = useState(false);
  const [photoMsg, setPhotoMsg] = useState<"saw" | "sawNothing" | "photoFailed" | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Shrinks the photo in the browser before sending, so it uploads fast on a slow connection.
  const shrink = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        const ctx = c.getContext("2d");
        if (!ctx) { URL.revokeObjectURL(url); reject(new Error("no canvas")); return; }
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad image")); };
      img.src = url;
    });

  const onPhoto = async (file: File | undefined) => {
    if (!file || looking) return;
    setLooking(true); setPhotoMsg(null); setRaw(null); setFailed(false); setEmpty(false); setHints({});
    try {
      const dataUrl = await shrink(file);
      setPreview(dataUrl);
      const res = await fetch("/api/photo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: dataUrl, lang }) });
      if (!res.ok) throw new Error("bad");
      const data = (await res.json()) as { dishes?: string[]; sizes?: { name: string; size: Size }[]; ok?: boolean };
      if (!data.ok) { setPhotoMsg("photoFailed"); return; }
      const dishes = Array.isArray(data.dishes) ? data.dishes.filter((d) => typeof d === "string" && d.trim()) : [];
      if (dishes.length === 0) { setPhotoMsg("sawNothing"); return; }
      // The photo only fills in the words. The person confirms them, and the numbers come from the usual estimate.
      setText(dishes.join(", "));
      setHints(Object.fromEntries((data.sizes ?? []).map((d) => [normalize(d.name), d.size])));
      setPhotoMsg("saw");
    } catch {
      setPhotoMsg("photoFailed");
    } finally {
      setLooking(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  useEffect(() => { if (raw) headRef.current?.focus(); }, [raw]);

  if (!hydrated) return <Page><Busy /></Page>;

  const target = s.rx?.carbTarget ?? DEFAULT_TARGET;
  // What is shown: the server's typical-serving values, adjusted by the sizes the person chose.
  const est = raw ? applySizes(raw, sizes, target) : null;

  const submit = async () => {
    if (busy) return;
    const q = text.trim();
    if (!q) { setEmpty(true); return; }
    setEmpty(false); setFailed(false); setBusy(true); setRaw(null); setLogId(null);
    try {
      const res = await fetch("/api/estimate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: q, target, lang }) });
      if (!res.ok) throw new Error("bad");
      const data = (await res.json()) as Estimate;
      if (!data || !Array.isArray(data.items) || !data.light) throw new Error("bad");
      // Starting size for each food: the photo's guess, else a size word the person used, else normal.
      const start: Size[] = data.items.map((it) => hints[normalize(it.name)] ?? it.size ?? "normal");
      setRaw(data);
      setSizes(start);
      if (data.items.length === 0) return; // nothing recognized: show the message, do not log a light
      const id = Date.now().toString();
      const entry: LogEntry = { id, text: q, at: new Date().toISOString(), estimate: applySizes(data, start, target) };
      setLogId(id);
      setState((st) => ({ log: [entry, ...st.log].slice(0, 20) }));
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  // Changing a size updates the total on screen and the entry already saved in today's list.
  const pickSize = (index: number, size: Size) => {
    if (!raw) return;
    const next = sizes.map((x, i) => (i === index ? size : x));
    setSizes(next);
    if (logId) {
      const updated = applySizes(raw, next, target);
      setState((st) => ({ log: st.log.map((e) => (e.id === logId ? { ...e, estimate: updated } : e)) }));
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
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void onPhoto(e.target.files?.[0])} />
        <BigButton variant="secondary" icon="camera" disabled={looking} onClick={() => fileRef.current?.click()}>{t(copy.photo)}</BigButton>
        <p className="text-muted">{t(copy.photoHint)}</p>
      </div>
      {looking && <Busy label={t(copy.looking)} />}
      <div aria-live="polite" className="flex flex-col gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {preview && !looking && <img src={preview} alt={t(copy.photoAlt)} className="max-h-56 w-full rounded-2xl border-2 border-rule object-cover" />}
        {photoMsg && !looking && <Notice tone={photoMsg === "saw" ? "info" : "warn"}><p className="text-[1.25rem] font-bold">{t(copy[photoMsg])}</p></Notice>}
      </div>
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
            {est.items.length === 0 ? (
              <Notice tone="warn"><p className="text-[1.25rem]">{est.message}</p></Notice>
            ) : (
              <>
                <TrafficLight light={est.light} />
                <p className="text-[1.563rem] font-bold leading-tight">
                  {t({ es: `Entre ${est.carbsMin} y ${est.carbsMax} gramos de carbohidratos`, en: `Between ${est.carbsMin} and ${est.carbsMax} grams of carbs` })}
                </p>
                <p className="text-[1.25rem]">{t(copy.goal)}: {target} g</p>
                <p className="text-[1.1rem] font-bold">{t(copy.adjust)}</p>
                {est.items.map((it, i) => (
                  <Card key={i} className="flex flex-col gap-1">
                    <p className="text-[1.25rem] font-bold">{it.name}</p>
                    <p>{t(copy.serving)}: {it.serving}</p>
                    <p className="text-[1.25rem] font-bold">{it.carbsMin}-{it.carbsMax} g</p>
                    <fieldset className="my-2 min-w-0">
                      <legend className="mb-2 font-bold">{t(copy.howMuch)}</legend>
                      <div className="grid grid-cols-3 gap-2">
                        {sizeChoices.map((c) => {
                          const on = (sizes[i] ?? "normal") === c.value;
                          return (
                            <label key={c.value} className={`flex min-h-[72px] cursor-pointer flex-col items-center justify-center rounded-2xl border-[3px] px-1 py-2 text-center has-[:focus-visible]:outline has-[:focus-visible]:outline-4 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${on ? "border-brand bg-brand text-white" : "border-rule bg-panel text-ink"}`}>
                              <input type="radio" name={`size-${i}`} value={c.value} checked={on} onChange={() => pickSize(i, c.value)} className="sr-only" />
                              <span className="flex items-center gap-1 font-bold leading-tight">{on && <Icon name="check" size={20} />}{t(c.label)}</span>
                              <span className="text-[0.85rem] leading-tight">{t(c.hint)}</span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                    <p>{t(copy.idea)}: {it.swap}</p>
                    {it.source && <p className="text-[0.85rem] text-muted">{it.source}</p>}
                  </Card>
                ))}
                {est.unmatched && <Notice tone="warn"><p className="text-[1.1rem] font-bold">{t(copy.unmatched)}: {est.unmatched}</p></Notice>}
                <Notice><p className="text-[1.1rem]">{est.message}</p></Notice>
                <div><Tag>{t(est.confidence === "low" ? copy.low : est.confidence === "mixed" ? copy.mixed : copy.table)}</Tag></div>
                <p className="text-[0.9rem] text-muted">{t(common.notAdvice)}</p>
                <ReadAloud text={readText} />
              </>
            )}
            <BigButton variant="secondary" icon="refresh" onClick={() => { setText(""); setRaw(null); setSizes([]); setLogId(null); setHints({}); setEmpty(false); setFailed(false); setPreview(null); setPhotoMsg(null); }}>{t(copy.another)}</BigButton>
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
                <span className="max-w-full text-[1.25rem] [overflow-wrap:anywhere]">{e.text}</span>
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
