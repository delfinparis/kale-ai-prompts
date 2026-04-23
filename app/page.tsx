"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { spaceGrotesk } from "./fonts";
import promptsData from "../data/prompts.json";
import SocialProofStrip from "./components/SocialProofStrip";
import GlobalSearch from "./components/GlobalSearch";
import TopThisWeek from "./components/TopThisWeek";
import StrategyCallFooter from "./components/StrategyCallFooter";
import StacksEntryCard from "./components/StacksEntryCard";
import FeedbackWidget from "./components/FeedbackWidget";
import OpenInAI from "./components/OpenInAI";

const FREE_COPY_LIMIT = 2;

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

interface Subgroup {
  id: string;
  label: string;
  desc: string;
  filter: (p: Prompt) => boolean;
}

interface Subcategory {
  id: string;
  label: string;
  desc: string;
  filter: (p: Prompt) => boolean;
  featured?: string[];
  subgroups?: Subgroup[];
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

const SUBCATEGORIES: Record<string, Subcategory[]> = {
  write: [
    {
      id: "listing-desc",
      label: "Listing Descriptions & Marketing",
      desc: "MLS copy, social posts, emails, flyers, video scripts",
      featured: ["ch6-6.1", "ch6-6.2", "ch6-6.3"],
      filter: (p) =>
        p.category === "write" &&
        (p.chapter === 6 ||
          /listing|mls|description|luxury listing|condo|investment property|price reduction|zillow|property description|townhome|short sale|multi-family|comparative market|neighborhood feature|withdrawn/i.test(
            p.title
          )),
      subgroups: [
        {
          id: "mls-descriptions",
          label: "MLS Descriptions",
          desc: "Standard, luxury, condo, land, investment",
          filter: (p) => /mls|description|luxury property|starter home|condo|townhouse|vacant land|investment property|rewriter|write better listing|comparative market|neighborhood feature/i.test(p.title),
        },
        {
          id: "listing-social",
          label: "Listing Social Posts",
          desc: "New listing, just sold, coming soon, price updates",
          filter: (p) => /announcement|just sold|coming soon|teaser|open house promotion|price improvement|price reduction.*social|new listing.*post|recap/i.test(p.title),
        },
        {
          id: "listing-emails",
          label: "Listing Emails",
          desc: "New listing blasts, broker emails, price reduction",
          filter: (p) => /email|blast|broker-to-broker|price reduction email|newsletter|neighborhood context/i.test(p.title),
        },
        {
          id: "listing-marketing",
          label: "Marketing Materials & Scripts",
          desc: "Flyers, brochures, video scripts, launch plans",
          filter: (p) => /flyer|brochure|video|walkthrough|narration|launch|strategy|stale|refresh|presentation|pitch|withdrawn|post-closing|property brochure/i.test(p.title),
        },
      ],
    },
    {
      id: "emails-letters",
      label: "Emails, Letters & Templates",
      desc: "Thank-you, intro, follow-up texts, response templates",
      featured: ["ch0-1", "ch0-5", "ch0-9"],
      filter: (p) =>
        p.category === "write" &&
        /email|letter|thank|intro|invitation|invite|welcome|congratulat|announcement|neighborhood intro|door knock|moving checklist|event|texts|text message|personalized.*follow-up|speed-to-lead|response template|wake up.*dead leads/i.test(
          p.title
        ),
    },
    {
      id: "social-content",
      label: "Social Media & Content",
      desc: "Posts, reels, stories, content calendar",
      featured: ["ch0-2", "ch0-3", "ch0-4"],
      filter: (p) =>
        p.category === "write" &&
        /social|post|reel|story|stories|content|calendar|instagram|facebook|caption|video|tiktok|youtube|poll|carousel|conversation starters|neighborhood intel/i.test(
          p.title
        ),
    },
    {
      id: "marketing-copy",
      label: "Marketing, Ads & Guides",
      desc: "Ad copy, SEO, landing pages, lead magnets, reports",
      featured: ["ch2-42", "ch1-33", "ch1-5"],
      filter: (p) =>
        p.category === "write" &&
        /flyer|brochure|launch|script|narration|ad copy|landing page|seo|blog|brand voice|market update|guide|market comparison|lead magnet promotion|swipe file|performance review|countdown checklist|roleplay/i.test(
          p.title
        ),
    },
  ],
  followup: [
    {
      id: "after-showing",
      label: "After a Showing",
      desc: "Same-day, next-morning, undecided buyers",
      featured: ["ch3-2", "ch3-1", "ch3-3"],
      filter: (p) =>
        p.category === "followup" &&
        /showing|debrief|post-showing|they loved|undecided|didn't like|criteria|post-price-reduction|seller check-in/i.test(
          p.title
        ),
    },
    {
      id: "cold-leads",
      label: "Cold & Dead Leads",
      desc: "Reactivation, re-engagement, prospecting, expired",
      featured: ["ch3-46", "ch3-45", "ch3-40"],
      filter: (p) =>
        p.category === "followup" &&
        /cold|dead|dormant|reactivat|re-engage|silent|ghost|lost|break-up|recovery|trigger event|hidden opportunity|purge|chose another agent|quick-question|re-opener|expired listing|lead qualification|database audit|segmentation plan/i.test(
          p.title + " " + p.bestFor
        ),
    },
    {
      id: "past-clients",
      label: "Past Clients & Referrals",
      desc: "Nurture, referral asks, milestone touches",
      featured: ["ch3-23", "ch3-13", "ch3-22"],
      filter: (p) =>
        p.category === "followup" &&
        /past client|referral|nurture|milestone|anniversary|sphere|soi|closing|appreciation|pop-by|home value|touchpoint|top of mind|thought of you|maintenance|personalized|intelligence profile|communication preference|natural conversation|voice note|post-transaction|same-message|different-styles|personality-based|personality type|assessment guide/i.test(
          p.title + " " + p.bestFor
        ),
      subgroups: [
        {
          id: "client-intel",
          label: "Client Intelligence",
          desc: "Profiles, preferences, personality-based follow-up",
          filter: (p) => /intelligence|preference|personalized|personality|saw this|thought of you|adapter|same-message|different-styles|natural conversation|assessment guide|network architecture/i.test(p.title),
        },
        {
          id: "stay-in-touch",
          label: "Stay-in-Touch Messages",
          desc: "Milestones, home value updates, pop-bys",
          filter: (p) => /milestone|home value|maintenance|pop-by|top of mind|touchpoint|voice note|market update|post-transaction|nurture drip|nurture plan|drip campaign|closing conversation|post-open-house text/i.test(p.title),
        },
        {
          id: "referral-asks",
          label: "Referral Asks & Thank-Yous",
          desc: "Non-cringe referral scripts, appreciation",
          filter: (p) => /referral|thank-you|appreciation|event invitation|nurture sequence|touchpoint calendar|soi|sphere of influence|outreach system|power partner breakfast|joint client education/i.test(p.title),
        },
      ],
    },
    {
      id: "drip-sequences",
      label: "Email Drip Campaigns & Automation",
      desc: "Sequences, CRM workflows, automation rules",
      featured: ["ch3-37", "ch3-38", "ch3-39"],
      filter: (p) =>
        p.category === "followup" &&
        /drip|sequence|email.*campaign|subject line|automation|multi-channel|channel selection|escalation|critical moment|quarterly.*assessment|engagement signal|frequency matrix|send guide|crm|action plan|sounds human/i.test(
          p.title
        ),
      subgroups: [
        {
          id: "drip-campaigns",
          label: "Drip Campaigns",
          desc: "Buyer, seller, past client, cold lead sequences",
          filter: (p) => /drip|campaign|sequence|subject line|action plan/i.test(p.title),
        },
        {
          id: "automation-rules",
          label: "Automation & CRM Systems",
          desc: "CRM workflows, pause rules, multi-channel",
          filter: (p) => /automat|multi-channel|channel selection|escalation|critical moment|frequency|engagement signal|send guide|quarterly|sounds human|crm|optimize|data cleanup|workflow/i.test(p.title),
        },
      ],
    },
    {
      id: "open-house-fu",
      label: "Open House",
      desc: "Planning, scripts, staging, objection handling",
      featured: ["ch4-43", "ch4-44", "ch4-45"],
      filter: (p) =>
        p.category === "followup" && p.chapter === 4,
      subgroups: [
        {
          id: "oh-planning",
          label: "Planning & Strategy",
          desc: "Decision framework, goals, timing, partners",
          filter: (p) => /decision|goal|timing|multi-open|partner|co-hosting/i.test(p.title),
        },
        {
          id: "oh-promotion",
          label: "Promotion & Marketing",
          desc: "Social posts, emails, door knocks, video",
          filter: (p) => /instagram|facebook|stories|countdown|video|reels|tiktok|email.*angle|door-knock|nextdoor|event page|checklist|14-day/i.test(p.title),
        },
        {
          id: "oh-staging",
          label: "Staging & Prep",
          desc: "Staging, cleaning, curb appeal, tech setup",
          filter: (p) => /staging|cleaning|curb|walkthrough|hiding|sign placement|sensory|music|scent|refreshment|visitor flow|safety|technology|assistant|delegation|materials/i.test(p.title),
        },
        {
          id: "oh-scripts",
          label: "Talking Points & Scripts",
          desc: "Greeting, qualifying, lifestyle stories, conversations",
          filter: (p) => /talking point|lifestyle|neighborhood pitch|brochure|comparable|greeting|qualifying|conversation|engagement|closing conversation|exit|recovery|awkward|first-time buyer.*guide|investor.*guide|neighbor.*guide|represented|move-up|downsizer|renovation potential|immediate post-open/i.test(p.title),
        },
        {
          id: "oh-objections",
          label: "Objection Handling",
          desc: "Price, condition, neighborhood, 'need to think'",
          filter: (p) => /objection|overpriced|renovation objection|needs too much|neighborhood objection|think about it/i.test(p.title),
        },
        {
          id: "oh-capture",
          label: "Lead Capture & Follow-Up",
          desc: "Sign-in, resistant visitors, post-event processing",
          filter: (p) => /sign-in|resistant visitor|text for detail|post-event|data processing|incentive|scorecard|performance|content captured|recap/i.test(p.title),
        },
      ],
    },
    {
      id: "networking",
      label: "Networking & Relationships",
      desc: "Introductions, partnerships, LinkedIn, events",
      featured: ["ch5-9", "ch5-19", "ch5-29"],
      filter: (p) =>
        p.category === "followup" && p.chapter === 5,
      subgroups: [
        {
          id: "net-strategy",
          label: "Strategy & Planning",
          desc: "Event selection, Dream 25, 90-day calendar",
          filter: (p) => /highest-roi|dream 25|90-day|network architecture|choosing.*groups|goal-setting/i.test(p.title),
        },
        {
          id: "net-brand",
          label: "Your Personal Brand",
          desc: "Introductions, origin story, positioning",
          filter: (p) => /introduction|origin story|what makes you|positioning|linkedin.*about|pre-event|non-pitch|signature stories|personality type|business card|cocktail/i.test(p.title),
        },
        {
          id: "net-conversation",
          label: "Conversation Skills",
          desc: "Frameworks, scripts, handling objections",
          filter: (p) => /conversation flow|go-deeper|scripts.*scenario|already have a realtor|new agent value|exit strateg|bridge question|thought leader|active listening|real work|isn't real/i.test(p.title),
        },
        {
          id: "net-partners",
          label: "Referral Partners",
          desc: "Outreach, coffee meetings, joint events",
          filter: (p) => /referral partner|first outreach|coffee meeting|value i bring|thank-you|agent-to-agent|power partner|joint client|annual partner|appreciation|design a monthly/i.test(p.title),
        },
        {
          id: "net-linkedin",
          label: "LinkedIn & Social",
          desc: "Profile, DMs, content, engagement routine",
          filter: (p) => /linkedin|instagram dm|online community|converting online|newsletter.*professional/i.test(p.title),
        },
        {
          id: "net-followup",
          label: "Follow-Up & Nurture",
          desc: "Post-event, reconnect, value bombs",
          filter: (p) => /24-hour|follow-up.*response|reconnect|relationship.*ladder|monthly partner|quarterly value|follow-up.*contact|value bomb|warm introduction|weekly relationship|board of advisors/i.test(p.title),
        },
      ],
    },
  ],
  coach: [
    {
      id: "listing-appt",
      label: "Listing Appointments",
      desc: "Pricing objections, FSBO, expired listings",
      featured: ["ch8-1", "ch8-3", "ch8-4"],
      filter: (p) =>
        p.category === "coach" &&
        /listing|seller|fsbo|expired|overprice|palace|spring|commission|discount broker|training material/i.test(
          p.title
        ),
    },
    {
      id: "buyer-convos",
      label: "Buyer Conversations",
      desc: "Hesitant buyers, consultations, value pitch",
      featured: ["ch8-7", "ch8-8", "ch7-5"],
      filter: (p) =>
        p.category === "coach" &&
        /buyer|scared|hesitant|consultation|first-time|value pitch|six-month|can't commit|lowball|parent|underbuyer|relocat|zillow|redfin|bad experience|just looking|crash|friend.*agent/i.test(
          p.title
        ),
    },
    {
      id: "negotiation",
      label: "Negotiation & Offers",
      desc: "Counters, inspections, appraisals, multiple offers",
      featured: ["ch7-1", "ch7-2", "ch7-4"],
      filter: (p) =>
        p.category === "coach" &&
        /offer|counter|appraisal|inspection|repair|cash|negotiat|net sheet|multi-offer|below-asking|walk-away|price reduction|worth what|overprice.*50|comparing.*offers|best and final|presenting multiple/i.test(
          p.title
        ),
      subgroups: [
        {
          id: "neg-offers",
          label: "Making & Winning Offers",
          desc: "Compelling offers, multi-offer, cash competition",
          filter: (p) => /compelling offer|multi-offer|below-asking|competing against|best and final|positioning|presenting multiple/i.test(p.title),
        },
        {
          id: "neg-inspections",
          label: "Inspections & Appraisals",
          desc: "Repair requests, low appraisals, walk-away",
          filter: (p) => /inspection|repair|appraisal|walk-away|terminate/i.test(p.title),
        },
        {
          id: "neg-pricing",
          label: "Pricing Conversations",
          desc: "Price reductions, Zillow, overpricing, seller net",
          filter: (p) => /price reduction|worth what|overprice|net sheet|counter-offer|explaining.*price|comparing.*offers|multiple offer presentation/i.test(p.title),
        },
      ],
    },
    {
      id: "tough-convos",
      label: "Tough Conversations",
      desc: "Commission talks, firing clients, delays, transactions",
      featured: ["ch7-21", "ch7-26", "ch7-15"],
      filter: (p) =>
        p.category === "coach" &&
        /difficult|tough|commission|firing|breakup|delay|unresponsive|back out|restrict|wire fraud|milestone email|closing timeline|thank you.*what's next/i.test(
          p.title
        ),
    },
    {
      id: "roleplay",
      label: "Roleplay & Practice",
      desc: "30 interactive scenarios to rehearse",
      featured: ["ch8-1", "ch8-7", "ch8-13"],
      filter: (p) =>
        p.category === "coach" && p.chapter === 8,
      subgroups: [
        {
          id: "rp-sellers",
          label: "Seller Roleplays",
          desc: "Palace seller, FSBO, expired, divorce, spring",
          filter: (p) => /palace|discount broker|fsbo|expired|spring|divorce|price reduction conversation/i.test(p.title),
        },
        {
          id: "rp-buyers",
          label: "Buyer Roleplays",
          desc: "Scared buyer, lowballer, parent-controlled",
          filter: (p) => /first-time buyer|six-month|lowball|parent|underbuyer|relocat/i.test(p.title),
        },
        {
          id: "rp-objections",
          label: "Common Objections",
          desc: "Commission, Zillow, bad experience, not ready",
          filter: (p) => /commission|friend.*agent|crash|just looking|zillow|redfin|bad experience/i.test(p.title),
        },
        {
          id: "rp-skills",
          label: "Key Skills Practice",
          desc: "Cold calls, referrals, presentations, pitches",
          filter: (p) => /inspection news|bidding war|referral|cold call|presenting|negotiating repair|panicked|why should|networking|coaching.*new agent/i.test(p.title),
        },
      ],
    },
  ],
  strategy: [
    {
      id: "ai-skills",
      label: "AI Skills & Prompt Engineering",
      desc: "Frameworks, techniques, better AI output",
      featured: ["ch1-1", "ch1-2", "ch1-10"],
      filter: (p) =>
        p.category === "strategy" &&
        /prompt|ai |negative prompting|few-shot|chain-of-thought|iterative|formatting|output|swipe file|brand voice|disclosure|implementation roadmap|plain language|complex.*concept/i.test(
          p.title
        ),
    },
    {
      id: "lead-gen",
      label: "Lead Generation Plans",
      desc: "Audits, budgets, social, ads, SEO, prospecting",
      featured: ["ch2-1", "ch2-3", "ch2-5"],
      filter: (p) =>
        p.category === "strategy" && p.chapter === 2,
      subgroups: [
        {
          id: "lg-audit",
          label: "Audit & Planning",
          desc: "Lead source audit, budget, sprint plans, scorecard",
          filter: (p) => /audit|portfolio|sprint|budget|competitive|scorecard|lead scoring/i.test(p.title),
        },
        {
          id: "lg-social",
          label: "Social Media Strategy",
          desc: "Platform ranking, content calendars, DMs, profiles",
          filter: (p) => /social media|instagram|facebook|tiktok|reels|linkedin|platform|dm |profile optimization|social proof/i.test(p.title),
        },
        {
          id: "lg-ads",
          label: "Paid Advertising",
          desc: "Google Ads, Facebook Ads, retargeting, A/B testing",
          filter: (p) => /ad |ads |campaign|retarget|headline.*test|lead form|video ad/i.test(p.title),
        },
        {
          id: "lg-seo",
          label: "SEO & Content",
          desc: "Keywords, Google Business, blog, video, reviews",
          filter: (p) => /seo|keyword|google business|blog|youtube|video.*repurpos|review|content pillar|market update/i.test(p.title),
        },
        {
          id: "lg-magnets",
          label: "Lead Magnets & Landing Pages",
          desc: "Buyer guides, home valuation, landing pages",
          filter: (p) => /lead magnet|landing page|home valuation|buyer guide/i.test(p.title),
        },
        {
          id: "lg-outreach",
          label: "Direct Outreach & Prospecting",
          desc: "Email sequences, FSBO, expired, door-knocking, events",
          filter: (p) => /speed-to-lead|welcome email|market update email|reactivation|database|hidden opportunity|purge|first-time buyer.*playbook|luxury market|investor.*system|fsbo|direct mail|door-knock|community event/i.test(p.title),
        },
      ],
    },
    {
      id: "workflows",
      label: "Daily Workflows & Systems",
      desc: "Routines, CRM, compliance, checklists, team tools",
      featured: ["ch1-11", "ch1-12", "ch1-13"],
      filter: (p) =>
        p.category === "strategy" &&
        /workflow|routine|morning|admin|automat|checklist|crm|task|decision|end-of-day|wrap-up|meeting prep|tech stack|delegation|team|communication hub|review|client meeting|template.*sound|professional response|difficult client|documentation|contract review|crisis|training material|scorecard|open house scorecard|roi tracker|introverts|reverse referral|connector reputation|relationship depth|segmentation.*referral/i.test(
          p.title
        ),
    },
    {
      id: "market-analysis",
      label: "Market Analysis & Data",
      desc: "CMA, neighborhood analysis, market predictions",
      featured: ["ch1-28", "ch1-29", "ch1-30"],
      filter: (p) =>
        p.category === "strategy" &&
        /neighborhood deep|data-driven|cma|market predict|seasonal market|property search|showing prep|competitive offer strategy|market comparison/i.test(
          p.title
        ),
    },
    {
      id: "content-mktg",
      label: "Content & Marketing Strategy",
      desc: "Calendars, brand, SEO, video, education, FAQs",
      featured: ["ch1-36", "ch1-35", "ch1-37"],
      filter: (p) =>
        p.category === "strategy" &&
        /content|calendar|brand|seo|video|repurpos|market update|blog|newsletter|visual explainer|first-time buyer.*email|seller preparation|faq|objection-response|success story/i.test(
          p.title
        ),
    },
  ],
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "#10b981",
  intermediate: "#f59e0b",
  advanced: "#ef4444",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

