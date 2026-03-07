import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, level } = await req.json();

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
          name: email,
          status_id: "stat_broiYwml7eEj5SFwAvolMOhK0bPsA961YhnhVgyqtDJ",
          contacts: [
            {
              emails: [{ email, type: "office" }],
            },
          ],
          "custom.cf_c09clx40GuQEME4aFK13bHwS57NdQOUTMWI5KAq9EfY": "AI Prompt Vault",
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
                note: `Source: AI Prompt Vault\nExperience Level: ${levelLabel}\nCaptured: ${new Date().toISOString()}`,
              }),
            }).catch(() => {});
          }
        })
        .catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email capture error:", error);
    return NextResponse.json({ success: true });
  }
}
