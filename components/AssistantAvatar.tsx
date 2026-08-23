import type { SVGProps } from "react";

/**
 * The AI assistant's avatar — visually derived from the NunyaLink logo
 * mark (see Logo.tsx's LogoMark: two connected nodes, joined by the brand
 * accent) but deliberately distinct rather than reused verbatim: circular
 * instead of the logo's rounded square, and the nodes sit in the site's
 * cream background tone rather than pure white, so it never reads as a
 * second copy of the primary logo. The small gold sparkle marks it as an
 * AI presence specifically — restrained to a single small accent so the
 * mark still reads as calm and premium rather than novelty.
 *
 * Always decorative: every place this is used already carries its own
 * accessible name or label (the launcher's aria-label, the panel's
 * visible "AI assistant" text), so this SVG stays out of the
 * accessibility tree entirely.
 */
export function AssistantAvatar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
      {...props}
    >
      <circle cx="16" cy="16" r="16" className="fill-ink" />
      <line
        x1="11.5"
        y1="11.5"
        x2="20.5"
        y2="20.5"
        strokeWidth="4"
        strokeLinecap="round"
        className="stroke-accent"
      />
      <rect x="7" y="7" width="9" height="9" rx="2.5" className="fill-background" />
      <rect x="16" y="16" width="9" height="9" rx="2.5" className="fill-background" />
      <path
        d="M25.55 2.9c.13-.5.86-.5.99 0l.5 1.9c.28 1.07 1.12 1.9 2.19 2.19l1.9.5c.5.13.5.86 0 .99l-1.9.5a3.05 3.05 0 0 0-2.19 2.19l-.5 1.9c-.13.5-.86.5-.99 0l-.5-1.9a3.05 3.05 0 0 0-2.19-2.19l-1.9-.5c-.5-.13-.5-.86 0-.99l1.9-.5A3.05 3.05 0 0 0 25.05 4.8z"
        className="fill-gold"
      />
    </svg>
  );
}
