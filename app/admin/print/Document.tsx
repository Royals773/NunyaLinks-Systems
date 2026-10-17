import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { LineItemsTable } from "@/components/admin/LineItems";
import { ENQUIRIES_EMAIL } from "@/lib/site";
import PrintButton from "./PrintButton";

type Item = { id: string; description: string; quantity: number; unit_price_pence: number };

export default function Document({
  kind,
  number,
  backHref,
  to,
  meta,
  items,
  vatRate,
  notes,
}: {
  kind: "Invoice" | "Quote";
  number: string;
  backHref: string;
  to: { name: string; contact?: string | null; email?: string | null; address?: string | null };
  meta: { label: string; value: ReactNode }[];
  items: Item[];
  vatRate: number;
  notes?: string | null;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 print:max-w-none print:px-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href={backHref} className="text-sm font-medium text-slate-600 hover:text-ink">← Back</Link>
        <PrintButton />
      </div>
      <article className="rounded-xl bg-white p-8 shadow-sm sm:p-12 print:rounded-none print:p-0 print:shadow-none">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-slate-600">{ENQUIRIES_EMAIL}</p>
            <p className="text-sm text-slate-600">nunyalinksystems.com</p>
          </div>
          <div className="sm:text-right">
            <h1 className="text-3xl font-semibold tracking-tight text-ink">{kind}</h1>
            <p className="mt-1 text-sm font-medium text-slate-600">{number}</p>
          </div>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{kind === "Invoice" ? "Bill to" : "Prepared for"}</p>
            <p className="mt-2 font-semibold text-ink">{to.name}</p>
            {to.contact && <p className="text-sm text-slate-700">{to.contact}</p>}
            {to.address && <p className="whitespace-pre-line text-sm text-slate-700">{to.address}</p>}
            {to.email && <p className="text-sm text-slate-700">{to.email}</p>}
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:justify-self-end">
            {meta.map((m) => (
              <div key={m.label} className="contents">
                <dt className="text-slate-500">{m.label}</dt>
                <dd className="text-right font-medium text-ink">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-10">
          <LineItemsTable items={items} vatRate={vatRate} />
        </div>

        {notes && (
          <div className="mt-10 border-t border-slate-200 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{kind === "Invoice" ? "Payment details" : "Notes & terms"}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{notes}</p>
          </div>
        )}
      </article>
    </div>
  );
}
