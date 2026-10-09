"use client";
import { BigButton, Card, Page } from "@/components/ui";
import { common, useT } from "@/lib/i18n";
import type { L10n } from "@/lib/types";

const sections: { title: L10n; items: L10n[] }[] = [
  {
    title: { es: "Lo que funciona de verdad", en: "What really works" },
    items: [
      { es: "Preguntas antes de la cita, con voz o texto, y resumen para el clínico hecho con IA.", en: "Pre-visit questions by voice or text, and an AI summary for the clinician." },
      { es: "Receta de comida del clínico y nota en palabras sencillas para el paciente.", en: "The clinician's food prescription and a plain-language note for the patient." },
      { es: "Plan de la semana hecho con IA, con lo que hay en las tiendas.", en: "A weekly plan made with AI from what stores have in stock." },
      { es: "Estimado de carbohidratos de platos locales, basado primero en nuestra tabla de comida local.", en: "Carbohydrate estimates for local dishes, grounded first in our local food table." },
      { es: "Foto del plato: la IA solo nombra los platos que ve; la persona los confirma y los números salen de la tabla. La foto no se guarda.", en: "Photo of the plate: the AI only names the dishes it sees; the person confirms them and the numbers come from the table. The photo is not saved." },
      { es: "Pedido en colmado, finca o cocina, y vista del negocio.", en: "Ordering from a store, farm or kitchen, and the business view." },
      { es: "Español e inglés, letra grande, lectura en voz alta.", en: "Spanish and English, large text, read aloud." },
    ],
  },
  {
    title: { es: "Lo que es simulado", en: "What is simulated" },
    items: [
      { es: "Los pacientes. No hay datos de personas reales.", en: "The patients. There is no data about real people." },
      { es: "Los colmados, fincas y cocinas, y lo que tienen en inventario.", en: "The stores, farms and kitchens, and their stock." },
      { es: "El estado del pedido, la entrega y el pago del vale.", en: "Order status, delivery and voucher payment." },
      { es: "Los datos se guardan solo en este navegador.", en: "Data is kept only in this browser." },
    ],
  },
  {
    title: { es: "Lo que la aplicación nunca hace", en: "What the app never does" },
    items: [
      { es: "No diagnostica.", en: "It does not diagnose." },
      { es: "No recomienda ni ajusta insulina ni medicamentos.", en: "It does not recommend or adjust insulin or medication." },
      { es: "No decide la meta de carbohidratos. La decide el clínico.", en: "It does not set the carbohydrate goal. The clinician does." },
      { es: "No presenta los números como exactos. Son estimados.", en: "It does not present numbers as exact. They are estimates." },
    ],
  },
  {
    title: { es: "Fuentes y créditos", en: "Sources and credits" },
    items: [
      { es: "Tabla de comida local, 30 platos: 14 comparados directamente con USDA FoodData Central, 10 con el alimento más parecido, y 6 todavía sin fuente. Una profesional de cuidado de diabetes revisó 15 de los platos más comunes.", en: "Local food table, 30 dishes: 14 matched directly to USDA FoodData Central, 10 to the closest food, and 6 still without a source. A diabetes care professional reviewed 15 of the most common dishes." },
      { es: "Inteligencia artificial: Claude, de Anthropic.", en: "AI: Claude, by Anthropic." },
      { es: "Tipografía: Atkinson Hyperlegible, del Braille Institute, hecha para personas con baja visión.", en: "Typeface: Atkinson Hyperlegible, by the Braille Institute, made for people with low vision." },
    ],
  },
];

export default function About() {
  const { t } = useT();
  return (
    <Page>
      <h1>{t(common.about)}</h1>
      {sections.map((s) => (
        <Card key={s.title.en}>
          <h2>{t(s.title)}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            {s.items.map((i) => <li key={i.en}>{t(i)}</li>)}
          </ul>
        </Card>
      ))}
      <BigButton variant="quiet" href="/" icon="home">{t(common.home)}</BigButton>
    </Page>
  );
}
