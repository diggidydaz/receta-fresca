// Receta Fresca offline support. Keeps the app's screens and files on the phone so a patient with a
// weak signal can still open their plan and note meals. AI requests (/api/) always go to the network.
const CACHE = "receta-fresca-v1";
const PAGES = ["/", "/paciente", "/plan", "/comida", "/canjear", "/intake", "/acerca", "/familia", "/clinico", "/promotora", "/negocio"];
const FILES = ["/logo.svg", "/icon-192.png", "/icon-512.png", "/manifest.webmanifest"];

// Each page's own scripts and styles, so a page never opened online still works offline.
async function precache() {
  const cache = await caches.open(CACHE);
  await cache.addAll(FILES).catch(() => {});
  const assets = new Set();
  for (const page of PAGES) {
    try {
      const res = await fetch(page, { credentials: "same-origin" });
      if (!res.ok) continue;
      const html = await res.clone().text();
      await cache.put(page, res);
      for (const m of html.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)) assets.add(m[0]);
    } catch {
      /* offline during install: the page is cached later, when visited */
    }
  }
  await Promise.all([...assets].map((a) => cache.add(a).catch(() => {})));
}

self.addEventListener("install", (e) => {
  e.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // Built files never change under the same name: use the saved copy first.
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }))
    );
    return;
  }

  // Pages and everything else: the network first, so updates arrive; the saved copy when offline.
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && (req.mode === "navigate" || FILES.includes(url.pathname))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(url.pathname, copy));
        }
        return res;
      })
      .catch(async () => (await caches.match(url.pathname)) || (await caches.match(req)) || (req.mode === "navigate" ? caches.match("/") : Response.error()))
  );
});