// Variable examples for richer bracket hints
const VARIABLE_EXAMPLES: Record<string, string> = {
  "YOUR NAME": "e.g., Sarah Johnson",
  "YOUR BROKERAGE": "e.g., Keller Williams Realty",
  "CLIENT NAME": "e.g., John & Maria Chen",
  "PROPERTY ADDRESS": "e.g., 742 Evergreen Terrace, Springfield",
  "NEIGHBORHOOD": "e.g., Lincoln Park",
  "CITY": "e.g., Chicago, IL",
  "PRICE": "e.g., $425,000",
  "ASKING PRICE": "e.g., $525,000",
  "LIST PRICE": "e.g., $399,900",
  "BEDROOMS": "e.g., 3",
  "BATHROOMS": "e.g., 2",
  "SQUARE FOOTAGE": "e.g., 1,850 sq ft",
  "PROPERTY TYPE": "e.g., single-family home, condo, townhome",
  "BUYER NAME": "e.g., David & Lisa Park",
  "SELLER NAME": "e.g., The Hendersons",
  "AGENT NAME": "e.g., Mike Torres",
  "THEIR NAME": "e.g., Jessica Adams",
  "YOUR PHONE": "e.g., (312) 555-0192",
  "YOUR EMAIL": "e.g., sarah@kwrealty.com",
  "YOUR MARKET/AREA": "e.g., North Shore suburbs",
  "THEIR OBJECTION": "e.g., We want to wait for rates to drop",
  "DATE": "e.g., March 15, 2026",
  "TIMEFRAME": "e.g., 60 days, 6 months",
  "NUMBER OF YEARS": "e.g., 8 years",
};

