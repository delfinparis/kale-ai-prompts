// lib/meta-events.ts
// Client-side helper. Generates ONE event_id per event and uses it for both
// the browser pixel (fired via GTM) and the server-side CAPI call, so Meta can
// deduplicate them. Import this into client components only.

"use client";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : undefined;
}

export function newEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Call this when the email form is submitted: trackLead(email)
export async function trackLead(email: string): Promise<void> {
  const eventId = newEventId();
  const fbp = getCookie("_fbp");
  const fbc = getCookie("_fbc");

  // 1) Hand the event_id to GTM so the browser-pixel Lead (if you wire one up)
  //    fires with the SAME id. See SETUP.md "Deduplication" for the GTM config.
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "meta_lead", meta_event_id: eventId });

  // 2) Fire the server-side CAPI Lead with the same id.
  try {
    await fetch("/api/meta/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        eventId,
        eventSourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
        fbp,
        fbc,
      }),
      keepalive: true, // lets the request finish even if the page navigates away
    });
  } catch (err) {
    console.error("[meta-events] CAPI lead failed:", err);
  }
}

// OPTIONAL. Call once on page load if you enable the pageview route.
export async function trackPageView(): Promise<void> {
  const eventId = newEventId();
  const fbp = getCookie("_fbp");
  const fbc = getCookie("_fbc");

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "meta_pageview", meta_event_id: eventId });

  try {
    await fetch("/api/meta/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        eventSourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
        fbp,
        fbc,
      }),
      keepalive: true,
    });
  } catch (err) {
    console.error("[meta-events] CAPI pageview failed:", err);
  }
}
