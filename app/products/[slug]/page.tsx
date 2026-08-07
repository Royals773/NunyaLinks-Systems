import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImageOff } from "lucide-react";
import { PRODUCTS, getProductBySlug } from "@/lib/products";
import ProductStatusBadge from "@/components/ProductStatusBadge";
import ProductCtaButton from "@/components/ProductCtaButton";
import Reveal from "@/components/Reveal";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  return {
    title: `${product.name} — NunyaLink Systems`,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="flex-1">
      <section className="bg-teal-deep py-16 text-white sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All products
            </Link>

            <div className="mt-6 flex items-start justify-between gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-teal text-lg font-bold text-white"
                aria-hidden="true"
              >
                {product.monogram}
              </div>
              <ProductStatusBadge
                status={product.status}
                label={product.statusLabel}
              />
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-2 text-base font-medium text-teal-bright">
              {product.eyebrow}
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-200">
              {product.tagline}
            </p>

            <ProductCtaButton cta={product.cta} className="mt-8" theme="dark" />
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal className="space-y-4">
            {product.longDescription.map((paragraph) => (
              <p
                key={paragraph}
                className="text-lg leading-relaxed text-slate-600"
              >
                {paragraph}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      {product.screenshots && product.screenshots.length > 0 ? (
        <section className="bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {product.screenshots.map((shot) => (
                // eslint-disable-next-line @next/next/no-img-element -- product screenshots come from an external product, not site-owned static assets
                <img
                  key={shot.src}
                  src={shot.src}
                  alt={shot.alt}
                  className="w-full rounded-lg border border-slate-200 shadow-sm"
                />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section
          aria-label="Product screenshots"
          className="bg-slate-50 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-slate-400">
              <ImageOff className="h-8 w-8" aria-hidden="true" />
              <p className="mt-3 text-sm">Screenshots coming soon.</p>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-teal-deep sm:text-3xl">
              Key features
            </h2>
          </Reveal>

          <ul className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
            {product.detailFeatures.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 60}>
                <li className="h-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-semibold text-teal-deep">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {product.howItWorks && product.howItWorks.length > 0 && (
        <section className="bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-teal-deep sm:text-3xl">
                How it works
              </h2>
            </Reveal>

            <ol className="mx-auto mt-10 max-w-2xl space-y-7">
              {product.howItWorks.map((step, i) => (
                <Reveal key={step.title} delay={i * 70}>
                  <li className="flex gap-4">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold text-white"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </div>
                    <div className="pt-0.5">
                      <h3 className="text-base font-semibold text-teal-deep">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {step.description}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {product.builtFor && product.builtFor.length > 0 && (
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <Reveal>
              <h2 className="text-2xl font-bold tracking-tight text-teal-deep sm:text-3xl">
                Who it&rsquo;s for
              </h2>
              <ul className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3">
                {product.builtFor.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-teal-deep"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      )}

      <section className="bg-teal-deep py-16 text-white sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Pricing
            </h2>
            <p className="mt-4 text-lg font-semibold text-teal-bright">
              {product.pricing.summary}
            </p>
            {product.pricing.note && (
              <p className="mt-2 text-slate-200">{product.pricing.note}</p>
            )}

            {product.pricing.includes && (
              <ul className="mx-auto mt-8 max-w-md space-y-2.5 text-left">
                {product.pricing.includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-slate-200"
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-bright"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            )}

            <ProductCtaButton cta={product.cta} className="mt-10" theme="dark" />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
