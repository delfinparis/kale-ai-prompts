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

// Location fields each have their own normalization rule before hashing.
// https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
// City: lowercase letters only, no spaces or punctuation ("St. Louis" -> "stlouis").
export function normCity(v?: string | null): string | undefined {
  if (!v) return undefined;
  const s = v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]/g, "");
  return s || undefined;
}
// State: lowercase code, letters and digits only ("IL" -> "il").
export function normState(v?: string | null): string | undefined {
  if (!v) return undefined;
  const s = v.toLowerCase().replace(/[^a-z0-9]/g, "");
  return s || undefined;
}
// ZIP: lowercase, no spaces or dashes; US ZIPs use the first 5 digits only.
export function normZip(v?: string | null, country?: string | null): string | undefined {
  if (!v) return undefined;
  let s = v.toLowerCase().replace(/[\s-]/g, "");
  if ((country || "").toLowerCase() === "us") s = s.replace(/\D/g, "").slice(0, 5);
  return s || undefined;
}
// Country: two-letter ISO code, lowercase ("US" -> "us").
export function normCountry(v?: string | null): string | undefined {
  if (!v) return undefined;
  const s = v.toLowerCase().replace(/[^a-z]/g, "");
  return s.length === 2 ? s : undefined;
}

type UserData = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  // Approximate location. On tapthis.co these come from Vercel's IP geolocation
  // headers, not from anything the visitor typed.
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
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
    ct: (() => { const v = normCity(u.city); return v && sha256(v); })(),
    st: (() => { const v = normState(u.state); return v && sha256(v); })(),
    zp: (() => { const v = normZip(u.zip, u.country); return v && sha256(v); })(),
    country: (() => { const v = normCountry(u.country); return v && sha256(v); })(),
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
