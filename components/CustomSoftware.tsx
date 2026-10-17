import Link from "next/link";
import { ArrowRight, Layers, Code2, UsersRound, Check } from "lucide-react";
import Reveal from "./Reveal";
import { getProductBySlug } from "@/lib/products";

// Custom software and SaaS — the third service line alongside automations
// and websites. The proof card pulls from lib/products.ts so product facts
// live in one place.

const OFFERINGS = [
  {
    icon: Layers,
    title: "Industry SaaS platforms",
    description:
      "Subscription software built for one type of business and the way it actually works — its workflows, its compliance and its clients.",
  },
  {
    icon: Code2,
    title: "Bespoke business software",
    description:
      "Internal systems built around your processes when off-the-shelf tools force you to work around them.",
  },
  {
    icon: UsersRound,
    title: "Client and customer portals",
    description:
      "Secure spaces where your clients can upload documents, see progress and get updates without chasing you by email.",
  },
];

const PROOF_SLUG = "nl-business-os";

export default function CustomSoftware() {
  const proof = getProductBySlug(PROOF_SLUG);

  return (
    <section
      id="software"
      aria-labelledby="software-heading"
      className="bg-white py-14 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Software &amp; SaaS
          </p>
          <h2
            id="software-heading"
            className="font-display mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl"
          >
            When the right tool doesn&rsquo;t exist, we build it.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Some problems need more than an automation. We design and build
            custom software and SaaS platforms — from a system for your own
            team to a product an entire industry can subscribe to.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <Reveal>
            <ul className="divide-y divide-ink/10 border-y border-ink/10">
              {OFFERINGS.map((item) => (
                <li key={item.title} className="flex items-start gap-4 py-6">
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
            <a
              href="#contact"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30 hover:bg-slate-50 sm:w-auto"
            >
              Talk to us about your software idea
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Reveal>

          {proof && (
            <Reveal delay={60}>
              <div className="flex h-full flex-col rounded-2xl bg-navy p-8 text-white sm:p-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">
                  Built by NunyaLink
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 font-display text-sm font-semibold"
                  >
                    {proof.monogram}
                  </span>
                  <h3 className="font-display text-2xl font-semibold">
                    {proof.name}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-slate-300">{proof.eyebrow}</p>
                <p className="mt-5 text-base leading-relaxed text-slate-200">
                  {proof.description}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {proof.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-slate-100"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row">
                  <Link
                    href={`/products/${proof.slug}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-slate-100"
                  >
                    See {proof.name}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <a
                    href={proof.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    {proof.cta.label}
                  </a>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
