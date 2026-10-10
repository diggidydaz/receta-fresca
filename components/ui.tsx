"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon";
import { common, useT } from "@/lib/i18n";
import type { L10n, Light } from "@/lib/types";

/* ---------- Buttons ---------- */
const base =
  "inline-flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 min-h-[64px] text-[1.25rem] font-bold leading-tight text-center border-[3px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
const variants = {
  primary: "bg-brand text-white border-brand hover:bg-brand-dark hover:border-brand-dark",
  secondary: "bg-panel text-brand border-brand hover:bg-brand-soft",
  quiet: "bg-transparent text-ink border-rule hover:bg-panel",
};

type BtnProps = {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  icon?: string;
  iconEnd?: string;
  href?: string;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function BigButton({ children, variant = "primary", icon, iconEnd, href, className = "", ...rest }: BtnProps) {
  const cls = `${base} ${variants[variant]} ${className}`;
  const inner = (
    <>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
      {iconEnd && <Icon name={iconEnd} />}
    </>
  );
  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  return <button type="button" className={cls} {...rest}>{inner}</button>;
}

/* ---------- Layout pieces ---------- */
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border-2 border-rule bg-panel p-5 ${className}`}>{children}</div>;
}

/** Page body: one readable column, generous spacing. */
export function Page({ children }: { children: React.ReactNode }) {
  return <main id="contenido" className="mx-auto flex w-full max-w-[36rem] flex-1 flex-col gap-6 px-4 pb-12 pt-6">{children}</main>;
}

/** Heading that takes focus when a new step appears, so screen readers announce it. */
export function StepHeading({ children, focusKey }: { children: React.ReactNode; focusKey?: string | number }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    ref.current?.focus();
  }, [focusKey]);
  return <h1 ref={ref} tabIndex={-1} className="outline-none">{children}</h1>;
}

export function Progress({ step, total }: { step: number; total: number }) {
  const { t } = useT();
  const label = t({ es: `Paso ${step} de ${total}`, en: `Step ${step} of ${total}` });
  return (
    <div>
      <p className="font-bold text-muted">{label}</p>
      <div className="mt-2 flex gap-2" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-3 flex-1 rounded-full border-2 ${i < step ? "border-brand bg-brand" : "border-rule bg-panel"}`} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Choices (real radio buttons, big targets) ---------- */
export type Choice<V extends string> = { value: V; label: string; hint?: string; icon?: string };

export function ChoiceGroup<V extends string>({ legend, hideLegend, name, options, value, onChange }: {
  legend: string; hideLegend?: boolean; name: string; options: Choice<V>[]; value?: V; onChange: (v: V) => void;
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className={hideLegend ? "sr-only" : "mb-3 text-[1.25rem] font-bold"}>{legend}</legend>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <label key={o.value} className={`flex min-h-[72px] cursor-pointer items-center gap-4 rounded-2xl border-[3px] px-5 py-4 has-[:focus-visible]:outline has-[:focus-visible]:outline-4 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${on ? "border-brand bg-brand-soft" : "border-rule bg-panel"}`}>
            <input type="radio" name={name} value={o.value} checked={on} onChange={() => onChange(o.value)} className="sr-only" />
            {o.icon && <Icon name={o.icon} size={32} className="text-brand" />}
            <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
              <span className="block text-[1.25rem] font-bold leading-tight">{o.label}</span>
              {o.hint && <span className="block text-muted">{o.hint}</span>}
            </span>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] ${on ? "border-brand bg-brand text-white" : "border-rule bg-panel text-transparent"}`}>
              <Icon name="check" size={22} />
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

/* ---------- Traffic light: color + shape + word, never color alone ---------- */
const lights: Record<Light, { box: string; icon: string; word: L10n; hint: L10n }> = {
  green: { box: "bg-go text-white border-go", icon: "check", word: common.green, hint: common.greenHint },
  yellow: { box: "bg-wait text-ink border-ink", icon: "warn", word: common.yellow, hint: common.yellowHint },
  red: { box: "bg-stop text-white border-stop", icon: "hand", word: common.red, hint: common.redHint },
};

export function TrafficLight({ light, compact }: { light: Light; compact?: boolean }) {
  const { t } = useT();
  const l = lights[light];
  if (compact)
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-[0.9rem] font-bold ${l.box}`}>
        <Icon name={l.icon} size={18} /> {t(l.word)}
      </span>
    );
  return (
    <div className={`flex items-center gap-4 rounded-2xl border-[3px] p-5 ${l.box}`}>
      <Icon name={l.icon} size={56} />
      <div>
        <p className="text-[1.563rem] font-bold leading-tight">{t(l.word)}</p>
        <p className="text-[1.1rem]">{t(l.hint)}</p>
      </div>
    </div>
  );
}

