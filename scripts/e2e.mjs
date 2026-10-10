// End-to-end QA of the hackathon features against a running production server.
// Usage: npm run build && PORT=3100 npm start   (in another terminal), then: npm run e2e
// Runs with no API key (labeled fallbacks). Needs a local Chrome: set CHROME=/path/to/chrome if not /usr/bin/google-chrome.
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const BASE = process.env.BASE || "http://localhost:3100";
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const OUT = path.join(os.tmpdir(), "receta-e2e");
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const ok = (name, cond, extra = "") => { results.push({ name, pass: !!cond, extra }); console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`); };

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  const M = () => page.locator("main:visible");
  const go = async (p) => { await page.goto(BASE + p); await page.waitForLoadState("networkidle"); };
  const click = (name) => M().getByRole("button", { name, exact: false }).first().click();
  const text = async () => (await page.locator("main:visible").innerText());

  // F6: disclosure gate
  await go("/clinico");
  ok("F6 disclosure shown on first visit", (await text()).includes("Antes de empezar"));
  await click("Entendido, empezar");
  ok("F6 acknowledged -> prescribe form", (await text()).includes("Recetar comida"));
  await go("/clinico");
  ok("F6 not shown again", !(await text()).includes("Antes de empezar"));

  // F8: clinician answers for patient
  await click("Contestar por el paciente");
  await page.waitForURL("**/intake");
  ok("F8 helper banner on intake", (await text()).includes("Usted está contestando por"));
  await M().getByText("Bien", { exact: true }).click();
  for (let i = 0; i < 5; i++) {
    if (i === 1) await M().locator("textarea").fill("arroz con habichuelas y café con pan");
    await click("Siguiente");
  }
  await M().locator("textarea").fill("mariscos");
  await click("Enviar a mi clínico");
  await page.waitForSelector("text=Gracias");
  await go("/clinico");
  ok("F8 summary tagged with helper", (await text()).includes("Contestado con ayuda de personal de la clínica"));

  // Send prescription
  await click("Enviar receta");
  await page.waitForSelector("text=Receta enviada", { timeout: 30000 });
  ok("Rx sent", true);

  // F5, F4, F18, F12 on plan
  await go("/plan");
  await page.waitForSelector("text=Día 1 de 7", { timeout: 60000 });
  const planText = await text();
  ok("F5 listen-to-day control present", planText.includes("Escuchar las comidas de este día"));
  ok("F4 teach-back question present", planText.includes("Si una comida sale en rojo"));
  await M().getByText("Tengo que tomar más medicina").click();
  await click("Ver si está bien");
  ok("F4 wrong answer explained (medicine safety)", (await text()).includes("Nunca cambie su medicina"));
  await M().getByText("Esa comida tiene bastantes más carbohidratos que mi meta").click();
  await click("Ver si está bien");
  ok("F4 correct answer confirmed", (await text()).includes("¡Correcto!"));
  await page.emulateMedia({ media: "print" });
  const printVisible = await page.locator("h1:visible", { hasText: /^Plan de la semana/ }).count() > 0;
  const daysInPrint = await M().locator("section h3").count();
  ok("F18 print view shows the whole week", printVisible && daysInPrint >= 7, `day sections=${daysInPrint}`);
  await page.pdf({ path: path.join(OUT, "plan-print.pdf") }).catch(() => {});
  await page.emulateMedia({ media: "screen" });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
  await page.evaluate(() => { delete Navigator.prototype.share; });
  await click("Compartir con mi familia");
  await page.waitForTimeout(300);
  let link = await page.evaluate(() => navigator.clipboard.readText().catch(() => ""));
  if (!link) link = await M().locator("#family-link").inputValue().catch(() => "");
  ok("F12 family link generated", link.includes("/familia#"), `${link.length} chars`);

  // F13, F7 on comida
  await go("/comida");
  await M().locator("textarea").fill("arroz con pollo y una malta");
  await click("Ver mi estimado");
  await page.waitForSelector("text=Su estimado", { timeout: 30000 });
  const est = await text();
  ok("F2 new dishes estimated from table", est.includes("Arroz con pollo") && /Malta/i.test(est));
  await click("Hoy no pude comer bien");
  await M().getByText("No tenía comida", { exact: true }).click();
  await click("Guardar");
  ok("F13 skip saved", (await text()).includes("Anotado. Su clínico lo verá."));
  const week = await text();
  ok("F7 week card shows counts and skip", week.includes("Mi semana") && week.includes("No tenía comida"));
  await page.screenshot({ path: path.join(OUT, "comida.png"), fullPage: true });

  // F1 + F17 on clinico
  await go("/clinico");
  const cl = await text();
  ok("F1 progress panel present", cl.includes("Cómo le va"));
  ok("F1 no-food alert shown", cl.includes("no tenía comida"));
  ok("F1 teach-back first answer recorded as wrong", cl.includes("No la contestó bien"));
  ok("F1 meals listed", cl.includes("arroz con pollo y una malta"));
  await M().locator("input[inputmode=decimal]").fill("8.2");
  await click("Guardar A1C");
  ok("F17 A1C saved", (await text()).includes("8.2%"));
  const dl = page.waitForEvent("download");
  await click("Descargar CSV sin nombres");
  const csvPath = path.join(OUT, "export.csv");
  await (await dl).saveAs(csvPath);
  const csv = fs.readFileSync(csvPath, "utf8");
  ok("F17 CSV exported without names", csv.startsWith("patient_code") && !csv.includes("Milagros") && csv.includes("8.2"), csv.split("\n")[1]);
  await page.screenshot({ path: path.join(OUT, "clinico.png"), fullPage: true });

  // F11 promotora
  await go("/promotora");
  let pr = await text();
  ok("F11 caseload lists patients, urgent first", pr.indexOf("Doña Milagros") < pr.indexOf("Don Ismael"));
  await M().getByRole("button", { name: "Llamé" }).first().click();
  ok("F11 quick note saved", (await text()).includes("Nota guardada"));
  await click("Simular que pasaron 3 días");
  pr = await text();
  ok("F11 non-redemption flag after 3 days", pr.includes("Receta sin recoger hace 3 días"));
  await go("/clinico");
  ok("F11 clinician sees promotora note", (await text()).includes("Llamé"));

  // F14 inventory
  await go("/negocio/inventario");
  await M().getByText("Colmado La Esperanza", { exact: true }).click();
  ok("F14 demand signal visible", (await text()).includes("Lo que piden los planes"));
  await M().getByLabel("Avena", { exact: true }).uncheck();
  await M().locator("#extra-c1").fill("Panapén");
  await click("Añadir");
  await click("Guardar");
  ok("F14 stock saved", (await text()).includes("Guardado. Los planes nuevos"));
  await go("/canjear");
  await M().getByText("Colmado La Esperanza").first().click();
  const cj = await text();
  ok("F14 patient sees updated stock", cj.includes("Panapén") && !cj.includes("Avena"));

  // F12 family page
  await go(link.replace(/^https?:\/\/[^/]+/, ""));
  const fam = await text();
  ok("F12 family view renders read-only plan", fam.includes("Solo para ver") && fam.includes("Meta por comida"));
  ok("F12 family view hides food log", !fam.includes("arroz con pollo y una malta"));
  await go("/familia#garbage");
  ok("F12 bad link handled", (await text()).includes("no se puede abrir"));

  // Accessibility: axe on every screen, both languages, 320px with large text
  const screens = ["/", "/paciente", "/intake", "/plan", "/comida", "/canjear", "/clinico", "/promotora", "/negocio", "/negocio/inventario", "/acerca", link.replace(/^https?:\/\/[^/]+/, "")];
  await page.setViewportSize({ width: 320, height: 700 });
  for (const lang of ["es", "en"]) {
    await page.evaluate((lang) => { const k = "receta-fresca-v2"; const s = JSON.parse(localStorage.getItem(k)); s.lang = lang; s.bigText = true; localStorage.setItem(k, JSON.stringify(s)); }, lang);
    for (const sc of screens) {
      await go(sc);
      await page.addScriptTag({ content: AXE });
      const r = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] })).violations.map((v) => `${v.id}(${v.nodes.length})`));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      ok(`a11y ${lang} ${sc.slice(0, 24)}`, r.length === 0 && !overflow, [...r, overflow ? "horizontal-overflow" : ""].filter(Boolean).join(" "));
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });

  await page.evaluate(() => { const k = "receta-fresca-v2"; const s = JSON.parse(localStorage.getItem(k)); s.lang = "es"; s.bigText = false; localStorage.setItem(k, JSON.stringify(s)); });
  // F9 offline: service worker installed, then table-only estimate with no network
  await go("/");
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForTimeout(3000);
  await ctx.setOffline(true);
  await page.goto(BASE + "/comida").catch(() => {});
  await page.waitForTimeout(800);
  const offlineOpen = (await page.locator("main:visible").count()) > 0 && (await text()).includes("comió");
  ok("F9 meal screen opens offline", offlineOpen);
  if (offlineOpen) {
    await M().locator("textarea").fill("arroz blanco");
    await click("Ver mi estimado");
    await page.waitForTimeout(800);
    ok("F9 offline table-only estimate", (await text()).includes("Sin conexión: este estimado"));
  }
  await page.goto(BASE + "/promotora").catch(() => {});
  ok("F9 other page opens offline (precached)", (await text()).includes("Mis pacientes"));
  await ctx.setOffline(false);

  const real = errors.filter((e) => !/Failed to fetch|ERR_INTERNET_DISCONNECTED|net::/.test(e));
  ok("no page errors", real.length === 0, real.slice(0, 5).join(" | "));
  await browser.close();
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error("CRASH", e); process.exit(2); });
