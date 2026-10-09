// Non-AI fallbacks. Used when there is no API key, the network is down, or a call times out.
// They keep the demo running and are always labeled as fallback in the interface.
import type { IntakeAnswers, IntakeSummary, Lang, Light, Plan, PlanDay, Rx, VisitSummary } from "./types";
import { lightFor } from "./foods";

const es = (lang: Lang) => lang === "es";

export function fallbackIntakeSummary(a: IntakeAnswers, lang: Lang): IntakeSummary {
  const S = es(lang);
  const points: string[] = [];
  const feel = { good: S ? "Se siente bien hoy." : "Feels well today.", ok: S ? "Se siente regular hoy." : "Feels so-so today.", bad: S ? "Se siente mal hoy." : "Feels unwell today." };
  if (a.feeling) points.push(feel[a.feeling]);
  if (a.concern) points.push((S ? "Le preocupa: " : "Main concern: ") + a.concern);
  const cook = { yes: S ? "Puede cocinar en casa." : "Can cook at home.", sometimes: S ? "Cocina a veces." : "Cooks sometimes.", no: S ? "No puede cocinar en casa." : "Cannot cook at home." };
  if (a.canCook) points.push(cook[a.canCook]);
  const barriers: string[] = [];
  if (a.canCook === "no") barriers.push(S ? "No cocina" : "Does not cook");
  if (a.canTravel === "no") barriers.push(S ? "Sin transporte a la tienda" : "No transport to the store");
  const avoid = (a.avoid ?? "").split(/[,;\n]| y | and /).map((x) => x.trim()).filter((x) => x && !/^(no|nada|ninguna|none|nothing)$/i.test(x));
  return {
    headline: S ? "Respuestas del paciente antes de la cita" : "Patient answers before the visit",
    keyPoints: points.length ? points : [S ? "El paciente no contestó las preguntas." : "The patient did not answer the questions."],
    foodPattern: a.typicalDay || (S ? "No lo dijo." : "Not stated."),
    barriers,
    flags: a.feeling === "bad" ? [S ? "Dijo que se siente mal hoy. Pregunte por qué." : "Said they feel unwell today. Ask why."] : [],
    suggestedType: a.canCook === "no" ? "meals" : "produce",
    suggestedDelivery: a.canTravel === "no",
    avoid,
    source: "fallback",
  };
}

export function fallbackVisitSummary(rx: Rx): VisitSummary {
  const points = [
    rx.type === "produce"
      ? { es: `Su clínico le recetó frutas, vegetales y viandas frescas por ${rx.weeks} semanas.`, en: `Your clinician prescribed fresh fruits, vegetables and root vegetables for ${rx.weeks} weeks.` }
      : { es: `Su clínico le recetó comidas preparadas por ${rx.weeks} semanas.`, en: `Your clinician prescribed prepared meals for ${rx.weeks} weeks.` },
    { es: `Su meta es cerca de ${rx.carbTarget} gramos de carbohidratos en cada comida.`, en: `Your goal is about ${rx.carbTarget} grams of carbohydrates at each meal.` },
    rx.needsDelivery
      ? { es: "Le llevarán la comida a su casa.", en: "Your food will be brought to your home." }
      : { es: "Usted recoge la comida en un lugar cerca de su casa.", en: "You pick up your food at a place near your home." },
  ];
  if (rx.avoid.length) points.push({ es: `Su plan no tendrá: ${rx.avoid.join(", ")}.`, en: `Your plan will not include: ${rx.avoid.join(", ")}.` });
  if (rx.note.trim()) points.push({ es: `Nota de su clínico: ${rx.note.trim()}`, en: `Note from your clinician: ${rx.note.trim()}` });
  return { points, source: "fallback" };
}

