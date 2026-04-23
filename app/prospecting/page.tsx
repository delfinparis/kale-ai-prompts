"use client";

import { spaceGrotesk } from "../fonts";
import Link from "next/link";
import { useState } from "react";
import OpenInAI from "../components/OpenInAI";

const HEROES = [
  {
    number: "1",
    title: "The Pre-Listing Intelligence Dossier",
    tagline: "Walk in like you've known the seller for a year.",
    bestFor: "Every agent with a listing appointment on the calendar.",
    timeToRun: "~90 seconds",
    query: `ROLE:
You are a senior real estate strategist briefing a top listing agent 15 minutes before a listing appointment. You are not a marketer. You are a researcher with access to public records, news, and social media.

CONTEXT:
I have a listing appointment tomorrow at [FULL ADDRESS] with a homeowner named [FULL NAME]. I have no other information about them. I need a briefing so thorough that when I walk in, the seller feels like I've known them for a year.

TASK:
Using deep web research, build a one-page pre-listing dossier on this homeowner and this property. Pull from:
- County assessor and recorder public records (purchase date, price, tax history, loan, any liens, prior sales)
- Building permits filed on the address in the last 10 years
- LinkedIn, company websites, any press, podcast appearances, charitable involvement, board memberships
- Local news mentions of the name or the household
- Social media public posts (any platform) in the last 12 months
- Publicly listed family details: spouse, kids' approximate ages, schools (only if publicly stated)
- Neighborhood-specific market data for the last 90 days

CONSTRAINTS:
- Use only publicly available sources. No scraping, no paid databases.
- Clearly flag every piece of information as either VERIFIED (with source link) or INFERRED (with reasoning).
- Do not fabricate any fact. If you cannot find something, say "not found" - do not invent.
- Keep the final dossier to one page.

RULES FOR THE DOSSIER:
1. Lead with the single most important insight about this seller's likely motivation.
2. Pricing psychology: based on public records, what anchor price is this seller mentally attached to?
3. Top 3 likely objections ranked by probability, with a one-sentence pre-handled response for each.
4. Two rapport-building hooks that are not real estate.
5. One non-obvious insight about this specific micro-market.
6. One question I should ask in the first 10 minutes that will reveal the real timeline.

EXPECTED OUTPUT:
A one-page brief with: HEADLINE INSIGHT, SELLER SNAPSHOT (VERIFIED/INFERRED tags), PROPERTY & MARKET, PRICING ANCHOR, TOP 3 OBJECTIONS + PRE-HANDLES (table), 2 RAPPORT HOOKS, THE ONE QUESTION (bolded), SOURCES.`,
  },
  {
    number: "2",
    title: "The Database Triage",
    tagline: "Who do I call Monday at 9am?",
    bestFor: "Any agent with a CRM export.",
    timeToRun: "~4 minutes",
    query: `ROLE:
You are a top-producing real estate coach who specializes in database reactivation. You have seen thousands of agent CRMs. Your job is to tell an agent which 10 people to call this week - and why - based entirely on their database.

CONTEXT:
Today's date is [INSERT TODAY'S DATE]. Attached is my CRM export as a CSV. Columns: name, phone, email, last_contact_date, source, tags, freeform_notes, city, year_purchased, purchase_price, estimated_current_value, birthday, life_event_notes.

TASK:
Score every contact 1-100 on probability of transacting in the next 6 months. Return the top 10 as a prioritized call list.

SCORING WEIGHTS:
1. Years in home: 5-9 years = peak sell probability. Weight: 25%.
2. Equity position: >40% equity = high. Weight: 20%.
3. Life-event signals in notes: baby, divorce, marriage, promotion, retire, empty nest, relocation, new job, illness, inheritance, aging parent. Also detect implied signals: space complaints ("too small"), commute complaints, investment intent. Weight: 25%.
4. Recency decay: not touched in 120+ days = penalty, unless life-event overrides. Weight: 10%.
5. Past referral behavior: referrers get a multiplier. Weight: 10%.
6. Freeform notes richness: rich personal notes = easier conversation. Weight: 10%.

CONSTRAINTS:
- Do not invent life events not in the notes.
- If a contact has no notes, not eligible for top 10.
- Penalize anyone flagged DNC.

OUTPUT RULES:
For each top 10: Rank | Name | Score /100 | Strongest Signal | Quoted note that triggered it | Opening line (conversational, references the note, NO "just checking in," NO "crazy market").

Also return: "Nurture only" next 20 (one-line reasons), and "Dead weight" count.

EXPECTED OUTPUT:
Three tables, no preamble.`,
  },
  {
    number: "3",
    title: "Ghost Notes Reactivation",
    tagline: "20% of your dead leads are still alive.",
    bestFor: "Agents with 18+ month old CRM notes or cold leads.",
    timeToRun: "~3 minutes",
    query: `ROLE:
You are a real estate re-engagement strategist. You specialize in finding gold in CRM notes that the original agent forgot they wrote. You are empathetic, specific, and allergic to generic outreach.

CONTEXT:
Below are raw CRM notes from leads I have not contacted in 18+ months. I believe at least 20% of them are still in the market or know someone who is. I want to re-engage them like an old friend reaching out, not a desperate agent rebooting a dead database.

NOTES DUMP:
[PASTE ALL NOTES HERE - one lead per block, name first]

TASK:
For every lead in the dump, do three things:

1. RECONSTRUCT (2 sentences): who this person was, what they wanted, what was blocking them.
2. AGE-FORWARD: assume 18-36 months have passed. What has probably changed? Be specific and reasonable.
3. REACTIVATE: write a four-touch sequence:
   - Touch 1: 2-sentence text. References one specific detail. Does NOT mention real estate.
   - Touch 2 (day 3 if no reply): 90-word email. Offers one useful piece of information.
   - Touch 3 (day 7): 20-second voice memo script. One question. Ends with "no rush, just thinking about you."
   - Touch 4 (day 14): handwritten card message, 4 sentences max. No real estate mention at all.

CONSTRAINTS:
- Never "just checking in."
- Never apologize for the time gap.
- Never "crazy market" or "interest rates."
- Match the tone of the original notes.
- If note is too thin (under 10 meaningful words): output "NOT ENOUGH TO PERSONALIZE - skip or scrub."

RULES FOR OUTPUT:
Summary table first: lead name, re-engageable confidence (High/Medium/Low), strongest hook.
Then per-lead: RECONSTRUCT, AGE-FORWARD, 4 labeled touches.

EXPECTED OUTPUT:
Summary table, then per-lead sequences in input order.`,
  },
  {
    number: "4",
    title: "Business Entity Unmasking",
    tagline: "Every LLC in your farm is a human. Find the human.",
    bestFor: "Agents who want repeat investor clients.",
    timeToRun: "~5 minutes",
    query: `ROLE:
You are a real estate intelligence analyst who specializes in tracing entity-owned properties back to the human decision-makers behind them. You use only publicly available sources.

CONTEXT:
In my farm area - [CITY/NEIGHBORHOOD], [STATE] - a growing percentage of properties are owned by business entities (LLCs, Incs, LPs, trusts). Tax records show the entity name but not the human. I want to identify the actual people as potential sellers, repeat buyers, and referral sources. These are investors and business owners, not distressed homeowners - they welcome good agents.

INPUT:
[Paste 5-25 entity names + property addresses. Columns: Entity Name | Entity Type | Property Address | Assessed Value | Year Acquired]

TASK:
For each entity, trace it back to its human principal using only public sources.

STEP 1: Search [STATE] Secretary of State business entity database. Pull: formation date, status, registered agent, officers/managers/members, principal office.
STEP 2: If generic registered agent (CT Corp, Northwest, Incorp), pivot to annual report filings which often name actual officers.
STEP 3: Cross-reference human names against LinkedIn, business press, news, podcasts.
STEP 4: Search for OTHER entities formed by the same human. This reveals portfolio size.

CONSTRAINTS:
- Public sources only. No paid skip-trace.
- Flag each item as VERIFIED (with source link) or INFERRED.
- If trail goes cold, say so - don't invent a name.
- Same workflow for all entity types.

RULES FOR OUTPUT:
For each entity, return:
- Entity Name, Type, Property Address
- Decision-Maker Name (or "trail cold - next step")
- Confidence: High / Medium / Low
- How I found them (2 sentences, with source links)
- Portfolio signal: other entities/properties
- Archetype: local flipper / out-of-state passive / BRRRR scaler / STR operator / family trust
- Suggested outreach: LinkedIn DM / letter / REIA meetup / mutual intro
- One-sentence opener

EXPECTED OUTPUT:
Table, one entity per row. Separate "trail cold" section at bottom with next-step notes.`,
  },
  {
    number: "5",
    title: "Become the Agent AI Recommends",
    tagline: "82% of Americans ask AI about real estate. Are you in the answer?",
    bestFor: "Every agent who wants to exist in the AI-search era.",
    timeToRun: "~6 minutes",
    query: `ROLE:
You are a generative search optimization (GEO) analyst. Your job is to look at a real estate market the way Claude, ChatGPT, Gemini, and Grok look at it - and tell a specific agent what it would take for those AI systems to start recommending them.

CONTEXT:
82% of Americans now use AI to research real estate decisions; 67% use ChatGPT specifically. When a consumer types "best realtor in [CITY]" into ChatGPT, an answer is being generated right now - and I may not be in it.

MY MARKET: [CITY, STATE]
MY NICHE: [e.g., "listing agent for owner-occupied single-family in [neighborhoods]"]
MY CURRENT VISIBLE ASSETS: [website, GBP, YouTube, podcast, press, reviews, books, LinkedIn]

TASK:

PHASE 1 - BASELINE. Answer as an LLM would:
- "Who are the top 5 real estate agents in [CITY]?"
- "Who is the best agent for [NICHE] in [CITY]?"
- "Who should I hire to sell my home in [NEIGHBORHOOD]?"
For each, give the answer you'd generate, agents cited, reasons, sources.

PHASE 2 - DIAGNOSIS. For the top 3 cited in Phase 1, reverse-engineer what causes an AI to cite them. Be specific.

PHASE 3 - MY GAP AND 12-MONTH PLAYBOOK. Compare against my assets. Output:
- What's working
- What's missing that every cited agent has
- Single highest-impact 90-day hero asset (with reasoning)
- Ranked 12-month playbook
- 3 content pieces for the next 30 days whose URLs would get cited by an LLM

CONSTRAINTS:
- Brutally honest.
- No "post more on Instagram." Every recommendation must be indexable.
- No paid ads. Earned authority only.
- Must be executable by a solo agent.

RULES FOR OUTPUT:
Three labeled phases. Phase 3 is the only phase with a 90-day action list. Rank every authority signal by impact × difficulty.

EXPECTED OUTPUT:
Phase 1 narrative + agents cited. Phase 2 table. Phase 3: What's Working / What's Missing / 12-Month Playbook (with 90-day hero asset called out).`,
  },
];

