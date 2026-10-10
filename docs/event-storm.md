# Event Storm — Receta Fresca

**Date:** 2026-10-09
**Subject:** Food-as-medicine for diabetes in Puerto Rico and USVI
**Scope:** Now and Next tier features (F1–F18) from the features doc
**Actors:** Patient, Clinician, CHW/Promotora, Business (colmado/finca/cocina)
**Status:** Storm complete. Ready for `/plan`.

---

## Timeline — Domain Events (🟧)

### Pre-visit intake
1. `IntakeLinkShared` — clinic sent the pre-visit link to the patient
2. `IntakeStarted` — patient (or CHW on their behalf) opened the intake
3. `IntakeAnswered` — patient completed one question (×6)
4. `IntakeSubmitted` — patient finished all questions and hit send
5. `IntakeSummarized` — AI (or fallback) produced the clinician-facing summary

### Prescription
6. `AIDisclosureAcknowledged` — clinician confirmed they understand what the AI does (first use)
7. `PatientSelected` — clinician picked which patient to prescribe for
8. `IntakeSummaryReviewed` — clinician read the pre-visit summary
9. `PrescriptionConfigured` — clinician set type, carb target, weeks, avoid list, delivery, note
10. `PrescriptionSent` — clinician hit send; Rx is active
11. `VisitNoteSent` — plain-language note generated for the patient

### Plan generation
12. `PlanRequested` — system began building the weekly plan from local stock
13. `PlanGenerated` — AI (or fallback) returned a 7-day plan within the carb target
14. `PlanReadAloud` — patient listened to the plan via text-to-speech

### Meal tracking
15. `MealLogged` — patient described what they ate (voice or text)
16. `MealEstimated` — system returned carb range and traffic light
17. `FoodInsecurityFlagged` — patient tapped "I couldn't eat today"
18. `WeekSummarized` — system computed the weekly pattern (green/yellow/red counts)
19. `TeachBackCompleted` — patient answered the comprehension question correctly
20. `TeachBackFailed` — patient answered incorrectly; re-explanation shown

### Redemption
21. `PlaceSelected` — patient chose a colmado, finca, or cocina
22. `DeliveryRequested` — patient checked the delivery box
23. `OrderPlaced` — patient confirmed the order; voucher code generated
24. `StockUpdated` — business updated what they have this week
25. `OrderAccepted` — business acknowledged the order
26. `OrderPrepared` — business marked preparing/ready
27. `OrderFulfilled` — business confirmed delivery or pickup complete
28. `VoucherRedeemed` — server authenticated that fulfillment happened

### Feedback loop
29. `PatientLogViewed` — clinician opened the patient's food log
30. `AdherenceReviewed` — clinician reviewed the weekly traffic light summary
31. `CHWNoteAdded` — CHW added an observation to the patient's record
32. `NonRedemptionFlagged` — system flagged an unredeemed Rx after N days
33. `OutreachTriggered` — CHW was notified to follow up with the patient

### Outcomes
34. `A1CRecorded` — clinician entered an A1C value at the visit
35. `FoodSecurityScreened` — Hunger Vital Sign 2-item screener completed
36. `OutcomeExported` — research-ready dataset generated

### Account lifecycle
37. `PatientAccountCreated` — patient registered with phone + PIN
38. `CHWAssigned` — a CHW was linked to a patient
39. `PlanSharedWithFamily` — patient sent a read-only plan link to a caregiver

---

## Commands and Actors

