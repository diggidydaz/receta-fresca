export type Lang = "es" | "en";
export type Light = "green" | "yellow" | "red";
export type RxType = "produce" | "meals";
export type L10n = { es: string; en: string };

export type Food = {
  id: string;
  name: string;            // local name, same in both languages
  aliases: string[];       // lowercase, no accents
  region: "PR" | "USVI" | "PR/USVI";
  serving: L10n;
  carbsMin: number;
  carbsMax: number;
  swap: L10n;
  verified: boolean;       // true = matched directly to a USDA FoodData Central entry
  clinicianReviewed: boolean; // true = range looked over by a diabetes care professional
  source: { match: "direct" | "closest" | "none"; fdcId?: number; description?: string; basis?: string };
};

export type Place = {
  id: string;
  kind: "colmado" | "finca" | "cocina";
  name: string;
  town: string;
  hours: L10n;
  delivers: boolean;
  stock: L10n[];           // produce in stock (colmado, finca) or dishes offered (cocina)
};

export type Patient = { id: string; name: string; age: number; town: string; note: L10n };

export type IntakeAnswers = {
  feeling?: "good" | "ok" | "bad";
  concern?: string;
  typicalDay?: string;
  canCook?: "yes" | "sometimes" | "no";
  canTravel?: "yes" | "no";
  avoid?: string;
};

export type IntakeSummary = {
  headline: string;
  keyPoints: string[];
  foodPattern: string;
  barriers: string[];
  flags: string[];                 // things the clinician should ask about; never a diagnosis
  suggestedType: RxType;
  suggestedDelivery: boolean;
  avoid: string[];
  source: "ai" | "fallback";
};

export type Rx = {
  patientId: string;
  type: RxType;
  carbTarget: number;              // grams per meal, set by the clinician
  weeks: number;
  avoid: string[];
  needsDelivery: boolean;
  note: string;
  createdAt: string;
};

export type VisitSummary = { points: L10n[]; source: "ai" | "fallback" };

export type PlanMeal = { meal: "desayuno" | "almuerzo" | "cena"; dish: string; portion: string; carbs: number; light: Light };
export type PlanDay = { day: string; meals: PlanMeal[] };
export type Plan = {
  days: PlanDay[];
  shopping: { item: string; qty: string }[];
  tip: string;
  source: "ai" | "fallback";
  lang?: Lang;             // language the plan was written in
};

export type EstimateItem = { name: string; serving: string; carbsMin: number; carbsMax: number; swap: string; source?: string };
export type Estimate = {
  items: EstimateItem[];
  carbsMin: number;
  carbsMax: number;
  light: Light;
  confidence: "table" | "low";     // table = from the local food table; low = AI guess
  message: string;
};

export type LogEntry = { id: string; text: string; at: string; estimate: Estimate };

export type OrderStatus = "received" | "preparing" | "ready" | "delivered";
export type Order = { id: string; placeId: string; needsDelivery: boolean; status: OrderStatus; createdAt: string };

export type AppState = {
  lang: Lang;
  bigText: boolean;
  patientId: string;
  intake: IntakeAnswers;
  intakeDone: boolean;
  intakeSummary: IntakeSummary | null;
  rx: Rx | null;
  visitSummary: VisitSummary | null;
  plan: Plan | null;
  log: LogEntry[];
  order: Order | null;
};