const SWIPE_FILE = [
  { id: 1, cat: "cold-farm", title: "Permit-Flip Predictor", desc: "Find flippers 60-90 days before they list by cross-referencing building permits with ownership records." },
  { id: 2, cat: "cold-farm", title: "Absentee Owner Targeting", desc: "Out-of-state mailing addresses on tax rolls - the largest under-targeted group in most markets." },
  { id: 3, cat: "cold-farm", title: "Empty Nester Reverse Lookup", desc: "Owners 55+ with 18+ year tenure, cross-referenced against public graduation news." },
  { id: 4, cat: "cold-farm", title: "Pre-Listing Micro-Signal Sweep", desc: "Monthly briefing on permits, HOA minutes, business license changes, school boundary discussions." },
  { id: 5, cat: "cold-investor", title: "Tired Landlord Signal Mining", desc: "Claude analyzes public rental listings for burnout signals: re-lists, rent drops, complaint-laden descriptions." },
  { id: 6, cat: "cold-investor", title: "Rental Portfolio Mapping", desc: "For a known investor, find every other property they own via matching mailing addresses in assessor records." },
  { id: 7, cat: "cold-investor", title: "Short-Term Rental Operator Outreach", desc: "Public Airbnb/VRBO listings cross-referenced with assessor records to identify STR operators." },
  { id: 8, cat: "cold-investor", title: "REIA Meetup Intel Brief", desc: "Walk into any real estate investor meetup with a specific game plan, not as a generic networker." },
  { id: 9, cat: "cold-niche", title: "Relocating Executive LinkedIn Query Builder", desc: "Exact Boolean search strings for LinkedIn and Sales Navigator to find recently-relocated execs." },
  { id: 10, cat: "cold-niche", title: "Medical Residency Match Day Calendar", desc: "March matches, June moves. 100-500 incoming residents per teaching hospital, on a predictable schedule." },
  { id: 11, cat: "cold-niche", title: "PCS Season Military Farming", desc: "Base-specific rotation cycle, BAH rates, 12-month outreach calendar." },
  { id: 12, cat: "cold-niche", title: "Corporate Relocation Pipeline", desc: "Companies announcing new offices or 50+ hires. Get to the relocation list before they do." },
  { id: 13, cat: "cold-visibility", title: "Competitor Agent Weakness Audit", desc: "24-month analysis of a dominant competitor. 5 positioning statements that exploit their gaps." },
  { id: 14, cat: "cold-visibility", title: "LLM-Quotable Content Generator", desc: "Content ideas structurally likely to be cited by an LLM answering consumer questions." },
  { id: 15, cat: "cold-visibility", title: "Local Business & Institution Mapping", desc: "The 30 most influential non-agent businesses in your farm. Partnership plan for each." },
  { id: 16, cat: "warm-sphere", title: "Hidden Referral Connector Mapping", desc: "Find the 20% of your sphere driving 80% of referrals. Pediatric dentists, HR people, connectors." },
  { id: 17, cat: "warm-sphere", title: "Life-Event Screenshot Scanning", desc: "Paste screenshots of your own social feeds. Claude extracts move signals from friends' public posts." },
  { id: 18, cat: "warm-sphere", title: "Equity Position Personalized Video Scripts", desc: "50 past clients → 50 personalized 45-second video scripts in a morning." },
  { id: 19, cat: "warm-sphere", title: "Anniversary Stack", desc: "Home-purchase anniversary message with rate-that-week + headline-from-that-month + equity update." },
  { id: 20, cat: "warm-sphere", title: "Relationship-Tuned Referral Ask", desc: "40 sphere contacts = 40 different referral asks. College roommate ≠ past client ≠ school parent." },
  { id: 21, cat: "warm-sphere", title: "Reverse ICP from Last 20 Closings", desc: "Feed your best 20 past clients. Get back a profile of the next 50 and where to find them." },
];

