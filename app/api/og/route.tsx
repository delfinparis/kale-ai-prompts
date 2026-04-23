import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200",
          height: "630",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              background: "rgba(56,189,248,0.15)",
              border: "1px solid rgba(56,189,248,0.3)",
              borderRadius: "20px",
              padding: "8px 20px",
              fontSize: "20px",
              color: "#38bdf8",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "18px" }}>⚡</span>
            The AI Cheat Sheet for Real Estate Agents
          </div>
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: "96px",
            fontWeight: 800,
            color: "#f1f5f9",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: "24px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Copy That<span style={{ color: "#10b981" }}>.</span></span>
          <span style={{ color: "#38bdf8", fontSize: "44px", marginTop: "12px" }}>570 AI prompts for realtors</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "28px",
            color: "#94a3b8",
            lineHeight: 1.5,
            maxWidth: "800px",
            marginBottom: "40px",
            display: "flex",
          }}
        >
          Copy. Paste. Close more deals. Ready-to-go prompts for emails, listings, follow-ups, and scripts.
        </div>

        {/* Category pills */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "✍️ Write For Me", count: "148" },
            { label: "📨 Follow Up", count: "180" },
            { label: "🎯 Coach Me", count: "113" },
            { label: "📊 Plan Strategy", count: "129" },
          ].map((cat) => (
            <div
              key={cat.label}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "12px 20px",
                fontSize: "20px",
                color: "#cbd5e1",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {cat.label}
              <span style={{ color: "#38bdf8", fontWeight: 700 }}>{cat.count}</span>
            </div>
          ))}
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "80px",
            fontSize: "24px",
            color: "#475569",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          tapthis.co
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
