import { NextRequest, NextResponse } from "next/server";
import { sendCapiEvent } from "@/lib/meta-capi";

export const runtime = "nodejs"; // node crypto needed for CAPI hashing; keep off the Edge runtime

export async function POST(req: NextRequest) {
  try {
    const { email, level, eventId, eventSourceUrl, fbp, fbc, promptText, promptTitle, src, firstName } =
      await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    const levelLabel =
      level === "new"
        ? "New Agent (0-2 years)"
        : level === "mid"
          ? "Mid-Career (3-7 years)"
          : level === "top"
            ? "Top Producer (20+ deals/yr)"
            : "Not specified";

    // Lead source for Close. LinkedIn gated carousels link here with a ?src=li-<slug>
    // tag (see video-strategy repo data/keyword-registry.md) so a LinkedIn tool lead is
    // distinguishable from an IG/FB ManyChat gate lead and from an organic tapthis visitor.
    // Without the tag all three collapse into one bucket and attribution is lost.
    const SRC_LABELS: Record<string, string> = {
      "li-scripts": "LinkedIn - Scripts",
      "li-prompts": "LinkedIn - Prompts",
      "li-voice": "LinkedIn - Voice",
      "li-toolkit": "LinkedIn - Toolkit",
    };
    const leadSource =
      typeof src === "string" && src.trim()
        ? SRC_LABELS[src.trim()] || `Web - ${src.trim()}`
        : "Copy That";

    // Optional first name. The joinkale.com gated lead magnets (Objection Response
    // Vault and the vaults after it) collect first name + email, so the lead lands in
    // Close as a person rather than a bare address. Everything else still posts email
    // only, which is why this stays optional and falls back to the address.
    const cleanFirstName =
      typeof firstName === "string" && firstName.trim() ? firstName.trim().slice(0, 60) : "";
    const leadName = cleanFirstName ? `${cleanFirstName} (${email})` : email;

    // Send to Google Sheets (non-blocking)
    const webhookUrl = process.env.PROMPT_VAULT_SHEETS_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveLead",
          data: {
            email,
            level: levelLabel,
            source: "prompt-vault",
            timestamp: new Date().toISOString(),
          },
        }),
      }).catch(() => {});
    }

    // Send to Close CRM (non-blocking)
    const closeApiKey = process.env.CLOSE_API_KEY;
    if (closeApiKey) {
      const authHeader = `Basic ${Buffer.from(`${closeApiKey}:`).toString("base64")}`;

      // Create lead with email only, status = "New Lead"
      fetch("https://api.close.com/api/v1/lead/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          name: leadName,
          status_id: "stat_broiYwml7eEj5SFwAvolMOhK0bPsA961YhnhVgyqtDJ",
          contacts: [
            {
              ...(cleanFirstName ? { name: cleanFirstName } : {}),
              emails: [{ email, type: "office" }],
            },
          ],
          // Kale Lead Source. This previously wrote to cf_c09clx40... which is "Lead Type"
          // (the A/B/C field) -- every capture was invisible to source reporting AND was
          // quietly corrupting Lead Type. Fixed 2026-07-22.
          "custom.cf_U9j9E5v9LuS4SMLZfI854gU88tmhi0GLVlxtzbZp1yD": leadSource,
        }),
      })
        .then((res) => res.json())
        .then((lead) => {
          // Add a note with source details
          if (lead?.id) {
            fetch("https://api.close.com/api/v1/activity/note/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
              },
              body: JSON.stringify({
                lead_id: lead.id,
                note: `Source: ${leadSource}\nExperience Level: ${levelLabel}\nCaptured: ${new Date().toISOString()}`,
              }),
            }).catch(() => {});
          }
        })
        .catch(() => {});
    }

    // Fire the Meta CAPI Lead server-side. This is the priority event: it carries
    // the hashed email and survives ad blockers / Instagram's in-app browser.
    // Deduplicates with the GTM browser pixel via the shared eventId + "Lead".
    // Awaited so it flushes before the serverless function freezes; failures are
    // swallowed inside sendCapiEvent and must not block the signup response.
    if (eventId) {
      await sendCapiEvent({
        eventName: "Lead",
        eventId,
        eventSourceUrl: eventSourceUrl || req.headers.get("referer") || undefined,
        userData: {
          email,
          clientIpAddress:
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
          clientUserAgent: req.headers.get("user-agent") || undefined,
          fbp,
          fbc,
        },
        customData: { content_name: "tapthis_email_capture", lead_level: levelLabel },
      });
    }

    // Email the prompt to the visitor as a "backup" (the gate's promise).
    // Sends via a Google Apps Script web app running under dj@kalerealty.com,
    // so the mail comes from the Workspace account with proper SPF/DKIM.
    // Skips silently if no prompt was sent or the webhook isn't configured yet,
    // so the gate + lead capture keep working before this is wired up.
    const emailWebhookUrl = process.env.PROMPT_EMAIL_WEBHOOK_URL;
    if (emailWebhookUrl && typeof promptText === "string" && promptText.trim()) {
      try {
        await fetch(emailWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: process.env.PROMPT_EMAIL_WEBHOOK_TOKEN || "",
            to: email,
            promptTitle: typeof promptTitle === "string" ? promptTitle : "Your prompt",
            promptText,
          }),
        });
      } catch (err) {
        console.error("Prompt backup email failed:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email capture error:", error);
    return NextResponse.json({ success: true });
  }
}
