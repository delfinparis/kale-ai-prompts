import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0a1628 0%, #0f2140 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <div
            style={{
              color: "#f1f5f9",
              fontSize: 82,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              display: "flex",
            }}
          >
            Ct
          </div>
          <div
            style={{
              width: 14,
              height: 58,
              background: "#10b981",
              marginLeft: 8,
              marginTop: 6,
              display: "flex",
            }}
          />
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 16,
            color: "#64748b",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          Copy That.
        </div>
      </div>
    ),
    { ...size }
  );
}
