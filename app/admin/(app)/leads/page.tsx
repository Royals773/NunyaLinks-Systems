import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LEAD_SOURCES, LEAD_STATUSES, findOption } from "@/lib/admin/constants";
import { formatDate, todayIso } from "@/lib/admin/format";
import { firstParam } from "@/lib/admin/queries";
import { Badge, ButtonLink, EmptyState, FilterTabs, PageHeader, Table, Td } from "@/components/admin/ui";

export const metadata = { title: "Leads" };

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  const status = firstParam((await searchParams).status);
  const supabase = await createClient();
  let query = supabase
    .from("leads")
    .select("id, created_at, full_name, business_name, email, status, source, next_follow_up")
    .order("created_at", { ascending: false })
    .limit(500);
  if (status && LEAD_STATUSES.some((s) => s.value === status)) query = query.eq("status", status);
  const { data: leads } = await query;
  const today = todayIso();

  return (
    <>
      <PageHeader
        title="Leads"
        description="Every enquiry in one place — website reviews arrive here automatically."
        actions={<ButtonLink href="/admin/leads/new">Add lead</ButtonLink>}
      />
      <FilterTabs base="/admin/leads" current={status} options={LEAD_STATUSES} />
      {leads?.length ? (
        <Table head={["Received", "Name", "Business", "Status", "Follow-up", "Source"]}>
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-slate-50">
              <Td>{formatDate(lead.created_at)}</Td>
              <Td>
                <Link href={`/admin/leads/${lead.id}`} className="font-medium text-ink hover:underline">
                  {lead.full_name}
                </Link>
                <div className="text-xs text-slate-500">{lead.email}</div>
              </Td>
              <Td>{lead.business_name ?? "—"}</Td>
              <Td><Badge option={findOption(LEAD_STATUSES, lead.status)} /></Td>
              <Td className={lead.next_follow_up && lead.next_follow_up <= today && !["won", "lost"].includes(lead.status) ? "font-semibold text-red-700" : ""}>
                {formatDate(lead.next_follow_up)}
              </Td>
              <Td>{findOption(LEAD_SOURCES, lead.source)?.label ?? lead.source}</Td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState>No leads{status ? " with this status" : " yet"}.</EmptyState>
      )}
    </>
  );
}
