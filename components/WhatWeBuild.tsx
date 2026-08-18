import {
  Inbox,
  BellRing,
  UserCheck,
  RefreshCw,
  BarChart3,
  Globe,
} from "lucide-react";
import Reveal from "./Reveal";

const BUILDS = [
  {
    icon: Inbox,
    title: "Enquiry and lead handling",
    description:
      "Capture, sort and respond automatically so nothing's missed.",
  },
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
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2
            id="what-we-build-heading"
            className="font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl"
          >
            What We Build
          </h2>
        </Reveal>

        <ul className="mx-auto mt-14 grid grid-cols-1 gap-x-10 gap-y-9 lg:grid-cols-2">
          {BUILDS.map((item, i) => (
            <Reveal key={item.title} delay={i * 50}>
              <li className="flex items-start gap-4 border-t border-slate-200 pt-6">
                <item.icon
                  className="mt-0.5 h-6 w-6 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-lg font-semibold text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
