// End-to-end QA of server mode (F10 accounts and sync, F15 vouchers): clinician, patient and business
// each on their own "device" (browser context), talking through the local Supabase.
// Usage:
//   npx supabase start && npx supabase db reset && npm run seed
//   NEXT_DIST_DIR=.next-server npm run build && NEXT_DIST_DIR=.next-server PORT=3220 npm start   (another terminal)
//   BASE=http://localhost:3220 npm run e2e:server
// Needs a local Chrome: set CHROME=/path/to/chrome if not /usr/bin/google-chrome.
// Remote browser (app and Supabase on a VM, browser elsewhere): build with NEXT_PUBLIC_SUPABASE_PROXY=1,
// open the app by the VM's address, and block the browser from Supabase's own address, as it would be:
//   BASE=http://<vm-ip>:3220 BLOCK=http://127.0.0.1:54321 npm run e2e:server
import { chromium } from "playwright-core";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const BASE = process.env.BASE || "http://localhost:3220";
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const STAFF_PW = "receta-demo";
const BLOCK = process.env.BLOCK ? new URL(process.env.BLOCK) : null;

const results = [];
const ok = (name, cond, extra = "") => { results.push({ name, pass: !!cond }); console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`); };
const errors = [];

async function device(browser, { noServer = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  // A browser on another computer cannot reach Supabase's address on the VM.
  if (BLOCK) {
    await ctx.route((u) => u.host === BLOCK.host, (r) => r.abort("connectionrefused"));
    await ctx.routeWebSocket((u) => u.host === BLOCK.host, (ws) => ws.close());
  }
  // Supabase unreachable by any path: the app is up, the data server is not.
  if (noServer) {
    await ctx.route(/\/(auth|rest|realtime)\/v1\/|:54321\//, (r) => r.abort("connectionrefused"));
    await ctx.routeWebSocket(/\/realtime\/v1\/|:54321\//, (ws) => ws.close());
  }
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  const M = () => page.locator("main:visible");
  return {
    ctx, page, M,
    go: async (p) => { await page.goto(BASE + p); await page.waitForLoadState("networkidle"); },
    click: (name, exact = false) => M().getByRole("button", { name, exact }).first().click(),
    text: async () => (await M().innerText()),
    waitText: (s, timeout = 15000) => M().getByText(s, { exact: false }).first().waitFor({ timeout }).then(() => true, () => false),
  };
}

async function signInStaff(d, email) {
  await d.M().getByText("Trabajo en la clínica o en un negocio").click();
  await d.M().getByLabel("Correo electrónico").fill(email);
  await d.M().getByLabel("Contraseña").fill(STAFF_PW);
  await d.click("Entrar", true);
}

async function signInPatient(d, phone, pin) {
  await d.M().getByLabel("Número de teléfono").fill(phone);
  await d.M().getByLabel(/^PIN de 6/).fill(pin);
  await d.click("Entrar", true);
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", headless: true });
  const clin = await device(browser);
  const pat = await device(browser);
  const biz = await device(browser);
  const name = `Prueba ${Date.now().toString().slice(-5)}`;
  const phone = "787" + String(Date.now()).slice(-7);
  const pin = "246813";

  // Signed out: protected screens ask to sign in; wrong PIN is refused.
  await pat.go("/canjear");
  ok("signed out: sign-in shown", (await pat.text()).includes("Entrar") && !(await pat.text()).includes("Recoger mi comida"));
  await signInPatient(pat, "7875550101", "000000");
  ok("wrong PIN refused", await pat.waitText("El teléfono o el PIN no son correctos"));
  await signInPatient(pat, "12345", "111111");
  ok("short phone number explained", await pat.waitText("Escriba los 10 números"));

  // Online, but the data server cannot be reached: say so, rather than "no connection".
  const cut = await device(browser, { noServer: true });
  await cut.go("/paciente");
  await signInPatient(cut, "7875550101", "111111");
  ok("unreachable server explained", await cut.waitText("No se pudo conectar con el servidor"));
  await cut.ctx.close();

  // Clinician signs in, acknowledges the AI disclosure, enrols a new patient.
  await clin.go("/clinico");
  await signInStaff(clin, "clinico@demo.receta.invalid");
  ok("clinician signed in", await clin.waitText("Antes de empezar"));
  await clin.click("Entendido, empezar");
  await clin.click("Inscribir paciente nuevo");
  await clin.click("Crear cuenta", true);
  ok("enrol form validates", (await clin.text()).includes("Escriba el nombre") && (await clin.text()).includes("El PIN debe tener 6 números"));
  await clin.M().getByLabel("Nombre").fill(name);
  await clin.M().getByLabel("Edad").fill("58");
  await clin.M().getByLabel("Pueblo").fill("Ponce");
  await clin.M().getByLabel("Teléfono del paciente").fill(phone);
  await clin.M().getByLabel(/^PIN de 6/).fill(pin);
  await clin.click("Crear cuenta", true);
  ok("patient account created", await clin.waitText("Cuenta creada. Dígale al paciente"));
  ok("new patient selected", await clin.M().getByRole("radio", { name: new RegExp(name) }).isChecked().catch(() => false));

  // Clinician sends a prescription for the new patient.
  await clin.click("Enviar receta");
  ok("rx sent", await clin.waitText("Receta enviada", 30000));

  // The patient signs in on their own phone and sees it.
  await signInPatient(pat, phone, pin);
  ok("patient signed in, sees own prescription", await pat.waitText("Dónde quiere recoger su comida"));
  await pat.go("/paciente");
  ok("patient sees own name", (await pat.text()).includes(name));
  ok("patient cannot switch person", !(await pat.text()).includes("No soy esta persona"));
  await pat.go("/clinico");
  ok("patient kept out of clinician screen", (await pat.text()).includes("Esta página no es para su cuenta"));

  // Order: the server issues the voucher.
  await pat.go("/canjear");
  await pat.M().getByText("Colmado La Esperanza").first().click();
  await pat.click("Confirmar", true);
  ok("order placed", await pat.waitText("Enseñe este código"));
  const code = ((await pat.text()).match(/RF-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}/) ?? [])[0];
  ok("voucher code shown", Boolean(code), code);
  ok("voucher end date shown", (await pat.text()).includes("Vale hasta el"));

  // The business sees the order live, moves it, and redeems the voucher as its own step.
  await biz.go("/negocio");
  await signInStaff(biz, "negocio-c1@demo.receta.invalid");
  ok("business sees the new order", await biz.waitText(name, 20000));
  ok("business sees own place only", (await biz.text()).includes("Colmado La Esperanza") && !(await biz.text()).includes("Fonda Doña Carmen"));
  ok("voucher starts unredeemed", (await biz.text()).includes("Vale: sin canjear"));
  await biz.click("Marcar: Preparando");
  ok("status moved", await biz.waitText("Estado: Preparando"));
  ok("patient sees status live", await pat.waitText("Preparando"));
  await biz.M().getByLabel("Código del vale").fill(code.toLowerCase().replace(/-/g, " "));
  await biz.click("Canjear", true);
  ok("voucher redeemed (typed loosely)", await biz.waitText("Vale aceptado"));
  await biz.M().getByLabel("Código del vale").fill(code);
  await biz.click("Canjear", true);
  ok("second redemption refused", await biz.waitText("Este vale ya se usó"));
  await biz.M().getByLabel("Código del vale").fill("RF-2222-2222");
  await biz.click("Canjear", true);
  ok("unknown code refused", await biz.waitText("Ese código no existe"));
  ok("patient sees voucher used, live", await pat.waitText("Vale usado el", 20000));
  ok("cannot change place after start", !(await pat.text()).includes("Cambiar de lugar"));

  // Business stock reaches the patient's device.
  await biz.go("/negocio/inventario");
  ok("business edits own stock only", !(await biz.text()).includes("¿Cuál es su negocio?"));
  await biz.M().getByLabel("Avena", { exact: true }).uncheck();
  await biz.M().locator("#extra-c1").fill("Panapén");
  await biz.click("Añadir", true);
  await biz.click("Guardar", true);
  ok("stock saved", await biz.waitText("Guardado. Los planes nuevos"));

  // Offline on the patient's phone: the change waits in the outbox and is sent on reconnect.
  await pat.go("/comida");
  await pat.ctx.setOffline(true);
  await pat.click("Hoy no pude comer bien");
  await pat.M().getByText("No tenía comida", { exact: true }).click();
  await pat.click("Guardar", true);
  ok("offline: skip saved on phone", await pat.waitText("Anotado. Su clínico lo verá."));
  ok("offline: waiting-to-send shown", await pat.page.getByText("Se enviará cuando haya conexión").first().waitFor({ timeout: 5000 }).then(() => true, () => false));
  await pat.ctx.setOffline(false);
  ok("online: outbox sent", await pat.page.getByText("Se enviará cuando haya conexión").first().waitFor({ state: "hidden", timeout: 30000 }).then(() => true, () => false));
  await clin.go("/promotora");
  ok("clinician sees the patient's no-food day", await clin.waitText("que no tenía comida", 20000));

  // Accessibility of the new screens: both languages, 320px, large text.
  const setPrefs = (d, lang, big) => d.page.evaluate(([lang, big]) => { const k = "receta-fresca-v2"; const s = JSON.parse(localStorage.getItem(k) || "{}"); s.lang = lang; s.bigText = big; localStorage.setItem(k, JSON.stringify(s)); }, [lang, big]);
  const anon = await device(browser);
  const screens = [[anon, "/entrar"], [clin, "/clinico"], [clin, "/promotora"], [pat, "/canjear"], [biz, "/negocio"]];
  for (const [d] of screens) await d.page.setViewportSize({ width: 320, height: 700 });
  for (const lang of ["es", "en"]) {
    for (const [d, sc] of screens) {
      await d.go(sc);
      await setPrefs(d, lang, true);
      await d.go(sc);
      if (sc === "/clinico") await d.click(lang === "es" ? "Inscribir paciente nuevo" : "Enrol a new patient");
      if (sc === "/promotora") await d.M().getByRole("button", { name: lang === "es" ? "Darle un PIN nuevo" : "Give a new PIN" }).first().click();
      await d.page.addScriptTag({ content: AXE });
      const r = await d.page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] })).violations.map((v) => `${v.id}(${v.nodes.length})`));
      const overflow = await d.page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      ok(`a11y ${lang} ${sc}`, r.length === 0 && !overflow, [...r, overflow ? "horizontal-overflow" : ""].filter(Boolean).join(" "));
    }
  }
  await setPrefs(pat, "es", false);

  // Sign out removes the records from the phone.
  await pat.page.setViewportSize({ width: 390, height: 844 });
  await pat.go("/paciente");
  await pat.page.getByRole("button", { name: "Salir", exact: true }).click();
  await pat.page.waitForURL(BASE + "/");
  const left = await pat.page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("receta-fresca-srv:") || k.startsWith("receta-fresca-outbox:")));
  ok("sign out clears this phone's records", left.length === 0, left.join(","));
  await pat.go("/canjear");
  ok("signed out again", (await pat.text()).includes("Entrar"));

  const real = errors.filter((e) => !/Failed to fetch|ERR_INTERNET_DISCONNECTED|net::|status of 40[03]|WebSocket/.test(e));
  ok("no page errors", real.length === 0, real.slice(0, 5).join(" | "));
  await browser.close();
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error("CRASH", e); process.exit(2); });
