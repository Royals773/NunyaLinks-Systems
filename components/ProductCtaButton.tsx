import { ArrowRight, Mail } from "lucide-react";
import type { ProductCta } from "@/lib/products";

interface ProductCtaButtonProps {
  cta: ProductCta;
  className?: string;
}

export default function ProductCtaButton({
  cta,
  className = "",
}: ProductCtaButtonProps) {
  const isExternal = cta.type !== "enquire";

  return (
    <a
      href={cta.href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-teal px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-deep ${className}`}
    >
      {cta.label}
      {isExternal ? (
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Mail className="h-4 w-4" aria-hidden="true" />
      )}
    </a>
  );
}
