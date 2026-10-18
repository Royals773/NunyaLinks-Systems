import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DOCUMENT_KINDS, DOCUMENT_STATUSES, findOption } from "@/lib/admin/constants";
import { formatDate } from "@/lib/admin/format";
import { firstParam } from "@/lib/admin/queries";
import { Badge, ButtonLink, EmptyState, FilterTabs, PageHeader, Table, Td } from "@/components/admin/ui";

export const metadata = { title: "Proposals & contracts" };

export default async function DocumentsPage({ searchParams }: PageProps<"/admin/documents">) {
  const kind = firstParam((await searchParams).kind);
  const supabase = await createClient();
  let query = supabase
    .from("documents")
    .select("id, kind, doc_number, title, status, updated_at, clients(name), leads(full_name, business_name)")
    .order("updated_at", { ascending: false });
  if (kind === "proposal" || kind === "contract") query = query.eq("kind", kind);
  const { data: docs } = await query;

  return (
    <>
      <PageHeader
        title="Proposals & contracts"
        description="Branded documents you can edit, print or save as PDF."
        actions={
          <>
            <ButtonLink href="/admin/documents/new?kind=contract" variant="secondary">New contract</ButtonLink>
            <ButtonLink href="/admin/documents/new?kind=proposal">New proposal</ButtonLink>
          </>
        }
      />
      <FilterTabs base="/admin/documents" current={kind} options={DOCUMENT_KINDS} param="kind" />
      {docs?.length ? (
        <Table head={["Document", "For", "Type", "Status", "Last edited"]}>
          {docs.map((d) => (
            <tr key={d.id} className="hover:bg-slate-50">
              <Td>
                <Link href={`/admin/documents/${d.id}`} className="font-medium text-ink hover:underline">{d.doc_number}</Link>
                <div className="max-w-xs truncate text-xs text-slate-500">{d.title}</div>
              </Td>
              <Td>{d.clients?.name ?? d.leads?.business_name ?? d.leads?.full_name ?? "—"}</Td>
              <Td><Badge option={findOption(DOCUMENT_KINDS, d.kind)} /></Td>
              <Td><Badge option={findOption(DOCUMENT_STATUSES, d.status)} /></Td>
              <Td>{formatDate(d.updated_at)}</Td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState>
          No documents yet. The quickest way to start is from a quote: open it and click &ldquo;Create proposal&rdquo;.
        </EmptyState>
      )}
    </>
  );
}
