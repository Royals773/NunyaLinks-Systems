import { ImageResponse } from "next/og";

export const alt =
  "NunyaLink Systems — Automate the busywork. Run the business.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1F3A5F",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 88,
              height: 88,
              marginRight: 24,
              borderRadius: 16,
              background: "#2E6DA4",
              color: "#ffffff",
              fontSize: 52,
              fontWeight: 700,
            }}
          >
            N
          </div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>
            <div style={{ display: "flex", color: "#ffffff" }}>NunyaLink</div>
            <div style={{ display: "flex", color: "#2E6DA4", marginLeft: 18 }}>
              Systems
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 32,
            color: "#eaf1f8",
          }}
        >
          Automate the busywork. Run the business.
        </div>
      </div>
    ),
    { ...size }
  );
}
