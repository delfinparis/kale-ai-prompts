"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "strategy_call_footer_dismissed";

export default function StrategyCallFooter() {
  const [dismissed, setDismissed] = useState(true); // default hidden until hydration check
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(DISMISS_KEY);
    if (stored !== "true") setDismissed(false);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "true");
  };

  const handleClick = () => {
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: "strategy_call_click", placement: "sticky_footer" });
    }
  };

  if (!mounted || dismissed) return null;

  return (
    <div
      className="slide-up"
      style={{
        position: "fixed",
        bottom: 12,
        left: 12,
        right: 12,
        zIndex: 900,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          background: "#0a1628",
          border: "1px solid rgba(56,189,248,0.3)",
          borderRadius: 14,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          maxWidth: 560,
          width: "100%",
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, #10b981, #38bdf8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.3 }}>
            Want help building your AI system?
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.3 }}>
            1:1 strategy call with D.J. — 45 min, built for your market
          </div>
        </div>
        <a
          href="https://calendly.com/djparis"
          onClick={handleClick}
          style={{
            background: "linear-gradient(135deg, #10b981, #38bdf8)",
            color: "#0a1628",
            fontSize: 12,
            fontWeight: 700,
            padding: "8px 14px",
            borderRadius: 8,
            textDecoration: "none",
            letterSpacing: 0.3,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Book →
        </a>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          style={{
            background: "none",
            border: "none",
            color: "#64748b",
            cursor: "pointer",
            fontSize: 18,
            padding: "4px 6px",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
