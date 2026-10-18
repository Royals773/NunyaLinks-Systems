import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import MarkdownView from "@/components/admin/MarkdownView";
import { formatDate } from "@/lib/admin/format";
import PrintButton from "../../PrintButton";

export const metadata = { title: "Print document" };

export default async function PrintDocumentPage({ params }: PageProps<"/admin/print/documents/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: doc }, { data: business }] = await Promise.all([
    supabase.from("documents").select("id, kind, doc_number, title, body, updated_at").eq("id", id).maybeSingle(),
    supabase.from("business_settings").select("*").maybeSingle(),
  ]);
  if (!doc) notFound();

  const footer = [
    business?.legal_name && business.legal_name !== business.trading_name
      ? `${business.trading_name ?? "NunyaLink Systems"} is a trading name of ${business.legal_name}`
      : business?.trading_name ?? "NunyaLink Systems",
    business?.company_number && `Company no. ${business.company_number}`,
    business?.vat_number && `VAT no. ${business.vat_number}`,
    business?.address?.replace(/\n+/g, ", "),
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-[52rem] px-4 print:max-w-none print:px-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href={`/admin/documents/${doc.id}`} className="text-sm font-medium text-slate-600 hover:text-ink">← Back to editor</Link>
        <PrintButton />
      </div>

      <article className="overflow-hidden rounded-xl bg-white shadow-sm print:rounded-none print:shadow-none">
        <header className="flex items-start justify-between gap-6 bg-ink px-8 py-7 text-white sm:px-12 print:px-0 print:[-webkit-print-color-adjust:exact] print:[print-color-adjust:exact]">
          <div className="print:pl-8">
            <Logo variant="light" />
            <p className="mt-3 text-sm text-slate-300">
              {[business?.email, business?.phone, business?.website].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="text-right print:pr-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">
              {doc.kind === "proposal" ? "Proposal" : "Agreement"}
            </p>
            <p className="mt-1 text-sm font-medium">{doc.doc_number}</p>
            <p className="text-xs text-slate-400">{formatDate(doc.updated_at)}</p>
          </div>
        </header>
        <div className="h-1 bg-accent print:[-webkit-print-color-adjust:exact] print:[print-color-adjust:exact]" />

        <div className="px-8 py-10 sm:px-12 print:px-0 print:py-8">
          <MarkdownView body={doc.body} />
        </div>

        <footer className="border-t border-slate-200 px-8 py-5 text-center text-xs text-slate-500 sm:px-12 print:px-0">
          {footer.join(" · ")}
        </footer>
      </article>
      <p className="mt-3 text-center text-xs text-slate-500 print:hidden">
        Tip: in the print dialog choose &ldquo;Save as PDF&rdquo; and turn on &ldquo;Background graphics&rdquo; to keep the branded header.
      </p>
    </div>
  );
}
