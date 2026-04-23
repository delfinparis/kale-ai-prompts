"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  // The text the user will run in the AI tool
  promptText: string;
  // Tracking metadata
  promptId?: string;
  // Optional label override
  label?: string;
}

type AITool = {
  id: "claude" | "chatgpt" | "gemini" | "grok";
  name: string;
  // Web URL - on iOS/Android this triggers Universal Links / App Links
  // into the native app when installed; falls back to browser otherwise.
  url: string;
  // Brand color (used in subtle accents, not backgrounds)
  accent: string;
};

const TOOLS: AITool[] = [
  { id: "claude",  name: "Claude",  url: "https://claude.ai/new",          accent: "#d97757" },
  { id: "chatgpt", name: "ChatGPT", url: "https://chat.openai.com/",       accent: "#10a37f" },
  { id: "gemini",  name: "Gemini",  url: "https://gemini.google.com/app",  accent: "#4285f4" },
  { id: "grok",    name: "Grok",    url: "https://grok.com/",              accent: "#e2e8f0" },
];

const PREFERRED_KEY = "prompt_vault_preferred_ai";

function getPreferred(): AITool["id"] {
  if (typeof window === "undefined") return "claude";
  try {
    const stored = localStorage.getItem(PREFERRED_KEY);
    if (stored && TOOLS.some((t) => t.id === stored)) {
      return stored as AITool["id"];
    }
  } catch {}
  return "claude";
}

function setPreferred(id: AITool["id"]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFERRED_KEY, id);
  } catch {}
}

function pushEvent(event: string, data?: Record<string, string>) {
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    (window as any).dataLayer.push({ event, ...data });
  }
}

function detectPlatform(): "ios" | "android" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const ua = window.navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

export default function OpenInAI({ promptText, promptId, label }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [preferred, setPreferredState] = useState<AITool["id"]>("claude");
  const [instructionVisible, setInstructionVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPreferredState(getPreferred());
  }, []);

  // Click-outside to close menu
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    setTimeout(() => document.addEventListener("mousedown", onClick), 0);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleLaunch = async (tool: AITool) => {
    const platform = detectPlatform();
    setMenuOpen(false);

    // Copy prompt to clipboard first - this is the transfer mechanism
    try {
      await navigator.clipboard.writeText(promptText);
    } catch {
      // If clipboard fails, still proceed - user can copy from the source page
    }

    setPreferred(tool.id);
    setPreferredState(tool.id);

    pushEvent("open_in_ai", {
      tool: tool.id,
      platform,
      prompt_id: promptId || "",
    });

    // Show the paste instruction overlay
    setInstructionVisible(true);
    setTimeout(() => setInstructionVisible(false), 6000);

    // Open the tool. On mobile, this triggers the native app via Universal
    // Links if installed; otherwise it opens the web interface.
    window.open(tool.url, "_blank", "noopener,noreferrer");
  };

  const preferredTool = TOOLS.find((t) => t.id === preferred) || TOOLS[0];
  const buttonLabel = label || `Run in ${preferredTool.name}`;

  return (
    <>
      <div style={{ position: "relative", display: "flex", gap: 0 }} ref={menuRef}>
        {/* Primary launch button */}
        <button
          onClick={() => handleLaunch(preferredTool)}
          className="copy-btn-primary"
          style={{
            flex: 1,
            padding: "14px 20px",
            background: "linear-gradient(135deg, #10b981, #38bdf8)",
            color: "#0a1628",
            border: "none",
            borderRadius: "12px 0 0 12px",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            letterSpacing: 0.3,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          {buttonLabel}
        </button>

        {/* Chevron - opens picker */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Choose AI tool"
          style={{
            padding: "0 12px",
            background: "linear-gradient(135deg, #0ea472, #0ea5e9)",
            color: "#0a1628",
            border: "none",
            borderLeft: "1px solid rgba(10,22,40,0.2)",
            borderRadius: "0 12px 12px 0",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            minHeight: 44,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Tool picker menu */}
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              background: "#0f2140",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: 6,
              minWidth: 200,
              zIndex: 100,
              boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#64748b",
                letterSpacing: 1,
                textTransform: "uppercase",
                padding: "6px 10px 8px",
              }}
            >
              Run this prompt in...
            </div>
            {TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleLaunch(t)}
                className="mini-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  background: t.id === preferred ? "rgba(56,189,248,0.08)" : "transparent",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 10px",
                  color: "#e2e8f0",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: t.accent,
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1 }}>{t.name}</span>
                {t.id === preferred && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "#38bdf8",
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    Default
                  </span>
                )}
              </button>
            ))}
            <div
              style={{
                fontSize: 11,
                color: "#475569",
                padding: "8px 10px 4px",
                lineHeight: 1.4,
                borderTop: "1px solid rgba(255,255,255,0.05)",
                marginTop: 4,
              }}
            >
              Opens the web app - on mobile with the app installed, iOS/Android route you into the native app.
            </div>
          </div>
        )}
      </div>

      {/* Paste instruction overlay */}
      {instructionVisible && (
        <div
          className="slide-up"
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0f2140",
            border: "1px solid rgba(56,189,248,0.35)",
            borderRadius: 12,
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            zIndex: 1200,
            maxWidth: "calc(100vw - 32px)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.3 }}>
              Prompt copied ✓
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.4, marginTop: 2 }}>
              Tap the input and paste (⌘V / long-press → Paste)
            </div>
          </div>
          <button
            onClick={() => setInstructionVisible(false)}
            aria-label="Dismiss"
            className="mini-btn"
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: 18,
              padding: "2px 6px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
