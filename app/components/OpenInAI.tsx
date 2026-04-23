"use client";

import { useEffect, useMemo, useState } from "react";

interface Props {
  promptText: string;
  promptId?: string;
  label?: string;
  /** Optional nicer title shown at the top of the customize modal. */
  promptTitle?: string;
}

type AITool = {
  id: "claude" | "chatgpt" | "gemini";
  name: string;
  url: string;
  accent: string;
  note: string;
};

const TOOLS: AITool[] = [
  { id: "claude",  name: "Claude",  url: "https://claude.ai/new",          accent: "#d97757", note: "claude.ai" },
  { id: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com/",           accent: "#10a37f", note: "chatgpt.com" },
  { id: "gemini",  name: "Gemini",  url: "https://gemini.google.com/app",  accent: "#4285f4", note: "gemini.google.com" },
];

const REMEMBERED_KEY = "prompt_vault_remembered_fields_v1";

type BracketField = {
  original: string;   // exact string including brackets: "[YOUR MARKET]"
  key: string;        // inner text: "YOUR MARKET"
  label: string;      // display label: "Your market"
  hint: string;       // inferred placeholder (e.g. "Chicago, IL")
  context: string;    // surrounding sentence, for disambiguating vague labels
  multiline: boolean;
  rememberable: boolean;
  defaultValue: string;
};

/** Regex to find [bracketed tokens]. Capped length stops runaway matches. */
const BRACKET_RE = /\[([^\]\n]{1,200})\]/g;
const MULTILINE_TERMS = /LIST|DESCRIBE|NOTES|PASTE|DUMP|EXPLANATION|CONTEXT|SITUATION|BODY|FULL|DETAILS|BACKGROUND/i;
const REMEMBERABLE_TERMS = /^(YOUR\s+(NAME|BROKERAGE|FIRM|MARKET|CITY|STATE|EMAIL|PHONE|WEBSITE))$|^(MARKET|CITY|STATE|NEIGHBORHOOD|MARKET\/CITY|CITY\/AREA|YOUR\s+MARKET)$/i;
const TODAY_TERMS = /^(TODAY'?S?\s+DATE|INSERT\s+TODAY'?S?\s+DATE|TODAY)$/i;

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function parseBrackets(promptText: string): BracketField[] {
  const seen = new Map<string, BracketField>();
  let m: RegExpExecArray | null;
  BRACKET_RE.lastIndex = 0;
  while ((m = BRACKET_RE.exec(promptText)) !== null) {
    const original = m[0];
    const inner = m[1].trim();
    if (seen.has(original)) continue;

    // Split "LABEL - e.g., hint" / "LABEL, e.g., hint" / "LABEL (hint)"
    let label = inner;
    let hint = "";
    const egMatch = inner.match(/^(.+?)\s*[-,]\s*(?:e\.g\.|ex:|example:|i\.e\.)\s*(.+)$/i);
    const parenMatch = inner.match(/^(.+?)\s*\((.+)\)\s*$/);
    if (egMatch) {
      label = egMatch[1];
      hint = egMatch[2];
    } else if (parenMatch) {
      label = parenMatch[1];
      hint = parenMatch[2];
    }

    const cleanLabel = label.replace(/[_]+/g, " ").trim();
    const displayLabel = titleCase(cleanLabel.replace(/\s+/g, " ")).slice(0, 70);

    // Grab the surrounding sentence for context (helps disambiguate [NUMBER], [X]).
    const idx = m.index;
    const windowStart = Math.max(0, idx - 120);
    const windowEnd = Math.min(promptText.length, idx + original.length + 120);
    const slice = promptText.slice(windowStart, windowEnd);
    const localIdx = idx - windowStart;
    const before = slice.slice(0, localIdx);
    const after = slice.slice(localIdx);
    const sentStart = Math.max(
      before.lastIndexOf(". "),
      before.lastIndexOf("\n"),
      before.lastIndexOf(":"),
      0
    );
    const afterPeriod = after.indexOf(". ");
    const afterNewline = after.indexOf("\n");
    const candidates = [afterPeriod, afterNewline].filter((n) => n >= 0);
    const sentEnd = candidates.length > 0 ? Math.min(...candidates) : after.length;
    const context = (before.slice(sentStart).replace(/^[\s.:\n]+/, "") + after.slice(0, sentEnd))
      .replace(/\*\*/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const upper = inner.toUpperCase();
    const multiline = MULTILINE_TERMS.test(upper);
    const rememberable = REMEMBERABLE_TERMS.test(upper);

    let defaultValue = "";
    if (TODAY_TERMS.test(upper)) {
      defaultValue = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    seen.set(original, {
      original,
      key: inner.toUpperCase(),
      label: displayLabel,
      hint: hint.trim().replace(/\*\*/g, "").slice(0, 80),
      context: context.length > 160 ? context.slice(0, 157) + "…" : context,
      multiline,
      rememberable,
      defaultValue,
    });
  }
  return Array.from(seen.values());
}

function applyFills(promptText: string, fills: Record<string, string>): string {
  let result = promptText;
  for (const [original, value] of Object.entries(fills)) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(escaped, "g"), trimmed);
  }
  return result;
}

