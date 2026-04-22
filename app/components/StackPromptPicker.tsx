"use client";

import { useMemo, useState } from "react";
import { spaceGrotesk } from "../fonts";

interface PickerPrompt {
  id: string;
  title: string;
  bestFor: string;
  category: "write" | "followup" | "coach" | "strategy";
  difficulty: "beginner" | "intermediate" | "advanced";
  chapterTitle: string;
  prompt: string;
}

interface Props<T extends PickerPrompt = PickerPrompt> {
  prompts: T[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onReorder: (newOrder: string[]) => void;
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

export default function StackPromptPicker<T extends PickerPrompt>({
  prompts,
  selectedIds,
  onToggle,
  onReorder,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return prompts.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.bestFor.toLowerCase().includes(q) ||
        p.chapterTitle.toLowerCase().includes(q)
      );
    });
  }, [prompts, query, categoryFilter]);

  const selectedPrompts = useMemo(() => {
    return selectedIds
      .map((id) => prompts.find((p) => p.id === id))
      .filter(Boolean) as T[];
  }, [selectedIds, prompts]);

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const copy = [...selectedIds];
    [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
    onReorder(copy);
  };

  const moveDown = (idx: number) => {
    if (idx === selectedIds.length - 1) return;
    const copy = [...selectedIds];
    [copy[idx], copy[idx + 1]] = [copy[idx + 1], copy[idx]];
    onReorder(copy);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Selected-stack preview */}
      <div>
        <div
          style={{
            fontSize: 11,
            color: "#64748b",
            letterSpacing: 0.8,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Your stack ({selectedPrompts.length})
        </div>
        {selectedPrompts.length === 0 ? (
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 13,
              color: "#64748b",
              textAlign: "center",
            }}
          >
            Pick prompts below. They&apos;ll run in the order you add them.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {selectedPrompts.map((p, idx) => (
              <div
                key={p.id}
                style={{
                  background: "rgba(56,189,248,0.08)",
                  border: "1px solid rgba(56,189,248,0.2)",
                  borderRadius: 8,
                  padding: "8px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", width: 18 }}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span style={{ flex: 1, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.title}
                </span>
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  aria-label="Move up"
                  style={{
                    background: "none",
                    border: "none",
                    color: idx === 0 ? "#334155" : "#94a3b8",
                    cursor: idx === 0 ? "default" : "pointer",
                    padding: 4,
                    fontSize: 12,
                  }}
                >
                  ↑
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === selectedPrompts.length - 1}
                  aria-label="Move down"
                  style={{
                    background: "none",
                    border: "none",
                    color: idx === selectedPrompts.length - 1 ? "#334155" : "#94a3b8",
                    cursor: idx === selectedPrompts.length - 1 ? "default" : "pointer",
                    padding: 4,
                    fontSize: 12,
                  }}
                >
                  ↓
                </button>
                <button
                  onClick={() => onToggle(p.id)}
                  aria-label="Remove"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    padding: 4,
                    fontSize: 14,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Browse/search */}
      <div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search prompts to add..."
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            padding: "10px 12px",
            color: "#e2e8f0",
            fontSize: 13,
            fontFamily: "inherit",
            outline: "none",
            marginBottom: 8,
          }}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {[{ id: "all", label: "All" }, { id: "write", label: "Write" }, { id: "followup", label: "Follow Up" }, { id: "coach", label: "Coach" }, { id: "strategy", label: "Strategy" }].map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              style={{
                background: categoryFilter === c.id ? "linear-gradient(135deg, #10b981, #38bdf8)" : "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: categoryFilter === c.id ? "#0a1628" : "#94a3b8",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.3,
                padding: "5px 10px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div style={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          {filtered.slice(0, 50).map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onToggle(p.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  background: isSelected ? "rgba(56,189,248,0.08)" : "rgba(255,255,255,0.02)",
                  border: isSelected ? "1px solid rgba(56,189,248,0.3)" : "1px solid rgba(255,255,255,0.04)",
                  borderRadius: 8,
                  padding: "8px 10px",
                  cursor: "pointer",
                  color: "inherit",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: `1px solid ${isSelected ? "#38bdf8" : "#475569"}`,
                    background: isSelected ? "#38bdf8" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 10,
                    color: "#0a1628",
                    fontWeight: 800,
                  }}
                >
                  {isSelected ? "✓" : ""}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className={spaceGrotesk.className}
                    style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {p.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: DIFFICULTY_COLORS[p.difficulty], fontWeight: 700, fontSize: 10, letterSpacing: 0.3, textTransform: "uppercase" }}>
                      {CATEGORY_LABELS[p.category]}
                    </span>
                    <span style={{ color: "#334155" }}>•</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.chapterTitle}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
