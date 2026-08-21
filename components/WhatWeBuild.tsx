import {
  Inbox,
  BellRing,
  UserCheck,
  RefreshCw,
  BarChart3,
  Globe,
} from "lucide-react";
import Reveal from "./Reveal";

const LEAD = {
  icon: Inbox,
  title: "Enquiry and lead handling",
  description:
    "Where most engagements start: capture, sort and respond automatically so nothing's missed. Once this is running, everything else connects to it.",
};

const CONNECTED = [
  {
    icon: BellRing,
    title: "Payments and reminders",
    description:
      "Automatic reminders for payments, renewals, documents and deadlines.",
  },
  {
    icon: UserCheck,
    title: "Staff and customer onboarding",
    description: "Consistent, hands-off sequences that never skip a step.",
  },
  {
    icon: RefreshCw,
    title: "Records and data sync",
    description: "Keep info updated across apps without re-entry.",
  },
  {
    icon: BarChart3,
    title: "Reporting and alerts",
    description: "Automatic dashboards and alerts, no chasing.",
  },
  {
    icon: Globe,
    title: "Websites that feed your automations",
    description:
      "Mobile-first sites that capture enquiries and route them straight into your systems.",
  },
];

export default function WhatWeBuild() {
  return (
    <section
      id="what-we-build"
      aria-labelledby="what-we-build-heading"
      className="bg-slate-50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <h2
            id="what-we-build-heading"
            className="font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl"
          >
            What We Build
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Six capabilities, one connected system — each one feeds the
            others rather than working in isolation.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[1fr_1px_1fr]">
          <Reveal>
            <div className="flex h-full flex-col rounded-2xl border border-ink/10 bg-white p-8">
              <span className="font-display text-sm font-semibold text-accent">
                Start here
              </span>
              <LEAD.icon
                className="mt-5 h-8 w-8 text-ink"
                aria-hidden="true"
              />
              <h3 className="font-display mt-4 text-2xl font-semibold text-navy">
                {LEAD.title}
              </h3>
              <p className="mt-3 max-w-sm text-base leading-relaxed text-slate-600">
                {LEAD.description}
              </p>
              <div className="mt-auto border-t border-ink/10 pt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Feeds directly into
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-ink">
                  Payments
                  <span className="text-accent"> · </span>
                  Onboarding
                  <span className="text-accent"> · </span>
                  Records
                  <span className="text-accent"> · </span>
                  Reporting
                  <span className="text-accent"> · </span>
                  Your website
                </p>
              </div>
            </div>
          </Reveal>

          <div
            aria-hidden="true"
            className="hidden bg-ink/10 lg:block"
          />

          <Reveal delay={60}>
            <ul className="divide-y divide-ink/10 border-t border-ink/10 lg:border-t-0">
              {CONNECTED.map((item) => (
                <li key={item.title} className="flex items-start gap-4 py-5">
                  <item.icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-base font-semibold text-navy">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
