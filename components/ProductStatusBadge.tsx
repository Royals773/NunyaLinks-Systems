import type { ProductStatus } from "@/lib/products";

const STATUS_STYLES: Record<ProductStatus, string> = {
  live: "bg-teal text-white",
  beta: "border border-teal-bright/60 bg-teal-light text-teal-deep",
  "coming-soon": "border border-slate-200 bg-slate-100 text-slate-500",
};

const DEFAULT_LABELS: Record<ProductStatus, string> = {
  live: "Live",
  beta: "Beta",
  "coming-soon": "Coming soon",
};

interface ProductStatusBadgeProps {
  status: ProductStatus;
  label?: string;
  className?: string;
}

export default function ProductStatusBadge({
  status,
  label,
  className = "",
}: ProductStatusBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[status]} ${className}`}
    >
      {label ?? DEFAULT_LABELS[status]}
    </span>
  );
}
