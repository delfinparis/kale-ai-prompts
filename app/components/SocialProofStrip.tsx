"use client";

import { spaceGrotesk } from "../fonts";

export default function SocialProofStrip() {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
        flexWrap: "wrap",
        marginBottom: 24,
      }}
    >
      {[
        { num: "570", label: "Prompts" },
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
  );
}
