"use client";

import { useEffect, useState } from "react";

interface Props {
  promptText: string;
  promptId?: string;
  label?: string;
}

type AITool = {
  id: "claude" | "chatgpt" | "gemini";
  name: string;
  url: string;
  accent: string;
  note: string;
};

const TOOLS: AITool[] = [
  {
    id: "claude",
    name: "Claude",
    url: "https://claude.ai/new",
    accent: "#d97757",
    note: "claude.ai",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    url: "https://chatgpt.com/",
    accent: "#10a37f",
    note: "chatgpt.com",
  },
  {
    id: "gemini",
    name: "Gemini",
    url: "https://gemini.google.com/app",
    accent: "#4285f4",
    note: "gemini.google.com",
  },
];

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
  const [modalOpen, setModalOpen] = useState(false);
  const [clipboardOk, setClipboardOk] = useState(false);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  const handleOpen = async () => {
    const ok = await copyToClipboard(promptText);
    setClipboardOk(ok);
    setModalOpen(true);
  };

  const handlePickTool = (tool: AITool) => {
    const platform = detectPlatform();
    pushEvent("open_in_ai", {
      tool: tool.id,
      platform,
      prompt_id: promptId || "",
    });
    window.open(tool.url, "_blank", "noopener,noreferrer");
    setModalOpen(false);
  };

  const retryCopy = async () => {
    const ok = await copyToClipboard(promptText);
    setClipboardOk(ok);
  };

  const buttonLabel = label || "Copy & Open AI";

  return (
    <>
      <button
        onClick={handleOpen}
        className="copy-btn-primary"
        style={{
          width: "100%",
          padding: "14px 20px",
          background: "linear-gradient(135deg, #10b981, #38bdf8)",
          color: "#0a1628",
          border: "none",
          borderRadius: 12,
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

      {modalOpen && (
        <OpenAIModal
          clipboardOk={clipboardOk}
          promptText={promptText}
          onClose={() => setModalOpen(false)}
          onPickTool={handlePickTool}
          onRetryCopy={retryCopy}
        />
      )}
    </>
  );
}

function OpenAIModal({
  clipboardOk,
  promptText,
  onClose,
  onPickTool,
  onRetryCopy,
}: {
  clipboardOk: boolean;
  promptText: string;
  onClose: () => void;
  onPickTool: (tool: AITool) => void;
  onRetryCopy: () => void;
}) {
  const platform = detectPlatform();
  const pasteHint =
    platform === "desktop"
      ? "Paste with ⌘V (mac) or Ctrl+V (windows)"
      : "Long-press the input and tap Paste";

  return (
    <div
      onClick={onClose}
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: 0.2 }}>
            Prompt ready - pick your AI
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              fontSize: 22,
              cursor: "pointer",
              padding: "0 4px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
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
            Auto-copy didn’t work in this browser. Tap <strong>Copy prompt</strong> below, then pick your AI.
          </div>
        )}

        <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.55, marginBottom: 14 }}>
          Pick an AI below. It opens in a new tab - click the chat input and paste.
          <br />
          <span style={{ color: "#94a3b8", fontSize: 12 }}>{pasteHint}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => onPickTool(t)}
              className="mini-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: "12px 14px",
                color: "#e2e8f0",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: t.accent,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1 }}>
                Open in {t.name}
                <span style={{ color: "#64748b", fontSize: 11, fontWeight: 400, marginLeft: 6 }}>
                  {t.note}
                </span>
              </span>
              <span style={{ color: "#64748b", fontSize: 14 }}>↗</span>
            </button>
          ))}
        </div>

        <details
          style={{
            background: "#0a1628",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: "10px 12px",
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
      </div>
    </div>
  );
}
