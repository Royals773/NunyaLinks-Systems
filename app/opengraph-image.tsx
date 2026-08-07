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
          {/* Same two-node mark as components/Logo.tsx, sized up. The
              navy page background stands in for the mark's usual badge,
              so only the nodes + connector are drawn here. */}
          <svg
            width={88}
            height={88}
            viewBox="0 0 32 32"
            style={{ display: "flex", marginRight: 24 }}
          >
            <line
              x1="11.5"
              y1="11.5"
              x2="20.5"
              y2="20.5"
              stroke="#2E6DA4"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <rect x="7" y="7" width="9" height="9" rx="2.5" fill="#ffffff" />
            <rect x="16" y="16" width="9" height="9" rx="2.5" fill="#ffffff" />
          </svg>
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
