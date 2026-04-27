"use client";

import { useEffect, useState } from "react";
import { spaceGrotesk } from "../fonts";

const STORAGE_KEY = "copythat_email_captured";

function pushEvent(event: string, data?: Record<string, string>) {
  if (typeof window === "undefined") return;
  const w = window as { dataLayer?: unknown[] };
  if (!w.dataLayer) w.dataLayer = [];
  w.dataLayer.push({ event, ...(data || {}) });
}

export default function PostCopyEmailCapture() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (typeof window === "undefined") return;
      if (localStorage.getItem(STORAGE_KEY) === "true") return;
      // Brief delay so the user sees the AI tab opening before the modal appears.
      window.setTimeout(() => setOpen(true), 1200);
    };
    window.addEventListener("copythat:prompt-copied", handler);
    return () => window.removeEventListener("copythat:prompt-copied", handler);
  }, []);

  const close = () => {
    setOpen(false);
    setError("");
  };

  const submit = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await fetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, level: "post_copy" }),
      });
    } catch {
      // Non-blocking: still mark captured so we do not nag again.
    }
    pushEvent("lead", { email_level: "post_copy", placement: "post_copy_modal" });
    localStorage.setItem(STORAGE_KEY, "true");
    setLoading(false);
    setSubmitted(true);
    window.setTimeout(() => setOpen(false), 1500);
  };

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,22,40,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 1000,
      }}
    >
      <div
        className="slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#162d54",
          borderRadius: 20,
          padding: 28,
          maxWidth: 420,
          width: "100%",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {submitted ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>✅</div>
            <h2
              className={spaceGrotesk.className}
              style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}
            >
              You&apos;re in.
            </h2>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.5 }}>
              First email lands Friday. Go close some deals.
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={close}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                background: "none",
                border: "none",
                color: "#64748b",
                fontSize: 22,
                cursor: "pointer",
                padding: "4px 8px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
            <h2
              className={spaceGrotesk.className}
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#f1f5f9",
                lineHeight: 1.3,
                marginBottom: 8,
              }}
            >
              Want 3 fresh prompts every Friday?
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#94a3b8",
                marginBottom: 20,
                lineHeight: 1.5,
              }}
            >
              Drop your email and D.J. will send you new prompts every Friday.
              Built for working real estate agents. Unsubscribe anytime.
            </p>

            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 14,
                  color: "#fca5a5",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && submit()}
              placeholder="you@email.com"
              autoFocus
              style={{
                width: "100%",
                padding: 14,
                fontSize: 16,
                background: "rgba(0,0,0,0.3)",
                border: "2px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "#f1f5f9",
                outline: "none",
                marginBottom: 14,
              }}
            />

            <button
              onClick={submit}
              disabled={loading}
              style={{
                width: "100%",
                padding: 14,
                background: loading
                  ? "#1e3a6a"
                  : "linear-gradient(135deg, #10b981, #38bdf8)",
                color: "#0a1628",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "default" : "pointer",
              }}
            >
              {loading ? "Sending…" : "Send me Friday prompts"}
            </button>

            <button
              onClick={close}
              style={{
                width: "100%",
                marginTop: 10,
                background: "none",
                border: "none",
                color: "#64748b",
                fontSize: 13,
                cursor: "pointer",
                padding: 6,
              }}
            >
              No thanks
            </button>
          </>
        )}
      </div>
    </div>
  );
}
