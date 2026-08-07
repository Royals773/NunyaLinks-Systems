import type { Metadata } from "next";
import { PRODUCTS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Products — NunyaLink Systems",
  description:
    "SaaS products built and sold by NunyaLink Systems for SMEs and community organisations.",
};

export default function ProductsPage() {
  return (
    <main className="flex-1">
      <section className="bg-teal-deep py-20 text-white sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-bright">
              NunyaLink Systems
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Products
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-200">
              Alongside bespoke automations and websites, we build and sell
              standalone SaaS products — software your business (or
              community) can put to work directly.
            </p>
          </Reveal>
        </div>
      </section>

      <section
        aria-label="All products"
        className="bg-slate-50 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {PRODUCTS.length > 0 ? (
            // Flex-wrap + fixed card widths (not a strict grid) so a
            // single product centers cleanly instead of leaving a big
            // empty column — and still wraps into rows as more are added.
            <ul className="flex flex-wrap justify-center gap-6">
              {PRODUCTS.map((product, i) => (
                <Reveal
                  key={product.slug}
                  delay={i * 60}
                  className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
                >
                  <ProductCard product={product} className="h-full" />
                </Reveal>
              ))}
            </ul>
          ) : (
            <p className="text-center text-slate-600">
              We&rsquo;re building our first product — check back soon.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
