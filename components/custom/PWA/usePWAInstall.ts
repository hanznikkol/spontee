"use client";

import { useSyncExternalStore } from "react";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let isInstalled = false;
let isDismissed = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function checkIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const isStandaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
  const nav = window.navigator as unknown as { standalone?: boolean };
  const isIosStandalone = Boolean(nav && "standalone" in nav && nav.standalone);
  return isStandaloneMedia || isIosStandalone;
}

if (typeof window !== "undefined") {
  isInstalled = checkIsStandalone();

  try {
    isDismissed = sessionStorage.getItem("spontee-install-dismissed") === "true";
  } catch {
    isDismissed = false;
  }

  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    if (!isInstalled && !isDismissed) {
      deferredPrompt = e as BeforeInstallPromptEvent;
      notify();
    }
  });

  window.addEventListener("appinstalled", () => {
    isInstalled = true;
    deferredPrompt = null;
    notify();
  });

  try {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        isInstalled = true;
        deferredPrompt = null;
        notify();
      }
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    }
  } catch {
    // Ignore environments where matchMedia listener is unsupported
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): boolean {
  return Boolean(deferredPrompt) && !isInstalled && !isDismissed;
}

function getServerSnapshot(): boolean {
  return false;
}

export function usePWAInstall() {
  const canInstall = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    const promptEvent = deferredPrompt;

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;

      if (choice.outcome === "dismissed") {
        isDismissed = true;
        try {
          sessionStorage.setItem("spontee-install-dismissed", "true");
        } catch {
          // ignore storage error
        }
        return false;
      }

      if (choice.outcome === "accepted") {
        isInstalled = true;
        return true;
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[PWA] Installation prompt failed:", error);
      }
      return false;
    } finally {
      deferredPrompt = null;
      notify();
    }

    return false;
  };

  return { canInstall, install };
}
