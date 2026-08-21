import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import HeroSystemDiagram from "./HeroSystemDiagram";

export default function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-white"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-12 lg:py-28 xl:px-8">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Automate the busywork. Run the business.
          </p>
          <h1
            id="hero-heading"
            className="font-display mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl"
          >
            Stop running your business on manual work.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-700">
            NunyaLink builds AI-powered automations and mobile-first websites
            that handle the repetitive tasks eating your week — chasing
            enquiries, following up on payments, onboarding staff, updating
            records — so your team can focus on the work that actually grows
            the business.
          </p>

          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <a
              href="#contact"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-navy sm:w-auto"
            >
              Book a Free Opportunity Review
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#what-we-build"
              className="inline-flex w-full items-center justify-center rounded-md border-2 border-ink/15 px-7 py-3.5 text-base font-semibold text-ink transition-colors hover:border-ink/30 hover:bg-slate-50 sm:w-auto"
            >
              See What We Build
            </a>
          </div>

          <p className="mt-7 max-w-md border-t border-slate-200 pt-5 text-sm leading-relaxed text-slate-700">
            Every engagement starts with a free Automation Opportunity
            Review — a focused conversation to find the one process
            costing you the most.
          </p>
        </Reveal>

        <Reveal delay={100} className="lg:mt-[3.75rem]">
          <HeroSystemDiagram />
        </Reveal>
      </div>
    </section>
  );
}
