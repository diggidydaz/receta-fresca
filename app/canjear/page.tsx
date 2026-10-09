"use client";
import { useEffect, useRef, useState } from "react";
import { BigButton, Busy, Card, ChoiceGroup, Notice, Page, Tag } from "@/components/ui";
import { Icon } from "@/components/Icon";
import placesData from "@/data/places.json";
import { common, useT } from "@/lib/i18n";
import { setState, useAppState, useHydrated } from "@/lib/store";
import type { L10n, Order, OrderStatus, Place } from "@/lib/types";

const places = placesData as Place[];

function makeOrderId(): string {
  return "RF-" + String(Math.floor(Math.random() * 10000)).padStart(4, "0");
}

const copy = {
  noRx: { es: "Su clínico todavía no le ha enviado una receta.", en: "Your clinician has not sent you a prescription yet." },
  back: { es: "Volver a mi página", en: "Back to my page" },
  whereProduce: { es: "¿Dónde quiere recoger su comida?", en: "Where do you want to pick up your food?" },
  whereMeals: { es: "¿Qué cocina quiere que prepare sus comidas?", en: "Which kitchen do you want to prepare your meals?" },
  stock: { es: "Lo que tienen esta semana", en: "What they have this week" },
  delivery: { es: "Necesito que me lo traigan a casa", en: "I need it brought to my home" },
  noDelivery: { es: "Este lugar no hace entregas. Escoja otro o quite la marca.", en: "This place does not deliver. Choose another or uncheck the box." },
  pickFirst: { es: "Escoja un lugar primero.", en: "Choose a place first." },
  confirm: { es: "Confirmar", en: "Confirm" },
  yourOrder: { es: "Su pedido", en: "Your order" },
  show: { es: "Enseñe este número", en: "Show this number" },
  done: { es: "Hecho", en: "Done" },
  now: { es: "Ahora", en: "Now" },
  later: { es: "Falta", en: "Still to come" },
  simNote: { es: "El estado lo cambia el negocio en esta demostración.", en: "The business changes the status in this demo." },
  asBiz: { es: "Ver como negocio", en: "View as the business" },
  change: { es: "Cambiar de lugar", en: "Change place" },
};

const kindLabel: Record<Place["kind"], L10n> = {
  colmado: { es: "Colmado", en: "Corner store" },
  finca: { es: "Finca", en: "Farm" },
  cocina: { es: "Cocina local", en: "Local kitchen" },
};

const steps = (delivery: boolean): { key: OrderStatus; label: L10n }[] => [
  { key: "received", label: { es: "Recibido", en: "Received" } },
  { key: "preparing", label: { es: "Preparando", en: "Preparing" } },
  { key: "ready", label: delivery ? { es: "En camino", en: "On the way" } : { es: "Listo para recoger", en: "Ready to pick up" } },
  { key: "delivered", label: { es: "Entregado", en: "Delivered" } },
];

