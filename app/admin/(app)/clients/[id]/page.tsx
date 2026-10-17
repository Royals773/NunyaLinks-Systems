import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/lib/admin/auth";
import { deleteClientRecord, updateClientRecord } from "@/lib/admin/actions/clients";
import { CLIENT_STATUSES, INVOICE_STATUSES, OVERDUE, PROJECT_STATUSES, QUOTE_STATUSES, findOption } from "@/lib/admin/constants";
import { formatDate, formatMoney, isOverdue, totals } from "@/lib/admin/format";
import { ActionForm, InlineAction } from "@/components/admin/ActionForm";
import { ClientFields } from "@/components/admin/fields";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Client" };

export default async function ClientPage({ params }: PageProps<"/admin/clients/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: client } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  if (!client) notFound();

  const [{ data: projects }, { data: quotes }, { data: invoices }, ctx] = await Promise.all([
    supabase.from("projects").select("id, name, status, due_date").eq("client_id", id).order("created_at", { ascending: false }),
    supabase.from("quotes").select("id, quote_number, title, status").eq("client_id", id).order("created_at", { ascending: false }),
    supabase
      .from("invoices")
      .select("id, invoice_number, status, due_date, vat_rate, invoice_items(quantity, unit_price_pence)")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    getAdminContext(),
  ]);

  const billed = (invoices ?? []).filter((i) => i.status !== "void" && i.status !== "draft");
  const paid = billed.filter((i) => i.status === "paid").reduce((s, i) => s + totals(i.invoice_items ?? [], i.vat_rate).total, 0);
  const owed = billed.filter((i) => i.status === "sent").reduce((s, i) => s + totals(i.invoice_items ?? [], i.vat_rate).total, 0);

  return (
    <>
      <PageHeader
        title={client.name}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge option={findOption(CLIENT_STATUSES, client.status)} />
            <span>Paid to date {formatMoney(paid)}</span>
            {owed > 0 && <span className="font-semibold text-amber-700">Owed {formatMoney(owed)}</span>}
            {client.lead_id && (
              <Link href={`/admin/leads/${client.lead_id}`} className="text-navy hover:underline">Original enquiry</Link>
            )}
          </span>
        }
        back={{ href: "/admin/clients", label: "Clients" }}
        actions={
          <>
            <ButtonLink href={`/admin/projects/new?client=${client.id}`} variant="secondary">New project</ButtonLink>
            <ButtonLink href={`/admin/quotes/new?client=${client.id}`} variant="secondary">New quote</ButtonLink>
            <ButtonLink href={`/admin/invoices/new?client=${client.id}`}>New invoice</ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
        <Card title="Client details">
          <ActionForm action={updateClientRecord} submitLabel="Save changes">
            <ClientFields client={client} />
          </ActionForm>
        </Card>

        <div className="space-y-6">
          <Card title="Projects">
            {projects?.length ? (
              <ul className="space-y-2">
                {projects.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                    <Link href={`/admin/projects/${p.id}`} className="truncate font-medium text-ink hover:underline">{p.name}</Link>
                    <Badge option={findOption(PROJECT_STATUSES, p.status)} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No projects yet.</p>
            )}
          </Card>

          <Card title="Quotes">
            {quotes?.length ? (
              <ul className="space-y-2">
                {quotes.map((q) => (
                  <li key={q.id} className="flex items-center justify-between gap-2 text-sm">
                    <Link href={`/admin/quotes/${q.id}`} className="truncate font-medium text-ink hover:underline">{q.quote_number} · {q.title}</Link>
                    <Badge option={findOption(QUOTE_STATUSES, q.status)} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No quotes yet.</p>
            )}
          </Card>

          <Card title="Invoices">
            {invoices?.length ? (
              <ul className="space-y-2">
                {invoices.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-2 text-sm">
                    <Link href={`/admin/invoices/${inv.id}`} className="truncate font-medium text-ink hover:underline">
                      {inv.invoice_number} · {formatMoney(totals(inv.invoice_items ?? [], inv.vat_rate).total)}
                    </Link>
                    <Badge option={isOverdue(inv) ? OVERDUE : findOption(INVOICE_STATUSES, inv.status)} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No invoices yet.</p>
            )}
            {invoices && invoices.length > 0 && (
              <p className="mt-3 text-xs text-slate-500">Latest due {formatDate(invoices[0].due_date)}</p>
            )}
          </Card>

          {ctx.status === "admin" && ctx.role === "owner" && (
            <Card title="Danger zone">
              <InlineAction
                action={deleteClientRecord}
                hidden={{ id: client.id }}
                label="Delete client"
                variant="danger"
                confirm="Delete this client permanently? This can't be undone."
              />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
