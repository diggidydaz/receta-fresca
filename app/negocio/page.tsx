"use client";
import { useRef } from "react";
import { BigButton, Busy, Card, Notice, Page, Tag } from "@/components/ui";
import { Icon } from "@/components/Icon";
import patientsData from "@/data/patients.json";
import placesData from "@/data/places.json";
import { common, useT } from "@/lib/i18n";
import { listOrders, setPatientState, useAppState, useHydrated } from "@/lib/store";
import type { L10n, Order, OrderStatus, Patient, Place } from "@/lib/types";

const places = placesData as Place[];
const patients = patientsData as Patient[];

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
  pitch: { es: "El negocio recibe el pago del vale cuando entrega el pedido.", en: "The business is paid for the voucher when it delivers the order." },
  home: { es: "Inicio", en: "Home" },
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
  if (!hydrated) return <Page><Busy /></Page>;

  const orders = listOrders(s);
  // A second tap within a moment is ignored, so one tap never skips a status.
  const advance = (now: number, patientId: string, order: Order, next: OrderStatus) => {
    if (now - lastTap.current < 700) return;
    lastTap.current = now;
    setPatientState(patientId, { order: { ...order, status: next } });
  };

  return (
    <Page>
      <h1>{t(copy.title)}</h1>
      <div><Tag>{t(common.simulated)}</Tag></div>

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
