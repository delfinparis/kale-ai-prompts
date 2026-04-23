"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { spaceGrotesk } from "../fonts";

interface SearchablePrompt {
  id: string;
  title: string;
  bestFor: string;
  category: "write" | "followup" | "coach" | "strategy";
  chapterTitle: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  prompt: string;
}

interface Props<T extends SearchablePrompt = SearchablePrompt> {
  prompts: T[];
  onNavigateToPrompt: (prompt: T) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  write: "Write",
  followup: "Follow Up",
  coach: "Coach",
  strategy: "Strategy",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "#10b981",
  intermediate: "#f59e0b",
  advanced: "#ef4444",
};

function scorePrompt(p: SearchablePrompt, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const terms = q.split(/\s+/).filter(Boolean);
  const title = p.title.toLowerCase();
  const bestFor = p.bestFor.toLowerCase();
  const body = p.prompt.toLowerCase();
  const chapter = p.chapterTitle.toLowerCase();

  let score = 0;
  for (const t of terms) {
    if (title.includes(t)) score += 10;
    if (bestFor.includes(t)) score += 4;
    if (chapter.includes(t)) score += 3;
    if (body.includes(t)) score += 1;
  }
  // Exact full-phrase match in title = big boost
  if (title.includes(q)) score += 20;
  return score;
}

export default function GlobalSearch<T extends SearchablePrompt>({ prompts, onNavigateToPrompt }: Props<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return prompts
      .map((p) => ({ prompt: p, score: scorePrompt(p, query) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((r) => r.prompt);
  }, [query, prompts]);

  // Cmd+K / Ctrl+K opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Keyboard nav for results
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        if (results[activeIdx]) {
          handleSelect(results[activeIdx]);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, activeIdx]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const handleSelect = (p: T) => {
    onNavigateToPrompt(p);
    setOpen(false);
    setQuery("");
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: "search_select",
        search_query: query,
        prompt_id: p.id,
      });
    }
  };

  // Placeholder bar (closed state)
  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "12px 16px",
          color: "#64748b",
          fontSize: 14,
          textAlign: "left",
          cursor: "pointer",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
          transition: "border-color 0.2s, background 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)";
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span style={{ flex: 1 }}>Search 570 prompts...</span>
        <span
          style={{
            fontSize: 11,
            color: "#475569",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 4,
            padding: "2px 6px",
            letterSpacing: 0.5,
          }}
        >
          ⌘K
        </span>
      </button>
    );
  }

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,22,40,0.8)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "80px 16px 24px",
        zIndex: 1100,
      }}
    >
      <div
        ref={panelRef}
        style={{
          background: "#0a1628",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 560,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            padding: "16px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by keyword or scenario..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#e2e8f0",
              fontSize: 15,
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: 11,
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 4,
              padding: "2px 6px",
            }}
          >
            Esc
          </button>
        </div>

        <div style={{ maxHeight: 420, overflowY: "auto" }}>
          {!query.trim() && (
            <div style={{ padding: "24px 18px", color: "#64748b", fontSize: 13 }}>
              Try: &ldquo;expired listing&rdquo;, &ldquo;FSBO&rdquo;, &ldquo;open house&rdquo;, &ldquo;first-time buyer&rdquo;, &ldquo;referral&rdquo;
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <div style={{ padding: "24px 18px", color: "#64748b", fontSize: 13 }}>
              No prompts matched &ldquo;{query}&rdquo;. Try a broader term.
            </div>
          )}

          {results.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              onMouseEnter={() => setActiveIdx(idx)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: idx === activeIdx ? "rgba(56,189,248,0.08)" : "transparent",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                padding: "14px 18px",
                cursor: "pointer",
                color: "inherit",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1,
                    color: DIFFICULTY_COLORS[p.difficulty],
                    textTransform: "uppercase",
                  }}
                >
                  {CATEGORY_LABELS[p.category]}
                </span>
                <span style={{ fontSize: 10, color: "#475569" }}>•</span>
                <span style={{ fontSize: 11, color: "#64748b" }}>{p.chapterTitle}</span>
              </div>
              <div
                className={spaceGrotesk.className}
                style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 2, lineHeight: 1.3 }}
              >
                {p.title}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}>
                {p.bestFor}
              </div>
            </button>
          ))}
        </div>

        <div
          style={{
            padding: "10px 18px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            fontSize: 11,
            color: "#475569",
            display: "flex",
            gap: 16,
            justifyContent: "center",
          }}
        >
          <span>↑↓ move</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
