import Link from "next/link";
import { spaceGrotesk } from "../fonts";
import { prompts as ALL_PROMPTS, getSlugForPrompt } from "../lib/prompts";

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

export default function TopThisWeek() {
  const topPrompts = TOP_IDS
    .map((id) => ALL_PROMPTS.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (topPrompts.length === 0) return null;

  return (
    <section style={{ marginBottom: 28 }}>
      <h2
        className={spaceGrotesk.className}
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#f1f5f9",
          letterSpacing: "-0.01em",
          marginBottom: 12,
          padding: "0 2px",
        }}
      >
        Top 10 This Week
      </h2>

      <div className="top-list-grid">
        {topPrompts.map((p, idx) => {
          const slug = getSlugForPrompt(p.id);
          if (!slug) return null;
          return (
            <Link
              key={p.id}
              href={`/p/${slug}`}
              className="top-list-row"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
                padding: "12px 14px",
                color: "inherit",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "border-color 0.2s, background 0.2s",
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
              <div
                className={spaceGrotesk.className}
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#e2e8f0",
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {p.title}
              </div>
              <div style={{ color: "#475569", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
