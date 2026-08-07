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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2
            id="what-we-build-heading"
            className="text-3xl font-bold tracking-tight text-navy sm:text-4xl"
          >
            What We Build
          </h2>
        </Reveal>

        <ul className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BUILDS.map((item, i) => (
            <Reveal key={item.title} delay={i * 60}>
              <li className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-accent-light">
                  <item.icon
                    className="h-6 w-6 text-accent"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-lg font-semibold text-navy">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
