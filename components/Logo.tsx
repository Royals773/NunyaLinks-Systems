import type { SVGProps } from "react";

/**
 * The NunyaLink Systems mark: two connected nodes on a navy badge —
 * "link" made literal. Self-contained (opaque navy background), so it
 * reads correctly on any page background without needing colour
 * overrides. Source of truth for the favicon/app icon/OG image, which
 * redraw the same shapes with plain SVG attributes (no Tailwind) since
 * next/og's renderer doesn't process stylesheets.
 */
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="shrink-0"
      {...props}
    >
      <rect width="32" height="32" rx="7" className="fill-ink" />
      <line
        x1="11.5"
        y1="11.5"
        x2="20.5"
        y2="20.5"
        strokeWidth="4"
        strokeLinecap="round"
        className="stroke-accent"
      />
      <rect x="7" y="7" width="9" height="9" rx="2.5" fill="#ffffff" />
      <rect x="16" y="16" width="9" height="9" rx="2.5" fill="#ffffff" />
    </svg>
  );
}

interface LogoProps {
  /** Classes on the outer wrapper (layout: flex alignment, justify-content, etc). */
  className?: string;
  /** Size override for the mark, e.g. "h-10 w-10". */
  markClassName?: string;
  /** "dark" (default) for light backgrounds like the header; "light" for
   *  dark surfaces like the footer. Controls both words together so the
   *  "Systems" qualifier always keeps accessible contrast against its
   *  background — text-accent reads fine on white but fails on ink. */
  variant?: "dark" | "light";
}

/** Full lockup: mark + wordmark, "Systems" set as a small tracked qualifier
 *  rather than a co-equal word, so the pairing reads as one deliberate
 *  mark rather than two arbitrarily coloured words. */
export function Logo({
  className = "",
  markClassName = "h-8 w-8",
  variant = "dark",
}: LogoProps) {
  const nameColor = variant === "light" ? "text-white" : "text-ink";
  const systemsColor = variant === "light" ? "text-accent-light" : "text-accent-dark";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={markClassName} />
      <span className={`text-lg font-bold tracking-tight sm:text-xl ${nameColor}`}>
        NunyaLink
        <span
          className={`ml-1.5 align-middle text-[0.6em] font-semibold uppercase tracking-[0.15em] ${systemsColor}`}
        >
          Systems
        </span>
      </span>
    </span>
  );
}
