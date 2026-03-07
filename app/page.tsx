"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { spaceGrotesk } from "./fonts";
import promptsData from "../data/prompts.json";

// --- Types ---
interface Prompt {
  id: string;
  chapter: number;
  chapterTitle: string;
  number: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  bestFor: string;
  category: "write" | "followup" | "coach" | "strategy";
  isInteractive: boolean;
  variables: string[];
  prompt: string;
  quickStart: string | null;
  whatYouGet: string | null;
}

const prompts = promptsData as Prompt[];

// --- Constants ---
const QUICK_PICKS = [
  {
    id: "write",
    label: "Write Something For Me",
    desc: "Listings, emails, social posts, campaigns",
    icon: "pencil",
  },
  {
    id: "followup",
    label: "Help Me Follow Up",
    desc: "Post-showing, cold leads, referral asks",
    icon: "reply",
  },
  {
    id: "coach",
    label: "Coach Me Through It",
    desc: "Roleplay, objection handling, tough talks",
    icon: "chat",
  },
  {
    id: "strategy",
    label: "Plan My Strategy",
    desc: "Lead gen plans, audits, systems",
    icon: "chart",
  },
];

// Hand-curated featured prompts per category (shown first)
const FEATURED: Record<string, string[]> = {
  write: ["ch6-6.1", "ch0-2", "ch0-9"],
  followup: ["ch3-2", "ch3-1", "ch2-40"],
  coach: ["ch8-1", "ch8-2", "ch7-5"],
  strategy: ["ch1-11", "ch2-1", "ch1-12"],
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "#10b981",
  intermediate: "#f59e0b",
  advanced: "#ef4444",
};

// --- Helpers ---
function pushEvent(event: string, data?: Record<string, string>) {
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    (window as any).dataLayer.push({ event, ...data });
  }
}

function highlightBrackets(text: string): string {
  return text.replace(
    /\[([^\]]+)\]/g,
    '<mark>[$1]</mark>'
  );
}

