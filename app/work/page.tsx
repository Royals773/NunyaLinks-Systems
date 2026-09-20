import type { Metadata } from "next";
import { WORK_ITEMS } from "@/lib/work";
import WorkCard from "@/components/work/WorkCard";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Selected Work — NunyaLink Systems",
  description:
    "Systems NunyaLink Systems has actually built — evidence of the capability behind the service, not client case studies.",
};

export default function WorkPage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="bg-navy py-20 text-white sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent-light">
              NunyaLink Systems
            </p>
            <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Selected Work
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-200">
              Systems we&rsquo;ve actually built — not client case studies,
              and not the illustrative examples on the homepage, but
              products and platforms that exist because we built them.
            </p>
          </Reveal>
        </div>
      </section>

      <section aria-label="Featured projects" className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {WORK_ITEMS.length > 0 ? (
            <ul className="flex flex-wrap justify-center gap-6">
              {WORK_ITEMS.map((item, i) => (
                <Reveal
                  key={item.slug}
                  delay={i * 60}
                  className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
                >
                  <WorkCard item={item} className="h-full" />
                </Reveal>
              ))}
            </ul>
          ) : (
            <p className="text-center text-slate-600">
              We&rsquo;re documenting our first project — check back soon.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
