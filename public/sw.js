// Minimal pass-through Service Worker for PWA installability.
// Caching is intentionally disabled to avoid interfering with Next.js App Router RSC payloads,
// Supabase Realtime subscriptions, active room voting states, and Google Places API calls.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through fetch event listener to satisfy PWA installation criteria without intercepting requests.
self.addEventListener("fetch", () => {
  // Let browser network stack handle all requests natively.
});
