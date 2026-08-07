import {
  Briefcase,
  Target,
  ShieldCheck,
  KeyRound,
  Sprout,
} from "lucide-react";
import Reveal from "./Reveal";

const VALUES = [
  {
    icon: Briefcase,
    title: "We come from running real operations, not just building tech",
    description:
      "Built by operators who run people-heavy, compliance-driven businesses ourselves. We know these workflows because we live them.",
  },
  {
    icon: Target,
    title: "We build around ROI, not features",
    description:
      "We automate the processes that cost you the most, and we prove the return before we build.",
  },
  {
    icon: ShieldCheck,
    title: "We handle your data responsibly",
    description:
      "Your business information is handled securely, with proper data protection built into everything we deliver.",
  },
  {
    icon: KeyRound,
    title: "You own the outcome, not a subscription trap",
    description:
      "We build automations and websites around your business and keep them running, not lock you into software you'll never fully use.",
  },
  {
    icon: Sprout,
    title: "We start small and expand",
    description:
      "We prove value on one process first, then automate more as the results speak for themselves.",
  },
];

export default function WhyUs() {
  return (
    <section
      aria-labelledby="why-us-heading"
      className="bg-slate-50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2
            id="why-us-heading"
            className="text-3xl font-bold tracking-tight text-navy sm:text-4xl"
          >
            Why NunyaLink
          </h2>
        </Reveal>

        <ul className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((value, i) => (
            <Reveal
              key={value.title}
              delay={i * 60}
              className={i === 3 ? "sm:col-span-2 sm:mx-auto sm:max-w-[calc(50%-0.75rem)] lg:col-span-1 lg:mx-0 lg:max-w-none" : undefined}
            >
              <li className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-accent-light">
                  <value.icon
                    className="h-6 w-6 text-accent"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-base font-semibold leading-snug text-navy">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {value.description}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
