"use client";
import { useAppState } from "./store";
import type { L10n, Lang } from "./types";

/** Returns the current language and a picker for {es, en} pairs. Spanish is the default. */
export function useT(): { lang: Lang; t: (s: L10n) => string } {
  const { lang } = useAppState();
  return { lang, t: (s) => s[lang] ?? s.es };
}

/** Strings shared by more than one screen. Screen-specific copy lives next to its screen. */
export const common = {
  appName: { es: "Receta Fresca", en: "Receta Fresca" },
  tagline: { es: "La comida es medicina, y es de aquí.", en: "Food is medicine, sourced locally." },
  back: { es: "Atrás", en: "Back" },
  next: { es: "Siguiente", en: "Next" },
  home: { es: "Inicio", en: "Home" },
  done: { es: "Listo", en: "Done" },
  yes: { es: "Sí", en: "Yes" },
  no: { es: "No", en: "No" },
  loading: { es: "Un momento, por favor…", en: "One moment, please…" },
  sample: { es: "Demostración con datos de ejemplo. No son pacientes reales.", en: "Demo with sample data. These are not real patients." },
  estimate: { es: "Estimado", en: "Estimate" },
  notAdvice: { es: "Esto es un estimado, no un consejo médico. Su clínico decide.", en: "This is an estimate, not medical advice. Your clinician decides." },
  callClinician: { es: "Si se siente mal, llame a su clínico. En una emergencia, llame al 911.", en: "If you feel unwell, call your clinician. In an emergency, call 911." },
  green: { es: "Verde", en: "Green" },
  yellow: { es: "Amarillo", en: "Yellow" },
  red: { es: "Rojo", en: "Red" },
  greenHint: { es: "Va bien con su meta", en: "Fits your goal" },
  yellowHint: { es: "Un poco sobre su meta", en: "A little over your goal" },
  redHint: { es: "Muy sobre su meta", en: "Well over your goal" },
  carbs: { es: "carbohidratos", en: "carbs" },
  skip: { es: "Saltar al contenido", en: "Skip to content" },
  about: { es: "Qué es real y qué es simulado", en: "What is real and what is simulated" },
  simulated: { es: "Simulado", en: "Simulated" },
} satisfies Record<string, L10n>;
