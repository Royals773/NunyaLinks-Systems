import { Target, ShieldCheck, KeyRound, Sprout } from "lucide-react";
import Reveal from "./Reveal";

const FEATURED = {
  icon: Target,
  title: "We build around ROI, not features",
  description:
    "We automate the processes that cost you the most, and we prove the return before we build.",
};

const SUPPORTING = [
  {
    icon: ShieldCheck,
    title: "We handle your data responsibly",
    description:
      "We design systems with data protection, access control and sensible handling of business information in mind.",
  },
  {
    icon: KeyRound,
    title: "Built around your business, not the other way round",
    description:
      "Whether it's an automation, a website or a full software platform, we build it around how you work and keep it running — not lock you into tools you'll never fully use.",
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
      id="why-nunyalink"
      aria-labelledby="why-us-heading"
      className="bg-slate-50 py-14 sm:py-20"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2
            id="why-us-heading"
            className="font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl"
          >
            Why NunyaLink
          </h2>
        </Reveal>

        <Reveal delay={40}>
          <div className="mx-auto mt-12 max-w-3xl border-l-4 border-accent pl-6 sm:pl-8">
            <FEATURED.icon
              className="h-8 w-8 text-accent"
              aria-hidden="true"
            />
            <p className="font-display mt-3 text-2xl font-semibold leading-snug text-navy sm:text-3xl">
              {FEATURED.title}
            </p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
              {FEATURED.description}
            </p>
          </div>
        </Reveal>

        <ul className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-3">
          {SUPPORTING.map((value, i) => (
            <Reveal key={value.title} delay={80 + i * 50}>
              <li className="border-t border-slate-200 pt-5">
                <value.icon
                  className="h-5 w-5 text-accent"
                  aria-hidden="true"
                />
                <h3 className="mt-3 text-sm font-semibold leading-snug text-navy">
                  {value.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
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
