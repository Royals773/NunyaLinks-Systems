import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CLIENT_STATUSES, findOption } from "@/lib/admin/constants";
import { formatDate } from "@/lib/admin/format";
import { firstParam } from "@/lib/admin/queries";
import { Badge, ButtonLink, EmptyState, FilterTabs, PageHeader, Table, Td } from "@/components/admin/ui";

export const metadata = { title: "Clients" };

export default async function ClientsPage({ searchParams }: PageProps<"/admin/clients">) {
  const status = firstParam((await searchParams).status);
  const supabase = await createClient();
  let query = supabase
    .from("clients")
    .select("id, name, contact_name, email, phone, status, created_at")
    .order("name");
  if (status && CLIENT_STATUSES.some((s) => s.value === status)) query = query.eq("status", status);
  const { data: clients } = await query;

  return (
    <>
      <PageHeader title="Clients" actions={<ButtonLink href="/admin/clients/new">Add client</ButtonLink>} />
      <FilterTabs base="/admin/clients" current={status} options={CLIENT_STATUSES} />
      {clients?.length ? (
        <Table head={["Client", "Contact", "Email", "Phone", "Status", "Since"]}>
          {clients.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <Td>
                <Link href={`/admin/clients/${c.id}`} className="font-medium text-ink hover:underline">{c.name}</Link>
              </Td>
              <Td>{c.contact_name ?? "—"}</Td>
              <Td>{c.email ?? "—"}</Td>
              <Td>{c.phone ?? "—"}</Td>
              <Td><Badge option={findOption(CLIENT_STATUSES, c.status)} /></Td>
              <Td>{formatDate(c.created_at)}</Td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState>No clients yet. Convert a lead or add one directly.</EmptyState>
      )}
    </>
  );
}