function searchPrompts(query: string): Prompt[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const words = q.split(/\s+/);

  const scored = prompts.map((p) => {
    const searchable = `${p.title} ${p.bestFor} ${p.chapterTitle} ${p.category} ${p.prompt}`.toLowerCase();
    let score = 0;

    // Exact phrase match in title
    if (p.title.toLowerCase().includes(q)) score += 50;

    // Word matches
    for (const w of words) {
      if (p.title.toLowerCase().includes(w)) score += 10;
      if (p.bestFor.toLowerCase().includes(w)) score += 5;
      if (p.prompt.toLowerCase().includes(w)) score += 2;
      if (p.chapterTitle.toLowerCase().includes(w)) score += 3;
    }

    return { prompt: p, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((s) => s.prompt);
}

function getCategoryResults(category: string): Prompt[] {
  const featured = FEATURED[category] || [];
  const featuredPrompts = featured
    .map((id) => prompts.find((p) => p.id === id))
    .filter(Boolean) as Prompt[];

  const rest = prompts
    .filter((p) => p.category === category && !featured.includes(p.id))
    .slice(0, 5);

  return [...featuredPrompts, ...rest];
}

// --- Components ---

function QuickPickIcon({ icon }: { icon: string }) {
  const size = 24;
  const stroke = "currentColor";
  const fill = "none";

  switch (icon) {
    case "pencil":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
      );
    case "reply":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 17 4 12 9 7" />
          <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
        </svg>
      );
    case "chat":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "chart":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    default:
      return null;
  }
}

function PromptCard({
  prompt,
  isExpanded,
  onToggle,
  onCopy,
}: {
  prompt: Prompt;
  isExpanded: boolean;
  onToggle: () => void;
  onCopy: (prompt: Prompt) => void;
}) {
  const [showFull, setShowFull] = useState(false);
  const displayText = !showFull && prompt.quickStart ? prompt.quickStart : prompt.prompt;

  return (
    <div
      className="fade-in"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        overflow: "hidden",
        transition: "border-color 0.2s",
        ...(isExpanded ? { borderColor: "rgba(56,189,248,0.3)" } : {}),
      }}
    >
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "20px 24px",
          cursor: "pointer",
          textAlign: "left",
          color: "inherit",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#f1f5f9",
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              {prompt.title}
            </h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {prompt.isInteractive && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#c084fc",
                  background: "rgba(192,132,252,0.12)",
                  padding: "3px 8px",
                  borderRadius: 6,
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                }}
              >
                Interactive
              </span>
            )}
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: DIFFICULTY_COLORS[prompt.difficulty],
                flexShrink: 0,
              }}
            />
            <svg
              width={16}
              height={16}
              viewBox="0 0 16 16"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              <polyline points="4 6 8 10 12 6" />
            </svg>
          </div>
        </div>

        {/* One-line description */}
        {prompt.bestFor && (
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.4 }}>
            {prompt.bestFor.replace(/\*\*/g, "")}
          </p>
        )}

        {/* Variables preview */}
        {prompt.variables.length > 0 && !isExpanded && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
            {prompt.variables.slice(0, 4).map((v) => (
              <span
                key={v}
                style={{
                  fontSize: 11,
                  color: "#f97316",
                  background: "rgba(249,115,22,0.1)",
                  padding: "2px 7px",
                  borderRadius: 4,
                }}
              >
                {v}
              </span>
            ))}
            {prompt.variables.length > 4 && (
              <span style={{ fontSize: 11, color: "#64748b" }}>
                +{prompt.variables.length - 4} more
              </span>
            )}
          </div>
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="slide-up" style={{ padding: "0 24px 24px" }}>
          {/* Prompt text */}
          <div
            className="prompt-text"
            style={{
              background: "rgba(0,0,0,0.3)",
              borderRadius: 12,
              padding: 20,
              fontSize: 14,
              lineHeight: 1.7,
              color: "#cbd5e1",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: 400,
              overflowY: "auto",
            }}
            dangerouslySetInnerHTML={{ __html: highlightBrackets(displayText) }}
          />

          {/* Toggle full/quick-start */}
          {prompt.quickStart && (
            <button
              onClick={() => setShowFull(!showFull)}
              style={{
                background: "none",
                border: "none",
                color: "#38bdf8",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                padding: "10px 0 4px",
              }}
            >
              {showFull ? "Show quick-start version" : "Show full version"}
            </button>
          )}

          {/* What you'll get */}
          {prompt.whatYouGet && (
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 12, lineHeight: 1.5 }}>
              <strong style={{ color: "#cbd5e1" }}>What you'll get:</strong>{" "}
              {prompt.whatYouGet}
            </p>
          )}

          {/* Copy button */}
          <button
            onClick={() => onCopy(prompt)}
            style={{
              width: "100%",
              marginTop: 16,
              padding: "14px 24px",
              background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
              color: "white",
              border: "none",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy Prompt
          </button>
        </div>
      )}
    </div>
  );
}

function EmailModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (email: string, level: string) => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await fetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, level: level || "not specified" }),
      });
    } catch {
      // Non-blocking — still unlock even if API fails
    }

    pushEvent("lead", { email_level: level || "not specified" });
    onSubmit(email, level);
  };

  const levels = [
    { id: "new", label: "New Agent", sub: "0-2 years" },
    { id: "mid", label: "Mid-Career", sub: "3-7 years" },
    { id: "top", label: "Top Producer", sub: "20+ deals/yr" },
  ];

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
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
          padding: 32,
          maxWidth: 420,
          width: "100%",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <h2
          className={spaceGrotesk.className}
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#f1f5f9",
            marginBottom: 8,
            lineHeight: 1.3,
          }}
        >
          We'll send you a personalized starter pack.
        </h2>
        <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24, lineHeight: 1.5 }}>
          Enter your email and we'll send your top 5 prompts based on your
          experience level. All 400+ prompts unlock instantly.
        </p>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 10,
              padding: 12,
              marginBottom: 16,
              color: "#fca5a5",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <input
          ref={inputRef}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="you@email.com"
          style={{
            width: "100%",
            padding: 14,
            fontSize: 16,
            background: "rgba(0,0,0,0.3)",
            border: "2px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            color: "#f1f5f9",
            outline: "none",
            marginBottom: 16,
          }}
        />

        {/* Experience level selector */}
        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 10 }}>
          Experience level <span style={{ color: "#64748b" }}>(optional)</span>
        </p>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {levels.map((l) => (
            <button
              key={l.id}
              onClick={() => setLevel(level === l.id ? "" : l.id)}
              style={{
                flex: 1,
                padding: "10px 8px",
                background:
                  level === l.id
                    ? "rgba(56,189,248,0.15)"
                    : "rgba(255,255,255,0.04)",
                border:
                  level === l.id
                    ? "1.5px solid rgba(56,189,248,0.4)"
                    : "1.5px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                cursor: "pointer",
                color: level === l.id ? "#38bdf8" : "#94a3b8",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>{l.label}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
                {l.sub}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: 16,
            background: loading
              ? "#1e3a6a"
              : "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
            color: "white",
            border: "none",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "Unlocking..." : "Unlock All Prompts"}
        </button>

        <p
          style={{
            fontSize: 12,
            color: "#64748b",
            textAlign: "center",
            marginTop: 12,
          }}
        >
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pendingCopyPrompt, setPendingCopyPrompt] = useState<Prompt | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load state from localStorage
  useEffect(() => {
    const unlocked = localStorage.getItem("prompt_vault_unlocked");
    if (unlocked === "true") setIsUnlocked(true);

    const recent = localStorage.getItem("prompt_vault_recent");
    if (recent) {
      try {
        setRecentlyUsed(JSON.parse(recent));
      } catch {}
    }
  }, []);

  // Results
  const results = useMemo(() => {
    if (query.trim()) return searchPrompts(query);
    if (activeCategory) return getCategoryResults(activeCategory);
    return [];
  }, [query, activeCategory]);

  // Recently used prompts
  const recentPrompts = useMemo(() => {
    return recentlyUsed
      .map((id) => prompts.find((p) => p.id === id))
      .filter(Boolean) as Prompt[];
  }, [recentlyUsed]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (value.trim()) {
      setActiveCategory(null);
      pushEvent("search", { search_query: value });
    }
  }, []);

  const handleQuickPick = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    setQuery("");
    setExpandedId(null);
    pushEvent("search", { search_query: `quick_pick:${categoryId}` });
  }, []);

  const handleToggle = useCallback((promptId: string) => {
    setExpandedId((prev) => {
      const next = prev === promptId ? null : promptId;
      if (next) pushEvent("prompt_view", { prompt_id: promptId });
      return next;
    });
  }, []);

  const handleCopy = useCallback(
    (prompt: Prompt) => {
      if (!isUnlocked) {
        setPendingCopyPrompt(prompt);
        setShowEmailModal(true);
        return;
      }
      executeCopy(prompt);
    },
    [isUnlocked]
  );

  const executeCopy = useCallback((prompt: Prompt) => {
    const textToCopy = prompt.quickStart || prompt.prompt;
    navigator.clipboard.writeText(textToCopy);

    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2000);

    pushEvent("prompt_copy", { prompt_id: prompt.id, prompt_category: prompt.category });

    // Update recently used
    setRecentlyUsed((prev) => {
      const updated = [prompt.id, ...prev.filter((id) => id !== prompt.id)].slice(0, 5);
      localStorage.setItem("prompt_vault_recent", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleEmailSubmit = useCallback(
    (email: string, level: string) => {
      setIsUnlocked(true);
      localStorage.setItem("prompt_vault_unlocked", "true");
      setShowEmailModal(false);

      if (pendingCopyPrompt) {
        executeCopy(pendingCopyPrompt);
        setPendingCopyPrompt(null);
      }
    },
    [pendingCopyPrompt, executeCopy]
  );

  const showingResults = results.length > 0 || query.trim() || activeCategory;

  return (
    <div style={{ minHeight: "100vh", padding: "0 16px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Hero */}
        <section style={{ paddingTop: 48, paddingBottom: 8, textAlign: "center" }}>
          <h1
            className={spaceGrotesk.className}
            style={{
              fontSize: "clamp(26px, 6vw, 38px)",
              fontWeight: 700,
              color: "#f1f5f9",
              lineHeight: 1.15,
              marginBottom: 12,
              letterSpacing: "-0.02em",
            }}
          >
            Tell us what you need.
            <br />
            <span style={{ color: "#38bdf8" }}>
              Get copy-paste-ready AI scripts in seconds.
            </span>
          </h1>
          <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.5, marginBottom: 32 }}>
            400+ templates built for working real estate agents. Works with
            ChatGPT, Claude, or any AI tool.
          </p>
        </section>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#64748b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="What do you need help with?"
            style={{
              width: "100%",
              padding: "16px 16px 16px 48px",
              fontSize: 16,
              background: "rgba(255,255,255,0.06)",
              border: "2px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              color: "#f1f5f9",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(56,189,248,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                searchInputRef.current?.focus();
              }}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                padding: 4,
                fontSize: 18,
              }}
            >
              x
            </button>
          )}
        </div>

        {/* Quick Picks */}
        {!showingResults && (
          <section className="fade-in">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 32,
              }}
            >
              {QUICK_PICKS.map((qp) => (
                <button
                  key={qp.id}
                  onClick={() => handleQuickPick(qp.id)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    padding: "20px 16px",
                    cursor: "pointer",
                    textAlign: "left",
                    color: "inherit",
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
                  <div style={{ color: "#38bdf8", marginBottom: 10 }}>
                    <QuickPickIcon icon={qp.icon} />
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#f1f5f9",
                      marginBottom: 4,
                      lineHeight: 1.3,
                    }}
                  >
                    {qp.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}>
                    {qp.desc}
                  </div>
                </button>
              ))}
            </div>

            {/* Recently Used */}
            {recentPrompts.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <h2
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 12,
                  }}
                >
                  Recently Used
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {recentPrompts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveCategory(p.category);
                        setExpandedId(p.id);
                      }}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 10,
                        padding: "12px 16px",
                        cursor: "pointer",
                        textAlign: "left",
                        color: "#cbd5e1",
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: DIFFICULTY_COLORS[p.difficulty],
                          flexShrink: 0,
                        }}
                      />
                      {p.title}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </section>
        )}

        {/* Results */}
        {showingResults && (
          <section>
            {/* Back / active category label */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <button
                onClick={() => {
                  setActiveCategory(null);
                  setQuery("");
                  setExpandedId(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#38bdf8",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="10 12 6 8 10 4" />
                </svg>
                Back
              </button>
              {activeCategory && (
                <span style={{ fontSize: 14, color: "#94a3b8" }}>
                  {QUICK_PICKS.find((q) => q.id === activeCategory)?.label}
                </span>
              )}
              {query && (
                <span style={{ fontSize: 14, color: "#94a3b8" }}>
                  {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
                </span>
              )}
            </div>

            {/* Prompt list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 48 }}>
              {results.length === 0 && query.trim() && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 24px",
                    color: "#64748b",
                  }}
                >
                  <p style={{ fontSize: 16, marginBottom: 8 }}>
                    No prompts found for "{query}"
                  </p>
                  <p style={{ fontSize: 14 }}>
                    Try different keywords like "listing description" or
                    "follow-up email"
                  </p>
                </div>
              )}

              {results.map((p) => (
                <PromptCard
                  key={p.id}
                  prompt={p}
                  isExpanded={expandedId === p.id}
                  onToggle={() => handleToggle(p.id)}
                  onCopy={handleCopy}
                />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer
          style={{
            padding: "32px 0",
            textAlign: "center",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p style={{ fontSize: 12, color: "#475569" }}>
            &copy; 2026 DJP3 Consulting Inc. Powered by AI.
          </p>
        </footer>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <EmailModal
          onSubmit={handleEmailSubmit}
          onClose={() => {
            setShowEmailModal(false);
            setPendingCopyPrompt(null);
          }}
        />
      )}

      {/* Copied toast */}
      {copiedId && (
        <div
          className="slide-up"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#10b981",
            color: "white",
            padding: "12px 24px",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            zIndex: 999,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          Copied to clipboard!
        </div>
      )}
    </div>
  );
}