// --- Helpers ---
function pushEvent(event: string, data?: Record<string, string>) {
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    (window as any).dataLayer.push({ event, ...data });
  }
}

function highlightBrackets(text: string): string {
  return text.replace(/\[([^\]]+)\]/g, (match, inner) => {
    const upperInner = inner.toUpperCase().trim();
    const example = VARIABLE_EXAMPLES[upperInner];
    if (example) {
      return `<mark>[${inner} - ${example}]</mark>`;
    }
    return `<mark>${match}</mark>`;
  });
}

function getSubcategoryResults(sub: Subcategory, subgroupId?: string): Prompt[] {
  let matching = prompts.filter(sub.filter);

  // If a subgroup is selected, further filter
  if (subgroupId && sub.subgroups) {
    const subgroup = sub.subgroups.find((sg) => sg.id === subgroupId);
    if (subgroup) {
      matching = matching.filter(subgroup.filter);
    }
  }

  const featured = sub.featured || [];
  const featuredPrompts = featured
    .map((id) => matching.find((p) => p.id === id))
    .filter(Boolean) as Prompt[];

  const rest = matching.filter((p) => !featured.includes(p.id));

  return [...featuredPrompts, ...rest];
}

function getRelatedPrompts(prompt: Prompt, count: number = 3): Prompt[] {
  const words = prompt.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const scored = prompts
    .filter((p) => p.id !== prompt.id)
    .map((p) => {
      let score = 0;
      if (p.category === prompt.category) score += 5;
      if (p.difficulty === prompt.difficulty) score += 1;
      for (const w of words) {
        if (p.title.toLowerCase().includes(w)) score += 3;
        if (p.bestFor.toLowerCase().includes(w)) score += 1;
      }
      return { prompt: p, score };
    });

  return scored
    .filter((s) => s.score > 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((s) => s.prompt);
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

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill={filled ? "#ef4444" : "none"}
      stroke={filled ? "#ef4444" : "#64748b"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function OnboardingBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="fade-in"
      style={{
        background: "rgba(56,189,248,0.08)",
        border: "1px solid rgba(56,189,248,0.2)",
        borderRadius: 14,
        padding: "16px 20px",
        marginBottom: 20,
        position: "relative",
      }}
    >
      <button
        onClick={onDismiss}
        style={{
          position: "absolute",
          top: 10,
          right: 12,
          background: "none",
          border: "none",
          color: "#64748b",
          cursor: "pointer",
          fontSize: 16,
          padding: 4,
          lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        x
      </button>
      <p
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#38bdf8",
          marginBottom: 10,
        }}
      >
        How it works
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {[
          { num: "1", text: "Select category" },
          { num: "2", text: "Copy prompt" },
          { num: "3", text: "Paste into AI" },
          { num: "4", text: "Get more biz!" },
        ].map((step) => (
          <div
            key={step.num}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "#cbd5e1",
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "rgba(56,189,248,0.15)",
                color: "#38bdf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {step.num}
            </span>
            {step.text}
            {step.num !== "4" && (
              <span style={{ color: "#334155", marginLeft: 2 }}>&rarr;</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DifficultyLegend() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        justifyContent: "center",
        marginBottom: 6,
        marginTop: -8,
      }}
    >
      {(["beginner", "intermediate", "advanced"] as const).map((d) => (
        <div
          key={d}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            color: "#64748b",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: DIFFICULTY_COLORS[d],
            }}
          />
          {DIFFICULTY_LABELS[d]}
        </div>
      ))}
    </div>
  );
}

const BEFORE_AFTERS = [
  {
    before: "Hi, just checking in to see if you\u2019re still interested in buying a home. Let me know if you have any questions!",
    after: "Sarah, last time we chatted you were debating between Lincoln Park and Lakeview - did that new coffee shop on Armitage tip the scales? I just listed a 2BR that checks every box you mentioned. Worth a peek?",
  },
  {
    before: "Beautiful 3BR/2BA home for sale. Great location, move-in ready. Call for details!",
    after: "Wake up to morning light flooding your chef\u2019s kitchen while the kids walk two blocks to Lincoln Elementary. This 3BR/2BA on tree-lined Maple Ave was renovated in 2024 with quartz counters, white oak floors, and a backyard built for summer BBQs. Open house Saturday 1-3.",
  },
  {
    before: "Thanks for coming to the open house today! Let me know if you have any questions about the property.",
    after: "Great meeting you today, Mike! You mentioned wanting a bigger backyard for your golden retriever - this home\u2019s half-acre lot is fully fenced. I pulled two more listings nearby with similar yards. Want me to send them over?",
  },
  {
    before: "Just wanted to follow up from our showing last week. Are you still interested?",
    after: "Hey David - that Craftsman on Elm we toured last Thursday just had a price drop of $15K. You mentioned it was your favorite layout but the price felt high. Want to take another look before the weekend rush?",
  },
  {
    before: "I hope you\u2019re enjoying your new home! Let me know if you ever need anything.",
    after: "Happy 1-year homeiversary, Jen! Your neighborhood just saw a 6% increase in values since you bought - great timing. I put together a quick equity snapshot for you. Also, my painter just finished a job on your street and has openings - want his number?",
  },
  {
    before: "I\u2019m a local real estate agent. If you or anyone you know is looking to buy or sell, please keep me in mind!",
    after: "I helped 3 families on your street find their homes last year. Your neighbor on Maple just got $40K over asking using my pre-listing renovation strategy. I\u2019d love to share what I\u2019m seeing in your micro-market - coffee on me?",
  },
  {
    before: "The inspection report came back with some issues. Let\u2019s discuss.",
    after: "Great news - the inspection found mostly cosmetic items. The two things worth discussing: the water heater is 12 years old (avg lifespan is 10-15) and there\u2019s minor grading near the foundation. I\u2019ve already gotten repair estimates for both. Here\u2019s my recommendation for the repair request\u2026",
  },
  {
    before: "Your home has been on the market for 30 days. We should talk about a price reduction.",
    after: "Here\u2019s your 30-day market report: 847 views online, 12 showings, 3 second showings, 0 offers. The feedback trend is clear - buyers love the kitchen but feel the price is $20-25K above comparable sales. A strategic adjustment to $475K would put us in the sweet spot. Here\u2019s why\u2026",
  },
  {
    before: "Do you have any referrals for me? I\u2019d really appreciate it!",
    after: "Lisa, remember when you told me your coworker was thinking about downsizing? I just listed a low-maintenance condo that might be perfect for her situation. Would it be weird if I reached out, or would you rather make the intro?",
  },
  {
    before: "I\u2019m reaching out to see if you\u2019re interested in selling your home.",
    after: "Your home on Oak Street is one of 3 mid-century ranches in the neighborhood - and the other two sold for $50K more than expected this spring. I ran a quick analysis on yours. Even with zero updates, you\u2019re sitting on significant equity. Curious what the number looks like?",
  },
  {
    before: "Here\u2019s a new listing I thought you might like. 4BR, 3BA, $550K.",
    after: "Remember your wish list? Big kitchen, walkable to school, under $575K. This one just hit the market 20 minutes ago: 4BR/3BA with a 15-foot island, 3 blocks from Roosevelt Elementary, listed at $550K. The seller is motivated and accepting showings starting tomorrow. Want the first slot?",
  },
  {
    before: "I know you said you\u2019re not ready to buy yet, but the market is really good right now.",
    after: "No rush at all, Maria - but I wanted to flag something. Rates just dipped to 6.2% this week, which drops your monthly payment by $180 vs. last month. At your price range, that\u2019s $65K more buying power. I set up a saved search so you\u2019ll see anything that hits before the weekend crowd.",
  },
  {
    before: "We got multiple offers on your listing. Let\u2019s talk.",
    after: "Exciting news - 5 offers came in, ranging from $485K to $520K. I\u2019ve built a side-by-side comparison covering price, contingencies, closing timeline, financing strength, and escalation clauses. Two stand out for different reasons. Let\u2019s hop on a call at 4pm to walk through your options.",
  },
  {
    before: "Happy holidays from your favorite Realtor! Hope you have a great year!",
    after: "Tom, I know you mentioned wanting to build a deck last spring - my contractor just finished one similar to what you described and has a winter discount. Also, your neighborhood appreciation is up 8% this year. I\u2019ll drop off your annual home equity report next week - the numbers will make you smile.",
  },
  {
    before: "Check out my new listing! Great home in a great neighborhood!",
    after: "POV: You\u2019re sipping coffee on this wraparound porch while your kids ride bikes on the quietest cul-de-sac in Westfield. 4 beds, a home office with built-ins, and a backyard with a firepit that\u2019s hosted 100+ neighborhood s\u2019mores nights. Open house Sunday 12-2. Link in bio.",
  },
  {
    before: "I\u2019d love to help you sell your home. I have a lot of experience in the area.",
    after: "In the last 12 months, I\u2019ve sold 8 homes within a mile of yours - averaging 4.2% over asking and 11 days on market. My pre-listing prep process (staging, photography, pricing strategy) is why my sellers net $23K more on average. Want me to walk you through exactly what I\u2019d do for your home?",
  },
  {
    before: "Sorry to hear the appraisal came in low. Let\u2019s figure out what to do.",
    after: "The appraisal came in at $465K vs. our $485K contract price. Before we panic: I\u2019ve already pulled 3 comparable sales the appraiser missed and drafted a rebuttal with supporting data. Option A: challenge the appraisal. Option B: split the difference. Option C: renegotiate. Here\u2019s my recommendation\u2026",
  },
  {
    before: "I haven\u2019t heard from you in a while. Are you still looking to buy?",
    after: "Hey Chris - I just drove past that Tudor on Park Ave you were obsessed with 6 months ago. Still there, and they just dropped the price 12%. Totally understand if your plans changed, but if the timing is better now, I can get us in this weekend before it gets picked up.",
  },
  {
    before: "Just listed! Contact me for more information about this property.",
    after: "JUST LISTED: The kitchen that made 3 contractors say \u201Cwhoever did this knew what they were doing.\u201D This 1920s brick colonial got a top-to-bottom renovation with original details preserved - crown molding, hardwood, arched doorways - plus a chef\u2019s kitchen with La Cornue range. First showing block is Friday.",
  },
  {
    before: "I\u2019m a new agent but I\u2019m really passionate about real estate!",
    after: "I may be newer to real estate, but here\u2019s what I bring: I respond to every inquiry within 5 minutes, I\u2019ve completed 60+ hours of negotiation training, and I\u2019m backed by a team that\u2019s closed 200+ transactions. My clients get senior-level strategy with someone who will outwork everyone. Let me prove it.",
  },
];

function BeforeAfterExample() {
  const [example, setExample] = useState(BEFORE_AFTERS[0]);

  useEffect(() => {
    setExample(BEFORE_AFTERS[Math.floor(Math.random() * BEFORE_AFTERS.length)]);
  }, []);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14,
        padding: "20px",
        marginBottom: 32,
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 14,
          textAlign: "center",
        }}
      >
        See it in action
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#ef4444",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 6,
            }}
          >
            Without AI
          </p>
          <div
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.12)",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 13,
              color: "#94a3b8",
              lineHeight: 1.5,
              fontStyle: "italic",
            }}
          >
            &ldquo;{example.before}&rdquo;
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <svg
            width={16}
            height={16}
            viewBox="0 0 16 16"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="8" y1="3" x2="8" y2="13" />
            <polyline points="4 9 8 13 12 9" />
          </svg>
        </div>
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#10b981",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 6,
            }}
          >
            With AI Prompt Vault
          </p>
          <div
            style={{
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.12)",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 13,
              color: "#cbd5e1",
              lineHeight: 1.5,
              fontStyle: "italic",
            }}
          >
            &ldquo;{example.after}&rdquo;
          </div>
        </div>
      </div>
    </div>
  );
}

