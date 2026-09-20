interface MediaPlaceholderProps {
  label: string;
  eyebrow?: string;
  className?: string;
}

/**
 * Stand-in for a product/project visual that hasn't been captured yet.
 * Deliberately not a "broken image" treatment (dashed border, grey icon) —
 * reuses the logo's connected-nodes motif at low opacity on an ink panel,
 * so an empty slot still reads as a deliberate brand surface rather than
 * an unfinished one.
 */
export default function MediaPlaceholder({
  label,
  eyebrow = "Visual to be added",
  className = "",
}: MediaPlaceholderProps) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden bg-ink px-6 py-10 text-center ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
      >
        <line
          x1="40"
          y1="40"
          x2="160"
          y2="160"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <rect x="18" y="18" width="44" height="44" rx="10" fill="white" />
        <rect x="138" y="138" width="44" height="44" rx="10" fill="white" />
      </svg>
      <p className="relative text-xs font-semibold uppercase tracking-widest text-accent-light">
        {eyebrow}
      </p>
      <p className="font-display relative mt-2 text-lg font-semibold leading-snug text-white sm:text-xl">
        {label}
      </p>
    </div>
  );
}
