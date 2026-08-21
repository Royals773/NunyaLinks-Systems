import Reveal from "./Reveal";

const STEPS = [
  {
    title: "Free Automation Opportunity Review",
    description:
      "A focused conversation to identify the process costing you the most time and money.",
  },
  {
    title: "Automation Audit & Roadmap",
    description:
      "A paid, in-depth review of that process — ROI estimate, priorities and a fixed build quote.",
  },
  {
    title: "Build",
    description:
      "We build the automation, and any website it needs, using AI and proven tools.",
  },
  {
    title: "Test and launch",
    description:
      "Tested on real business scenarios, then launched with your team briefed.",
  },
  {
    title: "Maintain and expand",
    description:
      "We monitor, maintain and improve, and find the next process to tackle.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="bg-slate-50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2
            id="how-it-works-heading"
            className="font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl"
          >
            How It Works
          </h2>
        </Reveal>

        <div className="relative mx-auto mt-14 max-w-3xl">
          <div
            aria-hidden="true"
            className="absolute bottom-5 left-5 top-5 w-px bg-ink/10"
          />
          <ol className="space-y-8">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 70}>
                <li className="flex gap-5">
                  <div
                    className="font-display relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-base font-semibold text-accent shadow-[0_0_0_1px_rgba(18,25,43,0.1)]"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </div>
                  <div className="pt-1">
                    <h3 className="text-lg font-semibold text-navy">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-base leading-relaxed text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
