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

export type PWAPlatform = "chromium" | "ios" | "unsupported";

interface PWAState {
  canInstall: boolean;
  platform: PWAPlatform;
  isIOSDialogOpen: boolean;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let isInstalled = false;
let isDismissed = false;
let isIOSUser = false;
let isIOSDialogOpen = false;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function checkIsIOS(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const userAgent = navigator.userAgent || "";
  const isIosDevice = /iPad|iPhone|iPod/.test(userAgent);
  const isIpadOS =
    navigator.platform === "MacIntel" &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1;
  return isIosDevice || isIpadOS;
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
  isIOSUser = checkIsIOS();

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
    isIOSDialogOpen = false;
    notify();
  });

  try {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        isInstalled = true;
        deferredPrompt = null;
        isIOSDialogOpen = false;
        notify();
      }
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    }
  } catch {
    // Ignore unsupported matchMedia listener
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

let currentSnapshot: PWAState = {
  canInstall: false,
  platform: "unsupported",
  isIOSDialogOpen: false,
};

function getSnapshot(): PWAState {
  const canInstall = !isInstalled && ((Boolean(deferredPrompt) && !isDismissed) || isIOSUser);
  const platform: PWAPlatform = isIOSUser ? "ios" : deferredPrompt ? "chromium" : "unsupported";

  if (
    currentSnapshot.canInstall !== canInstall ||
    currentSnapshot.platform !== platform ||
    currentSnapshot.isIOSDialogOpen !== isIOSDialogOpen
  ) {
    currentSnapshot = {
      canInstall,
      platform,
      isIOSDialogOpen,
    };
  }
  return currentSnapshot;
}

const serverSnapshot: PWAState = {
  canInstall: false,
  platform: "unsupported",
  isIOSDialogOpen: false,
};

function getServerSnapshot(): PWAState {
  return serverSnapshot;
}

export function usePWAInstall() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const openIOSDialog = () => {
    if (!isIOSUser) return;
    isIOSDialogOpen = true;
    notify();
  };

  const closeIOSDialog = () => {
    isIOSDialogOpen = false;
    notify();
  };

  const install = async (): Promise<boolean> => {
    if (isIOSUser) {
      openIOSDialog();
      return true;
    }

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

  return {
    canInstall: state.canInstall,
    platform: state.platform,
    isIOS: state.platform === "ios",
    isIOSDialogOpen: state.isIOSDialogOpen,
    openIOSDialog,
    closeIOSDialog,
    install,
  };
}