const CATEGORIES = [
  { id: "all", label: "All 21" },
  { id: "cold-farm", label: "Cold: Farm" },
  { id: "cold-investor", label: "Cold: Investor" },
  { id: "cold-niche", label: "Cold: Niche" },
  { id: "cold-visibility", label: "Cold: Visibility" },
  { id: "warm-sphere", label: "Warm: Sphere" },
];

export default function ProspectingPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedHero, setExpandedHero] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const filteredSwipe = activeCategory === "all"
    ? SWIPE_FILE
    : SWIPE_FILE.filter((q) => q.cat === activeCategory);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a1628",
        color: "#e2e8f0",
        padding: "32px 16px 64px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Badge */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              display: "inline-block",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              color: "#34d399",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              padding: "6px 14px",
              borderRadius: 6,
            }}
          >
            Find Your Next Client With AI
          </div>
        </div>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1
            className={spaceGrotesk.className}
            style={{
              fontSize: "clamp(28px, 7vw, 42px)",
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Stop using AI to write posts.
            <br />
            Start using it to{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #10b981, #38bdf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              find your next client
            </span>
            .
          </h1>
          <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.5, maxWidth: 560, margin: "0 auto" }}>
            5 queries that most agents have never seen. Plus 21 more in the swipe file.
            Copy-paste ready. Runs in Claude for $20/mo.
          </p>
        </div>

        {/* Primary CTA */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <a
            href="#strategy-call"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #10b981, #38bdf8)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              padding: "16px 32px",
              borderRadius: 10,
              textDecoration: "none",
              letterSpacing: 0.3,
              marginBottom: 10,
            }}
          >
            Book an AI Strategy Call →
          </a>
          <p style={{ fontSize: 13, color: "#64748b" }}>
            Or scroll down and grab the 5 queries first.
          </p>
        </div>

        {/* Video Placeholder */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px dashed rgba(255,255,255,0.15)",
            borderRadius: 12,
            padding: "32px 20px",
            textAlign: "center",
            marginBottom: 48,
          }}
        >
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>
            60-second intro
          </div>
          <div style={{ fontSize: 15, color: "#94a3b8" }}>
            [Video embed goes here once recorded]
          </div>
        </div>

        {/* The 5 Heroes */}
        <div style={{ marginBottom: 48 }}>
          <h2
            className={spaceGrotesk.className}
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            The 5 Hero Queries
          </h2>
          <p style={{ fontSize: 14, color: "#94a3b8", textAlign: "center", marginBottom: 24 }}>
            Tap any query to expand. Tap the copy button to paste into Claude.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {HEROES.map((h) => {
              const isOpen = expandedHero === h.number;
              const copyId = `hero-${h.number}`;
              return (
                <div
                  key={h.number}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => setExpandedHero(isOpen ? null : h.number)}
                    style={{
                      width: "100%",
                      padding: "20px",
                      background: "transparent",
                      border: "none",
                      color: "inherit",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          background: "linear-gradient(135deg, #10b981, #38bdf8)",
                          color: "#0a1628",
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        {h.number}
                      </span>
                      <h3
                        className={spaceGrotesk.className}
                        style={{ fontSize: 18, fontWeight: 700, margin: 0 }}
                      >
                        {h.title}
                      </h3>
                    </div>
                    <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 10, lineHeight: 1.4 }}>
                      {h.tagline}
                    </p>
                    <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#64748b" }}>
                      <span>
                        <strong style={{ color: "#94a3b8" }}>For:</strong> {h.bestFor}
                      </span>
                      <span>
                        <strong style={{ color: "#94a3b8" }}>Time:</strong> {h.timeToRun}
                      </span>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 12, color: "#34d399", fontWeight: 600 }}>
                      {isOpen ? "▼ Hide query" : "▶ Show query"}
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ padding: "0 20px 20px" }}>
                      <div
                        style={{
                          background: "#050d1c",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 8,
                          padding: "16px",
                          fontSize: 12,
                          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                          color: "#cbd5e1",
                          whiteSpace: "pre-wrap",
                          maxHeight: 400,
                          overflowY: "auto",
                          lineHeight: 1.5,
                        }}
                      >
                        {h.query}
                      </div>
                      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                        <OpenInAI
                          promptText={h.query}
                          promptId={`hero-${h.number}`}
                          label={`Run Query #${h.number} in Claude`}
                        />
                        <button
                          onClick={() => handleCopy(h.query, copyId)}
                          style={{
                            background: copiedId === copyId ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${copiedId === copyId ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)"}`,
                            color: copiedId === copyId ? "#34d399" : "#94a3b8",
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "8px 14px",
                            borderRadius: 8,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {copiedId === copyId ? "✓ Copied" : "Just copy (don't open app)"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* The Framework */}
        <div
          style={{
            background: "rgba(56, 189, 248, 0.06)",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            borderRadius: 12,
            padding: "24px 20px",
            marginBottom: 48,
          }}
        >
          <h3
            className={spaceGrotesk.className}
            style={{
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 12,
              textAlign: "center",
              color: "#38bdf8",
            }}
          >
            The 6-Part Framework
          </h3>
          <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", marginBottom: 16 }}>
            Every query above has this exact shape. Memorize it and you can build your own.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {["ROLE", "CONTEXT", "TASK", "CONSTRAINTS", "RULES", "EXPECTED OUTPUT"].map((part) => (
              <div
                key={part}
                style={{
                  background: "rgba(56, 189, 248, 0.1)",
                  color: "#38bdf8",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  padding: "6px 12px",
                  borderRadius: 6,
                }}
              >
                {part}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#64748b", textAlign: "center", marginTop: 16, fontStyle: "italic" }}>
            Short question = short answer. Detailed question = detailed answer.
          </p>
        </div>

        {/* Swipe File */}
        <div style={{ marginBottom: 48 }}>
          <h2
            className={spaceGrotesk.className}
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            The Swipe File
          </h2>
          <p style={{ fontSize: 14, color: "#94a3b8", textAlign: "center", marginBottom: 24 }}>
            21 more queries beyond the 5. Filter by category.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                style={{
                  background:
                    activeCategory === c.id
                      ? "linear-gradient(135deg, #10b981, #38bdf8)"
                      : "rgba(255,255,255,0.05)",
                  border:
                    activeCategory === c.id
                      ? "1px solid transparent"
                      : "1px solid rgba(255,255,255,0.08)",
                  color: activeCategory === c.id ? "#0a1628" : "#94a3b8",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  padding: "8px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredSwipe.map((q) => (
              <div
                key={q.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10,
                  padding: "14px 16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#64748b",
                      letterSpacing: 1,
                    }}
                  >
                    #{q.id}
                  </span>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#e2e8f0",
                    }}
                  >
                    {q.title}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
                  {q.desc}
                </div>
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: 12,
              color: "#64748b",
              textAlign: "center",
              marginTop: 20,
              fontStyle: "italic",
            }}
          >
            Full queries (ROLE / CONTEXT / TASK / CONSTRAINTS / RULES / OUTPUT) available on request - they
            live in the GitHub repo linked below.
          </p>
        </div>

        {/* Strategy Call CTA */}
        <div
          id="strategy-call"
          style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(56, 189, 248, 0.12))",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            borderRadius: 14,
            padding: "32px 24px",
            marginBottom: 32,
            textAlign: "center",
          }}
        >
          <h2
            className={spaceGrotesk.className}
            style={{
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            Want me to run Query #5 on your market?
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#94a3b8",
              marginBottom: 20,
              lineHeight: 1.5,
              maxWidth: 480,
              margin: "0 auto 20px",
            }}
          >
            An AI strategy call is a 45-minute working session where we build your 12-month GEO
            playbook together. Output is the Phase 3 deliverable from Query #5, built for YOUR
            market. One call, one plan, then you execute.
          </p>
          <a
            href="https://joinkale.com/schedule"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #10b981, #38bdf8)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              padding: "14px 28px",
              borderRadius: 10,
              textDecoration: "none",
              letterSpacing: 0.3,
            }}
          >
            Book a strategy call →
          </a>
        </div>

        {/* IG Follow */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 12 }}>
            New queries every week in the lab:
          </p>
          <a
            href="https://instagram.com/delfin.paris"
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e2e8f0",
              fontWeight: 600,
              fontSize: 14,
              padding: "10px 18px",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            Follow @delfin.paris on Instagram →
          </a>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <Link
            href="/"
            style={{
              fontSize: 13,
              color: "#64748b",
              textDecoration: "none",
              marginRight: 20,
            }}
          >
            Browse 570 more prompts in the vault →
          </Link>
          <a
            href="https://github.com/delfinparis/ai-prospecting-presentation"
            style={{
              fontSize: 13,
              color: "#64748b",
              textDecoration: "none",
            }}
          >
            GitHub repo →
          </a>
        </div>
      </div>
    </div>
  );
}
