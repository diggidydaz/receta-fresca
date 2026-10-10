"use client";
// A business says what it has this week. New weekly plans are built from this, and the business sees
// what the plans are asking for (a demand signal), so it knows what is worth stocking.
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { BigButton, Busy, Card, ChoiceGroup, Notice, Page, Tag } from "@/components/ui";
import { daysSince } from "@/lib/care";
import { common, useT } from "@/lib/i18n";
import { basePlaces, catalogFor, effectivePlaces } from "@/lib/places";
import { allPatients, setState, useAppState, useHydrated } from "@/lib/store";
import type { L10n, Place } from "@/lib/types";

const copy = {
  title: { es: "Lo que tengo esta semana", en: "What I have this week" },
  which: { es: "¿Cuál es su negocio?", en: "Which business are you?" },
  have: { es: "Marque lo que tiene", en: "Tick what you have" },
  haveDishes: { es: "Marque los platos que prepara esta semana", en: "Tick the dishes you make this week" },
  add: { es: "Añadir otra cosa", en: "Add something else" },
  addBtn: { es: "Añadir", en: "Add" },
  save: { es: "Guardar", en: "Save" },
  saved: { es: "Guardado. Los planes nuevos usarán esta lista.", en: "Saved. New plans will use this list." },
  noneTicked: { es: "Marque por lo menos una cosa.", en: "Tick at least one thing." },
  updatedToday: { es: "Actualizado hoy", en: "Updated today" },
  updatedDays: { es: "Actualizado hace", en: "Updated" },
  daysAgo: { es: "días", en: "days ago" },
  notUpdated: { es: "Lista de ejemplo, todavía sin actualizar", en: "Sample list, not updated yet" },
  demand: { es: "Lo que piden los planes de sus clientes", en: "What your customers' plans ask for" },
  demandNone: { es: "Todavía no hay planes que pidan cosas de aquí.", en: "No plans are asking for anything from here yet." },
  plans: { es: "planes", en: "plans" },
  orders: { es: "Pedidos abiertos aquí", en: "Open orders here" },
  back: { es: "Volver a pedidos", en: "Back to orders" },
};

const kindLabel: Record<Place["kind"], L10n> = {
  colmado: { es: "Colmado", en: "Corner store" },
  finca: { es: "Finca", en: "Farm" },
  cocina: { es: "Cocina local", en: "Local kitchen" },
};

const norm = (x: string) => x.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function Editor({ place, initial, onSave }: { place: Place; initial: L10n[]; onSave: (items: L10n[]) => void }) {
  const { t } = useT();
  const [items, setItems] = useState<L10n[]>(() => {
    const cat = catalogFor(place.kind);
    return [...cat, ...initial.filter((i) => !cat.some((c) => c.es === i.es))];
  });
  const [on, setOn] = useState<Set<string>>(() => new Set(initial.map((i) => i.es)));
  const [extra, setExtra] = useState("");
  const [msg, setMsg] = useState<"saved" | "noneTicked" | null>(null);
  const toggle = (es: string) => { setOn((o) => { const n = new Set(o); if (n.has(es)) n.delete(es); else n.add(es); return n; }); setMsg(null); };
  const add = () => {
    const v = extra.trim().slice(0, 60);
    if (!v) return;
    // A business types in its own words; the same words are used in both languages.
    if (!items.some((i) => i.es === v)) setItems((x) => [...x, { es: v, en: v }]);
    setOn((o) => new Set(o).add(v));
    setExtra(""); setMsg(null);
  };
  const save = () => {
    const chosen = items.filter((i) => on.has(i.es));
    if (chosen.length === 0) { setMsg("noneTicked"); return; }
    onSave(chosen); setMsg("saved");
  };
  const id = `extra-${place.id}`;
  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex min-w-0 flex-col gap-2">
        <legend className="mb-2 text-[1.25rem] font-bold">{t(place.kind === "cocina" ? copy.haveDishes : copy.have)}</legend>
        {items.map((it) => {
          const checked = on.has(it.es);
          return (
            <label key={it.es} className={`flex min-h-[64px] cursor-pointer items-center gap-4 rounded-2xl border-[3px] px-4 py-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-4 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${checked ? "border-brand bg-brand-soft" : "border-rule bg-panel"}`}>
              <input type="checkbox" checked={checked} onChange={() => toggle(it.es)} className="h-8 w-8 shrink-0 accent-brand" />
              <span className="min-w-0 flex-1 text-[1.25rem] font-bold [overflow-wrap:anywhere]">{t(it)}</span>
            </label>
          );
        })}
      </fieldset>
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="font-bold">{t(copy.add)}</label>
        <input id={id} value={extra} maxLength={60} onChange={(e) => setExtra(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }}
          className="min-h-[56px] w-full rounded-2xl border-[3px] border-rule bg-panel px-4 text-[1.25rem]" />
        <BigButton variant="secondary" icon="check" onClick={add}>{t(copy.addBtn)}</BigButton>
      </div>
      <BigButton icon="check" onClick={save}>{t(copy.save)}</BigButton>
      <p role="status" className={`text-[1.25rem] font-bold ${msg === "noneTicked" ? "text-stop" : "text-brand"}`}>{msg ? t(copy[msg]) : ""}</p>
    </div>
  );
}

