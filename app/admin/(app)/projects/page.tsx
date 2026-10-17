import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PROJECT_STATUSES, PROJECT_TYPES, findOption } from "@/lib/admin/constants";
import { formatDate, formatMoney } from "@/lib/admin/format";
import { firstParam } from "@/lib/admin/queries";
import { Badge, ButtonLink, EmptyState, FilterTabs, PageHeader, Table, Td } from "@/components/admin/ui";

export const metadata = { title: "Projects" };

export default async function ProjectsPage({ searchParams }: PageProps<"/admin/projects">) {
  const status = firstParam((await searchParams).status);
  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select("id, name, type, status, due_date, value_pence, clients(id, name)")
    .order("created_at", { ascending: false });
  if (status && PROJECT_STATUSES.some((s) => s.value === status)) query = query.eq("status", status);
  const { data: projects } = await query;

  return (
    <>
      <PageHeader title="Projects" actions={<ButtonLink href="/admin/projects/new">New project</ButtonLink>} />
      <FilterTabs base="/admin/projects" current={status} options={PROJECT_STATUSES} />
      {projects?.length ? (
        <Table head={["Project", "Client", "Type", "Status", "Due", "Value"]}>
          {projects.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50">
              <Td>
                <Link href={`/admin/projects/${p.id}`} className="font-medium text-ink hover:underline">{p.name}</Link>
              </Td>
              <Td>{p.clients?.name ?? "—"}</Td>
              <Td>{findOption(PROJECT_TYPES, p.type)?.label ?? p.type}</Td>
              <Td><Badge option={findOption(PROJECT_STATUSES, p.status)} /></Td>
              <Td>{formatDate(p.due_date)}</Td>
              <Td>{formatMoney(p.value_pence)}</Td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState>No projects{status ? " with this status" : " yet"}.</EmptyState>
      )}
    </>
  );
}
