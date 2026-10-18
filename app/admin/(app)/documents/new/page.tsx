import { createClient } from "@/lib/supabase/server";
import { createDocument } from "@/lib/admin/actions/documents";
import { DOCUMENT_KINDS } from "@/lib/admin/constants";
import { ensureDefaultTemplates } from "@/lib/admin/documents";
import { firstParam, getRefs } from "@/lib/admin/queries";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, Field, inputClass, PageHeader, Select } from "@/components/admin/ui";

export const metadata = { title: "New document" };

export default async function NewDocumentPage({ searchParams }: PageProps<"/admin/documents/new">) {
  const sp = await searchParams;
  const kind = firstParam(sp.kind) === "contract" ? "contract" : "proposal";
  const supabase = await createClient();
  await ensureDefaultTemplates(supabase);

  const [refs, { data: templates }, { data: quotes }] = await Promise.all([
    getRefs(),
    supabase.from("document_templates").select("id, name, kind, is_default").order("is_default", { ascending: false }).order("name"),
    supabase.from("quotes").select("id, quote_number, title").order("created_at", { ascending: false }).limit(200),
  ]);

  const quoteId = firstParam(sp.quote);
  let clientId = firstParam(sp.client);
  let leadId = firstParam(sp.lead);
  let projectId = firstParam(sp.project);
  if (quoteId && !clientId && !leadId) {
    const { data: q } = await supabase.from("quotes").select("client_id, lead_id, project_id").eq("id", quoteId).maybeSingle();
    clientId = q?.client_id ?? undefined;
    leadId = q?.lead_id ?? undefined;
    projectId = projectId ?? q?.project_id ?? undefined;
  }

  const templateOptions = (templates ?? []).map((t) => ({
    value: t.id,
    label: `${t.kind === "proposal" ? "Proposal" : "Contract"}: ${t.name}${t.is_default ? " (default)" : ""}`,
  }));
  const defaultTemplate = (templates ?? []).find((t) => t.kind === kind && t.is_default) ?? (templates ?? []).find((t) => t.kind === kind);

  return (
    <>
      <PageHeader
        title={`New ${kind}`}
        description="Pick who it's for and, ideally, a quote. Names, prices and your business details are filled in for you, and you can edit everything afterwards."
        back={{ href: "/admin/documents", label: "Proposals & contracts" }}
      />
      <Card>
        <ActionForm action={createDocument} submitLabel={`Create ${kind}`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Type" htmlFor="kind">
              <Select id="kind" name="kind" options={DOCUMENT_KINDS} defaultValue={kind} />
            </Field>
            <Field label="Template" htmlFor="template_id" hint="Must match the type. Edit templates under Settings.">
              <Select id="template_id" name="template_id" options={templateOptions} defaultValue={defaultTemplate?.id} />
            </Field>
            <Field label="Client" htmlFor="client_id">
              <Select id="client_id" name="client_id" options={refs.clients.map((c) => ({ value: c.id, label: c.name }))} defaultValue={clientId} includeBlank="—" />
            </Field>
            <Field label="Or lead" htmlFor="lead_id" hint="For proposals to people who aren't clients yet.">
              <Select id="lead_id" name="lead_id" options={refs.leads.map((l) => ({ value: l.id, label: l.name }))} defaultValue={leadId} includeBlank="—" />
            </Field>
            <Field label="Quote" htmlFor="quote_id" hint="Fills in the pricing table and total.">
              <Select
                id="quote_id"
                name="quote_id"
                options={(quotes ?? []).map((q) => ({ value: q.id, label: `${q.quote_number} · ${q.title}` }))}
                defaultValue={quoteId}
                includeBlank="None"
              />
            </Field>
            <Field label="Project" htmlFor="project_id">
              <Select id="project_id" name="project_id" options={refs.projects.map((p) => ({ value: p.id, label: p.name }))} defaultValue={projectId} includeBlank="None" />
            </Field>
            <Field label="Title" htmlFor="title" className="sm:col-span-2" hint="Leave blank to name it after the quote.">
              <input id="title" name="title" className={inputClass} />
            </Field>
          </div>
        </ActionForm>
      </Card>
    </>
  );
}