function SubgroupPicker({
  subcategory,
  parentFilter,
  onSelect,
}: {
  subcategory: Subcategory;
  parentFilter: (p: Prompt) => boolean;
  onSelect: (subgroupId: string) => void;
}) {
  const subgroups = subcategory.subgroups || [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingBottom: 48,
      }}
    >
      {subgroups.map((sg) => {
        const parentMatches = prompts.filter(parentFilter);
        const count = parentMatches.filter(sg.filter).length;
        return (
          <button
            key={sg.id}
            onClick={() => onSelect(sg.id)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "18px 20px",
              cursor: "pointer",
              textAlign: "left",
              color: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
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
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#f1f5f9",
                  marginBottom: 3,
                }}
              >
                {sg.label}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#94a3b8",
                  lineHeight: 1.4,
                }}
              >
                {sg.desc}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 13, color: "#64748b" }}>{count}</span>
              <svg
                width={16}
                height={16}
                viewBox="0 0 16 16"
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polyline points="6 4 10 8 6 12" />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PromptCard({
  prompt,
  isExpanded,
  onToggle,
  onCopy,
  isFavorited,
  onToggleFavorite,
  onNavigateToPrompt,
}: {
  prompt: Prompt;
  isExpanded: boolean;
  onToggle: () => void;
  onCopy: (prompt: Prompt) => void;
  isFavorited: boolean;
  onToggleFavorite: (promptId: string) => void;
  onNavigateToPrompt: (prompt: Prompt) => void;
}) {
  const [showFull, setShowFull] = useState(false);
  const displayText =
    !showFull && prompt.quickStart ? prompt.quickStart : prompt.prompt;

  const relatedPrompts = useMemo(
    () => (isExpanded ? getRelatedPrompts(prompt) : []),
    [isExpanded, prompt]
  );

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
          }}
        >
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
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

        {prompt.bestFor && (
          <p
            style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.4 }}
          >
            {prompt.bestFor.replace(/\*\*/g, "")}
          </p>
        )}

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

      {isExpanded && (
        <div className="slide-up" style={{ padding: "0 24px 24px" }}>
          {/* Favorite button */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button
              onClick={() => onToggleFavorite(prompt.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: isFavorited ? "#ef4444" : "#64748b",
                fontSize: 12,
              }}
            >
              <HeartIcon filled={isFavorited} />
              {isFavorited ? "Saved" : "Save"}
            </button>
          </div>

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
            dangerouslySetInnerHTML={{
              __html: highlightBrackets(displayText),
            }}
          />

          {/* Pill-style toggle for quick-start / full version */}
          {prompt.quickStart && (
            <div
              style={{
                display: "flex",
                marginTop: 12,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 8,
                padding: 3,
                border: "1px solid rgba(255,255,255,0.06)",
                width: "fit-content",
              }}
            >
              <button
                onClick={() => setShowFull(false)}
                style={{
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  background: !showFull
                    ? "rgba(56,189,248,0.15)"
                    : "transparent",
                  color: !showFull ? "#38bdf8" : "#64748b",
                  transition: "all 0.2s",
                }}
              >
                Quick-start
              </button>
              <button
                onClick={() => setShowFull(true)}
                style={{
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  background: showFull
                    ? "rgba(56,189,248,0.15)"
                    : "transparent",
                  color: showFull ? "#38bdf8" : "#64748b",
                  transition: "all 0.2s",
                }}
              >
                Full version
              </button>
            </div>
          )}

          {prompt.whatYouGet && (
            <p
              style={{
                fontSize: 13,
                color: "#94a3b8",
                marginTop: 12,
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: "#cbd5e1" }}>What you&apos;ll get:</strong>{" "}
              {prompt.whatYouGet}
            </p>
          )}

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Primary: Run in Claude (or last-used tool) */}
            <OpenInAI
              promptText={prompt.quickStart || prompt.prompt}
              promptId={prompt.id}
              label={prompt.isInteractive ? "Copy & Run in Claude" : "Run in Claude"}
            />
            {/* Secondary: plain copy, for users who already have a tool open */}
            <button
              onClick={() => onCopy(prompt)}
              style={{
                padding: "10px 16px",
                background: "rgba(255,255,255,0.04)",
                color: "#94a3b8",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Just copy (don&apos;t open app)
            </button>
          </div>

          {/* Related prompts */}
          {relatedPrompts.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 8,
                }}
              >
                Related prompts
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {relatedPrompts.map((rp) => (
                  <button
                    key={rp.id}
                    onClick={() => onNavigateToPrompt(rp)}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      cursor: "pointer",
                      textAlign: "left",
                      color: "#cbd5e1",
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "border-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "rgba(56,189,248,0.2)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")
                    }
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: DIFFICULTY_COLORS[rp.difficulty],
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ flex: 1 }}>{rp.title}</span>
                    <svg
                      width={14}
                      height={14}
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="#475569"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <polyline points="6 4 10 8 6 12" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
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
      // Non-blocking
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
          We&apos;ll send you a personalized starter pack.
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "#94a3b8",
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          Enter your email and we&apos;ll send your top 5 prompts based on your
          experience level. All {prompts.length} prompts open up instantly.
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
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="you@email.com"
          autoFocus
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
          {loading ? "Opening..." : "Get All Prompts"}
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

// --- Breadcrumb Back Button ---
function BackButton({ onClick, label }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
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
      <svg
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <polyline points="10 12 6 8 10 4" />
      </svg>
      {label || "Back"}
    </button>
  );
}

// --- Main Page ---
export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [activeSubgroup, setActiveSubgroup] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pendingCopyPrompt, setPendingCopyPrompt] = useState<Prompt | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesSection, setShowFavoritesSection] = useState(false);
  const [freeCopiesUsed, setFreeCopiesUsed] = useState(0);
  const [feedbackPromptId, setFeedbackPromptId] = useState<string | null>(null);

  useEffect(() => {
    const unlocked = localStorage.getItem("prompt_vault_unlocked");
    if (unlocked === "true") setIsUnlocked(true);

    const recent = localStorage.getItem("prompt_vault_recent");
    if (recent) {
      try {
        setRecentlyUsed(JSON.parse(recent));
      } catch {}
    }

    const onboardingDismissed = localStorage.getItem("prompt_vault_onboarding_dismissed");
    if (!onboardingDismissed) setShowOnboarding(true);

    const savedFavorites = localStorage.getItem("prompt_vault_favorites");
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch {}
    }

    const freeCount = localStorage.getItem("prompt_vault_free_copies");
    if (freeCount) {
      const n = parseInt(freeCount, 10);
      if (!isNaN(n)) setFreeCopiesUsed(n);
    }

    // Handle URL routing
    handleUrlRoute();
    window.addEventListener("popstate", handleUrlRoute);
    return () => window.removeEventListener("popstate", handleUrlRoute);
  }, []);

  const handleUrlRoute = useCallback(() => {
    const path = window.location.pathname;
    if (path === "/" || path === "") return;

    // Handle /prompt/ch3-2 style URLs
    const promptMatch = path.match(/^\/prompt\/(.+)$/);
    if (promptMatch) {
      const promptId = promptMatch[1];
      const found = prompts.find((p) => p.id === promptId);
      if (found) {
        setActiveCategory(found.category);
        const subs = SUBCATEGORIES[found.category] || [];
        const matchingSub = subs.find((s) => s.filter(found));
        if (matchingSub) {
          setActiveSubcategory(matchingSub.id);
          // If subgroups exist, find matching subgroup
          if (matchingSub.subgroups) {
            const matchingSubgroup = matchingSub.subgroups.find((sg) => sg.filter(found));
            if (matchingSubgroup) setActiveSubgroup(matchingSubgroup.id);
          }
        }
        setExpandedId(found.id);
        return;
      }
    }

    // Handle /category/subcategory/subgroup style URLs
    const catSubSubMatch = path.match(/^\/([^/]+)\/([^/]+)\/([^/]+)$/);
    if (catSubSubMatch) {
      const [, cat, sub, subgroup] = catSubSubMatch;
      if (SUBCATEGORIES[cat]) {
        const subObj = SUBCATEGORIES[cat].find((s) => s.id === sub);
        if (subObj?.subgroups?.find((sg) => sg.id === subgroup)) {
          setActiveCategory(cat);
          setActiveSubcategory(sub);
          setActiveSubgroup(subgroup);
          return;
        }
      }
    }

    // Handle /category/subcategory style URLs
    const catSubMatch = path.match(/^\/([^/]+)\/([^/]+)$/);
    if (catSubMatch) {
      const [, cat, sub] = catSubMatch;
      if (SUBCATEGORIES[cat]) {
        const subObj = SUBCATEGORIES[cat].find((s) => s.id === sub);
        if (subObj) {
          setActiveCategory(cat);
          setActiveSubcategory(sub);
          return;
        }
      }
    }

    // Handle /category style URLs
    const catMatch = path.match(/^\/([^/]+)$/);
    if (catMatch) {
      const cat = catMatch[1];
      if (SUBCATEGORIES[cat]) {
        setActiveCategory(cat);
        setActiveSubcategory(null);
      }
    }
  }, []);

  // Update URL when navigating
  const updateUrl = useCallback((path: string) => {
    window.history.pushState(null, "", path);
  }, []);

  // Subcategory results
  const subcategoryResults = useMemo(() => {
    if (!activeCategory || !activeSubcategory) return [];
    const subs = SUBCATEGORIES[activeCategory];
    const sub = subs?.find((s) => s.id === activeSubcategory);
    if (!sub) return [];
    return getSubcategoryResults(sub, activeSubgroup || undefined);
  }, [activeCategory, activeSubcategory, activeSubgroup]);

  // Recently used prompts
  const recentPrompts = useMemo(() => {
    return recentlyUsed
      .map((id) => prompts.find((p) => p.id === id))
      .filter(Boolean) as Prompt[];
  }, [recentlyUsed]);

  // Favorite prompts
  const favoritePrompts = useMemo(() => {
    return favorites
      .map((id) => prompts.find((p) => p.id === id))
      .filter(Boolean) as Prompt[];
  }, [favorites]);

  const handleQuickPick = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    setActiveSubcategory(null);
    setActiveSubgroup(null);
    setExpandedId(null);
    pushEvent("search", { search_query: `quick_pick:${categoryId}` });
    updateUrl(`/${categoryId}`);
  }, [updateUrl]);

  const handleSubcategory = useCallback(
    (subId: string) => {
      setActiveSubcategory(subId);
      setActiveSubgroup(null);
      setExpandedId(null);
      pushEvent("search", {
        search_query: `subcategory:${activeCategory}:${subId}`,
      });
      updateUrl(`/${activeCategory}/${subId}`);
    },
    [activeCategory, updateUrl]
  );

  const handleSubgroup = useCallback(
    (subgroupId: string) => {
      setActiveSubgroup(subgroupId);
      setExpandedId(null);
      pushEvent("search", {
        search_query: `subgroup:${activeCategory}:${activeSubcategory}:${subgroupId}`,
      });
      updateUrl(`/${activeCategory}/${activeSubcategory}/${subgroupId}`);
    },
    [activeCategory, activeSubcategory, updateUrl]
  );

  const handleBack = useCallback(() => {
    if (activeSubgroup) {
      setActiveSubgroup(null);
      setExpandedId(null);
      updateUrl(`/${activeCategory}/${activeSubcategory}`);
    } else if (activeSubcategory) {
      setActiveSubcategory(null);
      setActiveSubgroup(null);
      setExpandedId(null);
      updateUrl(`/${activeCategory}`);
    } else {
      setActiveCategory(null);
      setExpandedId(null);
      updateUrl("/");
    }
  }, [activeSubgroup, activeSubcategory, activeCategory, updateUrl]);

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
        // Progressive gate: allow FREE_COPY_LIMIT copies before the email wall
        if (freeCopiesUsed < FREE_COPY_LIMIT) {
          const next = freeCopiesUsed + 1;
          setFreeCopiesUsed(next);
          localStorage.setItem("prompt_vault_free_copies", String(next));
          pushEvent("prompt_copy_free", {
            prompt_id: prompt.id,
            free_copy_number: String(next),
          });
          executeCopy(prompt);
          return;
        }
        setPendingCopyPrompt(prompt);
        setShowEmailModal(true);
        return;
      }
      executeCopy(prompt);
    },
    [isUnlocked, freeCopiesUsed]
  );

  const executeCopy = useCallback((prompt: Prompt) => {
    const textToCopy = prompt.quickStart || prompt.prompt;
    navigator.clipboard.writeText(textToCopy);

    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2000);

    // Show feedback widget after the "copied!" toast fades
    setTimeout(() => setFeedbackPromptId(prompt.id), 2200);

    pushEvent("prompt_copy", {
      prompt_id: prompt.id,
      prompt_category: prompt.category,
    });

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

  const handleDismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem("prompt_vault_onboarding_dismissed", "true");
  }, []);

  const handleToggleFavorite = useCallback((promptId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(promptId)
        ? prev.filter((id) => id !== promptId)
        : [promptId, ...prev];
      localStorage.setItem("prompt_vault_favorites", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleNavigateToPrompt = useCallback((prompt: Prompt) => {
    setActiveCategory(prompt.category);
    const subs = SUBCATEGORIES[prompt.category] || [];
    const matchingSub = subs.find((s) => s.filter(prompt));
    if (matchingSub) {
      setActiveSubcategory(matchingSub.id);
      if (matchingSub.subgroups) {
        const matchingSubgroup = matchingSub.subgroups.find((sg) => sg.filter(prompt));
        if (matchingSubgroup) setActiveSubgroup(matchingSubgroup.id);
      }
    }
    setExpandedId(prompt.id);
    updateUrl(`/prompt/${prompt.id}`);
  }, [updateUrl]);

  // Determine what view to show
  const isHome = !activeCategory;
  const isPickingSubcategory = activeCategory && !activeSubcategory;

  const currentQuickPick = QUICK_PICKS.find((q) => q.id === activeCategory);
  const currentSubcategories = activeCategory
    ? SUBCATEGORIES[activeCategory] || []
    : [];
  const currentSubcategory = currentSubcategories.find(
    (s) => s.id === activeSubcategory
  );

  // Determine if we need to show subgroup picker
  const needsSubgroupPicker = currentSubcategory?.subgroups && !activeSubgroup;
  const isViewingPrompts = activeCategory && activeSubcategory && !needsSubgroupPicker;
  const currentSubgroup = currentSubcategory?.subgroups?.find(
    (sg) => sg.id === activeSubgroup
  );

  return (
    <div style={{ minHeight: "100vh", padding: "0 16px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Hero */}
        <section
          style={{ paddingTop: 48, paddingBottom: 8, textAlign: "center" }}
        >
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
            Your AI Cheat Sheet
            <br />
            <span style={{ color: "#38bdf8" }}>
              for Real Estate Agents
            </span>
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#94a3b8",
              lineHeight: 1.5,
              marginBottom: 32,
            }}
          >
            {prompts.length} copy-paste prompts. Emails, listings,
            follow-ups, scripts. Stop staring at the blank screen.
          </p>
        </section>

        {/* Global search - always visible */}
        <GlobalSearch prompts={prompts} onNavigateToPrompt={handleNavigateToPrompt} />

        {/* HOME: Social proof + Onboarding + Quick Picks + Top This Week + Before/After */}
        {isHome && (
          <section className="fade-in">
            {/* Social Proof */}
            <SocialProofStrip />

            {/* Onboarding Banner */}
            {showOnboarding && (
              <OnboardingBanner onDismiss={handleDismissOnboarding} />
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 20,
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
                    e.currentTarget.style.borderColor =
                      "rgba(56,189,248,0.3)";
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.08)";
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.04)";
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
                  <div
                    style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}
                  >
                    {qp.desc}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#38bdf8",
                      marginTop: 6,
                      fontWeight: 500,
                    }}
                  >
                    {prompts.filter((p) => p.category === qp.id).length} prompts
                  </div>
                </button>
              ))}
            </div>

            {/* Stacks entry point */}
            <StacksEntryCard />

            {/* Top 10 This Week */}
            <TopThisWeek prompts={prompts} onNavigateToPrompt={handleNavigateToPrompt} />

            {/* Difficulty Legend */}
            <DifficultyLegend />

            {/* Before/After Example */}
            <div style={{ marginTop: 20 }}>
              <BeforeAfterExample />
            </div>

            {/* Favorites */}
            {favoritePrompts.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <button
                  onClick={() => setShowFavoritesSection(!showFavoritesSection)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    marginBottom: 12,
                    width: "100%",
                  }}
                >
                  <h2
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: 0,
                    }}
                  >
                    Saved Prompts ({favoritePrompts.length})
                  </h2>
                  <svg
                    width={14}
                    height={14}
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{
                      transform: showFavoritesSection ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  >
                    <polyline points="4 6 8 10 12 6" />
                  </svg>
                </button>
                {showFavoritesSection && (
                  <div
                    className="fade-in"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {favoritePrompts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleNavigateToPrompt(p)}
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
                        <HeartIcon filled={true} />
                        <span style={{ flex: 1 }}>{p.title}</span>
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: DIFFICULTY_COLORS[p.difficulty],
                            flexShrink: 0,
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {recentPrompts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleNavigateToPrompt(p)}
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

        {/* SUBCATEGORY PICKER */}
        {isPickingSubcategory && (
          <section className="fade-in">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <BackButton onClick={handleBack} />
              <span style={{ fontSize: 14, color: "#94a3b8" }}>
                {currentQuickPick?.label}
              </span>
            </div>

            <h2
              className={spaceGrotesk.className}
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#f1f5f9",
                marginBottom: 16,
              }}
            >
              What specifically?
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                paddingBottom: 48,
              }}
            >
              {currentSubcategories.map((sub) => {
                const count = prompts.filter(sub.filter).length;
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSubcategory(sub.id)}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 14,
                      padding: "18px 20px",
                      cursor: "pointer",
                      textAlign: "left",
                      color: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "border-color 0.2s, background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(56,189,248,0.3)";
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.08)";
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.04)";
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "#f1f5f9",
                          marginBottom: 3,
                        }}
                      >
                        {sub.label}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#94a3b8",
                          lineHeight: 1.4,
                        }}
                      >
                        {sub.desc}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                        }}
                      >
                        {count}
                      </span>
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <polyline points="6 4 10 8 6 12" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* SUBGROUP PICKER (third level) */}
        {needsSubgroupPicker && currentSubcategory && (
          <section className="fade-in">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              <BackButton onClick={handleBack} />
              <span style={{ fontSize: 13, color: "#475569" }}>/</span>
              <span style={{ fontSize: 14, color: "#64748b" }}>
                {currentQuickPick?.label}
              </span>
              <span style={{ fontSize: 13, color: "#475569" }}>/</span>
              <span style={{ fontSize: 14, color: "#94a3b8" }}>
                {currentSubcategory.label}
              </span>
            </div>

            <h2
              className={spaceGrotesk.className}
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#f1f5f9",
                marginBottom: 16,
              }}
            >
              Narrow it down
            </h2>

            <SubgroupPicker
              subcategory={currentSubcategory}
              parentFilter={currentSubcategory.filter}
              onSelect={handleSubgroup}
            />
          </section>
        )}

        {/* PROMPT LIST */}
        {isViewingPrompts && (
          <section className="fade-in">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              <BackButton onClick={handleBack} />
              <span style={{ fontSize: 13, color: "#475569" }}>/</span>
              <span style={{ fontSize: 14, color: "#64748b" }}>
                {currentQuickPick?.label}
              </span>
              <span style={{ fontSize: 13, color: "#475569" }}>/</span>
              <span style={{ fontSize: 14, color: currentSubgroup ? "#64748b" : "#94a3b8" }}>
                {currentSubcategory?.label}
              </span>
              {currentSubgroup && (
                <>
                  <span style={{ fontSize: 13, color: "#475569" }}>/</span>
                  <span style={{ fontSize: 14, color: "#94a3b8" }}>
                    {currentSubgroup.label}
                  </span>
                </>
              )}
              <span style={{ fontSize: 13, color: "#475569", marginLeft: "auto" }}>
                {subcategoryResults.length} prompt
                {subcategoryResults.length !== 1 ? "s" : ""}
              </span>
            </div>

            <DifficultyLegend />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                paddingBottom: 48,
                marginTop: 8,
              }}
            >
              {subcategoryResults.map((p) => (
                <PromptCard
                  key={p.id}
                  prompt={p}
                  isExpanded={expandedId === p.id}
                  onToggle={() => handleToggle(p.id)}
                  onCopy={handleCopy}
                  isFavorited={favorites.includes(p.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onNavigateToPrompt={handleNavigateToPrompt}
                />
              ))}
            </div>
          </section>
        )}

        {/* Credibility Footer */}
        <footer
          style={{
            padding: "32px 0",
            textAlign: "center",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "#64748b",
              marginBottom: 6,
              fontWeight: 500,
            }}
          >
            Built by agents, for agents
          </p>
          <p style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>
            {prompts.length} prompts used by 2,000+ real estate professionals
          </p>
          <p style={{ fontSize: 12, color: "#475569" }}>
            &copy; 2026 DJP3 Consulting Inc.
          </p>
        </footer>
      </div>

      {showEmailModal && (
        <EmailModal
          onSubmit={handleEmailSubmit}
          onClose={() => {
            setShowEmailModal(false);
            setPendingCopyPrompt(null);
          }}
        />
      )}

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

      {/* Feedback widget - appears after a copy event */}
      <FeedbackWidget
        promptId={feedbackPromptId}
        onClose={() => setFeedbackPromptId(null)}
      />

      {/* Strategy call sticky footer (persistent; dismissible) */}
      <StrategyCallFooter />
    </div>
  );
}
