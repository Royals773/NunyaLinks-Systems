import Reveal from "./Reveal";

const STEPS = [
  {
    title: "Free automation audit",
    description:
      "We find the process costing you the most time and money.",
  },
  {
    title: "The ROI case",
    description:
      "We measure the hours and cost and show you what fixing it is worth.",
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
      className="bg-white py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2
            id="how-it-works-heading"
            className="text-3xl font-bold tracking-tight text-navy sm:text-4xl"
          >
            How It Works
          </h2>
        </Reveal>

        <ol className="mx-auto mt-14 max-w-3xl space-y-8">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 70}>
              <li className="flex gap-5">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-base font-bold text-white"
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
    </section>
  );
}
