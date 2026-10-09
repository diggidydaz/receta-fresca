"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "./Icon";
import { common, useT } from "@/lib/i18n";
import { setState, useAppState } from "@/lib/store";

export function TopBar() {
  const { lang, bigText } = useAppState();
  const { t } = useT();

  // Keep the page language and text size in step with the person's choice.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.big = bigText ? "1" : "0";
  }, [lang, bigText]);

  const pill = "inline-flex min-h-[48px] min-w-[48px] items-center justify-center gap-2 rounded-xl border-2 border-white bg-brand px-3 font-bold text-white hover:bg-brand-dark";
  return (
    <>
      <a href="#contenido" className="sr-only-focusable bg-panel p-3 font-bold text-brand">{t(common.skip)}</a>
      <header className="bg-brand text-white">
        <div className="mx-auto flex max-w-[36rem] flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link href="/" className="inline-flex min-h-[48px] items-center gap-2 rounded-xl text-[1.25rem] font-bold">
            <Icon name="leaf" /> {t(common.appName)}
          </Link>
          <div className="flex gap-2">
            <button type="button" className={pill} onClick={() => setState({ lang: lang === "es" ? "en" : "es" })} lang={lang === "es" ? "en" : "es"}>
              {lang === "es" ? "English" : "Español"}
            </button>
            <button type="button" className={pill} aria-pressed={bigText} onClick={() => setState({ bigText: !bigText })}>
              <span aria-hidden="true">A+</span>
              <span className="sr-only">{t({ es: "Letra más grande", en: "Larger text" })}</span>
            </button>
          </div>
        </div>
        <p className="bg-notice px-4 py-2 text-center text-[0.85rem] font-bold text-ink">{t(common.sample)}</p>
      </header>
    </>
  );
}
