"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.location.protocol.startsWith("http")
    ) {
      const register = () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .catch((error) => {
            if (process.env.NODE_ENV === "development") {
              console.warn("[PWA] Service worker registration failed:", error);
            }
          });
      };

      if (document.readyState === "complete") {
        register();
      } else {
        window.addEventListener("load", register, { once: true });
        return () => window.removeEventListener("load", register);
      }
    }
  }, []);

  return null;
}

export const ServiceWorkerProvider = ServiceWorkerRegistration;
export default ServiceWorkerRegistration;
