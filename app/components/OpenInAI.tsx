"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  promptText: string;
  promptId?: string;
  label?: string;
}

type AITool = {
  id: "chatgpt" | "claude" | "gemini" | "grok";
  name: string;
  url: string;
  accent: string;
  // If set, we try to open the tool with the prompt pre-filled via
  // a query parameter. Subject to MAX_URL_PREFILL_LENGTH so we don't
  // build URLs that routers/browsers truncate.
  buildPrefillUrl?: (text: string) => string;
};

// Safe URL length threshold for passing a prompt as a query param.
// Above this, fall back to clipboard + paste with a confirmation modal.
const MAX_URL_PREFILL_LENGTH = 2000;

const TOOLS: AITool[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    url: "https://chatgpt.com/",
    accent: "#10a37f",
    buildPrefillUrl: (text) => `https://chatgpt.com/?q=${encodeURIComponent(text)}`,
  },
  { id: "claude",  name: "Claude",  url: "https://claude.ai/new",          accent: "#d97757" },
  { id: "gemini",  name: "Gemini",  url: "https://gemini.google.com/app",  accent: "#4285f4" },
  { id: "grok",    name: "Grok",    url: "https://grok.com/",              accent: "#e2e8f0" },
];

const PREFERRED_KEY = "prompt_vault_preferred_ai";

function getPreferred(): AITool["id"] {
  if (typeof window === "undefined") return "chatgpt";
  try {
    const stored = localStorage.getItem(PREFERRED_KEY);
    if (stored && TOOLS.some((t) => t.id === stored)) {
      return stored as AITool["id"];
    }
  } catch {}
  return "chatgpt";
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

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function OpenInAI({ promptText, promptId, label }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [preferred, setPreferredState] = useState<AITool["id"]>("chatgpt");
  const [launchConfirm, setLaunchConfirm] = useState<{
    tool: AITool;
    clipboardOk: boolean;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPreferredState(getPreferred());
  }, []);

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

  useEffect(() => {
    if (!launchConfirm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLaunchConfirm(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [launchConfirm]);

  const handleLaunch = async (tool: AITool) => {
    const platform = detectPlatform();
    setMenuOpen(false);

    setPreferred(tool.id);
    setPreferredState(tool.id);

    const clipboardOk = await copyToClipboard(promptText);

    // Fast path: tool supports URL prefill AND prompt is short enough.
    // Open directly with prompt pre-populated - no modal needed.
    if (tool.buildPrefillUrl) {
      const prefillUrl = tool.buildPrefillUrl(promptText);
      if (prefillUrl.length <= MAX_URL_PREFILL_LENGTH) {
        pushEvent("open_in_ai", {
          tool: tool.id,
          platform,
          prompt_id: promptId || "",
          method: "url_prefill",
        });
        window.open(prefillUrl, "_blank", "noopener,noreferrer");
        return;
      }
    }

    // Slow path: show a confirmation modal explaining copy+paste.
    setLaunchConfirm({ tool, clipboardOk });
  };

  const confirmLaunch = () => {
    if (!launchConfirm) return;
    const { tool } = launchConfirm;
    const platform = detectPlatform();
    pushEvent("open_in_ai", {
      tool: tool.id,
      platform,
      prompt_id: promptId || "",
      method: "clipboard",
    });
    window.open(tool.url, "_blank", "noopener,noreferrer");
    setLaunchConfirm(null);
  };

  const retryCopy = async () => {
    const ok = await copyToClipboard(promptText);
    setLaunchConfirm((prev) => (prev ? { ...prev, clipboardOk: ok } : prev));
  };

  const preferredTool = TOOLS.find((t) => t.id === preferred) || TOOLS[0];
  const buttonLabel = label || `Run in ${preferredTool.name}`;

  return (
    <>
      <div style={{ position: "relative", display: "flex", gap: 0 }} ref={menuRef}>
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
              minWidth: 220,
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
              ChatGPT opens with the prompt pre-loaded. Claude, Gemini, and Grok open with the prompt on your clipboard - paste it in.
            </div>
          </div>
        )}
      </div>

      {launchConfirm && (
        <LaunchConfirmModal
          tool={launchConfirm.tool}
          clipboardOk={launchConfirm.clipboardOk}
          promptText={promptText}
          onCancel={() => setLaunchConfirm(null)}
          onConfirm={confirmLaunch}
          onRetryCopy={retryCopy}
        />
      )}
    </>
  );
}

function LaunchConfirmModal({
  tool,
  clipboardOk,
  promptText,
  onCancel,
  onConfirm,
  onRetryCopy,
}: {
  tool: AITool;
  clipboardOk: boolean;
  promptText: string;
  onCancel: () => void;
  onConfirm: () => void;
  onRetryCopy: () => void;
}) {
  const platform = detectPlatform();
  const pasteHint =
    platform === "desktop"
      ? "Paste with ⌘V (mac) or Ctrl+V (windows)"
      : "Long-press the input and tap Paste";

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(4,10,22,0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0f2140",
          border: "1px solid rgba(56,189,248,0.25)",
          borderRadius: 14,
          padding: 22,
          maxWidth: 460,
          width: "100%",
          boxShadow: "0 18px 48px rgba(0,0,0,0.5)",
          color: "#e2e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: tool.accent,
            }}
          />
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: 0.2 }}>
            Open this prompt in {tool.name}
          </h3>
        </div>

        {clipboardOk ? (
          <div
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
              color: "#6ee7b7",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 14 }}>✓</span>
            <span>Prompt copied to your clipboard.</span>
          </div>
        ) : (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
              color: "#fca5a5",
              marginBottom: 14,
            }}
          >
            Auto-copy didn’t work in this browser. Tap <strong>Copy prompt</strong> below, then continue.
          </div>
        )}

        <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.55, marginBottom: 14 }}>
          {tool.name} will open in a new tab. Click the chat input, then paste.
          <br />
          <span style={{ color: "#94a3b8", fontSize: 12 }}>{pasteHint}</span>
        </div>

        <details
          style={{
            background: "#0a1628",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 16,
            fontSize: 12,
          }}
        >
          <summary style={{ cursor: "pointer", color: "#94a3b8", fontWeight: 600, listStyle: "none" }}>
            Preview / copy manually
          </summary>
          <pre
            style={{
              marginTop: 10,
              marginBottom: 10,
              maxHeight: 180,
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: 11,
              lineHeight: 1.45,
              color: "#cbd5e1",
              background: "transparent",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            {promptText}
          </pre>
          <button
            onClick={onRetryCopy}
            className="mini-btn"
            style={{
              background: "rgba(56,189,248,0.1)",
              border: "1px solid rgba(56,189,248,0.3)",
              borderRadius: 8,
              padding: "6px 12px",
              color: "#38bdf8",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Copy prompt
          </button>
        </details>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            className="mini-btn"
            style={{
              padding: "10px 16px",
              background: "transparent",
              color: "#94a3b8",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="copy-btn-primary"
            style={{
              padding: "10px 18px",
              background: "linear-gradient(135deg, #10b981, #38bdf8)",
              color: "#0a1628",
              border: "none",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Open {tool.name} ↗
          </button>
        </div>
      </div>
    </div>
  );
}
