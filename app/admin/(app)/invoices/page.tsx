import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { INVOICE_STATUSES, OVERDUE, findOption } from "@/lib/admin/constants";
import { formatDate, formatMoney, isOverdue, totals } from "@/lib/admin/format";
import { firstParam } from "@/lib/admin/queries";
import { Badge, ButtonLink, EmptyState, FilterTabs, PageHeader, Table, Td } from "@/components/admin/ui";

export const metadata = { title: "Invoices" };

export default async function InvoicesPage({ searchParams }: PageProps<"/admin/invoices">) {
  const status = firstParam((await searchParams).status);
  const supabase = await createClient();
  let query = supabase
    .from("invoices")
    .select("id, invoice_number, status, issue_date, due_date, paid_date, vat_rate, clients(name), invoice_items(quantity, unit_price_pence)")
    .order("created_at", { ascending: false });
  if (status && INVOICE_STATUSES.some((s) => s.value === status)) query = query.eq("status", status);
  const { data: invoices } = await query;

  return (
    <>
      <PageHeader title="Invoices" actions={<ButtonLink href="/admin/invoices/new">New invoice</ButtonLink>} />
      <FilterTabs base="/admin/invoices" current={status} options={INVOICE_STATUSES} />
      {invoices?.length ? (
        <Table head={["Invoice", "Client", "Status", "Issued", "Due", "Total"]}>
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-slate-50">
              <Td>
                <Link href={`/admin/invoices/${inv.id}`} className="font-medium text-ink hover:underline">{inv.invoice_number}</Link>
              </Td>
              <Td>{inv.clients?.name ?? "—"}</Td>
              <Td><Badge option={isOverdue(inv) ? OVERDUE : findOption(INVOICE_STATUSES, inv.status)} /></Td>
              <Td>{formatDate(inv.issue_date)}</Td>
              <Td>{inv.status === "paid" ? `Paid ${formatDate(inv.paid_date)}` : formatDate(inv.due_date)}</Td>
              <Td className="font-medium">{formatMoney(totals(inv.invoice_items ?? [], inv.vat_rate).total)}</Td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState>No invoices{status ? " with this status" : " yet"}.</EmptyState>
      )}
    </>
  );
}
