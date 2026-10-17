import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/admin/format";
import Document from "../../Document";

export const metadata = { title: "Print invoice" };

export default async function PrintInvoicePage({ params }: PageProps<"/admin/print/invoices/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, clients(name, contact_name, email, address), invoice_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (!invoice || !invoice.clients) notFound();

  const items = [...(invoice.invoice_items ?? [])].sort((a, b) => a.position - b.position);
  return (
    <Document
      kind="Invoice"
      number={invoice.invoice_number}
      backHref={`/admin/invoices/${invoice.id}`}
      to={{ name: invoice.clients.name, contact: invoice.clients.contact_name, email: invoice.clients.email, address: invoice.clients.address }}
      meta={[
        { label: "Issue date", value: formatDate(invoice.issue_date) },
        { label: "Due date", value: formatDate(invoice.due_date) },
        ...(invoice.status === "paid" ? [{ label: "Paid", value: formatDate(invoice.paid_date) }] : []),
      ]}
      items={items}
      vatRate={invoice.vat_rate}
      notes={invoice.notes}
    />
  );
}
