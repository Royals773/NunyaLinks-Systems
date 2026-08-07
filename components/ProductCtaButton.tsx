import { ArrowRight, Mail } from "lucide-react";
import type { ProductCta } from "@/lib/products";
import CopyEmailButton from "./CopyEmailButton";

interface ProductCtaButtonProps {
  cta: ProductCta;
  className?: string;
  /** Which background this renders on — controls the copy-fallback text colour. */
  theme?: "light" | "dark";
}

export default function ProductCtaButton({
  cta,
  className = "",
  theme = "light",
}: ProductCtaButtonProps) {
  const isExternal = cta.type !== "enquire";
  const email = !isExternal
    ? decodeURIComponent(cta.href.replace(/^mailto:/, "").split("?")[0])
    : null;

  return (
    <div className={className}>
      <a
        href={cta.href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-deep"
      >
        {cta.label}
        {isExternal ? (
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Mail className="h-4 w-4" aria-hidden="true" />
        )}
      </a>

      {/* Mailto links silently no-op without a default mail client — this
          fallback lets visitors copy the address instead. */}
      {email && (
        <p
          className={`mt-2 text-center text-xs ${
            theme === "dark" ? "text-slate-300" : "text-slate-500"
          }`}
        >
          {email}{" "}
          <CopyEmailButton
            email={email}
            className={
              theme === "dark"
                ? "text-slate-300 hover:text-white"
                : "text-slate-500 hover:text-teal-deep"
            }
          />
        </p>
      )}
    </div>
  );
}
