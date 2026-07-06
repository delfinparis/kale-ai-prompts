"use client";

import { spaceGrotesk } from "../fonts";
import Link from "next/link";
import Image from "next/image";
import OpenInAI from "../components/OpenInAI";
import { WEBINAR_PROMPTS } from "./prompts";

export default function SoundLikeYouPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a1628",
        color: "#e2e8f0",
        padding: "32px 16px 64px",
      }}
    >
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <div
            style={{
              display: "inline-block",
              background: "rgba(124, 58, 237, 0.12)",
              border: "1px solid rgba(124, 58, 237, 0.25)",
              color: "#a78bfa",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              padding: "6px 14px",
              borderRadius: 6,
              marginBottom: 16,
            }}
          >
            Webinar attendee
          </div>
          <h1
            className={spaceGrotesk.className}
            style={{
              fontSize: "clamp(28px, 7vw, 42px)",
              fontWeight: 700,
              lineHeight: 1.12,
              marginBottom: 14,
            }}
          >
            Make AI sound{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #38bdf8, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              exactly like you
            </span>
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#94a3b8",
              lineHeight: 1.6,
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            The exact prompts from today. These are the full-power versions,
            way too long to screenshot, so I built you this page. Copy them
            straight into your AI.
          </p>
        </div>

        {/* How to run them */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "20px 22px",
            marginBottom: 30,
          }}
        >
          <h3
            className={spaceGrotesk.className}
            style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}
          >
            The two-minute setup
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              fontSize: 13.5,
              color: "#94a3b8",
              lineHeight: 1.55,
            }}
          >
            {[
              "Paste The De-AI Filter into a fresh chat. It strips every robot fingerprint from anything you write.",
              "Run The Voiceprint Engine. It learns how you actually write and clones your voice.",
              "Save the result in a Claude Style or Project so it loads every time. No writing samples? Use the Starter Kit and just talk to it.",
            ].map((item, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "baseline", gap: 10 }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: "#7c3aed",
                    fontWeight: 700,
                    minWidth: 18,
                  }}
                >
                  {i + 1}
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt cards */}
        {WEBINAR_PROMPTS.map((p, i) => (
          <div
            key={p.id}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "24px 22px",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: "#7c3aed",
                fontWeight: 700,
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              PROMPT {String(i + 1).padStart(2, "0")}
            </div>
            <h2
              className={spaceGrotesk.className}
              style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}
            >
              {p.title}
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#a78bfa",
                fontWeight: 600,
                marginBottom: 14,
              }}
            >
              {p.tagline}
            </p>

            <p
              style={{
                fontSize: 13.5,
                color: "#94a3b8",
                lineHeight: 1.6,
                marginBottom: 14,
              }}
            >
              {p.whatItDoes}
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 16,
                fontSize: 12.5,
                lineHeight: 1.5,
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "#64748b", minWidth: 66, fontWeight: 600 }}>
                  Best for
                </span>
                <span style={{ color: "#cbd5e1" }}>{p.bestFor}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "#64748b", minWidth: 66, fontWeight: 600 }}>
                  How to use
                </span>
                <span style={{ color: "#cbd5e1" }}>{p.howToUse}</span>
              </div>
            </div>

            {/* Full prompt preview */}
            <details
              style={{
                background: "#0a1628",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 14,
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  color: "#38bdf8",
                  fontWeight: 600,
                  fontSize: 13,
                  listStyle: "none",
                }}
              >
                Read the full prompt (it is long, that is the point)
              </summary>
              <pre
                style={{
                  marginTop: 12,
                  marginBottom: 4,
                  maxHeight: 340,
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontSize: 11.5,
                  lineHeight: 1.5,
                  color: "#cbd5e1",
                  background: "transparent",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                {p.prompt}
              </pre>
            </details>

            <OpenInAI
              promptText={p.prompt}
              promptId={p.id}
              promptTitle={p.title}
              label="Copy & Open AI"
            />
          </div>
        ))}

        {/* Connect-your-email guide */}
        <div
          style={{
            background: "rgba(245, 158, 11, 0.06)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            borderRadius: 12,
            padding: "20px 22px",
            marginBottom: 30,
          }}
        >
          <h3
            className={spaceGrotesk.className}
            style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#f59e0b" }}
          >
            The deeper voiceprint: connect your email
          </h3>
          <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 12 }}>
            Pasting a few samples is great. Letting AI read a few hundred of your
            own real sent emails is a different league. Here is the safe way to do
            it in Claude, ChatGPT, or Gemini.
          </p>

          <div
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 12,
            }}
          >
            <p style={{ fontSize: 12.5, color: "#fca5a5", lineHeight: 1.6, fontWeight: 600 }}>
              The one rule: your own sent mail only. Never a client&apos;s inbox,
              never a message full of someone&apos;s private info. Not comfortable?
              Just paste samples instead. It touches nobody&apos;s data.
            </p>
          </div>

          <details
            style={{
              background: "#0a1628",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                color: "#38bdf8",
                fontWeight: 600,
                fontSize: 13,
                listStyle: "none",
              }}
            >
              Show me the steps
            </summary>
            <div style={{ marginTop: 12, fontSize: 12.5, color: "#cbd5e1", lineHeight: 1.6 }}>
              <p style={{ marginBottom: 8 }}>
                <span style={{ color: "#64748b" }}>
                  Menus move around. If the wording is different, look for the
                  words <strong>Connectors</strong>, <strong>Apps</strong>, or{" "}
                  <strong>Extensions</strong>. That is always where this lives.
                </span>
              </p>
              <p style={{ marginBottom: 6 }}>
                <span style={{ color: "#d97757", fontWeight: 700 }}>Claude:</span>{" "}
                Settings, then Connectors, connect Google/Gmail, approve read
                access to your own account.
              </p>
              <p style={{ marginBottom: 6 }}>
                <span style={{ color: "#10a37f", fontWeight: 700 }}>ChatGPT:</span>{" "}
                Settings, then Connectors (or Connect apps), connect Gmail.
              </p>
              <p style={{ marginBottom: 10 }}>
                <span style={{ color: "#4285f4", fontWeight: 700 }}>Gemini:</span>{" "}
                Turn on the Gmail extension, or just type @Gmail in your message.
              </p>
              <p style={{ marginBottom: 6 }}>
                Then run The Voiceprint Engine and, when it asks for samples, paste
                this instead:
              </p>
              <div
                style={{
                  background: "rgba(56,189,248,0.06)",
                  border: "1px solid rgba(56,189,248,0.2)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 12,
                  color: "#cbd5e1",
                  fontStyle: "italic",
                  lineHeight: 1.55,
                }}
              >
                Instead of me pasting samples, read my last 300 sent emails from my
                own Gmail. Ignore anything forwarded, auto-generated, a newsletter,
                or mostly someone else&apos;s words. Study only what I actually
                wrote, then build my Voiceprint Profile from that, quoting real
                lines of mine as evidence.
              </div>
              <p style={{ marginTop: 10, color: "#64748b", fontSize: 12 }}>
                When you are done you can disconnect it in the same screen. Your
                saved voiceprint stays. Rules on AI and data change fast and vary
                by market, so check your local board, your state association, and
                NAR, and follow your brokerage&apos;s policy. Workflow tip, not
                legal advice.
              </p>
            </div>
          </details>
        </div>

        {/* Strategy Session CTA */}
        <div
          style={{
            background: "rgba(124, 58, 237, 0.06)",
            border: "1px solid rgba(124, 58, 237, 0.15)",
            borderRadius: 14,
            padding: "28px 24px",
            marginBottom: 30,
            textAlign: "center",
          }}
        >
          <h2
            className={spaceGrotesk.className}
            style={{ fontSize: 21, fontWeight: 700, marginBottom: 8 }}
          >
            Want me to build your voiceprint with you?
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#94a3b8",
              lineHeight: 1.6,
              marginBottom: 6,
            }}
          >
            I am doing free 15-minute one-on-ones this week. We build your voice
            live on your real writing, and you leave with your first cleaned-up
            message and a simple 30-day plan.
          </p>
          <p
            style={{
              fontSize: 13,
              color: "#64748b",
              lineHeight: 1.5,
              marginBottom: 20,
            }}
          >
            I am also researching a new Keeping It Real series on how agents
            actually use AI, so I want to hear what is working and what is stuck.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <Image
              src="/qr-strategy-session.png"
              alt="Scan to book a strategy session"
              width={172}
              height={172}
              style={{ borderRadius: 10 }}
            />
            <a
              href="https://calendly.com/joinkale/ai-strategy-session"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #38bdf8, #7c3aed)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                padding: "12px 32px",
                borderRadius: 8,
                textDecoration: "none",
                letterSpacing: 0.5,
              }}
            >
              Grab a 15-Minute Slot
            </a>
          </div>
        </div>

        {/* More Prompts CTA */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>
            Want more? The full vault has 620 prompts built for agents.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e2e8f0",
              fontWeight: 600,
              fontSize: 14,
              padding: "12px 28px",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            Browse All 620 Prompts
          </Link>
        </div>

        {/* Support */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 24,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
            D.J. Paris - Keeping It Real Podcast - Kale Realty
            <br />
            <a
              href="https://instagram.com/delfin.paris"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#7c3aed", textDecoration: "none" }}
            >
              @delfin.paris
            </a>
            {" | "}
            <a
              href="https://linktr.ee/thekeepingitrealpodcast"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#7c3aed", textDecoration: "none" }}
            >
              Subscribe to the podcast
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
