"use client";

export default function StrategyCallFooter() {
  const handleClick = () => {
    if (typeof window !== "undefined" && (window as { dataLayer?: unknown[] }).dataLayer) {
      (window as { dataLayer?: unknown[] }).dataLayer!.push({
        event: "strategy_call_click",
        placement: "page_footer",
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "32px 0 48px",
      }}
    >
      <a
        href="https://joinkale.com/schedule"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        style={{
          background: "linear-gradient(135deg, #10b981, #38bdf8)",
          color: "#0a1628",
          fontSize: 13,
          fontWeight: 700,
          padding: "10px 20px",
          borderRadius: 999,
          textDecoration: "none",
          letterSpacing: 0.2,
          whiteSpace: "nowrap",
        }}
      >
        Book a 15-min call with D.J.
      </a>
    </div>
  );
}
