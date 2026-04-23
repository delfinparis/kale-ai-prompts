import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a1628",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <div
          style={{
            color: "#f1f5f9",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            display: "flex",
          }}
        >
          C
        </div>
        <div
          style={{
            width: 4,
            height: 15,
            background: "#10b981",
            marginLeft: 2,
            marginTop: 1,
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
