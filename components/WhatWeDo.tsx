import Reveal from "./Reveal";
import BeforeAfterFlow from "./BeforeAfterFlow";

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
            className="font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl"
          >
            We find the work that&rsquo;s costing you, and we automate it.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            We don&rsquo;t sell software you have to learn. We build
            automations tailored to how your business already works, connect
            them to the tools you already use, and maintain them so they keep
            running as you grow.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <BeforeAfterFlow />
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-14 text-lg leading-relaxed text-slate-600">
            And sometimes the first thing to fix isn&rsquo;t a process behind
            the scenes — it&rsquo;s the business&rsquo;s front door. We build
            that too.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