| # | Event | Command | Actor |
|---|---|---|---|
| 1 | `IntakeLinkShared` | `ShareIntakeLink` | Clinician |
| 2 | `IntakeStarted` | `StartIntake` | Patient / CHW |
| 3 | `IntakeAnswered` | `AnswerIntakeQuestion` | Patient / CHW |
| 4 | `IntakeSubmitted` | `SubmitIntake` | Patient / CHW |
| 5 | `IntakeSummarized` | `SummarizeIntake` | System (policy) |
| 6 | `AIDisclosureAcknowledged` | `AcknowledgeAIDisclosure` | Clinician |
| 7 | `PatientSelected` | `SelectPatient` | Clinician |
| 8 | `IntakeSummaryReviewed` | `ReviewIntakeSummary` | Clinician |
| 9 | `PrescriptionConfigured` | `ConfigurePrescription` | Clinician |
| 10 | `PrescriptionSent` | `SendPrescription` | Clinician |
| 11 | `VisitNoteSent` | `GenerateVisitNote` | System (policy) |
| 12 | `PlanRequested` | `RequestPlan` | System (policy) |
| 13 | `PlanGenerated` | `GeneratePlan` | System (policy) |
| 14 | `PlanReadAloud` | `ReadPlanAloud` | Patient |
| 15 | `MealLogged` | `LogMeal` | Patient |
| 16 | `MealEstimated` | `EstimateMeal` | System (policy) |
| 17 | `FoodInsecurityFlagged` | `FlagFoodInsecurity` | Patient |
| 18 | `WeekSummarized` | `SummarizeWeek` | System (policy) |
| 19 | `TeachBackCompleted` | `AnswerTeachBack` | Patient |
| 20 | `TeachBackFailed` | `AnswerTeachBack` | Patient |
| 21 | `PlaceSelected` | `SelectPlace` | Patient |
| 22 | `DeliveryRequested` | `RequestDelivery` | Patient |
| 23 | `OrderPlaced` | `PlaceOrder` | Patient |
| 24 | `StockUpdated` | `UpdateStock` | Business |
| 25 | `OrderAccepted` | `AcceptOrder` | Business |
| 26 | `OrderPrepared` | `PrepareOrder` | Business |
| 27 | `OrderFulfilled` | `FulfillOrder` | Business |
| 28 | `VoucherRedeemed` | `RedeemVoucher` | System (policy) |
| 29 | `PatientLogViewed` | `ViewPatientLog` | Clinician |
| 30 | `AdherenceReviewed` | `ReviewAdherence` | Clinician |
| 31 | `CHWNoteAdded` | `AddCHWNote` | CHW |
| 32 | `NonRedemptionFlagged` | `FlagNonRedemption` | System (policy) |
| 33 | `OutreachTriggered` | `TriggerOutreach` | System (policy) |
| 34 | `A1CRecorded` | `RecordA1C` | Clinician |
| 35 | `FoodSecurityScreened` | `ScreenFoodSecurity` | Clinician / CHW |
| 36 | `OutcomeExported` | `ExportOutcomes` | Clinician / Program Admin |
| 37 | `PatientAccountCreated` | `CreatePatientAccount` | Patient / CHW |
| 38 | `CHWAssigned` | `AssignCHW` | Clinician / Program Admin |
| 39 | `PlanSharedWithFamily` | `SharePlanWithFamily` | Patient |

---

## Policies (🟪)

| Policy | Trigger | Action |
|---|---|---|
| **AutoSummarize** | `IntakeSubmitted` | `SummarizeIntake` (Claude Sonnet → Haiku, or fallback) |
| **AutoVisitNote** | `PrescriptionSent` | `GenerateVisitNote` (plain-language note for patient) |
| **AutoPlan** | `PrescriptionSent` | `RequestPlan` (fire-and-forget, background) |
| **AutoPlanGenerate** | `PlanRequested` | `GeneratePlan` (Claude Haiku from stock, or fallback) |
| **AutoEstimate** | `MealLogged` | `EstimateMeal` (food table first, Claude for unknowns) |
| **AutoVoucherRelease** | `OrderFulfilled` | `RedeemVoucher` (server validates, releases payment record) |
| **NonRedemptionWatch** | 3 days after `PrescriptionSent`, no `OrderPlaced` | `FlagNonRedemption` |
| **AutoOutreach** | `NonRedemptionFlagged` | `TriggerOutreach` (notify assigned CHW) |
| **WeeklyDigest** | Every 7 days per patient with active Rx | `SummarizeWeek` |

---

## Aggregates (🟫)

