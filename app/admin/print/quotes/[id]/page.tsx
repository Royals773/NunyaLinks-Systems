import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/admin/format";
import Document from "../../Document";

export const metadata = { title: "Print quote" };

export default async function PrintQuotePage({ params }: PageProps<"/admin/print/quotes/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: quote } = await supabase
    .from("quotes")
    .select("*, clients(name, contact_name, email, address), leads(full_name, business_name, email, location), quote_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (!quote) notFound();

  const to = quote.clients
    ? { name: quote.clients.name, contact: quote.clients.contact_name, email: quote.clients.email, address: quote.clients.address }
    : quote.leads
      ? { name: quote.leads.business_name ?? quote.leads.full_name, contact: quote.leads.business_name ? quote.leads.full_name : null, email: quote.leads.email, address: quote.leads.location }
      : { name: "—" };
  const items = [...(quote.quote_items ?? [])].sort((a, b) => a.position - b.position);

  return (
    <Document
      kind="Quote"
      number={`${quote.quote_number} · ${quote.title}`}
      backHref={`/admin/quotes/${quote.id}`}
      to={to}
      meta={[
        { label: "Date", value: formatDate(quote.issue_date) },
        { label: "Valid until", value: formatDate(quote.valid_until) },
      ]}
      items={items}
      vatRate={quote.vat_rate}
      notes={quote.notes}
    />
  );
}
