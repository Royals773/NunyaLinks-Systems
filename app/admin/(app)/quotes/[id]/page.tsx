import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/lib/admin/auth";
import { addQuoteItem, convertQuoteToInvoice, deleteQuote, deleteQuoteItem, updateQuote } from "@/lib/admin/actions/quotes";
import { QUOTE_STATUSES, findOption } from "@/lib/admin/constants";
import { formatDate } from "@/lib/admin/format";
import { getRefs } from "@/lib/admin/queries";
import { ActionForm, InlineAction } from "@/components/admin/ActionForm";
import { LineItemFields, QuoteFields } from "@/components/admin/fields";
import { LineItemsTable } from "@/components/admin/LineItems";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Quote" };

export default async function QuotePage({ params }: PageProps<"/admin/quotes/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: quote } = await supabase
    .from("quotes")
    .select("*, clients(id, name), leads(id, full_name, business_name), quote_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (!quote) notFound();

  const [refs, ctx, { data: invoices }] = await Promise.all([
    getRefs(),
    getAdminContext(),
    supabase.from("invoices").select("id, invoice_number").eq("quote_id", id),
  ]);
  // Keep the currently linked lead selectable even if it's since become a client.
  const leads = quote.leads && !refs.leads.some((l) => l.id === quote.leads!.id)
    ? [...refs.leads, { id: quote.leads.id, name: quote.leads.full_name }]
    : refs.leads;
  const items = [...(quote.quote_items ?? [])].sort((a, b) => a.position - b.position);
  const isOwner = ctx.status === "admin" && ctx.role === "owner";
  const recipient = quote.clients
    ? <Link href={`/admin/clients/${quote.clients.id}`} className="text-navy hover:underline">{quote.clients.name}</Link>
    : quote.leads
      ? <Link href={`/admin/leads/${quote.leads.id}`} className="text-navy hover:underline">{quote.leads.business_name ?? quote.leads.full_name} (lead)</Link>
      : null;

  return (
    <>
      <PageHeader
        title={`${quote.quote_number} · ${quote.title}`}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge option={findOption(QUOTE_STATUSES, quote.status)} />
            {recipient}
            <span>Issued {formatDate(quote.issue_date)}</span>
          </span>
        }
        back={{ href: "/admin/quotes", label: "Quotes" }}
        actions={
          <>
            <ButtonLink href={`/admin/print/quotes/${quote.id}`} variant="secondary">Print / PDF</ButtonLink>
            <ButtonLink href={`/admin/documents/new?kind=proposal&quote=${quote.id}`} variant="secondary">Create proposal</ButtonLink>
            <ButtonLink href={`/admin/documents/new?kind=contract&quote=${quote.id}`} variant="secondary">Create contract</ButtonLink>
            {invoices?.length ? (
              <ButtonLink href={`/admin/invoices/${invoices[0].id}`}>Open {invoices[0].invoice_number}</ButtonLink>
            ) : (
              <InlineAction action={convertQuoteToInvoice} hidden={{ id: quote.id }} label="Create invoice from quote" variant="primary" />
            )}
          </>
        }
      />

      <div className="space-y-6">
        <Card title="Lines">
          <LineItemsTable items={items} vatRate={quote.vat_rate} removeAction={isOwner ? deleteQuoteItem : undefined} />
          <div className="mt-6 border-t border-slate-100 pt-4">
            <ActionForm action={addQuoteItem} submitLabel="Add line" submitVariant="secondary" resetOnSuccess>
              <LineItemFields parentName="quote_id" parentId={quote.id} />
            </ActionForm>
          </div>
        </Card>

        <Card title="Quote details">
          <ActionForm action={updateQuote} submitLabel="Save changes">
            <QuoteFields quote={quote} clients={refs.clients} leads={leads} projects={refs.projects} />
          </ActionForm>
        </Card>

        {isOwner && (
          <Card title="Danger zone">
            <InlineAction action={deleteQuote} hidden={{ id: quote.id }} label="Delete quote" variant="danger" confirm="Delete this quote permanently? This can't be undone." />
          </Card>
        )}
      </div>
    </>
  );
}
