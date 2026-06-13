// app/api/meta/pageview/route.ts
// OPTIONAL. Fires a server-side "PageView" to recover visits the browser pixel
// misses (e.g. inside the Instagram in-app browser). Read the SETUP notes on
// deduplication before enabling this alongside an existing GTM PageView tag,
// or you may double-count page views.

import { NextRequest, NextResponse } from "next/server";
import { sendCapiEvent } from "@/lib/meta-capi";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { eventId, eventSourceUrl, fbp, fbc } = body ?? {};

    if (!eventId) {
      return NextResponse.json(
        { ok: false, error: "eventId is required" },
        { status: 400 }
      );
    }

    const result = await sendCapiEvent({
      eventName: "PageView",
      eventId,
      eventSourceUrl,
      userData: {
        clientIpAddress:
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
        clientUserAgent: req.headers.get("user-agent") || undefined,
        fbp,
        fbc,
      },
    });

    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
