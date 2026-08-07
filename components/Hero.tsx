import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
            Automate the busywork. Run the business.
          </p>
          <h1
            id="hero-heading"
            className="text-4xl font-bold leading-tight tracking-tight text-navy sm:text-5xl lg:text-6xl"
          >
            Stop running your business on manual work.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            NunyaLink builds AI-powered automations and mobile-first websites
            that handle the repetitive tasks eating your week — chasing
            enquiries, following up on payments, onboarding staff, updating
            records — so you and your team can focus on the work that
            actually grows the business.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#contact"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-navy px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-navy-dark sm:w-auto"
            >
              Book a Free Automation Audit
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#what-we-build"
              className="inline-flex w-full items-center justify-center rounded-md border-2 border-navy px-7 py-3.5 text-base font-semibold text-navy transition-colors hover:bg-accent-light sm:w-auto"
            >
              See What We Build
            </a>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Every engagement starts by finding one process that&rsquo;s
            costing you hours — and showing you what it&rsquo;s worth to fix.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
