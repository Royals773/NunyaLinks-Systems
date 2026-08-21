import { ArrowRight } from "lucide-react";

interface Mapping {
  before: string;
  after: string;
}

const MAPPINGS: Mapping[] = [
  { before: "Manual enquiries", after: "Captured and routed" },
  { before: "Repeated chasing", after: "Scheduled follow-up" },
  { before: "Disconnected records", after: "Synchronised information" },
  { before: "Inconsistent onboarding", after: "Reliable workflows" },
  { before: "Delayed reporting", after: "Timely dashboards and alerts" },
];

/**
 * The site's flagship transformation device: an exact, literal mapping
 * rather than decorative abstraction — each row states precisely what
 * changes, so it reads as a real operating-model shift, not an illustration.
 */
export default function BeforeAfterFlow() {
  return (
    <div className="mt-14">
      <div className="hidden grid-cols-[1fr_auto_1fr] items-center gap-x-6 border-t border-ink/10 sm:grid">
        <span className="pb-3 pt-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Today
        </span>
        <span aria-hidden="true" className="pb-3 pt-5" />
        <span className="pb-3 pt-5 text-xs font-semibold uppercase tracking-widest text-accent">
          With NunyaLink
        </span>
      </div>

      <ol className="border-t border-ink/10 sm:border-t-0">
        {MAPPINGS.map((mapping) => (
          <li
            key={mapping.before}
            className="grid grid-cols-1 items-center gap-x-6 gap-y-2 border-b border-ink/10 py-5 sm:grid-cols-[1fr_auto_1fr]"
          >
            <span className="text-base font-medium text-slate-500 sm:text-lg">
              {mapping.before}
            </span>
            <ArrowRight
              className="hidden h-4 w-4 shrink-0 text-accent sm:block"
              aria-hidden="true"
            />
            <span className="font-display text-lg font-semibold text-ink sm:text-xl">
              {mapping.after}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
