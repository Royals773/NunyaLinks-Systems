import Link from "next/link";
import type { ReactNode } from "react";
import type { Option, Tone } from "@/lib/admin/constants";

const TONES: Record<Tone, string> = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  teal: "bg-teal-light text-teal-deep ring-teal/20",
};

export function Badge({ option, fallback }: { option?: Option; fallback?: string }) {
  const tone = option?.tone ?? "slate";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONES[tone]}`}
    >
      {option?.label ?? fallback ?? "—"}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="text-sm font-medium text-slate-500 hover:text-ink">
            ← {back.label}
          </Link>
        )}
        <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {description && <div className="mt-1 text-sm text-slate-600">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  actions,
  children,
  className = "",
}: {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          {title && <h2 className="text-sm font-semibold text-ink">{title}</h2>}
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint, href }: { label: string; value: ReactNode; hint?: string; href?: string }) {
  const body = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </>
  );
  const cls = "block rounded-xl border border-slate-200 bg-white p-5";
  return href ? (
    <Link href={href} className={`${cls} transition-colors hover:border-slate-300`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link href={href} className={buttonClass(variant)}>
      {children}
    </Link>
  );
}

export function buttonClass(variant: "primary" | "secondary" | "danger" = "primary") {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  if (variant === "secondary") return `${base} border border-slate-300 bg-white text-ink hover:bg-slate-50`;
  if (variant === "danger") return `${base} border border-red-200 bg-white text-red-700 hover:bg-red-50`;
  return `${base} bg-ink text-white hover:bg-navy`;
}

export const inputClass =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-ink shadow-sm placeholder:text-slate-400 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20";

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Select({
  id,
  name,
  options,
  defaultValue,
  includeBlank,
}: {
  id: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string | null;
  includeBlank?: string;
}) {
  return (
    <select id={id} name={name} defaultValue={defaultValue ?? ""} className={inputClass}>
      {includeBlank !== undefined && <option value="">{includeBlank}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-slate-500">{children}</p>;
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {head.map((h) => (
              <th
                key={h}
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`whitespace-nowrap px-4 py-3 text-slate-700 ${className}`}>{children}</td>;
}

export function DetailList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</dt>
          <dd className="mt-1 break-words text-sm text-ink">{item.value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function FilterTabs({
  base,
  current,
  options,
}: {
  base: string;
  current?: string;
  options: { value: string; label: string }[];
}) {
  const all = [{ value: "", label: "All" }, ...options];
  return (
    <nav aria-label="Filter" className="mb-4 flex flex-wrap gap-2">
      {all.map((o) => {
        const active = (current ?? "") === o.value;
        return (
          <Link
            key={o.value || "all"}
            href={o.value ? `${base}?status=${o.value}` : base}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              active ? "bg-ink text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-ink"
            }`}
          >
            {o.label}
          </Link>
        );
      })}
    </nav>
  );
}
