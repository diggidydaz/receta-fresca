"use client";
// Last-resort screen: if anything unexpected breaks a page, the person gets a plain message and a way forward.
import { BigButton, Notice, Page } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { resetDemo } from "@/lib/store";

export default function ErrorPage({ retry }: { error: Error; retry: () => void }) {
  const { t } = useT();
  return (
    <Page>
      <h1>{t({ es: "Algo salió mal", en: "Something went wrong" })}</h1>
      <Notice tone="warn"><p className="text-[1.25rem]">{t({ es: "No es su culpa. Puede intentar otra vez.", en: "It is not your fault. You can try again." })}</p></Notice>
      <BigButton icon="refresh" onClick={() => retry()}>{t({ es: "Intentar otra vez", en: "Try again" })}</BigButton>
      {/* A full reload is intended here: it clears whatever state caused the failure. */}
      {/* eslint-disable-next-line @next/next/no-location-assign-relative-destination */}
      <BigButton variant="secondary" icon="home" onClick={() => { resetDemo(); window.location.href = "/"; }}>{t({ es: "Empezar de nuevo", en: "Start over" })}</BigButton>
    </Page>
  );
}
