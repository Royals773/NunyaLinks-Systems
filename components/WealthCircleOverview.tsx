import { Wallet, HandCoins, Users, ShieldCheck } from "lucide-react";
import { PRODUCTS } from "@/lib/products";

const CAPABILITY_ICONS = [Wallet, HandCoins, Users, ShieldCheck];

interface WealthCircleOverviewProps {
  className?: string;
  /** Omits the capability tags for tight spaces (e.g. card thumbnails). */
  compact?: boolean;
}

/**
 * Code-native stand-in for real WealthCircle product photography — an
 * app-window treatment in WealthCircle's own teal identity, surfacing
 * capabilities already published in lib/products.ts rather than
 * presenting as a screenshot or apologising for the absence of one.
 * Swap for real product screenshots once captured; nothing else on the
 * pages that render this needs to change when that happens.
 */
export default function WealthCircleOverview({
  className = "",
  compact = false,
}: WealthCircleOverviewProps) {
  const product = PRODUCTS.find((p) => p.slug === "wealthcircle");
  if (!product) return null;

  const capabilities = product.detailFeatures.slice(0, 4);

  return (
    <div
      aria-hidden="true"
      className={`relative flex flex-col items-center justify-center gap-1.5 overflow-hidden bg-teal-deep px-6 py-6 text-center ${className}`}
    >
      <div className="absolute left-4 top-4 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-teal-bright">
        WealthCircle product overview
      </p>
      <p className="font-display text-lg font-semibold text-white sm:text-xl">
        {product.name}
      </p>

      {!compact && (
        <ul className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
          {capabilities.map((feature, i) => {
            const Icon = CAPABILITY_ICONS[i] ?? Wallet;
            return (
              <li
                key={feature.title}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-teal-light"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {feature.title}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
