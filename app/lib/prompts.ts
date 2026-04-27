import promptsData from "../../data/prompts.json";

export interface Prompt {
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

export const prompts = promptsData as Prompt[];

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['‘’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const slugToPrompt = new Map<string, Prompt>();
const idToSlug = new Map<string, string>();

for (const p of prompts) {
  let slug = slugify(p.title);
  if (slugToPrompt.has(slug)) {
    slug = `${slug}-${p.id}`;
  }
  slugToPrompt.set(slug, p);
  idToSlug.set(p.id, slug);
}

export function getPromptBySlug(slug: string): Prompt | undefined {
  return slugToPrompt.get(slug);
}

export function getSlugForPrompt(id: string): string | undefined {
  return idToSlug.get(id);
}

export function getAllSlugs(): string[] {
  return Array.from(slugToPrompt.keys());
}
