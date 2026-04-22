"use client";

import { useEffect, useState } from "react";
import { spaceGrotesk } from "../fonts";

const QUOTES = [
  {
    text: "I used to stare at ChatGPT for 20 minutes trying to write one follow-up. Now I copy a prompt and I'm done in 40 seconds.",
    author: "Top producer, 4 years in",
  },
  {
    text: "The objection handling roleplays made me a better listing agent. Period.",
    author: "Team lead, Southern California",
  },
  {
    text: "Finally — prompts that don't sound like a robot wrote them. My past clients actually reply now.",
    author: "Solo agent, Chicago",
  },
  {
    text: "I ran one CRM triage prompt on a Sunday night and booked 3 appointments by Wednesday.",
    author: "Mid-career agent, Texas",
  },
];

export default function SocialProofStrip() {
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setQuoteIdx((i) => (i + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  const q = QUOTES[quoteIdx];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        marginBottom: 24,
      }}
    >
      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {[
          { num: "570", label: "Prompts" },
          { num: "2,000+", label: "Agents" },
          { num: "14", label: "Categories" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.18)",
              borderRadius: 8,
              padding: "6px 12px",
              display: "flex",
              alignItems: "baseline",
              gap: 6,
            }}
          >
            <span
              className={spaceGrotesk.className}
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#34d399",
              }}
            >
              {s.num}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "#94a3b8",
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Rotating testimonial */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          padding: "14px 18px",
          textAlign: "center",
        }}
      >
        <div
          key={quoteIdx}
          className="fade-in"
          style={{
            fontSize: 13,
            color: "#cbd5e1",
            lineHeight: 1.5,
            fontStyle: "italic",
            marginBottom: 6,
          }}
        >
          &ldquo;{q.text}&rdquo;
        </div>
        <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 0.3 }}>
          — {q.author}
        </div>
      </div>
    </div>
  );
}
