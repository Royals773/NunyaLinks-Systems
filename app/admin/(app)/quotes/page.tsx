import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { QUOTE_STATUSES, findOption } from "@/lib/admin/constants";
import { formatDate, formatMoney, totals } from "@/lib/admin/format";
import { firstParam } from "@/lib/admin/queries";
import { Badge, ButtonLink, EmptyState, FilterTabs, PageHeader, Table, Td } from "@/components/admin/ui";

export const metadata = { title: "Quotes" };

export default async function QuotesPage({ searchParams }: PageProps<"/admin/quotes">) {
  const status = firstParam((await searchParams).status);
  const supabase = await createClient();
  let query = supabase
    .from("quotes")
    .select("id, quote_number, title, status, issue_date, valid_until, vat_rate, clients(name), leads(full_name, business_name), quote_items(quantity, unit_price_pence)")
    .order("created_at", { ascending: false });
  if (status && QUOTE_STATUSES.some((s) => s.value === status)) query = query.eq("status", status);
  const { data: quotes } = await query;

  return (
    <>
      <PageHeader title="Quotes" actions={<ButtonLink href="/admin/quotes/new">New quote</ButtonLink>} />
      <FilterTabs base="/admin/quotes" current={status} options={QUOTE_STATUSES} />
      {quotes?.length ? (
        <Table head={["Quote", "For", "Status", "Issued", "Valid until", "Total"]}>
          {quotes.map((q) => (
            <tr key={q.id} className="hover:bg-slate-50">
              <Td>
                <Link href={`/admin/quotes/${q.id}`} className="font-medium text-ink hover:underline">{q.quote_number}</Link>
                <div className="text-xs text-slate-500">{q.title}</div>
              </Td>
              <Td>{q.clients?.name ?? q.leads?.business_name ?? q.leads?.full_name ?? "—"}</Td>
              <Td><Badge option={findOption(QUOTE_STATUSES, q.status)} /></Td>
              <Td>{formatDate(q.issue_date)}</Td>
              <Td>{formatDate(q.valid_until)}</Td>
              <Td className="font-medium">{formatMoney(totals(q.quote_items ?? [], q.vat_rate).total)}</Td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState>No quotes{status ? " with this status" : " yet"}.</EmptyState>
      )}
    </>
  );
}
