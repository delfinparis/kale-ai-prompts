// Shared types + localStorage helpers for Prompt Stacks

export interface Stack {
  id: string;
  name: string;
  description: string;
  promptIds: string[];
  createdAt: number;
  updatedAt: number;
}

const KEY = "prompt_vault_stacks_v1";

export function loadStacks(): Stack[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Stack[];
  } catch {
    return [];
  }
}

export function saveStacks(stacks: Stack[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(stacks));
  } catch {
    // quota exceeded; ignore
  }
}

export function createStack(partial: { name: string; description?: string; promptIds?: string[] }): Stack {
  return {
    id: `stack-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: partial.name.trim() || "Untitled Stack",
    description: (partial.description || "").trim(),
    promptIds: partial.promptIds || [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function upsertStack(stack: Stack): Stack[] {
  const stacks = loadStacks();
  const idx = stacks.findIndex((s) => s.id === stack.id);
  const updated = { ...stack, updatedAt: Date.now() };
  if (idx === -1) {
    stacks.unshift(updated);
  } else {
    stacks[idx] = updated;
  }
  saveStacks(stacks);
  return stacks;
}

export function deleteStack(id: string): Stack[] {
  const stacks = loadStacks().filter((s) => s.id !== id);
  saveStacks(stacks);
  return stacks;
}

// Starter templates — shown if user has zero stacks
export const STARTER_TEMPLATES: Omit<Stack, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "New Listing Launch",
    description: "MLS description → social post → broker blast → seller brief",
    promptIds: ["ch6-6.1", "ch0-2", "ch3-2", "ch8-1"],
  },
  {
    name: "Open House Weekend",
    description: "Pre-promo → conversation starters → same-day follow-up",
    promptIds: ["ch0-4", "ch0-5", "ch3-2"],
  },
  {
    name: "Monday Morning Reactivation",
    description: "Database audit → past client reactivation → referral ask",
    promptIds: ["ch2-47", "ch2-48", "ch3-23"],
  },
  {
    name: "Expired Listing Attack",
    description: "Prospecting system → listing autopsy → positioning",
    promptIds: ["ch2-54", "ch6-6.1", "ch8-19"],
  },
];
