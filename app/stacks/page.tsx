"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { spaceGrotesk } from "../fonts";
import promptsData from "../../data/prompts.json";
import StackPromptPicker from "../components/StackPromptPicker";
import {
  Stack,
  STARTER_TEMPLATES,
  createStack,
  deleteStack,
  loadStacks,
  upsertStack,
} from "../lib/stacks";

interface Prompt {
  id: string;
  title: string;
  bestFor: string;
  category: "write" | "followup" | "coach" | "strategy";
  difficulty: "beginner" | "intermediate" | "advanced";
  chapterTitle: string;
  prompt: string;
}

const prompts = promptsData as Prompt[];

function pushEvent(event: string, data?: Record<string, string>) {
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    (window as any).dataLayer.push({ event, ...data });
  }
}

type Mode = "list" | "edit" | "run";

export default function StacksPage() {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [mode, setMode] = useState<Mode>("list");
  const [editingStack, setEditingStack] = useState<Stack | null>(null);
  const [runningStack, setRunningStack] = useState<Stack | null>(null);
  const [runStep, setRunStep] = useState(0);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  useEffect(() => {
    setStacks(loadStacks());
  }, []);

  // ----- LIST MODE -----

  const handleNewStack = () => {
    const fresh = createStack({ name: "", description: "", promptIds: [] });
    setEditingStack(fresh);
    setMode("edit");
    pushEvent("stack_new_click");
  };

  const handleUseTemplate = (tpl: typeof STARTER_TEMPLATES[0]) => {
    const fresh = createStack(tpl);
    setEditingStack(fresh);
    setMode("edit");
    pushEvent("stack_template_click", { template: tpl.name });
  };

  const handleEdit = (stack: Stack) => {
    setEditingStack({ ...stack });
    setMode("edit");
  };

  const handleRun = (stack: Stack) => {
    if (stack.promptIds.length === 0) return;
    setRunningStack(stack);
    setRunStep(0);
    setMode("run");
    pushEvent("stack_run_start", { stack_id: stack.id, prompt_count: String(stack.promptIds.length) });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this stack? This can't be undone.")) return;
    setStacks(deleteStack(id));
    pushEvent("stack_delete", { stack_id: id });
  };

  // ----- EDIT MODE -----

  const handleEditToggle = (promptId: string) => {
    if (!editingStack) return;
    const has = editingStack.promptIds.includes(promptId);
    setEditingStack({
      ...editingStack,
      promptIds: has
        ? editingStack.promptIds.filter((id) => id !== promptId)
        : [...editingStack.promptIds, promptId],
    });
  };

  const handleEditReorder = (newOrder: string[]) => {
    if (!editingStack) return;
    setEditingStack({ ...editingStack, promptIds: newOrder });
  };

  const handleEditSave = () => {
    if (!editingStack) return;
    if (!editingStack.name.trim()) {
      window.alert("Give your stack a name first.");
      return;
    }
    if (editingStack.promptIds.length === 0) {
      window.alert("Add at least one prompt to the stack.");
      return;
    }
    const updated = upsertStack(editingStack);
    setStacks(updated);
    setEditingStack(null);
    setMode("list");
    pushEvent("stack_save", {
      stack_id: editingStack.id,
      prompt_count: String(editingStack.promptIds.length),
    });
  };

  const handleEditCancel = () => {
    setEditingStack(null);
    setMode("list");
  };

  // ----- RUN MODE -----

  const currentRunPrompt = useMemo(() => {
    if (!runningStack) return null;
    const id = runningStack.promptIds[runStep];
    return prompts.find((p) => p.id === id) || null;
  }, [runningStack, runStep]);

  const handleCopyCurrent = async () => {
    if (!currentRunPrompt) return;
    try {
      await navigator.clipboard.writeText(currentRunPrompt.prompt);
      setCopiedStep(runStep);
      pushEvent("stack_step_copy", {
        stack_id: runningStack!.id,
        prompt_id: currentRunPrompt.id,
        step: String(runStep + 1),
      });
      setTimeout(() => setCopiedStep(null), 2500);
    } catch {
      // ignore
    }
  };

  const handleNextStep = () => {
    if (!runningStack) return;
    if (runStep + 1 >= runningStack.promptIds.length) {
      // Finished
      pushEvent("stack_run_complete", { stack_id: runningStack.id });
      setRunningStack(null);
      setRunStep(0);
      setMode("list");
      return;
    }
    setRunStep((s) => s + 1);
    setCopiedStep(null);
  };

  const handleExitRun = () => {
    setRunningStack(null);
    setRunStep(0);
    setMode("list");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a1628",
        color: "#e2e8f0",
        padding: "32px 16px 96px",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Link
            href="/"
            style={{
              fontSize: 13,
              color: "#64748b",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 12,
            }}
          >
            ← Back to vault
          </Link>
          <h1
            className={spaceGrotesk.className}
            style={{
              fontSize: "clamp(24px, 6vw, 32px)",
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: 8,
            }}
          >
            Prompt{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #10b981, #38bdf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Stacks
            </span>
          </h1>
          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.5 }}>
            Chain prompts into workflows. New listing? Open house? Monday reactivation? Build
            the sequence once, run it in 2 minutes forever.
          </p>
        </div>

        {/* LIST MODE */}
        {mode === "list" && (
          <div>
            <button
              onClick={handleNewStack}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #10b981, #38bdf8)",
                color: "#0a1628",
                border: "none",
                borderRadius: 12,
                padding: "14px 18px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: 24,
                letterSpacing: 0.3,
              }}
            >
              + New Stack
            </button>

            {stacks.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  Your stacks ({stacks.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {stacks.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12,
                        padding: "14px 16px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            className={spaceGrotesk.className}
                            style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}
                          >
                            {s.name}
                          </div>
                          {s.description && (
                            <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}>
                              {s.description}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap", flexShrink: 0 }}>
                          {s.promptIds.length} step{s.promptIds.length === 1 ? "" : "s"}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                        <button
                          onClick={() => handleRun(s)}
                          disabled={s.promptIds.length === 0}
                          style={{
                            background: s.promptIds.length === 0 ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg, #10b981, #38bdf8)",
                            color: s.promptIds.length === 0 ? "#475569" : "#0a1628",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 14px",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: s.promptIds.length === 0 ? "not-allowed" : "pointer",
                            letterSpacing: 0.3,
                          }}
                        >
                          ▶ Run stack
                        </button>
                        <button
                          onClick={() => handleEdit(s)}
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            color: "#94a3b8",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 8,
                            padding: "8px 14px",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          style={{
                            background: "transparent",
                            color: "#64748b",
                            border: "1px solid rgba(255,255,255,0.05)",
                            borderRadius: 8,
                            padding: "8px 14px",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Starter templates */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                {stacks.length === 0 ? "Start from a template" : "More templates"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {STARTER_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => handleUseTemplate(tpl)}
                    style={{
                      background: "rgba(16,185,129,0.05)",
                      border: "1px solid rgba(16,185,129,0.15)",
                      borderRadius: 12,
                      padding: "14px 16px",
                      cursor: "pointer",
                      color: "inherit",
                      textAlign: "left",
                    }}
                  >
                    <div
                      className={spaceGrotesk.className}
                      style={{ fontSize: 14, fontWeight: 700, color: "#34d399", marginBottom: 3 }}
                    >
                      {tpl.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4, marginBottom: 4 }}>
                      {tpl.description}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      {tpl.promptIds.length} prompts →
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODE */}
        {mode === "edit" && editingStack && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  color: "#64748b",
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Stack name
              </label>
              <input
                value={editingStack.name}
                onChange={(e) => setEditingStack({ ...editingStack, name: e.target.value })}
                placeholder="New Listing Launch"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  color: "#e2e8f0",
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  color: "#64748b",
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                What it's for (optional)
              </label>
              <input
                value={editingStack.description}
                onChange={(e) => setEditingStack({ ...editingStack, description: e.target.value })}
                placeholder="Every time a new listing hits my desk..."
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  color: "#e2e8f0",
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
            </div>

            <StackPromptPicker
              prompts={prompts}
              selectedIds={editingStack.promptIds}
              onToggle={handleEditToggle}
              onReorder={handleEditReorder}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button
                onClick={handleEditSave}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #10b981, #38bdf8)",
                  color: "#0a1628",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 18px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: 0.3,
                }}
              >
                Save stack
              </button>
              <button
                onClick={handleEditCancel}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#94a3b8",
                  borderRadius: 10,
                  padding: "12px 18px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* RUN MODE */}
        {mode === "run" && runningStack && currentRunPrompt && (
          <div>
            <div
              style={{
                background: "rgba(16,185,129,0.05)",
                border: "1px solid rgba(16,185,129,0.15)",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                <span style={{ color: "#34d399", fontWeight: 700 }}>{runningStack.name}</span>
                <span style={{ color: "#475569" }}> · step {runStep + 1} of {runningStack.promptIds.length}</span>
              </div>
              <button
                onClick={handleExitRun}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  fontSize: 12,
                  textDecoration: "underline",
                }}
              >
                Exit
              </button>
            </div>

            {/* Progress bar */}
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 999, height: 4, marginBottom: 20, overflow: "hidden" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #10b981, #38bdf8)",
                  height: "100%",
                  width: `${((runStep + 1) / runningStack.promptIds.length) * 100}%`,
                  transition: "width 0.3s",
                }}
              />
            </div>

            <div
              className={spaceGrotesk.className}
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#e2e8f0",
                marginBottom: 8,
                lineHeight: 1.3,
              }}
            >
              {currentRunPrompt.title}
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16, lineHeight: 1.5 }}>
              {currentRunPrompt.bestFor}
            </div>

            <div
              style={{
                background: "#050d1c",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
                padding: "14px",
                fontSize: 12,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                color: "#cbd5e1",
                whiteSpace: "pre-wrap",
                maxHeight: 340,
                overflowY: "auto",
                lineHeight: 1.5,
                marginBottom: 16,
              }}
            >
              {currentRunPrompt.prompt}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleCopyCurrent}
                style={{
                  flex: 1,
                  background: copiedStep === runStep ? "#10b981" : "rgba(56,189,248,0.15)",
                  border: `1px solid ${copiedStep === runStep ? "#10b981" : "rgba(56,189,248,0.3)"}`,
                  color: copiedStep === runStep ? "#0a1628" : "#38bdf8",
                  borderRadius: 10,
                  padding: "14px 18px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: 0.3,
                }}
              >
                {copiedStep === runStep ? "✓ Copied" : "Copy prompt"}
              </button>
              <button
                onClick={handleNextStep}
                style={{
                  background: "linear-gradient(135deg, #10b981, #38bdf8)",
                  border: "none",
                  color: "#0a1628",
                  borderRadius: 10,
                  padding: "14px 18px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: 0.3,
                  whiteSpace: "nowrap",
                }}
              >
                {runStep + 1 >= runningStack.promptIds.length ? "Finish ✓" : "Next →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
