import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/lib/admin/auth";
import { deleteDocument, updateDocument } from "@/lib/admin/actions/documents";
import { DOCUMENT_KINDS, DOCUMENT_STATUSES, findOption } from "@/lib/admin/constants";
import { formatDate } from "@/lib/admin/format";
import { InlineAction } from "@/components/admin/ActionForm";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import { Badge, ButtonLink, Card, Field, inputClass, PageHeader, Select } from "@/components/admin/ui";

export const metadata = { title: "Document" };

export default async function DocumentPage({ params }: PageProps<"/admin/documents/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("documents")
    .select("*, clients(id, name), leads(id, full_name, business_name), quotes(id, quote_number), projects(id, name)")
    .eq("id", id)
    .maybeSingle();
  if (!doc) notFound();
  const ctx = await getAdminContext();
  const isOwner = ctx.status === "admin" && ctx.role === "owner";

  const links = [
    doc.clients && { href: `/admin/clients/${doc.clients.id}`, label: doc.clients.name },
    doc.leads && { href: `/admin/leads/${doc.leads.id}`, label: `${doc.leads.business_name ?? doc.leads.full_name} (lead)` },
    doc.quotes && { href: `/admin/quotes/${doc.quotes.id}`, label: doc.quotes.quote_number },
    doc.projects && { href: `/admin/projects/${doc.projects.id}`, label: doc.projects.name },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <>
      <PageHeader
        title={`${doc.doc_number} · ${doc.title}`}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge option={findOption(DOCUMENT_KINDS, doc.kind)} />
            <Badge option={findOption(DOCUMENT_STATUSES, doc.status)} />
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-navy hover:underline">{l.label}</Link>
            ))}
            <span>Last edited {formatDate(doc.updated_at)}</span>
          </span>
        }
        back={{ href: "/admin/documents", label: "Proposals & contracts" }}
        actions={<ButtonLink href={`/admin/print/documents/${doc.id}`}>Print / PDF</ButtonLink>}
      />

      {doc.kind === "contract" && (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This contract is a general starting point, not legal advice. Have a solicitor review your standard
          terms once, then update the template under Settings.
        </p>
      )}

      <Card>
        <MarkdownEditor action={updateDocument} initialBody={doc.body} submitLabel="Save document">
          <input type="hidden" name="id" value={doc.id} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_14rem]">
            <Field label="Title" htmlFor="title">
              <input id="title" name="title" required defaultValue={doc.title} className={inputClass} />
            </Field>
            <Field label="Status" htmlFor="status">
              <Select id="status" name="status" options={DOCUMENT_STATUSES} defaultValue={doc.status} />
            </Field>
          </div>
        </MarkdownEditor>
      </Card>

      {isOwner && (
        <div className="mt-6">
          <Card title="Danger zone">
            <InlineAction action={deleteDocument} hidden={{ id: doc.id }} label="Delete document" variant="danger" confirm="Delete this document permanently? This can't be undone." />
          </Card>
        </div>
      )}
    </>
  );
}
