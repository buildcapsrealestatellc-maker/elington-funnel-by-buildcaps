"use client";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/** Pushes an event for GTM, which forwards it to GA4, Ads and Meta. */
export function track(event: string, data: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...data });
}
