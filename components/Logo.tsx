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
      <rect width="32" height="32" rx="7" className="fill-navy" />
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
  /** Colour override for the "NunyaLink" word — defaults to navy for light backgrounds. */
  primaryTextClassName?: string;
}

/** Full lockup: mark + wordmark. Use on any background — see primaryTextClassName. */
export function Logo({
  className = "",
  markClassName = "h-8 w-8",
  primaryTextClassName = "text-navy",
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={markClassName} />
      <span className="text-lg font-bold tracking-tight sm:text-xl">
        <span className={primaryTextClassName}>NunyaLink</span>{" "}
        <span className="text-accent">Systems</span>
      </span>
    </span>
  );
}
