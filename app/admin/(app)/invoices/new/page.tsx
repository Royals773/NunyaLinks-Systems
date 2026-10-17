import { createInvoice } from "@/lib/admin/actions/invoices";
import { firstParam, getRefs } from "@/lib/admin/queries";
import { ActionForm } from "@/components/admin/ActionForm";
import { InvoiceFields } from "@/components/admin/fields";
import { ButtonLink, Card, EmptyState, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "New invoice" };

export default async function NewInvoicePage({ searchParams }: PageProps<"/admin/invoices/new">) {
  const sp = await searchParams;
  const refs = await getRefs();
  return (
    <>
      <PageHeader title="New invoice" description="Add the lines on the next screen." back={{ href: "/admin/invoices", label: "Invoices" }} />
      <Card>
        {refs.clients.length ? (
          <ActionForm action={createInvoice} submitLabel="Create invoice">
            <InvoiceFields
              clients={refs.clients}
              projects={refs.projects}
              defaults={{ clientId: firstParam(sp.client), projectId: firstParam(sp.project) }}
            />
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
