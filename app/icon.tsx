import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Mirrors components/Logo.tsx's LogoMark. Kept as plain SVG attributes
// (not Tailwind classes) since next/og's renderer doesn't process
// stylesheets — this is the one place the shapes are hand-duplicated.
export default function Icon() {
  return new ImageResponse(
    (
      <svg
        width={32}
        height={32}
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
