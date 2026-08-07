import { Check } from "lucide-react";
import Reveal from "./Reveal";

interface Package {
  title: string;
  badge?: "Entry point" | "Recommended";
  audience: string;
  includes: string[];
  highlighted?: boolean;
}

const PACKAGES: Package[] = [
  {
    title: "Digital Foundation (Website)",
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
    title: "Automation Audit",
    audience:
      "For SMEs who want to know where they're losing time and what it's worth to fix.",
    includes: [
      "Full review of day-to-day operations",
      "Identification of highest-value automation opportunities",
      "A measured ROI estimate for each",
      "A clear, no-obligation recommendation",
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
    title: "Automation Partner (Retainer)",
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
      className="bg-slate-50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2
            id="packages-heading"
            className="text-3xl font-bold tracking-tight text-navy sm:text-4xl"
          >
            Packages
          </h2>
        </Reveal>

        <ul className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {PACKAGES.map((pkg, i) => (
            <Reveal key={pkg.title} delay={i * 60} className="h-full">
              <li
                className={`flex h-full flex-col rounded-lg border p-6 shadow-sm ${
                  pkg.highlighted
                    ? "border-2 border-navy bg-navy text-white shadow-md lg:-translate-y-2"
                    : "border-slate-200 bg-white"
                }`}
              >
                {pkg.badge && (
                  <span
                    className={`mb-3 inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      pkg.highlighted
                        ? "bg-accent text-white"
                        : "bg-accent-light text-accent-dark"
                    }`}
                  >
                    {pkg.badge}
                  </span>
                )}
                <h3
                  className={`text-lg font-bold leading-snug ${
                    pkg.highlighted ? "text-white" : "text-navy"
                  }`}
                >
                  {pkg.title}
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    pkg.highlighted ? "text-slate-200" : "text-slate-600"
                  }`}
                >
                  {pkg.audience}
                </p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {pkg.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          pkg.highlighted ? "text-accent-light" : "text-accent"
                        }`}
                        aria-hidden="true"
                      />
                      <span
                        className={`text-sm leading-relaxed ${
                          pkg.highlighted ? "text-slate-100" : "text-slate-700"
                        }`}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mx-auto mt-14 max-w-2xl text-center">
          <p className="text-base leading-relaxed text-slate-600">
            Every engagement starts with an audit. You&rsquo;ll get a
            measured ROI estimate, a defined scope and a fixed build quote
            before any work begins.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
