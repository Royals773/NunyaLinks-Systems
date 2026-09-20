import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WORK_ITEMS } from "@/lib/work";
import MediaPlaceholder from "./MediaPlaceholder";
import WealthCircleOverview from "./WealthCircleOverview";
import Reveal from "./Reveal";

/**
 * A restrained, single-project feature — not a portfolio grid. Deliberately
 * shows only the first WORK_ITEMS entry; if more projects are added later,
 * this stays a single "latest/featured" spot rather than growing into a
 * grid (see /work for the full list).
 */
export default function SelectedWork() {
  const featured = WORK_ITEMS[0];
  if (!featured) return null;

  return (
    <section
      aria-labelledby="selected-work-heading"
      className="bg-slate-50 py-14 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Selected Work
          </p>
          <h2
            id="selected-work-heading"
            className="font-display mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl"
          >
            Something we&rsquo;ve actually built
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Not an illustration — a real product NunyaLink designed and
            built.
          </p>
        </Reveal>

        <Reveal delay={60}>
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:grid-cols-2">
            {featured.slug === "wealth-circle" ? (
              <WealthCircleOverview className="min-h-56 sm:min-h-full" />
            ) : (
              <MediaPlaceholder
                label={featured.name}
                className="min-h-56 sm:min-h-full"
              />
            )}

            <div className="flex flex-col justify-center p-8 sm:p-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block rounded-full bg-accent-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-dark">
                  {featured.type}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {featured.statusLabel}
                </span>
              </div>
              <h3 className="font-display mt-4 text-2xl font-semibold text-navy">
                {featured.name}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                {featured.summary}
              </p>
              <Link
                href={`/work/${featured.slug}`}
                className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-md bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-dark"
              >
                See the full story
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
