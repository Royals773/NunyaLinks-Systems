import { CheckCircle2 } from "lucide-react";
import Reveal from "./Reveal";

const CAPABILITIES = [
  "Capture and route every enquiry instantly",
  "Send payment and document reminders automatically",
  "Onboard a new staff member or client hands-off",
  "Keep records synced across systems",
  "Send the reports and alerts that used to require chasing",
];

export default function WhatWeDo() {
  return (
    <section
      id="what-we-do"
      aria-labelledby="what-we-do-heading"
      className="bg-white py-20 sm:py-28"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2
            id="what-we-do-heading"
            className="text-3xl font-bold tracking-tight text-navy sm:text-4xl"
          >
            We find the work that&rsquo;s costing you, and we automate it.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            We don&rsquo;t sell software you have to learn. We build
            automations tailored to how your business already works, connect
            them to the tools you already use, and maintain them so they keep
            running as you grow.
          </p>

          <ul className="mt-8 space-y-4">
            {CAPABILITIES.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <span className="text-base leading-relaxed text-slate-700">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-lg leading-relaxed text-slate-600">
            And when a business needs a professional front door — a
            mobile-first website that captures enquiries and feeds them
            straight into your automations — we build that too.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
