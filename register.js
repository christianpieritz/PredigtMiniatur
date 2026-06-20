// === Registrierung des Service Workers ===
// Diese Datei auf JEDER Seite einbinden (vor dem schließenden </body>):
// <script src="register.js"></script>
 
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => {
        console.log("Service Worker registriert:", reg.scope);
      })
      .catch((err) => {
        console.warn("Service Worker Registrierung fehlgeschlagen:", err);
      });
  });
}
 