| Aggregate | Commands | Key invariants |
|---|---|---|
| **Intake** | `StartIntake`, `AnswerIntakeQuestion`, `SubmitIntake`, `SummarizeIntake` | Cannot submit twice. Max 6 questions. |
| **Prescription** | `ConfigurePrescription`, `SendPrescription`, `GenerateVisitNote` | CarbTarget 15–75g. Type: produce or meals. One active Rx per patient. |
| **Plan** | `RequestPlan`, `GeneratePlan` | 7 days × 3 meals. No meal > carbTarget. Immutable once generated. |
| **MealLog** | `LogMeal`, `EstimateMeal`, `FlagFoodInsecurity`, `SummarizeWeek` | Text clipped 300 chars. Max 200 entries (was 20; too few for a week). Each meal entry gets one estimate. |
| **TeachBack** | `AnswerTeachBack` | Correct = green. One attempt per plan view. |
| **Order** | `SelectPlace`, `RequestDelivery`, `PlaceOrder`, `AcceptOrder`, `PrepareOrder`, `FulfillOrder` | Status: received → preparing → ready → delivered. Cannot regress. One active per patient. |
| **Voucher** | `RedeemVoucher` | Redeem once. Requires OrderFulfilled. Tied to one Order. |
| **Stock** | `UpdateStock` | Per-business. Items from preset + freeform. Timestamped. |
| **PatientAccount** | `CreatePatientAccount`, `AssignCHW`, `SharePlanWithFamily` | Phone + PIN. One CHW at a time. Share link expires with Rx. |
| **ClinicianSession** | `AcknowledgeAIDisclosure`, `SelectPatient`, `ReviewIntakeSummary`, `ViewPatientLog`, `ReviewAdherence`, `RecordA1C`, `ScreenFoodSecurity`, `ExportOutcomes` | AI disclosure once. Patient scoped to clinic panel. |
| **CHWCaseload** | `AddCHWNote`, `FlagNonRedemption`, `TriggerOutreach` | Notes append-only. Outreach flag clears on redemption or manual clear. |

---

## Read Models (🟩)

| Read model | Actor | Feeds feature | Exists? |
|---|---|---|---|
| Intake summary card | Clinician | `/clinico` SummaryCard | Yes |
| Prescription form | Clinician | `/clinico` RxForm | Yes |
| Patient visit note | Patient | `/paciente` visit summary | Yes |
| Weekly meal plan | Patient | `/plan` | Yes |
| Meal estimator result | Patient | `/comida` | Yes |
| Today's food log | Patient | `/comida` log section | Yes |
| Weekly pattern summary | Patient | F7 | Yes |
| Patient food log | Clinician | F1 | Yes |
| CHW caseload dashboard | CHW | F11 | Yes (`/promotora`) |
| Business order queue | Business | `/negocio` | Yes (simulated) |
| Business stock manager | Business | F14 | Yes |
| Store/farm/kitchen picker | Patient | `/canjear` | Yes |
| Order tracker | Patient | `/canjear` order view | Yes |
| Family plan view | Caregiver | F12 | Yes |
| Outcomes report | Clinician / Admin | F17 | Yes (CSV) |
| Teach-back screen | Patient | F4 | Yes |

---

## External Systems (🟥)

| System | Direction | Feature |
|---|---|---|
| Anthropic Claude API | Outbound | Exists |
| Browser Speech API | Bidirectional | Exists |
| SMS gateway (Twilio) | Outbound | F3, F18 |
| USDA FoodData Central | Reference (offline) | Exists |
| Supabase | Bidirectional | F10 |
| GusNIP / NAP systems | Future | F20 |
| EHR (Epic/eCW) | Future outbound | F16 |
| MA benefit admin | Future bidirectional | F21 |

---

## Bounded Contexts (⬛)

| Context | Aggregates | Candidate service seam |
|---|---|---|
| **Intake** | Intake | Question flow, summarization, teach-back |
| **Prescription** | Prescription, ClinicianSession | Rx lifecycle, AI disclosure, clinician views |
| **Nutrition** | Plan, MealLog | Food table, estimator, plan builder, weekly summary |
| **Fulfillment** | Order, Voucher, Stock | Colmado/finca/cocina, order lifecycle, stock, voucher |
| **Care Coordination** | PatientAccount, CHWCaseload | CHW role, outreach policies, family links |
| **Outcomes** | (part of ClinicianSession) | A1C, food security, research export |

---

## Hotspots (🔴)

| # | Hotspot | Blocks | Who answers |
|---|---|---|---|
| H1 | Is `IntakeLinkShared` system-sent or manual? | F3 design | PM |
| H2 | `VoucherRedeemed` vs `OrderFulfilled` — one moment or two? | F15 design | Architect |
| H3 | Non-redemption threshold — how many days? | F11 policy config | Clinician input |
| H4 | Who creates the patient account? (self, CHW, clinician?) | F10 auth flow | PM |
| H5 | Can a patient have multiple active prescriptions? | Rx aggregate invariant | Clinician input |
| H6 | Stock data freshness — how stale is too stale? | F14 UX and policy | Business interviews |
| H7 | WeeklyDigest timing — when does a "week" start? | F7 implementation | Design decision |
| H8 | CHW-assisted intake — separate auth mode needed? | F8 + F10 | Architect |
| H9 | Offline meal logging — food-table-only offline, re-estimate on sync? | F9 design | Architect |
| H10 | Family share link scope — what can the caregiver see? | F12 data scope | PM + legal |
| H11 | Business-facing UX — same accessibility standards as patient-facing? | F14 design | Design |

