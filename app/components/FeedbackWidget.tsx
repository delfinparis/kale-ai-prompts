"use client";

import { useEffect, useState } from "react";

interface Props {
  promptId: string | null;
  onClose: () => void;
}

const SEEN_KEY = "feedback_given_v1";

export default function FeedbackWidget({ promptId, onClose }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSubmitted(false);
  }, [promptId]);

  if (!mounted || !promptId) return null;

  const record = async (rating: "up" | "down") => {
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: "prompt_feedback",
        prompt_id: promptId,
        rating,
      });
    }
    try {
      const seen: Record<string, string> = JSON.parse(
        localStorage.getItem(SEEN_KEY) || "{}"
      );
      seen[promptId] = rating;
      localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    } catch {
      // ignore
    }
    // Optional server log — fires and forgets
    try {
      await fetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback: true,
          prompt_id: promptId,
          rating,
        }),
      });
    } catch {
      // non-blocking
    }
    setSubmitted(true);
    setTimeout(onClose, 1800);
  };

  return (
    <div
      className="slide-up"
      style={{
        position: "fixed",
        bottom: 90,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#0a1628",
        border: "1px solid rgba(56,189,248,0.3)",
        borderRadius: 12,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        zIndex: 998,
        boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      {submitted ? (
        <span style={{ fontSize: 13, color: "#34d399", fontWeight: 600 }}>
          Thanks — noted.
        </span>
      ) : (
        <>
          <span style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 500 }}>
            Useful?
          </span>
          <button
            onClick={() => record("up")}
            aria-label="Thumbs up"
            style={{
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#34d399",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 16,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            👍
          </button>
          <button
            onClick={() => record("down")}
            aria-label="Thumbs down"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#fca5a5",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 16,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            👎
          </button>
          <button
            onClick={onClose}
            aria-label="Dismiss"
            style={{
              background: "none",
              border: "none",
              color: "#475569",
              cursor: "pointer",
              fontSize: 18,
              padding: "2px 4px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}
