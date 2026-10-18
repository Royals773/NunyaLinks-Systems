import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/lib/admin/auth";
import { deleteTemplate, resetTemplate, updateTemplate } from "@/lib/admin/actions/documents";
import { DOCUMENT_KINDS, findOption } from "@/lib/admin/constants";
import { PLACEHOLDERS } from "@/lib/admin/documents";
import { InlineAction } from "@/components/admin/ActionForm";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import { Badge, Card, Field, inputClass, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Edit template" };

export default async function TemplatePage({ params }: PageProps<"/admin/settings/templates/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: t } = await supabase.from("document_templates").select("*").eq("id", id).maybeSingle();
  if (!t) notFound();
  const ctx = await getAdminContext();
  const isOwner = ctx.status === "admin" && ctx.role === "owner";

  return (
    <>
      <PageHeader
        title={t.name}
        description={
          <span className="inline-flex items-center gap-2">
            <Badge option={findOption(DOCUMENT_KINDS, t.kind)} />
            {t.is_default && <span className="text-emerald-700">Default for new {t.kind}s</span>}
          </span>
        }
        back={{ href: "/admin/settings/templates", label: "Templates" }}
      />

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1fr_20rem]">
        <Card>
          <MarkdownEditor action={updateTemplate} initialBody={t.body} submitLabel="Save template">
            <input type="hidden" name="id" value={t.id} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <Field label="Template name" htmlFor="name">
                <input id="name" name="name" required defaultValue={t.name} className={inputClass} />
              </Field>
              <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
                <input type="checkbox" name="is_default" defaultChecked={t.is_default} className="h-4 w-4 rounded border-slate-300" />
                Use as default
              </label>
            </div>
          </MarkdownEditor>
        </Card>

        <div className="space-y-6">
          <Card title="Placeholders">
            <p className="mb-3 text-sm text-slate-600">Copy these into the text. They&rsquo;re replaced with real details when you create a document.</p>
            <ul className="space-y-2 text-sm">
              {PLACEHOLDERS.map((p) => (
                <li key={p.key}>
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[12px] text-ink">{`{{${p.key}}}`}</code>
                  <span className="block text-xs text-slate-500">{p.description}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Start again">
            <p className="mb-3 text-sm text-slate-600">Replace this template&rsquo;s text with the original NunyaLink wording.</p>
            <InlineAction action={resetTemplate} hidden={{ id: t.id }} label="Restore original wording" confirm="Replace this template's text with the original wording? Your edits to it will be lost." />
          </Card>
          {isOwner && !t.is_default && (
            <Card title="Danger zone">
              <InlineAction action={deleteTemplate} hidden={{ id: t.id }} label="Delete template" variant="danger" confirm="Delete this template? Documents already created from it are not affected." />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
