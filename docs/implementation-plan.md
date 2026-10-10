# Receta Fresca — Hackathon Implementation Plan

Oct 10, 2026 · 24-hour build window

Scope: every R1 "Now" feature from the event storm, plus the Next-tier features that can be built honestly on the current browser-only storage (no server, no accounts). Everything stays labeled as simulated where it is.

## Decisions taken (hotspots)

| Hotspot | Decision for the hackathon |
| --- | --- |
| H3 non-redemption threshold | 3 days after the prescription with no order. A labeled demo control moves the prescription date back 3 days so the flag can be shown live. |
| H5 multiple active prescriptions | One per patient (unchanged). |
| H6 stock freshness | Each stock update is timestamped and shown ("Updated 2 days ago"). No expiry. |
| H7 when a week starts | The last 7 calendar days, ending today. |
| H8 CHW-assisted intake auth | No separate auth. The intake records who helped (self, promotora, family) and the summary says so. |
| H9 offline meal logging | Offline, the estimate uses the local food table only, in the browser, and says so. |
| H10 family link scope | Plan, carb goal and the clinician's plain-language points only. No food log, no intake answers. Link expires when the prescription ends. Data lives in the URL fragment, never sent to a server. |
| H11 business UX | Same accessibility rules as patient screens. |
| Doc conflict: plan immutability | The code wins: a patient may ask for a new plan. |
| Doc conflict: 20-entry meal log | Raised to 200 entries so a weekly summary has a full week. "Today" means today. |

## Build order

Each step ships on its own and leaves the app building cleanly.

| # | Step | Features | Main files |
| --- | --- | --- | --- |
| 0 | State foundation: log entry kinds, larger log, helper, teach-back, outcomes, CHW notes, stock overrides, clinician acknowledgement; pure week summary | — | `lib/types.ts`, `lib/store.ts`, `lib/week.ts` |
| 1 | "I couldn't eat well today" with reason (no food / felt unwell); today-only log; weekly pattern card | F13, F7 | `app/comida/page.tsx`, `components/WeekStrip.tsx` |
| 2 | Clinician AI disclosure (first use) and "How it is going" panel per patient | F6, F1 | `app/clinico/page.tsx`, `components/PatientProgress.tsx` |
| 3 | Plan: read the day aloud, teach-back question, print the whole week, family share link | F5, F4, F18 (print), F12 | `app/plan/page.tsx`, `app/familia/page.tsx`, `app/globals.css` |
| 4 | Helper-aware intake; promotora role and caseload with non-redemption flag and notes | F8, F11, F3 (partial) | `app/intake/page.tsx`, `app/promotora/page.tsx`, `app/page.tsx` |
| 5 | Business stock editor with demand signal; plan built from updated stock | F14 | `app/negocio/inventario/page.tsx`, `lib/places.ts`, `app/api/plan/route.ts` |
| 6 | A1C and Hunger Vital Sign at the visit; de-identified CSV export | F17 | `components/PatientProgress.tsx`, `lib/export.ts` |
| 7 | Offline: service worker for the app shell, table-only estimate offline | F9 | `public/sw.js`, `components/SwRegister.tsx`, `app/comida/page.tsx` |
| 8 | Food table to 80+ dishes from real USDA FoodData Central lookups, marked not clinician-reviewed | F2 | `data/foods.json` |
| 9 | QA and docs: accessibility pass, both languages, 320px, large text; README, `/acerca`, event-storm mapping | — | docs, `app/acerca/page.tsx`, `README.md` |

## Out of scope (needs a server, outside systems, or policy work)

F10 accounts and server storage, F15 server-authenticated vouchers, F16 FHIR export, SMS (F3 link, F18 SMS), F19–F22.

## Guardrails kept

- No diagnosis, no medication or insulin advice, clinician sets the goal.
- Traffic lights and weekly counts computed in code, never by a model.
- Weekly feedback for the patient is factual and kind, written as fixed text, not generated.
- New food rows show their USDA source and are not marked clinician-reviewed.
