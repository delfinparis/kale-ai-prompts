// lib/meta-capi.ts
// Server-only. Sends events to the Meta Conversions API (CAPI).
// Never import this into a client component — it reads your secret access token.

import { createHash } from "crypto";

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const API_VERSION = "v21.0";
// Optional: set while testing so events show up in Events Manager > Test Events.
// Remove the env var (or leave it unset) in production.
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE;

// Meta requires email / phone / names to be normalized then SHA-256 hashed.
function hash(value?: string | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return createHash("sha256").update(normalized).digest("hex");
}

type UserData = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  // Passed through un-hashed (Meta hashes/uses these itself):
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbp?: string; // _fbp cookie
  fbc?: string; // _fbc cookie
};

type CapiEvent = {
  eventName: string; // "Lead", "PageView", etc.
  eventId: string; // dedup key — MUST match the browser pixel's eventID
  eventSourceUrl?: string;
  userData: UserData;
  customData?: Record<string, unknown>;
  eventTime?: number; // unix seconds; defaults to now
};

export async function sendCapiEvent(event: CapiEvent) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.error("[meta-capi] Missing META_PIXEL_ID or META_CAPI_ACCESS_TOKEN env var");
    return { ok: false as const, error: "missing_config" };
  }

  const u = event.userData;
  const user_data: Record<string, unknown> = {
    em: hash(u.email),
    ph: hash(u.phone),
    fn: hash(u.firstName),
    ln: hash(u.lastName),
    client_ip_address: u.clientIpAddress,
    client_user_agent: u.clientUserAgent,
    fbp: u.fbp,
    fbc: u.fbc,
  };
  // Strip undefined keys so we don't send empty fields.
  Object.keys(user_data).forEach(
    (k) => user_data[k] === undefined && delete user_data[k]
  );

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: event.eventName,
        event_time: event.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        event_source_url: event.eventSourceUrl,
        action_source: "website",
        user_data,
        custom_data: event.customData,
      },
    ],
    access_token: ACCESS_TOKEN, // sent in the body, never in the URL
  };
  if (TEST_EVENT_CODE) payload.test_event_code = TEST_EVENT_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const json = await res.json();
    if (!res.ok) {
      console.error("[meta-capi] Meta returned an error:", json);
      return { ok: false as const, error: json };
    }
    return { ok: true as const, result: json };
  } catch (err) {
    console.error("[meta-capi] Request failed:", err);
    return { ok: false as const, error: String(err) };
  }
}
