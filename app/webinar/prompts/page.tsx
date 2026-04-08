"use client";

import { spaceGrotesk } from "../../fonts";
import Link from "next/link";
import Image from "next/image";

export default function WebinarPromptsPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a1628",
        color: "#e2e8f0",
        padding: "32px 16px 64px",
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
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
            Thanks for attending
          </div>
          <h1
            className={spaceGrotesk.className}
            style={{
              fontSize: "clamp(28px, 7vw, 40px)",
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: 14,
            }}
          >
            Your{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #38bdf8, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Prompt Guide
            </span>{" "}
            is ready.
          </h1>
          <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.6 }}>
            9 copy-paste prompts from today's session - refined, expanded, and
            ready to use tonight.
          </p>
        </div>

        {/* YouTube Replay */}
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "56.25%",
            marginBottom: 10,
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <iframe
            src="https://www.youtube.com/embed/WNiO8r_h3rk?rel=0"
            title="You're Doing AI 100% Wrong — 5 AI Strategies for Real Estate Agents"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </div>
        <p
          style={{
            fontSize: 12,
            color: "#64748b",
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          Watch the full webinar replay above, then grab the prompts below.
        </p>

        {/* Download Card */}
        <a
          href="/prompt-guide.pdf"
          download
          style={{
            display: "block",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: "28px 24px",
            marginBottom: 24,
            textDecoration: "none",
            color: "#e2e8f0",
            textAlign: "center",
            transition: "border-color 0.2s",
          }}
        >
          <div
            style={{
              fontSize: 48,
              marginBottom: 12,
            }}
          >
            📄
          </div>
          <h2
            className={spaceGrotesk.className}
            style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}
          >
            Download the Prompt Guide
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#94a3b8",
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            14-page PDF - every prompt from the webinar, plus "Why This Prompt
            Works" breakdowns and pro tips.
          </p>
          <div
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #38bdf8, #7c3aed)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              padding: "12px 32px",
              borderRadius: 8,
              letterSpacing: 0.5,
            }}
          >
            Download PDF
          </div>
        </a>

        {/* What's Inside */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12,
            padding: "20px 22px",
            marginBottom: 32,
          }}
        >
          <h3
            className={spaceGrotesk.className}
            style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}
          >
            What's inside
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              fontSize: 14,
              color: "#94a3b8",
            }}
          >
            {[
              "The Quick Win - listing appointment prep in 15 seconds",
              "Voice Training Setup - teach AI to sound like you",
              "Smart Follow-Up System - 3x response rate",
              "Listing Launch System - 6 content pieces in 10 minutes",
              "Buyer Consultation Prep - most prepared agent in every meeting",
              "AI Coaching & Roleplay - free 24/7 coaching partner",
              "Transaction Data Analysis - find patterns hiding in your CRM",
              "Nurture at Scale - 200 personal touchpoints per month",
              "Weekly Business Review - your free Sunday-night AI coach",
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
                    fontWeight: 600,
                    minWidth: 20,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy Session CTA */}
        <div
          style={{
            background: "rgba(124, 58, 237, 0.06)",
            border: "1px solid rgba(124, 58, 237, 0.15)",
            borderRadius: 14,
            padding: "28px 24px",
            marginBottom: 32,
            textAlign: "center",
          }}
        >
          <h2
            className={spaceGrotesk.className}
            style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}
          >
            Want a custom action plan?
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#94a3b8",
              lineHeight: 1.6,
              marginBottom: 6,
            }}
          >
            I'm doing free 15-minute AI strategy sessions this week. I'll audit
            your tech stack and build you 3 workflows specific to your business.
          </p>
          <p
            style={{
              fontSize: 13,
              color: "#64748b",
              lineHeight: 1.5,
              marginBottom: 20,
            }}
          >
            I'm also researching a new AI segment for the podcast and need your
            feedback - what's working, what's not, what you wish AI could do.
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
              width={180}
              height={180}
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
              Book 15 Minutes With Me
            </a>
          </div>
        </div>

        {/* More Prompts CTA */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p
            style={{
              fontSize: 14,
              color: "#64748b",
              marginBottom: 16,
            }}
          >
            Want more? The full vault has 570 prompts across 16 chapters.
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
            Browse All 570 Prompts
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