export default function InventarioPage() {
  const { t } = useT();
  const s = useAppState();
  const hydrated = useHydrated();
  const [placeId, setPlaceId] = useState<string | undefined>();
  if (!hydrated) return <Page><Busy /></Page>;

  const places = effectivePlaces(s.stock);
  const place = places.find((p) => p.id === placeId);
  const upd = placeId ? s.stock[placeId] : undefined;
  const age = upd ? daysSince(upd.at) : null;

  // Demand: how many current plans mention each thing this place offers.
  const records = Object.values(allPatients(s));
  const demand = place
    ? place.stock
        .map((it) => {
          const words = [norm(it.es), norm(it.en)];
          const n = records.filter((p) => {
            if (!p.rx || !p.plan || (p.rx.type === "meals") !== (place.kind === "cocina")) return false;
            const text = norm([...p.plan.shopping.map((x) => x.item), ...p.plan.days.flatMap((d) => d.meals.map((m) => m.dish))].join(" | "));
            // A kitchen's dish must appear whole; for produce the main word is enough ("Calabaza" in "Pollo con calabaza").
            return words.some((w) => text.includes(place.kind === "cocina" ? w : w.split(" ")[0]));
          }).length;
          return { it, n };
        })
        .filter((d) => d.n > 0)
        .sort((a, b) => b.n - a.n)
    : [];
  const openOrders = place ? records.filter((p) => p.order?.placeId === place.id && p.order.status !== "delivered").length : 0;

  return (
    <Page>
      <h1>{t(copy.title)}</h1>
      <div><Tag>{t(common.simulated)}</Tag></div>
      <ChoiceGroup legend={t(copy.which)} name="biz" value={placeId} onChange={setPlaceId}
        options={basePlaces.map((p) => ({ value: p.id, label: p.name, hint: `${t(kindLabel[p.kind])} · ${p.town}`, icon: "store" }))} />

      {place && (
        <>
          <p className="flex items-center gap-2 text-[1.1rem] font-bold">
            <Icon name="calendar" />
            {age === null ? t(copy.notUpdated) : age === 0 ? t(copy.updatedToday) : `${t(copy.updatedDays)} ${age} ${t(copy.daysAgo)}`}
          </p>
          <Card className="flex flex-col gap-3">
            <h2>{t(copy.demand)}</h2>
            {demand.length === 0 ? <p>{t(copy.demandNone)}</p> : (
              <ul className="list-disc pl-6">{demand.map((d) => <li key={d.it.es}>{t(d.it)}: {d.n} {t(copy.plans)}</li>)}</ul>
            )}
            <p><strong>{t(copy.orders)}:</strong> {openOrders}</p>
          </Card>
          <Editor key={place.id} place={place} initial={place.stock}
            onSave={(items) => setState({ stock: { ...s.stock, [place.id]: { items, at: new Date().toISOString() } } })} />
        </>
      )}
      {!place && <Notice><p>{t(copy.which)}</p></Notice>}
      <BigButton href="/negocio" variant="quiet" icon="left">{t(copy.back)}</BigButton>
    </Page>
  );
}
