import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same mark as app/icon.tsx, rendered at Apple's larger touch-icon size.
// The viewBox stays 0 0 32 32 and the <svg> is scaled up — true vector
// scaling, not a raster upscale, so it stays crisp.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg
        width={180}
        height={180}
        viewBox="0 0 32 32"
        style={{ display: "flex" }}
      >
        <rect width="32" height="32" rx="7" fill="#1F3A5F" />
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
    ),
    { ...size }
  );
}
