"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { roleHome, SignIn } from "@/components/Account";
import { BigButton, Busy, Notice, Page } from "@/components/ui";
import { common, useT } from "@/lib/i18n";
import { useSession } from "@/lib/store";

export default function EntrarPage() {
  const { t } = useT();
  const session = useSession();
  const router = useRouter();
  const home = session.status === "signedIn" ? roleHome[session.role] : null;
  useEffect(() => { if (home) router.replace(home); }, [home, router]);

  if (session.status === "demo") {
    return (
      <Page>
        <h1>{t({ es: "Entrar", en: "Sign in" })}</h1>
        <Notice>{t({ es: "Esta demostración no usa cuentas: todo se guarda en este navegador.", en: "This demo has no accounts: everything is kept in this browser." })}</Notice>
        <BigButton href="/" icon="home">{t(common.home)}</BigButton>
      </Page>
    );
  }
  if (session.status === "signedOut") return <SignIn />;
  return <Page><Busy /></Page>;
}
