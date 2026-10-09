# Receta Fresca

**La comida es medicina, y es de aquí.** / **Food is medicine, sourced locally.**

Built at the Caribbean AI Summit Hackathon (San Juan, Puerto Rico, October 8-10, 2026).

A clinician prescribes fresh produce or prepared meals. The patient redeems the prescription at a local colmado, farm or kitchen. AI turns what those businesses have in stock into a weekly plan of familiar dishes, and estimates carbohydrates for local food that calorie apps cannot measure.

## The flows
1. **Before the visit** (`/intake`): the patient answers 6 questions, one per screen, by tap or voice. AI writes a one-screen summary for the clinician.
2. **Prescribe** (`/clinico`): the summary pre-fills a food prescription. The clinician sets the carbohydrate goal and sends it in about 30 seconds. The patient gets a plain-language note.
3. **Plan and tracker** (`/plan`, `/comida`): a weekly plan built from local stock, and a "What did I eat?" box that returns a carbohydrate range and a traffic light.
4. **Redeem** (`/canjear`, `/negocio`): the patient picks a store, farm or kitchen; the business sees and fulfills the order.

## Working vs simulated
| Working | Simulated |
|---|---|
| Intake by voice or text, AI summary | Patients (synthetic, no real records) |
| Prescription and plain-language note | Stores, farms, kitchens and their stock |
| AI weekly plan from stock | Order status, delivery, voucher payment |
| Dish estimator grounded in a local food table | Storage (this browser only, no accounts) |
| Spanish and English, large text, read aloud | |

## Responsible design
- The app never diagnoses and never recommends or adjusts insulin or medication.
- The clinician sets the carbohydrate goal. The AI does not.
- Every number is labeled an estimate. Traffic lights are computed in code from the clinician's goal, not by the model.
- The dish estimator answers from `data/foods.json` first. Claude only guesses dishes the table does not know, and that guess is flagged as low confidence.
- Every AI route has a non-AI fallback, labeled as such, so the app works without a key or network.
- Food table (`data/foods.json`, 30 dishes): 14 matched directly to a USDA FoodData Central entry, 10 to the closest available food, 6 with no USDA match yet. Each row records its FDC ID and the arithmetic. A diabetes care professional reviewed the ranges for 15 of the most common dishes. Every dish shows its source on screen.

## Accessibility
Designed for older adults and people affected by diabetes: Spanish first, 20px base text with a larger-text switch, Atkinson Hyperlegible typeface, one question per screen, touch targets of 56px or more, voice input and read aloud, visible focus, and traffic lights that use color, shape and a word together. Target: WCAG 2.2 AA.

## Models
| Task | Model | Why |
|---|---|---|
| Dish estimate, plain-language note, weekly plan | Claude Haiku 4.5 | Fast and low cost; measured live, it returns a full on-target week in about 16 seconds |
| Intake summary for the clinician | Claude Sonnet 5.5 | Careful summarizing: reports what the patient said and flags what to ask in person, without interpreting |

## Run it
```bash
npm install
echo "ANTHROPIC_API_KEY=your-key" > .env.local   # optional: without it the app uses labeled fallbacks
npm run dev
```
Open http://localhost:3000.

## Credits
Next.js, React, Tailwind CSS, Anthropic Claude API, Atkinson Hyperlegible (Braille Institute, via Fontsource), axe-core for accessibility testing. Built with Claude Code.
