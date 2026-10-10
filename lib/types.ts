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

export type Patient = { id: string; name: string; age: number; town: string; note: L10n; phone?: string };

export type IntakeAnswers = {
  feeling?: "good" | "ok" | "bad";
  concern?: string;
  typicalDay?: string;
  canCook?: "yes" | "sometimes" | "no";
  canTravel?: "yes" | "no";
  avoid?: string;
  helper?: Helper;                 // who answered: the patient, or someone helping them
};

export type Helper = "self" | "promotora" | "family" | "clinic";

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
  lang?: Lang;
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

export type VisitSummary = { points: L10n[]; source: "ai" | "template" | "fallback" };

export type PlanMeal = { meal: "desayuno" | "almuerzo" | "cena"; dish: string; portion: string; carbs: number; light: Light };
export type PlanDay = { day: string; meals: PlanMeal[] };
export type Plan = {
  days: PlanDay[];
  shopping: { item: string; qty: string }[];
  tip: string;
  source: "ai" | "fallback";
  lang?: Lang;             // language the plan was written in
};

export type Size = "small" | "normal" | "large";
export type EstimateItem = { name: string; serving: string; carbsMin: number; carbsMax: number; swap: string; source?: string; size?: Size };
export type Estimate = {
  items: EstimateItem[];
  carbsMin: number;
  carbsMax: number;
  light: Light;
  confidence: "table" | "mixed" | "low"; // table = local food table; low = AI guess; mixed = some of each
  message: string;
  unmatched?: string;              // words in the meal that neither the table nor the AI could count
};

/** A meal the person logged, or a day they could not eat well (and why). */
export type SkipReason = "noFood" | "unwell" | "other";
export type LogEntry =
  | { id: string; kind?: "meal"; text: string; at: string; estimate: Estimate }
  | { id: string; kind: "skipped"; reason: SkipReason; at: string };

export type TeachBack = { at: string; planAt: string; correct: boolean };

/** Hunger Vital Sign, 2 items. Positive when either answer is "often" or "sometimes" true. */
export type HvsAnswer = "often" | "sometimes" | "never";
export type Outcomes = { a1c: { value: number; at: string }[]; hvs: { q1: HvsAnswer; q2: HvsAnswer; at: string }[] };

export type ChwNote = { at: string; text: string };

export type OrderStatus = "received" | "preparing" | "ready" | "delivered";
export type Order = {
  id: string;
  placeId: string;
  needsDelivery: boolean;
  status: OrderStatus;             // fulfillment, set by the business one step at a time
  createdAt: string;
  voucher?: string;                // code the patient shows; issued by the server (F15)
  expiresAt?: string;              // voucher ends with the prescription
  redeemedAt?: string;             // set only when the business's redemption was accepted
};

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
  teachBack: TeachBack | null;
  outcomes: Outcomes;
  chwNotes: ChwNote[];
  // Shared by everyone on this device (not per patient):
  clinicianAck: boolean;           // clinician has read what the AI does and does not do
  stock: Record<string, StockUpdate>; // what each business says it has this week, by place id
};

export type StockUpdate = { items: L10n[]; at: string };
