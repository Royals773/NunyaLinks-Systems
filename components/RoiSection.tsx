import { TrendingUp } from "lucide-react";
import Reveal from "./Reveal";

export default function RoiSection() {
  return (
    <section
      aria-labelledby="roi-heading"
      className="bg-navy py-20 text-white sm:py-28"
    >
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <TrendingUp
            className="mx-auto mb-6 h-10 w-10 text-accent"
            aria-hidden="true"
          />
          <h2
            id="roi-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Every automation pays for itself — and we show you the numbers.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-200">
            Before we build anything, we measure the process: how many hours
            it takes, how often it happens, and what that time is costing
            you. Then we show you the return.
          </p>

          <div className="mx-auto mt-10 max-w-2xl rounded-lg border border-white/20 bg-white/5 p-6 sm:p-8">
            <p className="text-xl font-semibold leading-relaxed text-white sm:text-2xl">
              A process taking your team 10 hours a week is over 500 hours a
              year. Automate it, and that time goes back into the business —
              for a fraction of what those hours cost.
            </p>
          </div>

          <p className="mt-8 text-base font-medium text-slate-200">
            If the numbers don&rsquo;t make sense for you, we&rsquo;ll tell
            you.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
