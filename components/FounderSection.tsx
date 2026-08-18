import { UserRound } from "lucide-react";
import Reveal from "./Reveal";

/**
 * Not currently rendered on the homepage (see app/page.tsx) — the photo and
 * name below are placeholders, and this section was pulled pending real
 * founder content (name, title, photo) rather than shipping placeholders to
 * production. The verified copy here is duplicated in WhyUs's "We come from
 * running real operations" item in the meantime. Re-add the import and
 * <FounderSection /> in app/page.tsx once real content is available, and
 * consider removing the now-duplicated item from WhyUs at that point.
 */
export default function FounderSection() {
  return (
    <section
      aria-labelledby="founder-heading"
      className="bg-slate-50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="grid grid-cols-1 items-center gap-10 sm:grid-cols-[15rem_1fr] sm:gap-12">
          <div className="mx-auto flex aspect-square w-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400 sm:mx-0 sm:w-full">
            <UserRound className="h-9 w-9" aria-hidden="true" />
            <p className="px-4 text-center text-xs leading-relaxed">
              Founder photo — to be added
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              Who&rsquo;s behind NunyaLink
            </p>
            <h2
              id="founder-heading"
              className="font-display mt-3 text-2xl font-semibold tracking-tight text-navy sm:text-3xl"
            >
              We come from running real operations, not just building tech.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Built by operators who run people-heavy, compliance-driven
              businesses ourselves. We know these workflows because we live
              them.
            </p>
            <span className="mt-5 inline-block rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-medium text-slate-400">
              Founder name &amp; title — to be added
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
