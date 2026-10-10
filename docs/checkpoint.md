# Checkpoint — Receta Fresca build

Oct 10, 2026 · branch `receta-yolo`

Read this first when resuming. It says what is built, how to check it, what we learned the hard way, and what comes next.

## Where we are

Hackathon build done: every feature in `docs/implementation-plan.md` (R1 "Now" plus browser-only Next-tier features) is built and passes QA.

| Feature | Status | Where |
| --- | --- | --- |
| F1 clinician "How it is going" | Done | `components/PatientProgress.tsx` on `/clinico` |
| F2 food table 30 → 92 dishes (USDA FDC) | Done; 77 rows not clinician-reviewed | `data/foods.json` |
| F3 async intake | Partial: works in the same browser; no SMS link | `/intake` |
| F4 teach-back | Done | `components/TeachBack.tsx` |
| F5 read the day aloud | Done | `/plan` |
| F6 clinician AI disclosure | Done | `/clinico` (first visit) |
| F7 weekly pattern | Done | `lib/week.ts`, `components/WeekCard.tsx` |
| F8 helper-aware intake | Done | `/intake`, `IntakeAnswers.helper` |
| F9 offline | Done: service worker + table-only estimate | `public/sw.js`, `/comida` |
| F11 promotora caseload | Done (browser only) | `/promotora`, `lib/care.ts` |
| F12 family link | Done (data in URL fragment, expires with Rx) | `lib/share.ts`, `/familia` |
| F13 "I couldn't eat well today" | Done | `/comida`, log entry `kind: "skipped"` |
| F14 business stock + demand signal | Done (browser only) | `/negocio/inventario`, `lib/places.ts` |
| F17 A1C, Hunger Vital Sign, CSV export | Done (browser only) | `PatientProgress`, `lib/export.ts` |
| F18 non-smartphone path | Partial: printable week; no SMS | `/plan` print |
| F10, F15, F16, F19–F22 | Not started | — |

## How to run and check

```bash
npm install
npm run build && PORT=3100 npm start      # terminal 1
npm run e2e                                # terminal 2: 59 checks, expects 59/59
npx tsc --noEmit && npm run lint
```

`scripts/e2e.mjs` drives the whole demo in Chrome with no API key (labeled fallbacks), runs axe-core (WCAG 2.2 AA) on every screen in both languages at 320px with large text, and tests offline. Set `CHROME=/path` if Chrome is not at `/usr/bin/google-chrome`. Add a check there for every new feature.

Not yet exercised: the AI routes with a real `ANTHROPIC_API_KEY`. The plan route now also receives business stock updates (`stock` in the request body); run one live plan before judging.

## Things learned the hard way

- **Next 16 keeps the previous route in the DOM, hidden** (cache components). Two `<main>` elements can exist; in tests scope to `main:visible`. Existing behavior, harmless.
- **The `react-hooks/purity` lint rule** rejects `Date.now()` / `new Date()` in a component body. Put time logic in `lib/` functions (see `linkExpired`, `daysSince`).
- **ESLint rejects `require()`** everywhere, including scripts; use ESM.
- **`Notice` content must be able to shrink** (`min-w-0`) or long buttons overflow at 320px with large text. Fixed in `components/ui.tsx`.
- **State shape**: per-patient fields live in `PatientState` (`lib/store.ts`), device-wide ones (`lang`, `bigText`, `patientId`, `clinicianAck`, `stock`) in `DEVICE_KEYS`. Every stored field needs a sanitizer in `sanitizePatient` / `sanitize`, or a bad save can break a screen.
- **Avoid unverified facts in patient copy** (e.g. a hotline number). Ask or leave it out.
- **The USDA `DEMO_KEY` allows about 10 requests per hour.** For food rows use USDA's bulk FNDDS and SR Legacy files, and keep live API calls for spot checks.

## Food rows a clinician should review first

Malta (47–58 g) and jugo de tamarindo (62–76 g); guineos verdes (uses raw ripe banana: no green-banana entry in FDC); yautía (uses taro); saltfish pate (generic empanada); Crucian sweet bread (raisin bread); arroz con pollo (restaurant entrée, may run low); mangú, bizcocho, dulce de lechosa (wide ranges); galletas de soda (assume saltine size).

## What comes next

Everything left needs a server, an outside service, or policy work. Suggested order, since F10 unlocks the rest:

1. **F10 server persistence and accounts**: replaces localStorage so clinician, promotora, business and patient work on their own devices. The event storm names Supabase. Keep the `lib/store.ts` API (`useAppState`, `setState`, `setPatientState`, `allPatients`) so screens barely change. Plan for an offline queue (F9) that syncs on reconnect.
2. **F15 server-authenticated voucher**: redemption validated on the server, separate from `OrderFulfilled` (hotspot H2).
3. **F3 intake link + F18 SMS**: an SMS gateway (the event storm names Twilio) to send the pre-visit link and a text version of the prescription.
4. **F11/F17 on the server**: the non-redemption policy as a scheduled job (`NonRedemptionWatch`), outreach notifications, and an outcomes export across the clinic.
5. **F16 FHIR R4 SDOH export** of the intake and prescription.
6. **Later (outside systems or policy)**: F19 vendor onboarding, F20 NAP/WIC/GusNIP, F21 MA benefit API, F22 1115 waiver evidence.

## Decisions needed from the user before F10

- Backend: Supabase (as in the event storm) or something else; who holds the project and keys.
- H4: who creates a patient account (self, promotora, clinician) and how they sign in (phone + PIN per the event storm).
- H2: is voucher redemption the same moment as order fulfillment, or a separate server step.
- SMS provider and sending number for F3/F18.
- Real data or still synthetic: real patient data brings HIPAA obligations (BAA, hosting, audit log) that change the F10 design.
