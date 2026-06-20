// === Service Worker: Geistlicher StrandBegleiter ===
//
// Versionsnummer erhöhen (v1 -> v2 -> v3 ...), sobald sich Inhalte/Bilder
// ändern. Nur so merkt der Browser, dass er den Cache erneuern muss.
const CACHE_NAME = "strandbegleiter-v1";

// Alle Dateien, die für die Offline-Nutzung vorab gespeichert werden sollen.
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./bernstein.html",
  "./glaubetogo.html",
  "./kontakt.html",
  "./promenade.html",
  "./rettungsturm.html",
  "./schiffe.html",
  "./seebruecke.html",
  "./strand.html",
  "./strandhafer.html",
  "./strandkorb.html",

  "./bernsteinbild.jpg",
  "./Cover.jpg",
  "./dreikirchen.jpg",
  "./promenadebild.jpg",
  "./rettungsturm.jpg",
  "./seebrueckebild.jpg",
  "./strandbild.jpg",
  "./strandhaferbild.jpg",
  "./strandkorbbild.jpg",
  "./teaser.jpg",
  "./wasser.jpg",
  "./dreikirchen.png",
  "./siegel.png",
  "./thesenkreuz.svg",

  "./register.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512-maskable.png",
  "./icon-512.png"
];

// --- INSTALL: Alle Dateien einmalig in den Cache laden ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // addAll bricht ab, wenn EINE Datei fehlt/falsch benannt ist.
      // Daher einzeln laden, damit ein Tippfehler nicht alles blockiert.
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("Konnte nicht gecacht werden:", url, err);
          })
        )
      );
    })
  );
  self.skipWaiting(); // neue Version sofort aktivieren
});

// --- ACTIVATE: Alte Cache-Versionen aufräumen ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// --- FETCH: Cache-First, mit Netzwerk-Fallback ---
self.addEventListener("fetch", (event) => {
  // Nur GET-Anfragen behandeln (z. B. keine Formular-POSTs)
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // aus dem Cache, funktioniert offline
      }

      // Nicht im Cache -> aus dem Netz laden und für später mit-cachen
      return fetch(event.request)
        .then((networkResponse) => {
          // Nur gültige Antworten cachen (keine Fehlerseiten o.Ä.)
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Kein Netz und nicht im Cache -> bei HTML-Seiten
          // notfalls die Startseite anzeigen
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});