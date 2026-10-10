"use client";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { BigButton, Page } from "@/components/ui";
import { common, useT } from "@/lib/i18n";
import { roleHome } from "@/components/Account";
import { resetDemo, useSession } from "@/lib/store";
import type { L10n } from "@/lib/types";

const copy = {
  who: { es: "¿Quién es usted?", en: "Who are you?" },
  reset: { es: "Empezar la demostración de nuevo", en: "Start the demo again" },
  signIn: { es: "Entrar con mi cuenta", en: "Sign in to my account" },
  myPage: { es: "Ir a mi página", en: "Go to my page" },
  resetDone: { es: "Demostración reiniciada.", en: "Demo reset." },
};

const roles: { href: string; icon: string; title: L10n; hint: L10n }[] = [
  { href: "/paciente", icon: "person", title: { es: "Soy paciente", en: "I am a patient" }, hint: { es: "Mi cita, mi plan y mi comida", en: "My visit, my plan and my food" } },
  { href: "/clinico", icon: "clipboard", title: { es: "Soy clínico", en: "I am a clinician" }, hint: { es: "Recetar comida en 30 segundos", en: "Prescribe food in 30 seconds" } },
  { href: "/promotora", icon: "people", title: { es: "Soy promotora de salud", en: "I am a community health worker" }, hint: { es: "Mis pacientes, llamadas y visitas", en: "My patients, calls and visits" } },
  { href: "/negocio", icon: "store", title: { es: "Soy colmado, finca o cocina", en: "I am a store, farm or kitchen" }, hint: { es: "Ver y preparar pedidos", en: "See and prepare orders" } },
];

export default function Home() {
  const { t } = useT();
  const session = useSession();
  return (
    <Page>
      <div>
        <h1>{t(common.tagline)}</h1>
        <p className="mt-3 text-[1.25rem] font-bold text-muted">{t(copy.who)}</p>
      </div>
      {session.status === "signedIn" && <BigButton href={roleHome[session.role]} icon="right">{t(copy.myPage)}</BigButton>}
      {session.status === "signedOut" && <BigButton href="/entrar" icon="person">{t(copy.signIn)}</BigButton>}
      <nav aria-label={t(copy.who)} className="flex flex-col gap-4">
        {roles.map((r) => (
          <Link key={r.href} href={r.href} className="flex min-h-[96px] items-center gap-4 rounded-2xl border-[3px] border-brand bg-panel p-5 hover:bg-brand-soft">
            <Icon name={r.icon} size={44} className="text-brand" />
            <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
              <span className="block text-[1.563rem] font-bold leading-tight text-brand">{t(r.title)}</span>
              <span className="block text-muted">{t(r.hint)}</span>
            </span>
            <Icon name="right" className="text-brand" />
          </Link>
        ))}
      </nav>
      <BigButton variant="quiet" href="/acerca" icon="info">{t(common.about)}</BigButton>
      {session.status === "demo" && <BigButton variant="quiet" icon="refresh" onClick={() => { resetDemo(); window.alert(t(copy.resetDone)); }}>{t(copy.reset)}</BigButton>}
    </Page>
  );
}
