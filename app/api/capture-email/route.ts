import { NextRequest, NextResponse } from "next/server";
import { sendCapiEvent } from "@/lib/meta-capi";

export const runtime = "nodejs"; // node crypto needed for CAPI hashing; keep off the Edge runtime

// The gated lead magnets on joinkale.com (a Squarespace site) post here from a different
// origin, so this route has to answer CORS preflight and echo an allowed origin. Same-origin
// callers on tapthis.co are unaffected. Keep this an allowlist, never "*", because the route
// creates Close leads and fires Meta CAPI.
const ALLOWED_ORIGINS = new Set([
  "https://joinkale.com",
  "https://www.joinkale.com",
]);

// Sources that get a human follow-up: a Close task for Ahmed and a heads-up email to D.J.
// Only the joinkale.com one-pager forms for now. The tapthis.co prompt gates are national,
// high-volume and anonymous, so they stay capture-only.
const FOLLOW_UP_SRCS = new Set(["jk-onething"]);
const AHMED_USER_ID = "user_WRtgYeUnex3DDWs34EIVdjBRhRHyXTQ2hLMz8NfhiYh"; // Ahmed Khaled
const DEFAULT_NOTIFY_EMAIL = "dj@kalerealty.com";

// Close wants a plain date for a task. Use Chicago's, so a 9pm request is still "today".
function chicagoToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
}

function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Vercel adds approximate location headers to every request. The city arrives
// URL-encoded ("San%20Francisco"). Missing headers (local dev) just yield nothing.
function ipLocation(req: NextRequest) {
  const h = (name: string) => req.headers.get(name) || undefined;
  let city = h("x-vercel-ip-city");
  if (city) {
    try { city = decodeURIComponent(city); } catch { /* leave as-is */ }
  }
  return {
    city,
    state: h("x-vercel-ip-country-region"),
    zip: h("x-vercel-ip-postal-code"),
    country: h("x-vercel-ip-country"),
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function POST(req: NextRequest) {
  const cors = corsHeaders(req.headers.get("origin"));
  try {
    const { email, level, eventId, eventSourceUrl, fbp, fbc, promptText, promptTitle, src, firstName } =
      await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400, headers: cors }
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

    // Which page they were on. The one-pager forms send the page's H1 as promptTitle and
    // the page address as eventSourceUrl; without these on the lead, whoever follows up
    // can't tell which of the problems the agent raised a hand for.
    const wantsFollowUp = typeof src === "string" && FOLLOW_UP_SRCS.has(src.trim());
    const pageTitle =
      typeof promptTitle === "string" && promptTitle.trim() ? promptTitle.trim().slice(0, 200) : "";
    const pageUrl =
      typeof eventSourceUrl === "string" && /^https:\/\//.test(eventSourceUrl)
        ? eventSourceUrl.split("?")[0].slice(0, 300)
        : "";

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

    // Send to Close CRM. Started here and awaited just before the response, so it runs
    // alongside the Meta and email calls but is finished before the function freezes.
    // Resolves to the new lead's id, or "" if Close is off or the create failed.
    let closeWork: Promise<string> = Promise.resolve("");
    const closeApiKey = process.env.CLOSE_API_KEY;
    if (closeApiKey) {
      const authHeader = `Basic ${Buffer.from(`${closeApiKey}:`).toString("base64")}`;
      const closePost = async (path: string, body: unknown) => {
        const res = await fetch(`https://api.close.com/api/v1${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: authHeader },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`Close ${path} returned ${res.status}`);
        return res.json();
      };

      closeWork = (async () => {
        // Create lead with email only, status = "New Lead"
        const lead = await closePost("/lead/", {
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
        });
        if (!lead?.id) return "";

        const pageLines =
          (pageTitle ? `\nPage: ${pageTitle}` : "") + (pageUrl ? `\nPage URL: ${pageUrl}` : "");
        const jobs: Promise<unknown>[] = [
          // Add a note with source details
          closePost("/activity/note/", {
            lead_id: lead.id,
            note: `Source: ${leadSource}${pageLines}\nExperience Level: ${levelLabel}\nCaptured: ${new Date().toISOString()}`,
          }),
        ];
        if (wantsFollowUp) {
          jobs.push(
            closePost("/task/", {
              _type: "lead",
              lead_id: lead.id,
              assigned_to: AHMED_USER_ID,
              date: chicagoToday(),
              text:
                `One-pager request from joinkale.com: "${pageTitle || "page not recorded"}". ` +
                `${cleanFirstName || "This agent"} asked for the printable sheet. ` +
                `The form collects email only, so look them up for a phone number, then follow up.`,
            })
          );
        }
        for (const r of await Promise.allSettled(jobs)) {
          if (r.status === "rejected") console.error("Close follow-up failed:", r.reason);
        }
        return lead.id as string;
      })().catch((err) => {
        console.error("Close lead capture failed:", err);
        return "";
      });
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
          // Richer matching for Meta (Events Manager asked for it). The first name
          // is what the visitor typed; location is Vercel's approximate IP geolocation.
          firstName: cleanFirstName || undefined,
          ...ipLocation(req),
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

    const closeLeadId = await closeWork;

    // Heads-up to D.J. that a one-pager was requested. Same Apps Script webhook as the
    // visitor's copy; kind "notify" tells it to send the subject and body as written
    // (see docs/email-prompt-apps-script.gs).
    if (emailWebhookUrl && wantsFollowUp) {
      try {
        await fetch(emailWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: process.env.PROMPT_EMAIL_WEBHOOK_TOKEN || "",
            kind: "notify",
            to: process.env.LEAD_NOTIFY_EMAIL || DEFAULT_NOTIFY_EMAIL,
            promptTitle: `One-pager request: ${cleanFirstName || email}`,
            promptText:
              `${cleanFirstName || "Someone"} (${email}) just asked for a one-pager on joinkale.com.\n\n` +
              `Page: ${pageTitle || "not recorded"}\n` +
              (pageUrl ? `${pageUrl}\n` : "") +
              `\n` +
              (closeLeadId
                ? `Close lead: https://app.close.com/lead/${closeLeadId}/\nAhmed has a follow-up task due today.`
                : `The Close lead was NOT created, so there is no task for Ahmed. Add this one by hand.`),
          }),
        });
      } catch (err) {
        console.error("Lead notification email failed:", err);
      }
    }

    return NextResponse.json({ success: true }, { headers: cors });
  } catch (error) {
    console.error("Email capture error:", error);
    return NextResponse.json({ success: true }, { headers: cors });
  }
}