/* ---------- Read aloud ---------- */
export function ReadAloud({ text }: { text: string }) {
  const { lang, t } = useT();
  const [speaking, setSpeaking] = useState(false);
  const [ok, setOk] = useState(false);
  useEffect(() => {
    // Feature check must run in the browser after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOk(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => { if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel(); };
  }, []);
  if (!ok) return null;
  const toggle = () => {
    const synth = window.speechSynthesis;
    if (speaking) { synth.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "es" ? "es-US" : "en-US";
    u.rate = 0.9;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  };
  return (
    <button type="button" onClick={toggle} aria-pressed={speaking} className="inline-flex min-h-[56px] items-center gap-2 self-start rounded-2xl border-[3px] border-brand bg-panel px-5 py-2 font-bold text-brand hover:bg-brand-soft">
      <Icon name={speaking ? "stop" : "speaker"} />
      {speaking ? t({ es: "Parar", en: "Stop" }) : t({ es: "Escuchar", en: "Listen" })}
    </button>
  );
}

/* ---------- Text answer with optional voice input ---------- */
type Recognition = { lang: string; interimResults: boolean; continuous: boolean; start: () => void; stop: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };

export function VoiceInput({ label, hint, value, onChange, rows = 3 }: { label: string; hint?: string; value: string; onChange: (v: string) => void; rows?: number }) {
  const { lang, t } = useT();
  const id = useId();
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const rec = useRef<Recognition | null>(null);
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => rec.current?.stop();
  }, []);
  const toggle = () => {
    if (listening) { rec.current?.stop(); return; }
    const w = window as unknown as Record<string, new () => Recognition>;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = lang === "es" ? "es-PR" : "en-US";
    r.interimResults = false;
    r.continuous = false;
    r.onresult = (e) => {
      const said = Array.from(e.results).map((x) => x[0].transcript).join(" ").trim();
      if (said) onChange(value ? `${value} ${said}` : said);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    rec.current = r;
    r.start();
    setListening(true);
  };
  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={id} className="text-[1.25rem] font-bold">{label}</label>
      {hint && <p id={`${id}-h`} className="-mt-2 text-muted">{hint}</p>}
      <textarea id={id} rows={rows} maxLength={600} value={value} onChange={(e) => onChange(e.target.value)} aria-describedby={hint ? `${id}-h` : undefined}
        className="w-full rounded-2xl border-[3px] border-rule bg-panel p-4 text-[1.25rem] leading-snug" />
      {supported && (
        <button type="button" onClick={toggle} aria-pressed={listening}
          className={`inline-flex min-h-[64px] items-center justify-center gap-3 rounded-2xl border-[3px] px-5 py-3 text-[1.25rem] font-bold ${listening ? "border-stop bg-stop text-white" : "border-brand bg-panel text-brand hover:bg-brand-soft"}`}>
          <Icon name={listening ? "stop" : "mic"} />
          {listening ? t({ es: "Escuchando… toque para parar", en: "Listening… tap to stop" }) : t({ es: "Hablar en vez de escribir", en: "Speak instead of typing" })}
        </button>
      )}
      <p className="sr-only" role="status">{listening ? t({ es: "Micrófono encendido", en: "Microphone on" }) : ""}</p>
    </div>
  );
}

/* ---------- Status and notices ---------- */
export function Busy({ label }: { label?: string }) {
  const { t } = useT();
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-4 rounded-2xl border-2 border-rule bg-panel p-5">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent motion-reduce:animate-none" aria-hidden="true" />
      <p className="text-[1.25rem] font-bold">{label ?? t(common.loading)}</p>
    </div>
  );
}

export function Notice({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warn" }) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl border-2 p-4 ${tone === "warn" ? "border-stop bg-panel" : "border-rule bg-notice"}`}>
      <Icon name={tone === "warn" ? "warn" : "info"} className={tone === "warn" ? "text-stop" : "text-ink"} />
      <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">{children}</div>
    </div>
  );
}

/** Small tag marking anything that is simulated or AI-generated. */
export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="inline-block rounded-full border-2 border-ink bg-notice px-3 py-0.5 text-[0.85rem] font-bold">{children}</span>;
}
