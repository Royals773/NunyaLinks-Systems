import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { WORK_ITEMS, getWorkBySlug } from "@/lib/work";
import { getProductBySlug } from "@/lib/products";
import Reveal from "@/components/Reveal";
import WorkflowStrip from "@/components/work/WorkflowStrip";
import MediaPlaceholder from "@/components/MediaPlaceholder";
import WealthCircleOverview from "@/components/WealthCircleOverview";

export function generateStaticParams() {
  return WORK_ITEMS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = getWorkBySlug(slug);
  if (!item) return {};

  return {
    title: `${item.name} — Selected Work — NunyaLink Systems`,
    description: item.summary,
  };
}

export default async function WorkDetailPage({
  params,
}: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const item = getWorkBySlug(slug);
  if (!item) notFound();

  const productSlug = item.productHref?.split("/").filter(Boolean).pop();
  const product = productSlug ? getProductBySlug(productSlug) : undefined;

  return (
    <main id="main-content" className="flex-1">
      {/* Hero */}
      <section className="bg-navy py-16 text-white sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <Link
              href="/work"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Selected Work
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-light">
                {item.type}
              </span>
              <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                {item.statusLabel}
              </span>
            </div>

            <h1 className="font-display mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              {item.name}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-200">
              {item.tagline}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-slate-100"
              >
                Book a Free Opportunity Review
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {item.productHref && (
                <Link
                  href={item.productHref}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  See the {item.name} product page
                </Link>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* At a glance */}
      <section aria-label="At a glance" className="bg-slate-50 py-12 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-6 border-y border-slate-200 py-6 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Status
                </dt>
                <dd className="mt-1.5 text-base font-semibold text-navy">
                  {item.statusLabel}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Built for
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-slate-700">
                  {product?.builtFor?.join(", ") ?? item.type}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Designed to
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-slate-700">
                  {product?.tagline ?? item.tagline}
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      {/* The problem */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              The problem
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              {item.problem.intro}
            </p>
            <ul className="mt-6 space-y-3">
              {item.problem.points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"
                    aria-hidden="true"
                  />
                  <span className="text-base leading-relaxed text-slate-600">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-base font-medium leading-relaxed text-navy">
              {item.problem.closing}
            </p>
          </Reveal>
        </div>
      </section>

      {/* The system */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              The system
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              {item.system.intro}
            </p>
            <ul className="mt-6 space-y-3">
              {item.system.capabilities.map((capability) => (
                <li key={capability} className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <span className="text-base leading-relaxed text-slate-700">
                    {capability}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-5">
              <ShieldCheck
                className="mt-0.5 h-5 w-5 shrink-0 text-navy"
                aria-hidden="true"
              />
              <p className="text-sm leading-relaxed text-slate-600">
                {item.system.boundary}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              How it works
            </p>
            <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
              The operational journey
            </h2>
          </Reveal>
          <div className="mt-12">
            <WorkflowStrip steps={item.howItWorks} />
          </div>
        </div>
      </section>

      {/* Product interface */}
      <section
        aria-label="Product interface"
        className="bg-slate-50 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              Product interface
            </p>
            <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
              What it looks like
            </h2>
            <p className="mt-3 text-base text-slate-600">
              An overview of {item.name}, and the views a group&rsquo;s
              committee works from day to day.
            </p>
          </Reveal>

          <Reveal delay={40} className="mx-auto mt-10 max-w-md">
            {item.slug === "wealth-circle" ? (
              <WealthCircleOverview className="rounded-lg" />
            ) : (
              <MediaPlaceholder label={item.name} className="rounded-lg py-16" />
            )}
          </Reveal>

          <Reveal delay={80}>
            <ul className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {item.recommendedScreenshots.map((label) => (
                <li key={label} className="flex items-start gap-2.5 text-left">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-relaxed text-slate-700">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* What this demonstrates */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              What this demonstrates
            </p>
            <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
              The capability behind the product
            </h2>
          </Reveal>

          <ul className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
            {item.demonstrates.map((theme) => (
              <li key={theme.title} className="border-t border-slate-200 pt-5">
                <h3 className="text-base font-semibold leading-snug text-navy">
                  {theme.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {theme.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Technology */}
      <section className="bg-slate-50 py-12 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal className="flex items-start gap-3 text-left">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-slate-500">
              <span className="font-medium text-slate-600">Technology: </span>
              {item.technology.note}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-navy py-16 text-center text-white sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Have a process like this to fix?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-200">
              A free Automation Opportunity Review looks at your actual
              process and identifies what&rsquo;s worth investigating first.
            </p>
            <Link
              href="/#contact"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-md bg-white px-7 py-3.5 text-base font-semibold text-navy transition-colors hover:bg-slate-100"
            >
              Book a Free Opportunity Review
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
