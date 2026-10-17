import { createQuote } from "@/lib/admin/actions/quotes";
import { firstParam, getRefs } from "@/lib/admin/queries";
import { ActionForm } from "@/components/admin/ActionForm";
import { QuoteFields } from "@/components/admin/fields";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "New quote" };

export default async function NewQuotePage({ searchParams }: PageProps<"/admin/quotes/new">) {
  const sp = await searchParams;
  const refs = await getRefs();
  return (
    <>
      <PageHeader title="New quote" description="Add the lines on the next screen." back={{ href: "/admin/quotes", label: "Quotes" }} />
      <Card>
        <ActionForm action={createQuote} submitLabel="Create quote">
          <QuoteFields
            {...refs}
            defaults={{ clientId: firstParam(sp.client), leadId: firstParam(sp.lead), projectId: firstParam(sp.project) }}
          />
        </ActionForm>
      </Card>
    </>
  );
}
