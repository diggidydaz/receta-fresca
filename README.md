# Receta Fresca

**La comida es medicina, y es de aquí.** / **Food is medicine, sourced locally.**

Built at the Caribbean AI Summit Hackathon (San Juan, Puerto Rico, October 8-10, 2026).

A clinician prescribes fresh produce or prepared meals. The patient redeems the prescription at a local colmado, farm or kitchen. AI turns what those businesses have in stock into a weekly plan of familiar dishes, and estimates carbohydrates for local food that calorie apps cannot measure.

## The flows
1. **Before the visit** (`/intake`): the patient answers 6 questions, one per screen, by tap or voice. AI writes a one-screen summary for the clinician.
2. **Prescribe** (`/clinico`): the summary pre-fills a food prescription. The clinician sets the carbohydrate goal and sends it in about 30 seconds. The patient gets a plain-language note.
3. **Plan and tracker** (`/plan`, `/comida`): a weekly plan built from local stock, and a "What did I eat?" screen that takes speech, text or a photo of the plate and returns a carbohydrate range and a traffic light. For a photo, the AI only names the dishes; the person confirms them and the numbers come from the food table. The photo is not stored. Each food then has Poco / Normal / Mucho buttons (half, typical, one and a half servings); the total and the light update at once. A photo or a size word in speech ("un poco de arroz") sets the starting size, and the person can change it.
4. **Redeem** (`/canjear`, `/negocio`, `/negocio/inventario`): the patient picks a store, farm or kitchen and gets a voucher code (RF-XXXX-XXXX). The business sees and fulfills the order, and redeems the voucher as its own step by typing the code the patient shows; the server accepts each code once, only at the place it was issued for, and not after the prescription ends. The business also says what it has this week (new plans use it) and sees what customers' plans ask for.
5. **Follow-up** (`/clinico`, `/promotora`): the clinician sees "How it is going" (last 7 days of lights, "I could not eat well today" with the reason, teach-back result, order, promotora notes), records A1C and the Hunger Vital Sign, and downloads a CSV without names. The community health worker sees patients needing a call first (no food, prescription not picked up after 3 days), leaves notes the clinician sees, and helps with the pre-visit questions; the summary says who helped.
6. **At home**: "My week" pattern for the patient, the day's meals read aloud, a one-question teach-back, a printable week, a read-only family link (data in the link only, expires with the prescription), and offline use (the app is saved on the phone; meals in the food table are estimated without a connection).

The first time a clinician opens `/clinico`, a screen explains what the AI does and never does.

## Working vs simulated
| Working | Simulated |
|---|---|
| Intake by voice or text, AI summary | Patients (synthetic, no real records) |
| Prescription and plain-language note | Stores, farms, kitchens and their stock |
| AI weekly plan from stock | Delivery and voucher payment (no money moves) |
| Dish estimator grounded in a local food table | The "3 days have passed" demo button (demo mode only) |
| Spanish and English, large text, read aloud | |
| Weekly pattern, follow-up alerts, notes, A1C, CSV export | |
| Printed plan, family link, offline use | |
| Server mode: accounts, each role on its own device, live updates, offline outbox, server-checked vouchers, audit log | |

The app runs in two modes. **Demo mode** (no Supabase configured) keeps everything in one browser and every role shares it. **Server mode** (F10) uses Supabase: staff enrol patients, patients sign in with phone number and a 6-digit PIN, and staff sign in with email and password. Row-level security limits what each role can read and write. Server mode is for synthetic data only until a BAA, hosting review and access policy are in place.

## Responsible design
- The app never diagnoses and never recommends or adjusts insulin or medication.
- The clinician sets the carbohydrate goal. The AI does not.
- Every number is labeled an estimate. Traffic lights are computed in code from the clinician's goal, not by the model.
- The dish estimator answers from `data/foods.json` first. Claude only guesses dishes the table does not know, and that guess is flagged as low confidence.
- Foods the patient avoids, and any meal over the clinician's carbohydrate goal, are removed from every plan in code, whatever the model returns.
- Every AI route has a non-AI fallback, labeled as such, so the app works without a key or network.
- Food table (`data/foods.json`, 92 dishes): 59 matched directly to a USDA FoodData Central entry, 27 to the closest available food, 6 with no USDA match yet. Each row records its FDC ID and the arithmetic. A diabetes care professional reviewed the ranges for 15 of the most common dishes; the other 77 are not yet reviewed and say so. Every dish shows its source on screen.
- Weekly counts, follow-up alerts and the patient's weekly message are computed in code with fixed wording, never by a model.

## Accessibility
Designed for older adults and people affected by diabetes: Spanish first, 20px base text with a larger-text switch, Atkinson Hyperlegible typeface, one question per screen, touch targets of 56px or more, voice input and read aloud, visible focus, and traffic lights that use color, shape and a word together. Target: WCAG 2.2 AA.

## Models
| Task | Model | Why |
|---|---|---|
| Intake summary for the clinician | Claude Sonnet 5.5 | Careful summarizing: reports what the patient said and flags what to ask in person, without interpreting |
| Weekly plan | Claude Haiku 5.5 (falls back to Haiku 4.5) | Measured live: a full week in about 8 seconds, started as soon as the prescription is sent |
| Naming the dishes in a plate photo | Claude Sonnet 5.5 (falls back to Haiku 4.5) | Vision; names only, never numbers |
| Dish estimate for food outside the table, restating the clinician's note | Claude Haiku 4.5 | Fast and low cost for short, bounded tasks |
| Prescription facts in the patient's note, traffic lights, carb goal, avoided foods | No model | Fixed template and code, so they cannot be wrong in a new way each time |

## Run it
Demo mode (browser only):
```bash
npm install
echo "ANTHROPIC_API_KEY=your-key" > .env.local   # optional: without it the app uses labeled fallbacks
npm run dev
```
Open http://localhost:3000.

Server mode (needs Docker for the local Supabase):
```bash
cp .env.example .env.local      # then fill in the values `npx supabase start` prints
npx supabase start              # local Postgres, Auth and Realtime
npx supabase db reset           # applies supabase/migrations and the places in supabase/seed.sql
npm run seed                    # synthetic accounts; prints the phone numbers, PINs and staff password
npm run dev
```
Sample sign-ins after `npm run seed`: patients (787) 555-0101, -0102 and -0103 with PINs 111111, 222222 and 333333; staff `clinico@demo.receta.invalid`, `promotora@demo.receta.invalid` and `negocio-c1@demo.receta.invalid` (one per place: c1, c2, f1, f2, k1, k2), password `receta-demo`.

Checks: `npm run e2e` (demo mode, 59 checks), `npm run rls-check` (server access rules and voucher commands, 41 checks; 48 with `APP=http://localhost:PORT` against a running server build), `npm run e2e:server` (three devices against the server build, 44 checks). See `docs/checkpoint.md`.

## Credits
Next.js, React, Tailwind CSS, Anthropic Claude API, Atkinson Hyperlegible (Braille Institute, via Fontsource), axe-core for accessibility testing. Built with Claude Code.