type Row = [string, string, string, string, number]; // dish es, dish en, portion es, portion en, carbs
const produce: Row[][] = [
  [["Avena con papaya", "Oatmeal with papaya", "1/2 taza de avena, 1/2 taza de fruta", "1/2 cup oats, 1/2 cup fruit", 35], ["Pollo guisado con calabaza y ensalada", "Stewed chicken with squash and salad", "1 presa, 1/2 taza de calabaza", "1 piece, 1/2 cup squash", 25], ["Habichuelas guisadas con arroz integral", "Stewed beans with brown rice", "1/2 taza de cada uno", "1/2 cup of each", 40]],
  [["Revoltillo con espinaca y medio pan", "Scrambled eggs with spinach and half a roll", "2 huevos, 1/2 pan", "2 eggs, 1/2 roll", 15], ["Bacalao guisado con guineítos verdes", "Stewed salt cod with green bananas", "3 onzas, 2 guineítos", "3 oz, 2 small bananas", 35], ["Berenjena guisada con huevo", "Stewed eggplant with egg", "1 taza", "1 cup", 15]],
  [["Queso del país con china", "Local white cheese with an orange", "2 lonjas, 1 china", "2 slices, 1 orange", 15], ["Pescado al mojo con batata hervida", "Fish in mojo with boiled sweet potato", "1 filete, 1/2 taza de batata", "1 fillet, 1/2 cup sweet potato", 25], ["Sopa de pollo con chayote y zanahoria", "Chicken soup with chayote and carrot", "1 1/2 tazas", "1.5 cups", 20]],
  [["Avena con canela", "Oatmeal with cinnamon", "1/2 taza", "1/2 cup", 27], ["Arroz con gandules y ensalada de repollo", "Rice with pigeon peas and cabbage salad", "1/2 taza de arroz, 1 taza de ensalada", "1/2 cup rice, 1 cup salad", 30], ["Pollo al horno con quimbombó", "Baked chicken with okra", "1 presa, 1 taza", "1 piece, 1 cup", 12]],
  [["Huevo hervido con aguacate y medio pan", "Boiled egg with avocado and half a roll", "1 huevo, 1/4 de aguacate, 1/2 pan", "1 egg, 1/4 avocado, 1/2 roll", 18], ["Habichuelas rosadas con calabaza y arroz integral", "Pink beans with squash and brown rice", "1/2 taza de cada uno", "1/2 cup of each", 42], ["Ensalada de pepinillo y tomate con pescado", "Cucumber and tomato salad with fish", "1 filete, 1 taza de ensalada", "1 fillet, 1 cup salad", 10]],
  [["Papaya con queso del país", "Papaya with local white cheese", "1 taza, 2 lonjas", "1 cup, 2 slices", 16], ["Pollo guisado con yuca hervida", "Stewed chicken with boiled cassava", "1 presa, 1/3 de taza de yuca", "1 piece, 1/3 cup cassava", 22], ["Revoltillo con pimientos y habichuelas tiernas", "Scrambled eggs with peppers and green beans", "2 huevos, 1 taza", "2 eggs, 1 cup", 12]],
  [["Avena con piña", "Oatmeal with pineapple", "1/2 taza de avena, 1/2 taza de piña", "1/2 cup oats, 1/2 cup pineapple", 38], ["Pernil magro con ensalada y 2 tostones", "Lean roast pork with salad and 2 tostones", "3 onzas, 2 tostones", "3 oz, 2 tostones", 16], ["Sopa de vegetales con pollo", "Vegetable soup with chicken", "1 1/2 tazas", "1.5 cups", 18]],
];
const meals: Row[][] = [
  [["Revoltillo con espinaca", "Scrambled eggs with spinach", "1 porción", "1 serving", 8], ["Pollo guisado con ensalada", "Stewed chicken with salad", "1 plato", "1 plate", 20], ["Sopa de pollo con vegetales", "Chicken soup with vegetables", "1 1/2 tazas", "1.5 cups", 20]],
  [["Avena con canela", "Oatmeal with cinnamon", "1/2 taza", "1/2 cup", 27], ["Bacalao guisado con vianda pequeña", "Stewed salt cod with a small root portion", "1 plato", "1 plate", 30], ["Berenjena guisada con huevo", "Stewed eggplant with egg", "1 plato", "1 plate", 15]],
  [["Huevo hervido con medio pan", "Boiled egg with half a roll", "1 huevo, 1/2 pan", "1 egg, 1/2 roll", 14], ["Habichuelas guisadas con calabaza", "Stewed beans with squash", "1 plato", "1 plate", 35], ["Pescado al mojo con vegetales", "Fish in mojo with vegetables", "1 plato", "1 plate", 12]],
  [["Revoltillo con espinaca", "Scrambled eggs with spinach", "1 porción", "1 serving", 8], ["Pavo guisado con chayote", "Stewed turkey with chayote", "1 plato", "1 plate", 18], ["Ensalada de carrucho", "Conch salad", "1 plato", "1 plate", 10]],
  [["Avena con fruta", "Oatmeal with fruit", "1/2 taza de cada uno", "1/2 cup of each", 35], ["Pernil magro con ensalada de repollo", "Lean roast pork with cabbage salad", "1 plato", "1 plate", 12], ["Sopa de pollo con vegetales", "Chicken soup with vegetables", "1 1/2 tazas", "1.5 cups", 20]],
  [["Huevo hervido con medio pan", "Boiled egg with half a roll", "1 huevo, 1/2 pan", "1 egg, 1/2 roll", 14], ["Pollo guisado con ensalada", "Stewed chicken with salad", "1 plato", "1 plate", 20], ["Berenjena guisada con huevo", "Stewed eggplant with egg", "1 plato", "1 plate", 15]],
  [["Revoltillo con espinaca", "Scrambled eggs with spinach", "1 porción", "1 serving", 8], ["Pescado al mojo con vegetales", "Fish in mojo with vegetables", "1 plato", "1 plate", 12], ["Habichuelas guisadas con calabaza", "Stewed beans with squash", "1 plato", "1 plate", 35]],
];
const dayNames = { es: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"], en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] };
const slots = ["desayuno", "almuerzo", "cena"] as const;

export function fallbackPlan(rx: Rx, lang: Lang): Plan {
  const S = es(lang);
  const src = rx.type === "produce" ? produce : meals;
  const days: PlanDay[] = src.map((rows, d) => ({
    day: dayNames[lang][d],
    meals: rows.map((r, i) => ({ meal: slots[i], dish: S ? r[0] : r[1], portion: S ? r[2] : r[3], carbs: r[4], light: lightFor(r[4], r[4], rx.carbTarget) as Light })),
  }));
  const shopping =
    rx.type === "produce"
      ? [
          [S ? "Pollo fresco" : "Fresh chicken", S ? "3 libras" : "3 lb"], [S ? "Huevos del país" : "Local eggs", S ? "1 docena" : "1 dozen"], [S ? "Calabaza" : "Pumpkin squash", S ? "2 libras" : "2 lb"],
          [S ? "Habichuelas rosadas" : "Pink beans", S ? "1 libra" : "1 lb"], [S ? "Espinaca" : "Spinach", S ? "2 mazos" : "2 bunches"], [S ? "Berenjena" : "Eggplant", "2"],
          [S ? "Batata" : "Sweet potato", S ? "1 libra" : "1 lb"], [S ? "Papaya" : "Papaya", "1"], [S ? "Avena" : "Oats", S ? "1 paquete" : "1 package"], [S ? "Pescado fresco" : "Fresh fish", S ? "1 libra" : "1 lb"],
        ]
      : Array.from(new Set(src.flatMap((rows) => rows.slice(1).map((r) => (S ? r[0] : r[1]))))).map((d) => [d, S ? "esta semana" : "this week"]);
  return {
    days,
    shopping: shopping.map(([item, qty]) => ({ item, qty })),
    tip: S ? "Llene la mitad del plato con vegetales. Tome agua con sus comidas." : "Fill half your plate with vegetables. Drink water with your meals.",
    source: "fallback",
  };
}
