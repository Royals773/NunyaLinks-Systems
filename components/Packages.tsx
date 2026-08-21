import { Check } from "lucide-react";
import Reveal from "./Reveal";

interface StartHereStep {
  title: string;
  tag: "Free" | "Paid";
  description: string;
}

const START_HERE: StartHereStep[] = [
  {
    title: "Free Automation Opportunity Review",
    tag: "Free",
    description:
      "A focused initial conversation to identify the manual process creating the greatest operational cost or friction. This is exploratory and does not include a complete operational audit or detailed implementation roadmap.",
  },
  {
    title: "Automation Audit & Roadmap",
    tag: "Paid",
    description:
      "A paid, in-depth review of the selected workflow, including process analysis, automation opportunities, estimated ROI, priorities and a recommended implementation roadmap.",
  },
];

interface Package {
  title: string;
  badge?: "Entry point" | "Recommended";
  audience: string;
  includes: string[];
  highlighted?: boolean;
}

const EXPAND_PACKAGES: Package[] = [
  {
    title: "Digital Foundation",
    badge: "Entry point",
    audience:
      "For SMEs who need a professional online presence and a proper way to capture enquiries — often the first step before automating what happens next.",
    includes: [
      "Mobile-first website",
      "Service or product pages",
      "Structured enquiry forms that feed your systems",
      "Basic customer records",
      "Analytics setup",
      "Team handover",
    ],
  },
  {
    title: "First Automation",
    audience:
      "For SMEs ready to automate one high-value process and see the results.",
    includes: [
      "One custom-built automation",
      "Connection to existing tools",
      "Testing against real scenarios",
      "Team briefing and handover",
      "30 days post-launch support",
    ],
  },
  {
    title: "Automation Partner",
    badge: "Recommended",
    highlighted: true,
    audience:
      "For SMEs who want an ongoing partner keeping things running and automating more over time.",
    includes: [
      "Maintenance and monitoring of all automations",
      "Ongoing fixes and improvements",
      "New automations built on a rolling basis",
      "Priority support",
      "Regular ROI and performance reviews",
    ],
  },
  {
    title: "Business Control System",
    audience:
      "For established SMEs who want their automations feeding a single operational view.",
    includes: [
      "Multiple connected automations",
      "A central dashboard for owners and managers",
      "Alerts and reporting across the business",
      "Multi-location and multi-currency support where needed",
      "Full retainer support",
    ],
  },
];

export default function Packages() {
  return (
    <section
      id="packages"
      aria-labelledby="packages-heading"
      className="bg-white py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <h2
            id="packages-heading"
            className="font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl"
          >
            Packages
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Every engagement starts with a free review. From there, build
            and expand at your own pace.
          </p>
        </Reveal>

        {/* Start here: the free review and the paid audit that follows it */}
        <Reveal className="mt-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Start here
          </p>
        </Reveal>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {START_HERE.map((step, i) => (
            <Reveal key={step.title} delay={i * 60} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-ink/10 bg-slate-50 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span
                    className="font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      step.tag === "Free"
                        ? "bg-accent-light text-accent-dark"
                        : "bg-navy text-white"
                    }`}
                  >
                    {step.tag}
                  </span>
                </div>
                <h3 className="font-display mt-4 text-xl font-semibold leading-snug text-navy">
                  {step.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Ways to build and expand: the ongoing packages beyond the audit */}
        <Reveal className="mt-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Ways to build and expand
          </p>
        </Reveal>

        <ul className="mt-6 border-t border-ink/10">
          {EXPAND_PACKAGES.map((pkg, i) =>
            pkg.highlighted ? (
              <Reveal key={pkg.title} delay={i * 40} className="border-b border-ink/10 py-4">
                <li className="rounded-2xl bg-ink px-6 py-8 text-white sm:px-10 sm:py-10">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-12">
                    <div>
                      <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                        {pkg.badge}
                      </span>
                      <h3 className="font-display mt-4 text-2xl font-semibold leading-snug text-white">
                        {pkg.title}
                      </h3>
                      <p className="mt-3 max-w-sm text-base leading-relaxed text-slate-300">
                        {pkg.audience}
                      </p>
                    </div>
                    <ul className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
                      {pkg.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-accent-light"
                            aria-hidden="true"
                          />
                          <span className="text-sm leading-relaxed text-slate-100">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              </Reveal>
            ) : (
              <Reveal key={pkg.title} delay={i * 40}>
                <li className="grid grid-cols-1 gap-6 border-b border-ink/10 py-8 lg:grid-cols-[1fr_1.3fr] lg:gap-12">
                  <div>
                    {pkg.badge && (
                      <span className="inline-block rounded-full bg-accent-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-dark">
                        {pkg.badge}
                      </span>
                    )}
                    <h3
                      className={`font-display text-xl font-semibold leading-snug text-navy ${pkg.badge ? "mt-3" : ""}`}
                    >
                      {pkg.title}
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
                      {pkg.audience}
                    </p>
                  </div>
                  <ul className="grid grid-cols-1 gap-x-8 gap-y-2 self-start sm:grid-cols-2">
                    {pkg.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                          aria-hidden="true"
                        />
                        <span className="text-sm leading-relaxed text-slate-700">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              </Reveal>
            )
          )}
        </ul>

        <Reveal className="mt-12 max-w-2xl">
          <p className="text-base leading-relaxed text-slate-600">
            Every engagement starts with a free Automation Opportunity
            Review. If there&rsquo;s a strong case to dig deeper, the paid
            Automation Audit &amp; Roadmap gives you a measured ROI
            estimate, a defined scope and a fixed build quote before any
            work begins.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
