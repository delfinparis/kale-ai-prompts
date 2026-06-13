// app/api/meta/lead/route.ts
// Fires a server-side "Lead" event to Meta when someone submits their email.
// This is the high-value event: it carries the hashed email, which Meta uses
// for match quality, remarketing audiences, and lookalike seeds.

import { NextRequest, NextResponse } from "next/server";
import { sendCapiEvent } from "@/lib/meta-capi";

export const runtime = "nodejs"; // node crypto needed; keep off the Edge runtime

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, eventId, eventSourceUrl, fbp, fbc } = body ?? {};

    if (!email || !eventId) {
      return NextResponse.json(
        { ok: false, error: "email and eventId are required" },
        { status: 400 }
      );
    }

    const result = await sendCapiEvent({
      eventName: "Lead",
      eventId,
      eventSourceUrl,
      userData: {
        email,
        clientIpAddress:
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
        clientUserAgent: req.headers.get("user-agent") || undefined,
        fbp,
        fbc,
      },
      customData: { content_name: "tapthis_email_capture" },
    });

    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
