import { createClientRecord } from "@/lib/admin/actions/clients";
import { ActionForm } from "@/components/admin/ActionForm";
import { ClientFields } from "@/components/admin/fields";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Add client" };

export default function NewClientPage() {
  return (
    <>
      <PageHeader title="Add client" back={{ href: "/admin/clients", label: "Clients" }} />
      <Card>
        <ActionForm action={createClientRecord} submitLabel="Save client">
          <ClientFields />
        </ActionForm>
      </Card>
    </>
  );
}
