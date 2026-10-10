"use client";
import { useRef, useState } from "react";
import { BigButton, Busy, Card, Field, Notice, Page, Tag } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { effectivePlaces } from "@/lib/places";
import { common, useT } from "@/lib/i18n";
import { advanceOrder, redeemVoucher, type RedeemReason } from "@/lib/orders";
import { listOrders, listPatients, useAppState, useHydrated, useSession } from "@/lib/store";
import type { L10n, Order, OrderStatus, Place } from "@/lib/types";

const copy = {
  title: { es: "Pedidos de Receta Fresca", en: "Receta Fresca orders" },
  none: { es: "No hay pedidos todavía.", en: "There are no orders yet." },
  forPatient: { es: "Para", en: "For" },
  delivery: { es: "Entrega a casa", en: "Home delivery" },
  yes: { es: "Sí, hay que entregar", en: "Yes, needs delivery" },
  no: { es: "No, la persona lo recoge", en: "No, the person picks it up" },
  rxLabel: { es: "Lo recetado", en: "Prescribed" },
  voucher: { es: "Vale de frutas, vegetales y viandas", en: "Voucher for fruit, vegetables and root vegetables" },
  pack: { es: "Para empacar", en: "To pack" },
  weekMeals: { es: "Comidas preparadas para la semana", en: "Prepared meals for the week" },
  menu: { es: "Menú que preparó la IA con la receta del clínico", en: "Menu the AI prepared from the clinician's prescription" },
  menuSample: { es: "Menú de ejemplo para la receta del clínico", en: "Sample menu for the clinician's prescription" },
  avoid: { es: "No usar", en: "Do not use" },
  goal: { es: "Meta", en: "Goal" },
  status: { es: "Estado", en: "Status" },
  complete: { es: "Pedido completado", en: "Order complete" },
  pitch: { es: "El negocio recibe el pago cuando canjea el vale que le enseña el paciente.", en: "The business is paid when it redeems the voucher the patient shows." },
  redeemTitle: { es: "Canjear un vale", en: "Redeem a voucher" },
  code: { es: "Código del vale", en: "Voucher code" },
  codeHint: { es: "Escriba el código que le enseña el paciente, por ejemplo RF-7K2M-Q9XP.", en: "Type the code the patient shows you, for example RF-7K2M-Q9XP." },
  redeem: { es: "Canjear", en: "Redeem" },
  redeemed: { es: "Vale aceptado. Ya puede entregar la comida", en: "Voucher accepted. You can hand over the food" },
  voucherUsed: { es: "Vale: canjeado", en: "Voucher: redeemed" },
  voucherOpen: { es: "Vale: sin canjear", en: "Voucher: not redeemed" },
  failed: { es: "No se pudo guardar. Revise la conexión y trate otra vez.", en: "Could not save. Check the connection and try again." },
  home: { es: "Inicio", en: "Home" },
  stock: { es: "Decir lo que tengo esta semana", en: "Say what I have this week" },
};

const statusWord: Record<OrderStatus, L10n> = {
  received: { es: "Recibido", en: "Received" },
  preparing: { es: "Preparando", en: "Preparing" },
  ready: { es: "Listo", en: "Ready" },
  delivered: { es: "Entregado", en: "Delivered" },
};
const nextOf: Partial<Record<OrderStatus, OrderStatus>> = { received: "preparing", preparing: "ready", ready: "delivered" };
const markWord: Record<string, L10n> = {
  preparing: { es: "Marcar: Preparando", en: "Mark: Preparing" },
  ready: { es: "Marcar: Listo", en: "Mark: Ready" },
  delivered: { es: "Marcar: Entregado", en: "Mark: Delivered" },
};
const redeemErr: Record<RedeemReason, L10n> = {
  unknown: { es: "Ese código no existe. Revise las letras y los números.", en: "That code does not exist. Check the letters and numbers." },
  otherPlace: { es: "Este vale es para otro negocio.", en: "This voucher is for another business." },
  used: { es: "Este vale ya se usó. No entregue la comida otra vez.", en: "This voucher was already used. Do not hand over the food again." },
  void: { es: "Este vale se canceló. El paciente tiene una receta nueva.", en: "This voucher was cancelled. The patient has a new prescription." },
  expired: { es: "Este vale venció con la receta.", en: "This voucher ended with the prescription." },
  offline: { es: "No hay conexión. Para canjear necesita internet.", en: "No connection. You need internet to redeem." },
};

const kindLabel: Record<Place["kind"], L10n> = {
  colmado: { es: "Colmado", en: "Corner store" },
  finca: { es: "Finca", en: "Farm" },
  cocina: { es: "Cocina local", en: "Local kitchen" },
};

