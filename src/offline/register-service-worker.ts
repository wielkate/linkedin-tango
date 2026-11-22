// Registers the service worker that stores the game for offline play. It only exists in the
// production build (dist/service-worker.js), so the dev server skips it.
export function registerServiceWorker(): void {
  const isSupported = "serviceWorker" in navigator;
  const isProductionBuild = import.meta.env.PROD;
  if (!isSupported || !isProductionBuild) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .catch((error: unknown) => {
        console.error("Offline play is not available:", error);
      });
  });
}