---

## Release Split

| Release | Events | Features |
|---|---|---|
| **R1 — Now** | 1–20 (existing + read-aloud, teach-back, weekly summary, AI disclosure, CHW-assisted intake, food insecurity flag as local log) | F1, F2, F4, F5, F6, F7, F8, partial F13 |
| **R2 — Persistence** | `PatientAccountCreated`, all existing events persisted server-side, `ViewPatientLog`, `AdherenceReviewed` | F10, F1 (full), F3 |
| **R3 — Coordination** | `CHWAssigned`, `CHWNoteAdded`, `NonRedemptionFlagged`, `OutreachTriggered`, `StockUpdated`, `PlanSharedWithFamily` | F11, F12, F14 |
| **R4 — Voucher** | `VoucherRedeemed` server-authenticated, `OrderFulfilled` separated | F15, F9 |
| **R5 — Outcomes** | `A1CRecorded`, `FoodSecurityScreened`, `OutcomeExported` | F16, F17, F18 |
| **Later** | GusNIP/NAP integration, MA benefit API, 1115 waiver | F19, F20, F21, F22 |

---

## Mapping Table — Storm Element → Code

| Storm element | Code name | Exists? |
|---|---|---|
| `ShareIntakeLink` | `POST /api/intake-link` | No |
| `StartIntake` | `/intake` page load | Yes |
| `AnswerIntakeQuestion` | `setState({ intake: {...} })` | Yes |
| `SubmitIntake` | `fetch("/api/intake-summary")` | Yes |
| `SummarizeIntake` | `askJSON` in `/api/intake-summary/route.ts` | Yes |
| `AcknowledgeAIDisclosure` | `setState({ clinicianAck: true })` in `/clinico` | Yes |
| `SelectPatient` | `setState({ patientId })` | Yes |
| `ConfigurePrescription` | RxForm state in `/clinico` | Yes |
| `SendPrescription` | `fetch("/api/visit-summary")` + `setState({ rx })` | Yes |
| `GenerateVisitNote` | `askJSON` in `/api/visit-summary/route.ts` | Yes |
| `RequestPlan` | `ensurePlan()` in `lib/planLoader.ts` | Yes |
| `GeneratePlan` | `askJSON` in `/api/plan/route.ts` | Yes |
| `ReadPlanAloud` | `ReadAloud` for the day on `/plan` | Yes |
| `LogMeal` | `fetch("/api/estimate")` in `/comida` | Yes |
| `EstimateMeal` | `/api/estimate/route.ts` | Yes |
| `FlagFoodInsecurity` | "Hoy no pude comer bien" on `/comida` (`kind: "skipped"` log entry) | Yes |
| `SummarizeWeek` | `summarizeWeek()` in `lib/week.ts` | Yes |
| `AnswerTeachBack` | `components/TeachBack.tsx` on `/plan` | Yes |
| `SelectPlace` | `setPlaceId()` in `/canjear` | Yes |
| `PlaceOrder` | `setState({ order })` in `/canjear` | Yes |
| `UpdateStock` | `/negocio/inventario` page | Yes (browser only) |
| `AcceptOrder` | Status advance in `/negocio` | Yes (simulated) |
| `FulfillOrder` | Status advance in `/negocio` | Yes (simulated) |
| `RedeemVoucher` | Server-side voucher validation | No (F15) |
| `ViewPatientLog` | `PatientProgress` on `/clinico` | Yes |
| `AddCHWNote` | Notes on `/promotora` | Yes |
| `RecordA1C` | A1C input in `PatientProgress` | Yes |
| `CreatePatientAccount` | Phone + PIN registration | No (F10) |
| `AssignCHW` | CHW assignment flow | No (F11) |
| `SharePlanWithFamily` | `familyLink()` in `lib/share.ts`, `/familia` | Yes |