export default function NegocioPage() {
  const { t } = useT();
  const s = useAppState();
  const hydrated = useHydrated();
  const lastTap = useRef(0);
  const session = useSession();
  const [failed, setFailed] = useState<string | null>(null);
  if (!hydrated) return <Page><Busy /></Page>;
  const places = effectivePlaces(s.stock);
  const patients = listPatients(s);
  const mine = session.status === "signedIn" ? places.find((p) => p.id === session.placeId) : undefined;

  const orders = listOrders(s);
  // A second tap within a moment is ignored, so one tap never skips a status.
  const advance = async (now: number, patientId: string, order: Order, next: OrderStatus) => {
    if (now - lastTap.current < 700) return;
    lastTap.current = now;
    setFailed((await advanceOrder(patientId, order, next)) ? order.id : null);
  };

  return (
    <Page>
      <h1>{t(copy.title)}</h1>
      {mine && <p className="text-[1.25rem] font-bold">{mine.name} · {mine.town}</p>}
      <div><Tag>{t(common.simulated)}</Tag></div>
      <BigButton href="/negocio/inventario" variant="secondary" icon="store">{t(copy.stock)}</BigButton>
      <RedeemBox names={Object.fromEntries(patients.map((p) => [p.id, p.name]))} />

      {orders.length === 0 && <Notice><p className="text-[1.25rem]">{t(copy.none)}</p></Notice>}
      {orders.map(({ patientId, order, rx, plan }) => {
        const place = places.find((p) => p.id === order.placeId);
        const patient = patients.find((p) => p.id === patientId);
        const meals = rx.type === "meals";
        const dishes = plan
          ? Array.from(new Set(plan.days.flatMap((d) => d.meals.filter((m) => m.meal === "almuerzo" || m.meal === "cena").map((m) => m.dish)))).slice(0, 7)
          : [];
        const next = nextOf[order.status];
        return (
        <Card key={order.id} className="flex flex-col gap-3 text-[1.25rem]">
          <p className="font-bold">{place?.name}{place ? ` · ${t(kindLabel[place.kind])}` : ""}</p>
          <p className="text-[1.563rem] font-bold">{order.id}</p>
          {order.voucher && <p className="font-bold">{t(order.redeemedAt ? copy.voucherUsed : copy.voucherOpen)}</p>}
          <p>{t(copy.forPatient)}: {patient?.name ?? ""}</p>
          <p>{t(copy.delivery)}: {t(order.needsDelivery ? copy.yes : copy.no)}</p>

          <h2>{t(copy.rxLabel)}</h2>
          {meals ? (
            <>
              <p className="font-bold">{t(copy.weekMeals)}</p>
              {dishes.length > 0 && (
                <>
                  <h3>{t(plan?.source === "ai" ? copy.menu : copy.menuSample)}</h3>
                  <ul className="list-disc space-y-1 pl-6">{dishes.map((d, i) => <li key={i}>{d}</li>)}</ul>
                </>
              )}
              {rx && rx.avoid.length > 0 && <p><strong>{t(copy.avoid)}:</strong> {rx.avoid.join(", ")}</p>}
              {rx && <p>{t(copy.goal)}: {rx.carbTarget} g {t({ es: "de carbohidratos por comida", en: "of carbs per meal" })}</p>}
            </>
          ) : (
            <>
              <p className="font-bold">{t(copy.voucher)}</p>
              {place && (
                <>
                  <h3>{t(copy.pack)}</h3>
                  <ul className="list-disc space-y-1 pl-6">{place.stock.map((it, i) => <li key={i}>{t(it)}</li>)}</ul>
                </>
              )}
            </>
          )}

          <div aria-live="polite" className="flex flex-col gap-3">
            <p className="font-bold">{t(copy.status)}: {t(statusWord[order.status])}</p>
            {order.status === "delivered" && (
              <p className="flex items-center gap-2 font-bold text-brand"><Icon name="check" /> {t(copy.complete)}</p>
            )}
          </div>
          {next && (
            <BigButton onClick={(e) => advance(e.timeStamp, patientId, order, next)}>{t(markWord[next])}</BigButton>
          )}
          {failed === order.id && <p role="alert" className="font-bold text-stop">{t(copy.failed)}</p>}
        </Card>
        );
      })}

      <div className="flex flex-col items-start gap-2">
        <Tag>{t(common.simulated)}</Tag>
        <p>{t(copy.pitch)}</p>
      </div>
      <BigButton href="/" variant="quiet" icon="home">{t(copy.home)}</BigButton>
    </Page>
  );
}

/** Redemption is its own step: the server accepts each code once, at the place it was issued for. */
function RedeemBox({ names }: { names: Record<string, string> }) {
  const { t } = useT();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: true; name: string } | { ok: false; reason: RedeemReason } | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    const r = await redeemVoucher(code);
    setBusy(false);
    setResult(r.ok ? { ok: true, name: names[r.patientId] ?? "" } : r);
    if (r.ok) setCode("");
  };
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded-2xl border-[3px] border-brand bg-panel p-5">
      <h2>{t(copy.redeemTitle)}</h2>
      <Field label={t(copy.code)} hint={t(copy.codeHint)} autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={20} value={code}
        onChange={(v) => { setCode(v); setResult(null); }} />
      <button type="submit" disabled={busy} className="inline-flex min-h-[64px] w-full items-center justify-center gap-3 rounded-2xl border-[3px] border-brand bg-brand px-6 py-4 text-[1.25rem] font-bold text-white hover:bg-brand-dark disabled:opacity-60">
        <Icon name="check" /> {busy ? t(common.loading) : t(copy.redeem)}
      </button>
      {result && (result.ok
        ? <p role="status" className="flex items-center gap-2 text-[1.25rem] font-bold text-brand"><Icon name="check" /> {t(copy.redeemed)}{result.name ? `: ${result.name}` : ""}.</p>
        : <p role="alert" className="text-[1.25rem] font-bold text-stop">{t(redeemErr[result.reason])}</p>)}
    </form>
  );
}
