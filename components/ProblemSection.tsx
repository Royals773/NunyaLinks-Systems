import Reveal from "./Reveal";

const PAIN_POINTS = [
  "Chasing enquiries and following up leads by hand",
  "Re-typing the same information across apps, spreadsheets and messages",
  "Manually reminding people about payments, documents or deadlines",
  "Onboarding staff or customers through slow, inconsistent steps",
  "Reporting that only happens when someone finds the time",
];

export default function ProblemSection() {
  return (
    <section
      aria-labelledby="problem-heading"
      className="bg-slate-50 py-14 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1fr] lg:gap-16">
          <Reveal>
            <h2
              id="problem-heading"
              className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
            >
              Your team is spending hours on work a system could do for
              free.
            </h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-slate-600">
              Every hour spent here is an hour not spent serving customers
              or growing the business.
            </p>
          </Reveal>

          <Reveal delay={60}>
            <ol className="border-t border-ink/10">
              {PAIN_POINTS.map((point, i) => (
                <li
                  key={point}
                  className="flex items-baseline gap-5 border-b border-ink/10 py-4"
                >
                  <span
                    className="font-display shrink-0 text-sm font-semibold text-accent"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed text-slate-700 sm:text-base">
                    {point}
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        <Reveal className="mt-14 border-t border-ink/10 pt-8 lg:mt-16">
          <p className="max-w-2xl text-lg font-medium leading-relaxed text-ink">
            NunyaLink builds automations that do this work for you —
            reliably, every time, without being asked.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
