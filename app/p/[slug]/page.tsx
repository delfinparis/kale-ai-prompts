import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getPromptBySlug, type Prompt } from "../../lib/prompts";
import { spaceGrotesk } from "../../fonts";
import OpenInAI from "../../components/OpenInAI";
import CopyLinkButton from "../../components/CopyLinkButton";

const SITE_URL = "https://tapthis.co";

const DIFFICULTY_COLORS: Record<Prompt["difficulty"], string> = {
  beginner: "#10b981",
  intermediate: "#f59e0b",
  advanced: "#ef4444",
};

const DIFFICULTY_LABELS: Record<Prompt["difficulty"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const CATEGORY_LABELS: Record<Prompt["category"], string> = {
  write: "Write",
  followup: "Follow Up",
  coach: "Coach",
  strategy: "Strategy",
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

function buildDescription(p: Prompt): string {
  const fact = `${CATEGORY_LABELS[p.category]} prompt for real estate agents.`;
  if (p.whatYouGet) {
    const trimmed = p.whatYouGet.replace(/\s+/g, " ").trim();
    return `${fact} ${trimmed}`.slice(0, 158);
  }
  return `${fact} Customize the brackets and paste into ChatGPT, Claude, or Gemini. ${p.bestFor.replace(/\*\*/g, "").trim()}`.slice(0, 158);
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const prompt = getPromptBySlug(slug);
  if (!prompt) {
    return {
      title: "Prompt not found | Copy That.",
      description: "This prompt does not exist or has moved.",
    };
  }
  const title = `${prompt.title} | Copy That. AI Prompt for Real Estate Agents`;
  const description = buildDescription(prompt);
  const url = `${SITE_URL}/p/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Copy That.",
      type: "article",
      images: ["/api/og"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/api/og"],
    },
  };
}

function PromptJsonLd({ prompt, slug }: { prompt: Prompt; slug: string }) {
  const url = `${SITE_URL}/p/${slug}`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: prompt.title,
        description: buildDescription(prompt),
        url,
        author: { "@id": `${SITE_URL}#org` },
        publisher: { "@id": `${SITE_URL}#org` },
        about: {
          "@type": "Thing",
          name: "Real estate AI prompts",
        },
        audience: {
          "@type": "Audience",
          audienceType: "Real estate agents",
        },
        keywords: [
          CATEGORY_LABELS[prompt.category],
          DIFFICULTY_LABELS[prompt.difficulty],
          "real estate AI prompt",
          "ChatGPT prompt for realtors",
          prompt.title,
        ].join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Copy That.",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: prompt.title,
            item: url,
          },
        ],
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function PromptPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const prompt = getPromptBySlug(slug);
  if (!prompt) notFound();

  const promptText = prompt.prompt;
  const cleanedBestFor = prompt.bestFor.replace(/\*\*/g, "").trim();

  return (
    <div style={{ minHeight: "100vh", padding: "0 16px" }}>
      <PromptJsonLd prompt={prompt} slug={slug} />
      <div className="col-narrow" style={{ paddingTop: 32, paddingBottom: 48 }}>
        {/* Brand link back home */}
        <div style={{ marginBottom: 24 }}>
          <Link
            href="/"
            style={{
              fontSize: 14,
              color: "#94a3b8",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className={spaceGrotesk.className} style={{ fontWeight: 700, color: "#f1f5f9" }}>
              Copy That.
            </span>
          </Link>
        </div>

        {/* Difficulty + category badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              color: DIFFICULTY_COLORS[prompt.difficulty],
            }}
          >
            {DIFFICULTY_LABELS[prompt.difficulty]}
          </span>
          <span style={{ color: "#475569" }}>•</span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "#64748b" }}>
            {CATEGORY_LABELS[prompt.category]}
          </span>
        </div>

        {/* Title */}
        <h1
          className={spaceGrotesk.className}
          style={{
            fontSize: "clamp(24px, 5vw, 32px)",
            fontWeight: 700,
            color: "#f1f5f9",
            lineHeight: 1.2,
            marginBottom: 14,
            letterSpacing: "-0.01em",
          }}
        >
          {prompt.title}
        </h1>

        {/* What you get */}
        {prompt.whatYouGet && (
          <p style={{ fontSize: 15, color: "#cbd5e1", lineHeight: 1.55, marginBottom: 20 }}>
            <strong style={{ color: "#f1f5f9", fontWeight: 700 }}>What you&apos;ll get: </strong>
            {prompt.whatYouGet}
          </p>
        )}

        {/* Best for */}
        {cleanedBestFor && (
          <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5, marginBottom: 24, fontStyle: "italic" }}>
            Best for: {cleanedBestFor}
          </p>
        )}

        {/* Primary CTA */}
        <div style={{ marginBottom: 12 }}>
          <OpenInAI
            promptText={promptText}
            promptId={prompt.id}
            promptTitle={prompt.title}
          />
        </div>
        <div style={{ marginBottom: 32 }}>
          <CopyLinkButton url={`${SITE_URL}/p/${slug}`} />
        </div>

        {/* Prompt body */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "18px 20px",
            marginBottom: 32,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 10,
            }}
          >
            The prompt
          </p>
          <pre
            style={{
              fontSize: 13,
              color: "#cbd5e1",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              fontFamily: "inherit",
              margin: 0,
            }}
          >
            {promptText}
          </pre>
        </div>

        <div style={{ textAlign: "center" }}>
          <Link
            href="/"
            style={{
              fontSize: 13,
              color: "#94a3b8",
              textDecoration: "none",
            }}
          >
            ← Browse all 620 prompts
          </Link>
        </div>
      </div>
    </div>
  );
}