function loadRemembered(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(REMEMBERED_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveRemembered(updates: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    const current = loadRemembered();
    localStorage.setItem(REMEMBERED_KEY, JSON.stringify({ ...current, ...updates }));
  } catch {}
}

function pushEvent(event: string, data?: Record<string, string | number>) {
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

type Mode = null | "customize" | "picker";

export default function OpenInAI({ promptText, promptId, label, promptTitle }: Props) {
  const [mode, setMode] = useState<Mode>(null);
  const [clipboardOk, setClipboardOk] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState<string>(promptText);

  const fields = useMemo(() => parseBrackets(promptText), [promptText]);

  useEffect(() => {
    if (mode === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMode(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mode]);

  const transitionToPicker = async (text: string, method: "customized" | "raw") => {
    setFinalPrompt(text);
    const ok = await copyToClipboard(text);
    setClipboardOk(ok);
    pushEvent("prompt_customize_" + (method === "customized" ? "complete" : "skip"), {
      prompt_id: promptId || "",
      fields_total: fields.length,
    });
    setMode("picker");
  };

  const handlePrimaryClick = async () => {
    if (fields.length === 0) {
      // No brackets - straight to picker with raw prompt.
      await transitionToPicker(promptText, "raw");
      return;
    }
    pushEvent("prompt_customize_start", {
      prompt_id: promptId || "",
      fields_total: fields.length,
    });
    setMode("customize");
  };

  const handleCustomizeSubmit = async (fills: Record<string, string>) => {
    const filled = applyFills(promptText, fills);
    await transitionToPicker(filled, "customized");
  };

  const handleSkipCustomize = async () => {
    await transitionToPicker(promptText, "raw");
  };

  const handlePickTool = (tool: AITool) => {
    pushEvent("open_in_ai", {
      tool: tool.id,
      platform: detectPlatform(),
      prompt_id: promptId || "",
    });
    window.open(tool.url, "_blank", "noopener,noreferrer");
    setMode(null);
  };

  const retryCopy = async () => {
    const ok = await copyToClipboard(finalPrompt);
    setClipboardOk(ok);
  };

  const buttonLabel = label || (fields.length > 0 ? "Customize & Copy" : "Copy & Open AI");

  return (
    <>
      <button
        onClick={handlePrimaryClick}
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

      {mode === "customize" && (
        <CustomizeModal
          promptTitle={promptTitle}
          fields={fields}
          onSubmit={handleCustomizeSubmit}
          onSkip={handleSkipCustomize}
          onCancel={() => setMode(null)}
        />
      )}

      {mode === "picker" && (
        <PickerModal
          clipboardOk={clipboardOk}
          promptText={finalPrompt}
          onClose={() => setMode(null)}
          onPickTool={handlePickTool}
          onRetryCopy={retryCopy}
        />
      )}
    </>
  );
}

function CustomizeModal({
  promptTitle,
  fields,
  onSubmit,
  onSkip,
  onCancel,
}: {
  promptTitle?: string;
  fields: BracketField[];
  onSubmit: (fills: Record<string, string>) => void;
  onSkip: () => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [remember, setRemember] = useState<Record<string, boolean>>({});

  // Seed from remembered storage + auto-fill defaults
  useEffect(() => {
    const remembered = loadRemembered();
    const seed: Record<string, string> = {};
    const rememberSeed: Record<string, boolean> = {};
    for (const f of fields) {
      if (f.defaultValue) seed[f.original] = f.defaultValue;
      if (f.rememberable && remembered[f.key]) {
        seed[f.original] = remembered[f.key];
        rememberSeed[f.original] = true;
      } else if (f.rememberable) {
        rememberSeed[f.original] = true; // default to checked
      }
    }
    setValues(seed);
    setRemember(rememberSeed);
  }, [fields]);

  const setValue = (original: string, v: string) => {
    setValues((prev) => ({ ...prev, [original]: v }));
  };
  const setRememberFlag = (original: string, v: boolean) => {
    setRemember((prev) => ({ ...prev, [original]: v }));
  };

  const handleSubmit = () => {
    // Save remembered fields
    const toSave: Record<string, string> = {};
    for (const f of fields) {
      if (f.rememberable && remember[f.original]) {
        const v = (values[f.original] || "").trim();
        if (v) toSave[f.key] = v;
      }
    }
    if (Object.keys(toSave).length > 0) saveRemembered(toSave);
    onSubmit(values);
  };

  const filledCount = fields.filter((f) => (values[f.original] || "").trim().length > 0).length;

  return (
    <ModalBackdrop onClose={onCancel}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: 0.2 }}>
          Customize your prompt
        </h3>
        <button
          onClick={onCancel}
          aria-label="Close"
          style={{ background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}
        >
          ×
        </button>
      </div>
      {promptTitle && (
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>{promptTitle}</div>
      )}

      <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5, marginBottom: 16 }}>
        Fill in what you can - skip what you don’t have, and we’ll leave those blanks in the prompt.
        <br />
        <span style={{ color: "#64748b", fontSize: 12 }}>
          {filledCount} of {fields.length} filled
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: "52vh", overflowY: "auto", paddingRight: 4 }}>
        {fields.map((f) => (
          <FieldRow
            key={f.original}
            field={f}
            value={values[f.original] || ""}
            onValue={(v) => setValue(f.original, v)}
            remember={!!remember[f.original]}
            onRemember={(v) => setRememberFlag(f.original, v)}
          />
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
        <button
          onClick={handleSubmit}
          className="copy-btn-primary"
          style={{
            padding: "12px 18px",
            background: "linear-gradient(135deg, #10b981, #38bdf8)",
            color: "#0a1628",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Copy customized prompt
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
          <button
            onClick={onCancel}
            className="mini-btn"
            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 0, fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            onClick={onSkip}
            className="mini-btn"
            style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", padding: 0, fontWeight: 500 }}
          >
            Or copy with blanks →
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

function FieldRow({
  field,
  value,
  onValue,
  remember,
  onRemember,
}: {
  field: BracketField;
  value: string;
  onValue: (v: string) => void;
  remember: boolean;
  onRemember: (v: boolean) => void;
}) {
  const inputStyle = {
    width: "100%",
    background: "#0a1628",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#e2e8f0",
    fontSize: 13,
    fontFamily: "inherit",
    resize: "vertical" as const,
    lineHeight: 1.4,
  };
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 700,
          color: "#e2e8f0",
          marginBottom: 4,
          letterSpacing: 0.2,
        }}
      >
        {field.label}
      </label>
      {field.context && field.context.length > 0 && (
        <div
          style={{
            fontSize: 11,
            color: "#64748b",
            lineHeight: 1.45,
            marginBottom: 6,
            fontStyle: "italic",
          }}
        >
          {field.context}
        </div>
      )}
      {field.multiline ? (
        <textarea
          value={value}
          onChange={(e) => onValue(e.target.value)}
          placeholder={field.hint || "(optional - leave blank to skip)"}
          rows={3}
          style={inputStyle}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onValue(e.target.value)}
          placeholder={field.hint || "(optional - leave blank to skip)"}
          style={inputStyle}
        />
      )}
      {field.rememberable && (
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 6,
            fontSize: 11,
            color: "#94a3b8",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => onRemember(e.target.checked)}
            style={{ cursor: "pointer" }}
          />
          Remember this for other prompts
        </label>
      )}
    </div>
  );
}

function PickerModal({
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
    <ModalBackdrop onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: 0.2 }}>
          Prompt ready - pick your AI
        </h3>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}
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
    </ModalBackdrop>
  );
}

function ModalBackdrop({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
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
          maxWidth: 520,
          width: "100%",
          boxShadow: "0 18px 48px rgba(0,0,0,0.5)",
          color: "#e2e8f0",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
