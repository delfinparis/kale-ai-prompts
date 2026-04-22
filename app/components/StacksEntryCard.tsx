"use client";

import Link from "next/link";
import { spaceGrotesk } from "../fonts";

export default function StacksEntryCard() {
  return (
    <Link
      href="/stacks"
      style={{
        display: "block",
        background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(56,189,248,0.1))",
        border: "1px solid rgba(56,189,248,0.25)",
        borderRadius: 14,
        padding: "14px 16px",
        textDecoration: "none",
        color: "inherit",
        marginBottom: 28,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "linear-gradient(135deg, #10b981, #38bdf8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="4" rx="1" />
            <rect x="3" y="10" width="18" height="4" rx="1" />
            <rect x="3" y="17" width="18" height="4" rx="1" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 2,
            }}
          >
            <div
              className={spaceGrotesk.className}
              style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}
            >
              Prompt Stacks
            </div>
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: 1,
                color: "#0a1628",
                background: "linear-gradient(135deg, #10b981, #38bdf8)",
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              NEW
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}>
            Chain prompts into workflows. Build once, run in 2 minutes forever.
          </div>
        </div>
        <div style={{ color: "#38bdf8", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
