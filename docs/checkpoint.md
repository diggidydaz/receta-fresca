# Checkpoint — Receta Fresca build

Oct 10, 2026 (session 2) · branch `receta-yolo`

Read this first when resuming. It says what is built, how to check it, what we learned the hard way, and what comes next.

## Where we are

Hackathon build done: every feature in `docs/implementation-plan.md` (R1 "Now" plus browser-only Next-tier features) is built and passes QA. Session 2 added **F10 server persistence and accounts** and **F15 server-authenticated vouchers** (local Supabase; synthetic data only).

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
| F11 promotora caseload | Done (shared through the server in server mode; no scheduled job yet) | `/promotora`, `lib/care.ts` |
| F12 family link | Done (data in URL fragment, expires with Rx) | `lib/share.ts`, `/familia` |
| F13 "I couldn't eat well today" | Done | `/comida`, log entry `kind: "skipped"` |
| F14 business stock + demand signal | Done (server mode: `stock` table, own place only) | `/negocio/inventario`, `lib/places.ts` |
| F17 A1C, Hunger Vital Sign, CSV export | Done (server mode: clinic-wide for the clinician) | `PatientProgress`, `lib/export.ts` |
| F18 non-smartphone path | Partial: printable week; no SMS | `/plan` print |
| F10 server persistence and accounts | Done (local Supabase) | `supabase/migrations/`, `lib/sync.ts`, `lib/store.ts`, `components/Account.tsx`, `/entrar`, `app/api/accounts` |
| F15 server-authenticated voucher | Done | `place_order` / `redeem_voucher` in the migration, `lib/orders.ts`, `/canjear`, `/negocio` |
| F16, F19–F22 | Not started | — |

## Decisions made (session 2, Oct 10)

