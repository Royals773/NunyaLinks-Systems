import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LEAD_STATUSES, PROJECT_STATUSES, findOption } from "@/lib/admin/constants";
import { formatDate, formatMoney, isOverdue, todayIso, totals } from "@/lib/admin/format";
import { Badge, ButtonLink, Card, EmptyState, PageHeader, Stat } from "@/components/admin/ui";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = todayIso();

  const [newLeads, followUps, recentLeads, activeProjects, openInvoices] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase
      .from("leads")
      .select("id, full_name, business_name, next_follow_up, status")
      .lte("next_follow_up", today)
      .not("status", "in", "(won,lost)")
      .order("next_follow_up")
      .limit(8),
    supabase
      .from("leads")
      .select("id, full_name, business_name, status, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("projects")
      .select("id, name, status, due_date, clients(name)")
      .in("status", ["planned", "in_progress"])
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(8),
    supabase
      .from("invoices")
      .select("id, invoice_number, status, due_date, vat_rate, clients(name), invoice_items(quantity, unit_price_pence)")
      .eq("status", "sent"),
  ]);

  const invoices = (openInvoices.data ?? []).map((inv) => ({
    ...inv,
    total: totals(inv.invoice_items ?? [], inv.vat_rate).total,
    overdue: isOverdue(inv),
  }));
  const outstanding = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const overdue = invoices.filter((inv) => inv.overdue);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="What needs your attention today."
        actions={
          <>
            <ButtonLink href="/admin/leads/new" variant="secondary">Add lead</ButtonLink>
            <ButtonLink href="/admin/invoices/new">New invoice</ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="New leads" value={newLeads.count ?? 0} href="/admin/leads?status=new" />
        <Stat label="Follow-ups due" value={followUps.data?.length ?? 0} hint="Today or earlier" href="/admin/leads" />
        <Stat label="Active projects" value={activeProjects.data?.length ?? 0} href="/admin/projects" />
        <Stat
          label="Outstanding"
          value={formatMoney(outstanding)}
          hint={overdue.length ? `${overdue.length} overdue` : "Nothing overdue"}
          href="/admin/invoices?status=sent"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="Follow-ups due">
          {followUps.data?.length ? (
            <ul className="divide-y divide-slate-100">
              {followUps.data.map((lead) => (
                <li key={lead.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/leads/${lead.id}`} className="min-w-0 truncate text-sm font-medium text-ink hover:underline">
                    {lead.full_name}
                    {lead.business_name && <span className="text-slate-500"> · {lead.business_name}</span>}
                  </Link>
                  <span className={`shrink-0 text-xs font-semibold ${lead.next_follow_up! < today ? "text-red-700" : "text-amber-700"}`}>
                    {lead.next_follow_up! < today ? `Overdue · ${formatDate(lead.next_follow_up)}` : "Today"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No follow-ups due. Set a follow-up date on a lead to see it here.</EmptyState>
          )}
        </Card>

        <Card title="Latest leads" actions={<Link href="/admin/leads" className="text-sm font-medium text-navy hover:underline">All leads</Link>}>
          {recentLeads.data?.length ? (
            <ul className="divide-y divide-slate-100">
              {recentLeads.data.map((lead) => (
                <li key={lead.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/leads/${lead.id}`} className="min-w-0 truncate text-sm font-medium text-ink hover:underline">
                    {lead.full_name}
                    {lead.business_name && <span className="text-slate-500"> · {lead.business_name}</span>}
                  </Link>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-slate-500">{formatDate(lead.created_at)}</span>
                    <Badge option={findOption(LEAD_STATUSES, lead.status)} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No leads yet. Opportunity Review submissions will appear here automatically.</EmptyState>
          )}
        </Card>

        <Card title="Active projects" actions={<Link href="/admin/projects" className="text-sm font-medium text-navy hover:underline">All projects</Link>}>
          {activeProjects.data?.length ? (
            <ul className="divide-y divide-slate-100">
              {activeProjects.data.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/projects/${p.id}`} className="min-w-0 truncate text-sm font-medium text-ink hover:underline">
                    {p.name}
                    <span className="text-slate-500"> · {p.clients?.name}</span>
                  </Link>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-slate-500">{p.due_date ? `Due ${formatDate(p.due_date)}` : ""}</span>
                    <Badge option={findOption(PROJECT_STATUSES, p.status)} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No active projects.</EmptyState>
          )}
        </Card>

        <Card title="Unpaid invoices" actions={<Link href="/admin/invoices" className="text-sm font-medium text-navy hover:underline">All invoices</Link>}>
          {invoices.length ? (
            <ul className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/invoices/${inv.id}`} className="min-w-0 truncate text-sm font-medium text-ink hover:underline">
                    {inv.invoice_number}
                    <span className="text-slate-500"> · {inv.clients?.name}</span>
                  </Link>
                  <span className="flex shrink-0 items-center gap-2 text-sm">
                    {formatMoney(inv.total)}
                    {inv.overdue && <span className="text-xs font-semibold text-red-700">Overdue</span>}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No unpaid invoices.</EmptyState>
          )}
        </Card>
      </div>
    </>
  );
}
