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

    const webhookUrl = process.env.PROMPT_VAULT_SHEETS_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("PROMPT_VAULT_SHEETS_WEBHOOK_URL not configured");
      return NextResponse.json({ success: true });
    }

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "saveLead",
        data: {
          email,
          level: level || "not specified",
          source: "prompt-vault",
          timestamp: new Date().toISOString(),
        },
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email capture error:", error);
    return NextResponse.json({ success: true });
  }
}
