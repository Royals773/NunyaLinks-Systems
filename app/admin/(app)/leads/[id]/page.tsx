import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/lib/admin/auth";
import { convertLeadToClient, deleteLead, updateLead } from "@/lib/admin/actions/leads";
import { LEAD_SOURCES, LEAD_STATUSES, QUOTE_STATUSES, findOption } from "@/lib/admin/constants";
import { formatDate } from "@/lib/admin/format";
import { ActionForm, InlineAction } from "@/components/admin/ActionForm";
import { LeadFields } from "@/components/admin/fields";
import { Badge, ButtonLink, Card, DetailList, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Lead" };

export default async function LeadPage({ params }: PageProps<"/admin/leads/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (!lead) notFound();

  const [{ data: client }, { data: quotes }, ctx] = await Promise.all([
    lead.client_id
      ? supabase.from("clients").select("id, name").eq("id", lead.client_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("quotes").select("id, quote_number, title, status").eq("lead_id", lead.id).order("created_at", { ascending: false }),
    getAdminContext(),
  ]);

  return (
    <>
      <PageHeader
        title={lead.full_name}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            {lead.business_name && <span>{lead.business_name}</span>}
            <Badge option={findOption(LEAD_STATUSES, lead.status)} />
            <span>Received {formatDate(lead.created_at)} via {findOption(LEAD_SOURCES, lead.source)?.label ?? lead.source}</span>
          </span>
        }
        back={{ href: "/admin/leads", label: "Leads" }}
        actions={
          <>
            <ButtonLink href={`/admin/quotes/new?lead=${lead.id}`} variant="secondary">Create quote</ButtonLink>
            <ButtonLink href={`/admin/documents/new?kind=proposal&lead=${lead.id}`} variant="secondary">Create proposal</ButtonLink>
            {client ? (
              <ButtonLink href={`/admin/clients/${client.id}`}>Open client</ButtonLink>
            ) : (
              <InlineAction action={convertLeadToClient} hidden={{ id: lead.id }} label="Convert to client" variant="primary" />
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
        <Card title="Update lead">
          <ActionForm action={updateLead} submitLabel="Save changes">
            <LeadFields lead={lead} />
          </ActionForm>
        </Card>

        <div className="space-y-6">
          <Card title="Their enquiry">
            <DetailList
              items={[
                { label: "Email", value: <a className="text-navy hover:underline" href={`mailto:${lead.email}`}>{lead.email}</a> },
                { label: "Phone", value: lead.phone ? <a className="text-navy hover:underline" href={`tel:${lead.phone}`}>{lead.phone}</a> : null },
                { label: "Prefers", value: lead.contact_method },
                { label: "Location", value: lead.location },
                { label: "Industry", value: lead.industry },
                { label: "Team size", value: lead.employees },
                { label: "Hours a week", value: lead.hours_per_week },
              ]}
            />
            {lead.message && <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{lead.message}</p>}
          </Card>

          <Card title="Quotes">
            {quotes?.length ? (
              <ul className="space-y-2">
                {quotes.map((q) => (
                  <li key={q.id} className="flex items-center justify-between gap-2 text-sm">
                    <Link href={`/admin/quotes/${q.id}`} className="truncate font-medium text-ink hover:underline">
                      {q.quote_number} · {q.title}
                    </Link>
                    <Badge option={findOption(QUOTE_STATUSES, q.status)} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No quotes yet.</p>
            )}
          </Card>

          {ctx.status === "admin" && ctx.role === "owner" && (
            <Card title="Danger zone">
              <InlineAction
                action={deleteLead}
                hidden={{ id: lead.id }}
                label="Delete lead"
                variant="danger"
                confirm="Delete this lead permanently? This can't be undone."
              />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
