"use client";

import { spaceGrotesk } from "../fonts";

interface TopPrompt {
  id: string;
  title: string;
  bestFor: string;
  category: "write" | "followup" | "coach" | "strategy";
  difficulty: "beginner" | "intermediate" | "advanced";
  chapterTitle: string;
  prompt: string;
}

interface Props<T extends TopPrompt = TopPrompt> {
  prompts: T[];
  onNavigateToPrompt: (prompt: T) => void;
}

// Curated list - update weekly/monthly. Order = display order.
const TOP_IDS = [
  "ch3-2",    // Post-Showing Follow-Up Email (beginner, universal)
  "ch0-1",    // Wake Up Dead Leads (beginner, instant win)
  "ch2-54",   // Expired Listing Prospecting (advanced, high-value)
  "ch8-19",   // Price Reduction Conversation (coach, tough talk)
  "ch2-40",   // SOI Outreach System (warm base)
  "ch3-46",   // "Something Changed" Re-engagement
  "ch2-48",   // Past Client Reactivation
  "ch2-55",   // FSBO Conversion
  "ch3-23",   // Non-Cringe Referral Ask
  "ch6-6.1",  // MLS Listing Description
];

const CATEGORY_LABELS: Record<string, string> = {
  write: "Write",
  followup: "Follow Up",
  coach: "Coach",
  strategy: "Strategy",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "#10b981",
  intermediate: "#f59e0b",
  advanced: "#ef4444",
};

export default function TopThisWeek<T extends TopPrompt>({ prompts, onNavigateToPrompt }: Props<T>) {
  const topPrompts = TOP_IDS
    .map((id) => prompts.find((p) => p.id === id))
    .filter(Boolean) as T[];

  if (topPrompts.length === 0) return null;

  return (
    <section style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          padding: "0 2px",
        }}
      >
        <h2
          className={spaceGrotesk.className}
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#f1f5f9",
            letterSpacing: "-0.01em",
          }}
        >
          Top 10 This Week
        </h2>
        <span
          style={{
            fontSize: 11,
            color: "#64748b",
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          Most-used by agents
        </span>
      </div>

      <div className="top-list-grid">
        {topPrompts.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => onNavigateToPrompt(p)}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10,
              padding: "12px 14px",
              cursor: "pointer",
              color: "inherit",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 12,
              transition: "border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)";
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#64748b",
                width: 22,
                flexShrink: 0,
                letterSpacing: 0.5,
              }}
            >
              {String(idx + 1).padStart(2, "0")}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className={spaceGrotesk.className}
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#e2e8f0",
                  lineHeight: 1.3,
                  marginBottom: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {p.title}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#94a3b8",
                  lineHeight: 1.4,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ color: DIFFICULTY_COLORS[p.difficulty], fontWeight: 700, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>
                  {CATEGORY_LABELS[p.category]}
                </span>
                <span style={{ color: "#475569" }}>•</span>
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.bestFor}
                </span>
              </div>
            </div>
            <div style={{ color: "#475569", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
