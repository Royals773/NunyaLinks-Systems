import Link from "next/link";
import { Check } from "lucide-react";
import type { Product } from "@/lib/products";
import ProductStatusBadge from "./ProductStatusBadge";
import ProductCtaButton from "./ProductCtaButton";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  return (
    <li
      className={`flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal-deep text-sm font-bold text-white"
          aria-hidden="true"
        >
          {product.monogram}
        </div>
        <ProductStatusBadge status={product.status} label={product.statusLabel} />
      </div>

      <h3 className="mt-4 text-xl font-bold text-teal-deep">
        <Link
          href={`/products/${product.slug}`}
          className="hover:text-teal"
        >
          {product.name}
        </Link>
      </h3>
      <p className="mt-1 text-sm font-medium text-teal">{product.tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {product.description}
      </p>

      <ul className="mt-4 space-y-2">
        {product.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-slate-700"
          >
            <Check
              className="mt-0.5 h-4 w-4 shrink-0 text-teal"
              aria-hidden="true"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-teal-deep">
          {product.pricing.summary}
        </p>
      </div>

      {/*
        Deliberately always stacked, not "sm:flex-row" — this card's
        rendered width comes from a parent flex-basis calc(), not the
        viewport, so a viewport breakpoint here can fire while the card
        itself is still too narrow for two side-by-side buttons.
      */}
      <div className="mt-5 flex flex-col gap-3">
        <ProductCtaButton cta={product.cta} />
        <Link
          href={`/products/${product.slug}`}
          className="inline-flex items-center justify-center rounded-md border border-teal px-5 py-3 text-sm font-semibold text-teal transition-colors hover:bg-teal-light"
        >
          Learn more
        </Link>
      </div>
    </li>
  );
}
