"use client";

import { useEffect } from "react";

const CACHE_MARKERS = ["serwist", "workbox", "contador-musical"];

export function ServiceWorkerUpdater() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "development") {
      void navigator.serviceWorker.getRegistrations().then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister())),
      );

      if ("caches" in window) {
        void caches.keys().then((keys) =>
          Promise.all(
            keys
              .filter((key) => CACHE_MARKERS.some((marker) => key.toLowerCase().includes(marker)))
              .map((key) => caches.delete(key)),
          ),
        );
      }
      return;
    }

    let reloadRequested = false;
    const applyUpdate = () => {
      if (reloadRequested) return;
      reloadRequested = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", applyUpdate);
    void navigator.serviceWorker.ready.then((registration) => registration.update());

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", applyUpdate);
    };
  }, []);

  return null;
}
