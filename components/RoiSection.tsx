import Reveal from "./Reveal";

export default function RoiSection() {
  return (
    <section
      aria-labelledby="roi-heading"
      className="bg-ink py-20 text-white sm:py-28"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-light">
            The return, before the build
          </p>
          <h2
            id="roi-heading"
            className="font-display mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
          >
            The right automation pays for itself in time saved, errors
            reduced or opportunities recovered.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
            Before we build anything, we measure the process: how many
            hours it takes, how often it happens, and what that time is
            costing you. Then we show you the return. If the numbers
            don&rsquo;t make sense for you, we&rsquo;ll tell you.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-16 grid grid-cols-1 items-end gap-x-10 gap-y-8 border-t border-white/15 pt-10 sm:grid-cols-[auto_1fr]">
            <div>
              <p className="font-display text-7xl font-semibold leading-none tracking-tight text-white sm:text-8xl">
                500<span className="text-accent-light">+</span>
              </p>
              <p className="mt-3 text-sm font-medium uppercase tracking-widest text-slate-400">
                Hours a year
              </p>
            </div>
            <p className="max-w-md text-base leading-relaxed text-slate-300">
              A process taking your team{" "}
              <span className="font-semibold text-white">10 hours a week</span>{" "}
              is over 500 hours a year. Automate it, and that time goes back
              into the business — for a fraction of what those hours cost.
            </p>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            Illustrative example, not a client result.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
