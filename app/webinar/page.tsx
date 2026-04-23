"use client";

import { spaceGrotesk } from "../fonts";
import Link from "next/link";

const STRATEGIES = [
  {
    number: "1",
    superpower: "PRACTICE",
    title: "The Midnight Sales Coach",
    desc: "AI plays a realistic client and coaches you after every response. Hidden motivations. Trap questions. A scorecard at the end.",
    path: "Coach Me Through It → Roleplay & Practice → Seller Roleplays",
    promptIds: ["ch8-1", "ch8-2", "ch8-3", "ch8-4"],
    color: "#7c3aed",
  },
  {
    number: "2",
    superpower: "THINK",
    title: "The Context-Loaded Client Brief",
    desc: "Feed AI your client details and get a strategic game plan: predicted objections, landmine map, behavioral signals, and a meeting flow.",
    path: "Plan My Strategy → Daily Workflows → Morning Routines & Meeting Prep",
    promptIds: ["ch1-11", "ch1-12"],
    color: "#38bdf8",
  },
  {
    number: "3",
    superpower: "PRACTICE",
    title: "The Objection Vault",
    desc: "Diagnose what clients REALLY mean underneath their objections. Three response styles calibrated to your voice.",
    path: "Coach Me Through It → Common Objections",
    promptIds: ["ch8-19", "ch8-20", "ch8-21"],
    color: "#7c3aed",
  },
  {
    number: "4",
    superpower: "WORK",
    title: "The AI Open House Machine",
    desc: "A complete before/during/after system: visitor type playbook, conversation flow map, personalized follow-ups, and lead scoring.",
    path: "Help Me Follow Up → Open House",
    promptIds: ["ch4-1", "ch4-34", "ch4-56"],
    color: "#10b981",
  },
  {
    number: "5",
    superpower: "THINK",
    title: "Own Your Zip Code in 30 Minutes",
    desc: "7 fully written, hyper-local social media posts - not topic ideas, actual posts. One prompt, one week of content.",
    path: "Write Something For Me → Social Media & Content",
    promptIds: ["ch0-2", "ch0-3"],
    color: "#38bdf8",
  },
];

const QUICK_STARTS = [
  {
    label: "New Agent (0-2 years)",
    action: "Start with Chapter 0 → 10 prompts, 20 minutes, immediate results",
    path: "/",
  },
  {
    label: "Mid-Career (3-7 years)",
    action: "Start with Strategy 1 (Roleplay) or Strategy 3 (Objection Vault)",
    path: "/",
  },
  {
    label: "Top Producer (20+ deals)",
    action: "Start with Strategy 2 (Client Brief) - upgrade how you win appointments",
    path: "/",
  },
  {
    label: "Team Lead",
    action: "Send the Roleplay prompts to your agents - review scorecards at your next team meeting",
    path: "/",
  },
];

export default function WebinarPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a1628",
        color: "#e2e8f0",
        padding: "32px 16px 64px",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
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
            Webinar Attendee
          </div>
          <h1
            className={spaceGrotesk.className}
            style={{
              fontSize: "clamp(26px, 6vw, 36px)",
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: 12,
            }}
          >
            You&apos;re Doing A.I.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #38bdf8, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              100% Wrong.
            </span>
          </h1>
          <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.5 }}>
            Here are the 5 strategies from the webinar - plus direct links to
            related prompts in the vault. Pick one. Try it tonight.
          </p>
        </div>

        {/* Three Superpowers Legend */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            marginBottom: 32,
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "PRACTICE", color: "#7c3aed", desc: "Coach & roleplay" },
            { label: "THINK", color: "#38bdf8", desc: "Strategy & prep" },
            { label: "WORK", color: "#10b981", desc: "Systems & execution" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "#94a3b8",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: s.color,
                }}
              />
              <span style={{ fontWeight: 700, color: s.color }}>{s.label}</span>
              <span>- {s.desc}</span>
            </div>
          ))}
        </div>

        {/* Strategy Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
          {STRATEGIES.map((s) => (
            <div
              key={s.number}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "20px 20px 16px",
                borderLeft: `3px solid ${s.color}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: s.color,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  {s.superpower}
                </span>
                <span style={{ fontSize: 12, color: "#475569" }}>•</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Strategy {s.number}
                </span>
              </div>
              <h3
                className={spaceGrotesk.className}
                style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "#94a3b8",
                  lineHeight: 1.5,
                  marginBottom: 12,
                }}
              >
                {s.desc}
              </p>
              <div
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  background: "rgba(255,255,255,0.03)",
                  padding: "8px 12px",
                  borderRadius: 6,
                }}
              >
                <span style={{ color: "#94a3b8", fontWeight: 600 }}>
                  Find it:{" "}
                </span>
                {s.path}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Start by Experience */}
        <div style={{ marginBottom: 40 }}>
          <h2
            className={spaceGrotesk.className}
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Not sure where to start?
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {QUICK_STARTS.map((q) => (
              <div
                key={q.label}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10,
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#e2e8f0",
                    marginBottom: 4,
                  }}
                >
                  {q.label}
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>
                  {q.action}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #38bdf8, #7c3aed)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              padding: "16px 40px",
              borderRadius: 10,
              textDecoration: "none",
              letterSpacing: 0.5,
            }}
          >
            Browse All 570 Prompts →
          </Link>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 12 }}>
            Works in ChatGPT, Claude, or any AI tool. Copy, paste, go.
          </p>
        </div>
      </div>
    </div>
  );
}