- Backend: **Supabase**. Built and tested against the local stack (`npx supabase start`, Docker). No hosted project yet; whoever creates it supplies the URL, publishable key and secret key in `.env.local` (see `.env.example`).
- Data: **synthetic only**. No BAA. The enrol form says so. Real data needs a BAA-covered host, access review and the follow-ups below.
- Accounts (H4): **clinician or promotora enrols the patient**; patients sign in with **phone + 6-digit PIN** (6 is Supabase's minimum password length); staff with email + password. Public sign-up is off in `supabase/config.toml`. No SMS: the phone number becomes the sign-in address `1XXXXXXXXXX@phone.receta.invalid` (`lib/phone.ts`). A promotora or clinician can set a new PIN.
- Vouchers (H2): **redemption is a separate server step**. The business types the code the patient shows; `redeem_voucher` accepts it once, only at its place, not void, not expired (expiry = prescription start + weeks). Order status (fulfillment) is separate and does not redeem. A new prescription voids an unredeemed voucher and clears the order (trigger `rx_resets_order`).
- SMS provider: **still open** (needed for F3/F18).

## How server mode works (F10)

- **Two modes.** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` set at build time = server mode; unset = the browser-only demo, unchanged. Both modes share the `lib/store.ts` API, so screens barely changed.
- **One row per patient field** (`patient_fields`), written through `put_fields`, which keeps the newest copy by the writer's clock. An offline phone's old edit cannot undo a newer one.
- **Outbox** (`lib/sync.ts`): every change is saved on the phone first, queued, and sent when online (on `online`, on focus, every 15 s while waiting). The account bar shows "Guardado en este teléfono…" while anything is waiting. Records are cached per account in localStorage so the app opens offline; sign-out clears them (shared phones).
- **Live updates**: Supabase Realtime on `patient_fields`, `stock`, `patients`, plus a refresh every 60 s and on reconnect.
- **Who may write what** (`can_write_field`): clinician everything but `order`; promotora intake, notes, outcomes; patient own intake, plan, log, teach-back. Nobody writes `order` directly: only `place_order`, `cancel_order`, `set_order_status`, `redeem_voucher`. A business reads only `rx`, `plan`, `order` of patients with an order at its place.
- **Audit log**: every field write, account creation, PIN reset and voucher event (no values copied). Clinicians can read it.
- **Screens**: `AccountGate` in the layout sends signed-out people to sign-in and keeps each role to its screens. Home, About, Family and `/entrar` stay public.

## How to run and check

```bash
npm install
npm run build && PORT=3100 npm start      # terminal 1
npm run e2e                                # terminal 2: 59 checks, expects 59/59
npx tsc --noEmit && npm run lint
```

Server mode (local Supabase, Docker):

```bash
npx supabase start && npx supabase db reset && npm run seed
NEXT_DIST_DIR=.next-server npm run build && NEXT_DIST_DIR=.next-server PORT=3220 npm start   # terminal 1
APP=http://localhost:3220 npm run rls-check      # 48 checks: access rules, vouchers, accounts API
npx supabase db reset && npm run seed            # rls-check changes p1/p2; start clean
BASE=http://localhost:3220 npm run e2e:server    # 44 checks: three devices, live updates, offline outbox, axe
```

**Remote browser** (app and Supabase on a VM, browser on another computer): set `NEXT_PUBLIC_SUPABASE_PROXY=1` before building. The browser then talks to Supabase through the app's own address (`/auth/v1`, `/rest/v1`, `/realtime/v1` rewrites in `next.config.ts`, WebSocket included), so only the app's port is needed. Test it the way it is used: `BASE=http://<vm-ip>:3220 BLOCK=http://127.0.0.1:54321 npm run e2e:server` (45 checks) blocks the browser from Supabase's own address. Without the proxy, that run fails at sign-in, which is the failure the user hit in session 2.

`NEXT_DIST_DIR` keeps the server build apart from the demo build (`.next`), so both can run at once. To build the demo while `.env.local` has Supabase values, blank them: `NEXT_PUBLIC_SUPABASE_URL= NEXT_PUBLIC_SUPABASE_ANON_KEY= npm run build`.

`scripts/e2e.mjs` drives the whole demo in Chrome with no API key (labeled fallbacks), runs axe-core (WCAG 2.2 AA) on every screen in both languages at 320px with large text, and tests offline. Set `CHROME=/path` if Chrome is not at `/usr/bin/google-chrome`. Add a check there for every new feature.

Not yet exercised: the AI routes with a real `ANTHROPIC_API_KEY`. The plan route now also receives business stock updates (`stock` in the request body); run one live plan before judging.

## Things learned the hard way

- **Next 16 keeps the previous route in the DOM, hidden** (cache components). Two `<main>` elements can exist; in tests scope to `main:visible`. Existing behavior, harmless.
- **The `react-hooks/purity` lint rule** rejects `Date.now()` / `new Date()` in a component body. Put time logic in `lib/` functions (see `linkExpired`, `daysSince`).
- **ESLint rejects `require()`** everywhere, including scripts; use ESM.
- **`Notice` content must be able to shrink** (`min-w-0`) or long buttons overflow at 320px with large text. Fixed in `components/ui.tsx`.
- **State shape**: per-patient fields live in `PatientState` (`lib/store.ts`), device-wide ones (`lang`, `bigText`, `patientId`, `clinicianAck`, `stock`) in `DEVICE_KEYS`. Every stored field needs a sanitizer in `sanitizePatient` / `sanitize`, or a bad save can break a screen.
- **Sanitizers matter more with a server**: data now arrives from other devices. A test row with an empty `estimate` crashed `/clinico` (TrafficLight read `undefined.box`); `validEntry` now checks the estimate's shape. Every new field still needs a sanitizer in `lib/store.ts`.
- **plpgsql**: name variables `v_…`, or `code` clashes with the `code` column. On Supabase, pgcrypto lives in the `extensions` schema (`extensions.gen_random_bytes`).
- **Don't `pkill -f` a pattern that appears in your own command line**: it kills the shell running it.
- **Test where the user is**: the first server e2e ran Chrome on the VM, so `127.0.0.1:54321` worked there and nowhere else. The user browses from another computer. Run e2e:server with `BLOCK` and the VM's address, and check how the user reaches the app before handing it over.
- **Port 3100** had a stale `next start` from session 1 (left running). Session 2 used 3210 (demo) and 3220 (server).
- **Avoid unverified facts in patient copy** (e.g. a hotline number). Ask or leave it out.
- **The USDA `DEMO_KEY` allows about 10 requests per hour.** For food rows use USDA's bulk FNDDS and SR Legacy files, and keep live API calls for spot checks.

## Food rows a clinician should review first

Malta (47–58 g) and jugo de tamarindo (62–76 g); guineos verdes (uses raw ripe banana: no green-banana entry in FDC); yautía (uses taro); saltfish pate (generic empanada); Crucian sweet bread (raisin bread); arroz con pollo (restaurant entrée, may run low); mangú, bizcocho, dulce de lechosa (wide ranges); galletas de soda (assume saltine size).

## Known gaps in F10/F15 (fix before real data)

- **PIN guessing**: 6 digits, protected only by Supabase Auth's per-IP rate limit. Add a lockout after N failed tries per phone.
- **AI routes are open**: `/api/plan`, `/api/estimate`, etc. do not check the caller. In server mode, require the bearer token (cost and abuse).
- **Business demand signal** (`/negocio/inventario`) now counts only the business's own customers' plans (it can't read others). A server-side aggregate (counts only, no patients) would restore the full signal.
- **Promotora sees every patient** in the clinic; `patients.chw_id` is set but not yet used to scope a caseload.
- **One clinic**: no clinic/tenant column yet.
- **Hosted project**: not created. Needs `npx supabase link` + `db push`, and Auth settings matching `supabase/config.toml` (sign-up off).

## What comes next

1. **F11/F17 on the server**: `NonRedemptionWatch` as a scheduled job (pg_cron) that records `NonRedemptionFlagged` and an outreach item for the assigned promotora, cleared on order or by hand. The clinic-wide outcomes export already works in server mode (the clinician sees all patients).
2. **F16 FHIR R4 SDOH export**: Hunger Vital Sign (LOINC 88121-9 panel), A1C, and the food prescription as a Bundle. Check every code against the source before shipping.
3. **F3 intake link + F18 SMS**: blocked on the SMS provider and sending number.
4. **Later (outside systems or policy)**: F19 vendor onboarding, F20 NAP/WIC/GusNIP, F21 MA benefit API, F22 1115 waiver evidence.

## Decisions still needed from the user

- SMS provider and sending number for F3/F18 (Twilio per the event storm?).
- Who creates and holds the hosted Supabase project.
- When (if) real patient data is in scope: BAA, hosting region, access review.
