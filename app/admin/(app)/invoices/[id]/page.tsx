import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/lib/admin/auth";
import { addInvoiceItem, deleteInvoice, deleteInvoiceItem, markInvoicePaid, updateInvoice } from "@/lib/admin/actions/invoices";
import { INVOICE_STATUSES, OVERDUE, findOption } from "@/lib/admin/constants";
import { formatDate, isOverdue } from "@/lib/admin/format";
import { getRefs } from "@/lib/admin/queries";
import { ActionForm, InlineAction } from "@/components/admin/ActionForm";
import { InvoiceFields, LineItemFields } from "@/components/admin/fields";
import { LineItemsTable } from "@/components/admin/LineItems";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Invoice" };

export default async function InvoicePage({ params }: PageProps<"/admin/invoices/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, clients(id, name), quotes(id, quote_number), invoice_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (!invoice) notFound();

  const [refs, ctx] = await Promise.all([getRefs(), getAdminContext()]);
  const items = [...(invoice.invoice_items ?? [])].sort((a, b) => a.position - b.position);
  const isOwner = ctx.status === "admin" && ctx.role === "owner";

  return (
    <>
      <PageHeader
        title={invoice.invoice_number}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge option={isOverdue(invoice) ? OVERDUE : findOption(INVOICE_STATUSES, invoice.status)} />
            {invoice.clients && (
              <Link href={`/admin/clients/${invoice.clients.id}`} className="text-navy hover:underline">{invoice.clients.name}</Link>
            )}
            <span>{invoice.status === "paid" ? `Paid ${formatDate(invoice.paid_date)}` : `Due ${formatDate(invoice.due_date)}`}</span>
            {invoice.quotes && (
              <Link href={`/admin/quotes/${invoice.quotes.id}`} className="text-navy hover:underline">From {invoice.quotes.quote_number}</Link>
            )}
          </span>
        }
        back={{ href: "/admin/invoices", label: "Invoices" }}
        actions={
          <>
            <ButtonLink href={`/admin/print/invoices/${invoice.id}`} variant="secondary">Print / PDF</ButtonLink>
            {invoice.status !== "paid" && invoice.status !== "void" && (
              <InlineAction action={markInvoicePaid} hidden={{ id: invoice.id }} label="Mark as paid" variant="primary" />
            )}
          </>
        }
      />

      <div className="space-y-6">
        <Card title="Lines">
          <LineItemsTable items={items} vatRate={invoice.vat_rate} removeAction={isOwner ? deleteInvoiceItem : undefined} />
          <div className="mt-6 border-t border-slate-100 pt-4">
            <ActionForm action={addInvoiceItem} submitLabel="Add line" submitVariant="secondary" resetOnSuccess>
              <LineItemFields parentName="invoice_id" parentId={invoice.id} />
            </ActionForm>
          </div>
        </Card>

        <Card title="Invoice details">
          <ActionForm action={updateInvoice} submitLabel="Save changes">
            <InvoiceFields invoice={invoice} clients={refs.clients} projects={refs.projects} />
          </ActionForm>
        </Card>

        {isOwner && (
          <Card title="Danger zone">
            <InlineAction action={deleteInvoice} hidden={{ id: invoice.id }} label="Delete invoice" variant="danger" confirm="Delete this invoice permanently? This can't be undone." />
          </Card>
        )}
      </div>
    </>
  );
}
