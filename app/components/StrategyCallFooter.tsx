"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "strategy_call_footer_dismissed";

export default function StrategyCallFooter() {
  const [dismissed, setDismissed] = useState(true);
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
    if (typeof window !== "undefined" && (window as { dataLayer?: unknown[] }).dataLayer) {
      (window as { dataLayer?: unknown[] }).dataLayer!.push({
        event: "strategy_call_click",
        placement: "sticky_footer",
      });
    }
  };

  if (!mounted || dismissed) return null;

  return (
    <div
      className="slide-up"
      style={{
        position: "fixed",
        bottom: 12,
        left: 0,
        right: 0,
        zIndex: 900,
        display: "flex",
        justifyContent: "center",
        padding: "0 12px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: 4,
          background: "#0a1628",
          border: "1px solid rgba(56,189,248,0.3)",
          borderRadius: 999,
          padding: 4,
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        }}
      >
        <a
          href="https://joinkale.com/schedule"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          style={{
            background: "linear-gradient(135deg, #10b981, #38bdf8)",
            color: "#0a1628",
            fontSize: 13,
            fontWeight: 700,
            padding: "8px 16px",
            borderRadius: 999,
            textDecoration: "none",
            letterSpacing: 0.2,
            whiteSpace: "nowrap",
          }}
        >
          Book a 15-min call with D.J.
        </a>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          style={{
            background: "none",
            border: "none",
            color: "#64748b",
            cursor: "pointer",
            fontSize: 16,
            padding: "6px 10px",
            lineHeight: 1,
            borderRadius: 999,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
