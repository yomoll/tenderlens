import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#143A66",
          color: "white",
          padding: "72px",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.8 }}>CivicAI Labs</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2 }}>TenderLens</div>
          <div style={{ fontSize: 36, maxWidth: 820, lineHeight: 1.3 }}>
            Find public contracts. Understand them. Decide faster.
          </div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.8 }}>tenderlens.civicailabs.co.uk</div>
      </div>
    ),
    size,
  );
}
