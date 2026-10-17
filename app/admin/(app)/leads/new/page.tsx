import { createLead } from "@/lib/admin/actions/leads";
import { ActionForm } from "@/components/admin/ActionForm";
import { LeadFields } from "@/components/admin/fields";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Add lead" };

export default function NewLeadPage() {
  return (
    <>
      <PageHeader title="Add lead" description="For enquiries that came by phone, email or referral." back={{ href: "/admin/leads", label: "Leads" }} />
      <Card>
        <ActionForm action={createLead} submitLabel="Save lead">
          <LeadFields />
        </ActionForm>
      </Card>
    </>
  );
}