export default function CanjearPage() {
  const { t } = useT();
  const s = useAppState();
  const hydrated = useHydrated();
  const [placeId, setPlaceId] = useState<string | undefined>();
  const [delivery, setDelivery] = useState<boolean | null>(null);
  const [error, setError] = useState<"pick" | "deliver" | null>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const orderId = s.order?.id;
  // When the order appears, move focus to its heading so it is announced and a second tap cannot hit another button.
  useEffect(() => { if (orderId) headRef.current?.focus(); }, [orderId]);

  if (!hydrated) return <Page><Busy /></Page>;
  const back = <BigButton href="/paciente" variant="quiet" icon="left">{t(copy.back)}</BigButton>;
  const rx = s.rx;

  if (!rx) {
    return (
      <Page>
        <h1>{t({ es: "Recoger mi comida", en: "Pick up my food" })}</h1>
        <Notice><p className="text-[1.25rem]">{t(copy.noRx)}</p></Notice>
        {back}
      </Page>
    );
  }

  if (s.order) {
    const o = s.order;
    const place = places.find((p) => p.id === o.placeId);
    const list = steps(o.needsDelivery);
    const cur = list.findIndex((x) => x.key === o.status);
    const allDone = o.status === "delivered";
    return (
      <Page>
        <h1 ref={headRef} tabIndex={-1} className="outline-none">{t(copy.yourOrder)}{place ? `: ${place.name}` : ""}</h1>
        <Card>
          <p className="text-[1.563rem] font-bold">{t(copy.show)}: {o.id}</p>
        </Card>
        <ol className="flex flex-col gap-3">
          {list.map((st, i) => {
            const done = allDone || i < cur;
            const isNow = !allDone && i === cur;
            return (
              <li key={st.key} className={`flex min-h-[64px] flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl p-4 ${isNow ? "border-[4px] border-brand bg-brand-soft font-bold" : "border-2 border-rule bg-panel"}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] ${done ? "border-brand bg-brand text-white" : "border-rule bg-panel text-transparent"}`}>
                  <Icon name="check" size={22} />
                </span>
                <span className="min-w-0 flex-1 text-[1.25rem] [overflow-wrap:anywhere]">{t(st.label)}</span>
                <span className={`text-[1.1rem] ${isNow ? "font-bold" : ""}`}>{t(done ? copy.done : isNow ? copy.now : copy.later)}</span>
              </li>
            );
          })}
        </ol>
        <div className="flex flex-col items-start gap-2">
          <Tag>{t(common.simulated)}</Tag>
          <p className="text-muted">{t(copy.simNote)}</p>
        </div>
        <BigButton href="/negocio" variant="secondary" icon="store">{t(copy.asBiz)}</BigButton>
        <BigButton variant="quiet" onClick={() => { if (Date.now() - new Date(o.createdAt).getTime() > 1500) setState({ order: null }); }}>{t(copy.change)}</BigButton>
        {back}
      </Page>
    );
  }

  const meals = rx.type === "meals";
  const options = places.filter((p) => (meals ? p.kind === "cocina" : p.kind === "colmado" || p.kind === "finca"));
  const place = options.find((p) => p.id === placeId);
  const wantsDelivery = delivery ?? rx.needsDelivery;
  const blocked = Boolean(place && wantsDelivery && !place.delivers);

  const confirm = () => {
    if (!place) { setError("pick"); return; }
    if (blocked) { setError("deliver"); return; }
    setError(null);
    const order: Order = {
      id: makeOrderId(),
      placeId: place.id,
      needsDelivery: wantsDelivery,
      status: "received",
      createdAt: new Date().toISOString(),
    };
    setState({ order });
  };

  return (
    <Page>
      <h1>{t(meals ? copy.whereMeals : copy.whereProduce)}</h1>
      <ChoiceGroup
        legend={t(meals ? copy.whereMeals : copy.whereProduce)}
        hideLegend
        name="place"
        value={placeId}
        onChange={(v) => { setPlaceId(v); setError(null); }}
        options={options.map((p) => ({ value: p.id, label: p.name, hint: `${t(kindLabel[p.kind])} · ${p.town} · ${t(p.hours)}` }))}
      />
      {place && (
        <Card className="flex flex-col gap-3">
          <h2>{t(copy.stock)}</h2>
          <ul className="list-disc space-y-1 pl-6 text-[1.25rem]">
            {place.stock.map((it, i) => <li key={i}>{t(it)}</li>)}
          </ul>
          <div><Tag>{t(common.simulated)}</Tag></div>
        </Card>
      )}
      <label className="flex min-h-[64px] cursor-pointer items-center gap-4 rounded-2xl border-[3px] border-rule bg-panel px-5 py-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-4 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus">
        <input type="checkbox" checked={wantsDelivery} onChange={(e) => { setDelivery(e.target.checked); setError(null); }} className="h-8 w-8 shrink-0 accent-brand" />
        <span className="text-[1.25rem] font-bold">{t(copy.delivery)}</span>
      </label>
      {blocked && (
        <Notice tone="warn"><p role="alert" className="text-[1.25rem] font-bold">{t(copy.noDelivery)}</p></Notice>
      )}
      {error === "pick" && <p role="alert" className="text-[1.25rem] font-bold text-stop">{t(copy.pickFirst)}</p>}
      <BigButton icon="check" onClick={confirm}>{t(copy.confirm)}</BigButton>
      {back}
    </Page>
  );
}
