import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createTemplate } from "@/lib/admin/actions/documents";
import { DOCUMENT_KINDS, findOption } from "@/lib/admin/constants";
import { ensureDefaultTemplates } from "@/lib/admin/documents";
import { formatDate } from "@/lib/admin/format";
import { ActionForm } from "@/components/admin/ActionForm";
import { Badge, Card, Field, inputClass, PageHeader, Select, Table, Td } from "@/components/admin/ui";

export const metadata = { title: "Templates" };

export default async function TemplatesPage() {
  const supabase = await createClient();
  await ensureDefaultTemplates(supabase);
  const { data: templates } = await supabase
    .from("document_templates")
    .select("id, kind, name, is_default, updated_at")
    .order("kind")
    .order("is_default", { ascending: false })
    .order("name");

  return (
    <>
      <PageHeader title="Document templates" back={{ href: "/admin/settings", label: "Settings" }} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_20rem]">
        <Table head={["Template", "Type", "Last edited"]}>
          {(templates ?? []).map((t) => (
            <tr key={t.id} className="hover:bg-slate-50">
              <Td>
                <Link href={`/admin/settings/templates/${t.id}`} className="font-medium text-ink hover:underline">{t.name}</Link>
                {t.is_default && <span className="ml-2 text-xs font-semibold text-emerald-700">Default</span>}
              </Td>
              <Td><Badge option={findOption(DOCUMENT_KINDS, t.kind)} /></Td>
              <Td>{formatDate(t.updated_at)}</Td>
            </tr>
          ))}
        </Table>
        <Card title="Add a template">
          <p className="mb-4 text-sm text-slate-600">e.g. a shorter proposal for websites, or a support retainer agreement. It starts as a copy of the standard wording.</p>
          <ActionForm action={createTemplate} submitLabel="Create template">
            <div className="space-y-4">
              <Field label="Name" htmlFor="name">
                <input id="name" name="name" required className={inputClass} />
              </Field>
              <Field label="Type" htmlFor="kind">
                <Select id="kind" name="kind" options={DOCUMENT_KINDS} defaultValue="proposal" />
              </Field>
            </div>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
