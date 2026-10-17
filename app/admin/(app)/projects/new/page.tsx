import { createProject } from "@/lib/admin/actions/projects";
import { firstParam, getRefs } from "@/lib/admin/queries";
import { ActionForm } from "@/components/admin/ActionForm";
import { ProjectFields } from "@/components/admin/fields";
import { ButtonLink, Card, EmptyState, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "New project" };

export default async function NewProjectPage({ searchParams }: PageProps<"/admin/projects/new">) {
  const clientId = firstParam((await searchParams).client);
  const { clients } = await getRefs();

  return (
    <>
      <PageHeader title="New project" back={{ href: "/admin/projects", label: "Projects" }} />
      <Card>
        {clients.length ? (
          <ActionForm action={createProject} submitLabel="Create project">
            <ProjectFields clients={clients} defaultClientId={clientId} />
          </ActionForm>
        ) : (
          <EmptyState>
            Add a client first. <ButtonLink href="/admin/clients/new" variant="secondary">Add client</ButtonLink>
          </EmptyState>
        )}
      </Card>
    </>
  );
}
