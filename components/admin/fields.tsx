// Form field groups shared by the "new" and "edit" screens. Plain JSX, so
// they render on the server inside the client-side <ActionForm>.
import type { Tables } from "@/lib/supabase/database.types";
import {
  CLIENT_STATUSES,
  INVOICE_STATUSES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  QUOTE_STATUSES,
} from "@/lib/admin/constants";
import { Field, inputClass, Select } from "./ui";

type Ref = { id: string; name: string };

const grid = "grid grid-cols-1 gap-4 sm:grid-cols-2";

function penceToInput(p: number | null | undefined) {
  return p === null || p === undefined ? "" : (p / 100).toFixed(2);
}

export function LeadFields({ lead }: { lead?: Tables<"leads"> }) {
  return (
    <div className={grid}>
      {lead && <input type="hidden" name="id" value={lead.id} />}
      <Field label="Name" htmlFor="full_name">
        <input id="full_name" name="full_name" required defaultValue={lead?.full_name} className={inputClass} />
      </Field>
      <Field label="Business" htmlFor="business_name">
        <input id="business_name" name="business_name" defaultValue={lead?.business_name ?? ""} className={inputClass} />
      </Field>
      <Field label="Email" htmlFor="email">
        <input id="email" name="email" type="email" required defaultValue={lead?.email} className={inputClass} />
      </Field>
      <Field label="Phone" htmlFor="phone">
        <input id="phone" name="phone" defaultValue={lead?.phone ?? ""} className={inputClass} />
      </Field>
      <Field label="Location" htmlFor="location">
        <input id="location" name="location" defaultValue={lead?.location ?? ""} className={inputClass} />
      </Field>
      <Field label="Industry" htmlFor="industry">
        <input id="industry" name="industry" defaultValue={lead?.industry ?? ""} className={inputClass} />
      </Field>
      <Field label="Status" htmlFor="status">
        <Select id="status" name="status" options={LEAD_STATUSES} defaultValue={lead?.status ?? "new"} />
      </Field>
      <Field label="Source" htmlFor="source">
        <Select id="source" name="source" options={LEAD_SOURCES} defaultValue={lead?.source ?? "referral"} />
      </Field>
      <Field label="Next follow-up" htmlFor="next_follow_up">
        <input id="next_follow_up" name="next_follow_up" type="date" defaultValue={lead?.next_follow_up ?? ""} className={inputClass} />
      </Field>
      <Field label="What they need" htmlFor="biggest_task" className="sm:col-span-2">
        <textarea id="biggest_task" name="biggest_task" rows={3} defaultValue={lead?.biggest_task ?? ""} className={inputClass} />
      </Field>
      <Field label="Notes" htmlFor="notes" className="sm:col-span-2" hint="Calls, emails, next steps — only visible to the admin team.">
        <textarea id="notes" name="notes" rows={5} defaultValue={lead?.notes ?? ""} className={inputClass} />
      </Field>
    </div>
  );
}

export function ClientFields({ client }: { client?: Tables<"clients"> }) {
  return (
    <div className={grid}>
      {client && <input type="hidden" name="id" value={client.id} />}
      <Field label="Business name" htmlFor="name">
        <input id="name" name="name" required defaultValue={client?.name} className={inputClass} />
      </Field>
      <Field label="Main contact" htmlFor="contact_name">
        <input id="contact_name" name="contact_name" defaultValue={client?.contact_name ?? ""} className={inputClass} />
      </Field>
      <Field label="Email" htmlFor="email">
        <input id="email" name="email" type="email" defaultValue={client?.email ?? ""} className={inputClass} />
      </Field>
      <Field label="Phone" htmlFor="phone">
        <input id="phone" name="phone" defaultValue={client?.phone ?? ""} className={inputClass} />
      </Field>
      <Field label="Status" htmlFor="status">
        <Select id="status" name="status" options={CLIENT_STATUSES} defaultValue={client?.status ?? "active"} />
      </Field>
      <Field label="Address" htmlFor="address" className="sm:col-span-2" hint="Shown on invoices and quotes.">
        <textarea id="address" name="address" rows={3} defaultValue={client?.address ?? ""} className={inputClass} />
      </Field>
      <Field label="Notes" htmlFor="notes" className="sm:col-span-2">
        <textarea id="notes" name="notes" rows={4} defaultValue={client?.notes ?? ""} className={inputClass} />
      </Field>
    </div>
  );
}

export function ProjectFields({
  project,
  clients,
  defaultClientId,
}: {
  project?: Tables<"projects">;
  clients: Ref[];
  defaultClientId?: string;
}) {
  return (
    <div className={grid}>
      {project && <input type="hidden" name="id" value={project.id} />}
      <Field label="Project name" htmlFor="name">
        <input id="name" name="name" required defaultValue={project?.name} className={inputClass} />
      </Field>
      <Field label="Client" htmlFor="client_id">
        <Select
          id="client_id"
          name="client_id"
          options={clients.map((c) => ({ value: c.id, label: c.name }))}
          defaultValue={project?.client_id ?? defaultClientId}
          includeBlank="Choose a client"
        />
      </Field>
      <Field label="Type" htmlFor="type">
        <Select id="type" name="type" options={PROJECT_TYPES} defaultValue={project?.type ?? "automation"} />
      </Field>
      <Field label="Status" htmlFor="status">
        <Select id="status" name="status" options={PROJECT_STATUSES} defaultValue={project?.status ?? "planned"} />
      </Field>
      <Field label="Start date" htmlFor="start_date">
        <input id="start_date" name="start_date" type="date" defaultValue={project?.start_date ?? ""} className={inputClass} />
      </Field>
      <Field label="Due date" htmlFor="due_date">
        <input id="due_date" name="due_date" type="date" defaultValue={project?.due_date ?? ""} className={inputClass} />
      </Field>
      <Field label="Project value (£)" htmlFor="value">
        <input id="value" name="value" inputMode="decimal" placeholder="0.00" defaultValue={penceToInput(project?.value_pence)} className={inputClass} />
      </Field>
      <Field label="Notes" htmlFor="notes" className="sm:col-span-2">
        <textarea id="notes" name="notes" rows={4} defaultValue={project?.notes ?? ""} className={inputClass} />
      </Field>
    </div>
  );
}

export function QuoteFields({
  quote,
  clients,
  leads,
  projects,
  defaults,
}: {
  quote?: Tables<"quotes">;
  clients: Ref[];
  leads: Ref[];
  projects: Ref[];
  defaults?: { clientId?: string; leadId?: string; projectId?: string };
}) {
  return (
    <div className={grid}>
      {quote && <input type="hidden" name="id" value={quote.id} />}
      <Field label="Title" htmlFor="title" className="sm:col-span-2" hint="e.g. Enquiry automation build">
        <input id="title" name="title" required defaultValue={quote?.title} className={inputClass} />
      </Field>
      <Field label="Client" htmlFor="client_id" hint="Or choose a lead if they aren't a client yet.">
        <Select
          id="client_id"
          name="client_id"
          options={clients.map((c) => ({ value: c.id, label: c.name }))}
          defaultValue={quote?.client_id ?? defaults?.clientId}
          includeBlank="—"
        />
      </Field>
      <Field label="Lead" htmlFor="lead_id">
        <Select
          id="lead_id"
          name="lead_id"
          options={leads.map((l) => ({ value: l.id, label: l.name }))}
          defaultValue={quote?.lead_id ?? defaults?.leadId}
          includeBlank="—"
        />
      </Field>
      <Field label="Project" htmlFor="project_id">
        <Select
          id="project_id"
          name="project_id"
          options={projects.map((p) => ({ value: p.id, label: p.name }))}
          defaultValue={quote?.project_id ?? defaults?.projectId}
          includeBlank="None"
        />
      </Field>
      <Field label="Status" htmlFor="status">
        <Select id="status" name="status" options={QUOTE_STATUSES} defaultValue={quote?.status ?? "draft"} />
      </Field>
      <Field label="Issue date" htmlFor="issue_date">
        <input id="issue_date" name="issue_date" type="date" defaultValue={quote?.issue_date ?? ""} className={inputClass} />
      </Field>
      <Field label="Valid until" htmlFor="valid_until">
        <input id="valid_until" name="valid_until" type="date" defaultValue={quote?.valid_until ?? ""} className={inputClass} />
      </Field>
      <Field label="VAT rate (%)" htmlFor="vat_rate" hint="Leave at 0 if you're not VAT registered.">
        <input id="vat_rate" name="vat_rate" inputMode="decimal" defaultValue={String(quote?.vat_rate ?? 0)} className={inputClass} />
      </Field>
      <Field label="Notes / terms" htmlFor="notes" className="sm:col-span-2" hint="Printed on the quote.">
        <textarea id="notes" name="notes" rows={4} defaultValue={quote?.notes ?? ""} className={inputClass} />
      </Field>
    </div>
  );
}

export function InvoiceFields({
  invoice,
  clients,
  projects,
  defaults,
}: {
  invoice?: Tables<"invoices">;
  clients: Ref[];
  projects: Ref[];
  defaults?: { clientId?: string; projectId?: string };
}) {
  return (
    <div className={grid}>
      {invoice && <input type="hidden" name="id" value={invoice.id} />}
      <Field label="Client" htmlFor="client_id">
        <Select
          id="client_id"
          name="client_id"
          options={clients.map((c) => ({ value: c.id, label: c.name }))}
          defaultValue={invoice?.client_id ?? defaults?.clientId}
          includeBlank="Choose a client"
        />
      </Field>
      <Field label="Project" htmlFor="project_id">
        <Select
          id="project_id"
          name="project_id"
          options={projects.map((p) => ({ value: p.id, label: p.name }))}
          defaultValue={invoice?.project_id ?? defaults?.projectId}
          includeBlank="None"
        />
      </Field>
      <Field label="Status" htmlFor="status">
        <Select id="status" name="status" options={INVOICE_STATUSES} defaultValue={invoice?.status ?? "draft"} />
      </Field>
      <Field label="VAT rate (%)" htmlFor="vat_rate" hint="Leave at 0 if you're not VAT registered.">
        <input id="vat_rate" name="vat_rate" inputMode="decimal" defaultValue={String(invoice?.vat_rate ?? 0)} className={inputClass} />
      </Field>
      <Field label="Issue date" htmlFor="issue_date">
        <input id="issue_date" name="issue_date" type="date" defaultValue={invoice?.issue_date ?? ""} className={inputClass} />
      </Field>
      <Field label="Due date" htmlFor="due_date">
        <input id="due_date" name="due_date" type="date" defaultValue={invoice?.due_date ?? ""} className={inputClass} />
      </Field>
      <Field label="Paid on" htmlFor="paid_date" hint="Filled in automatically when marked as paid.">
        <input id="paid_date" name="paid_date" type="date" defaultValue={invoice?.paid_date ?? ""} className={inputClass} />
      </Field>
      <Field label="Notes / payment details" htmlFor="notes" className="sm:col-span-2" hint="Printed on the invoice — e.g. bank details and payment terms.">
        <textarea id="notes" name="notes" rows={4} defaultValue={invoice?.notes ?? ""} className={inputClass} />
      </Field>
    </div>
  );
}

export function LineItemFields({ parentName, parentId }: { parentName: "quote_id" | "invoice_id"; parentId: string }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_6rem_8rem]">
      <input type="hidden" name={parentName} value={parentId} />
      <Field label="Description" htmlFor="description">
        <input id="description" name="description" required className={inputClass} />
      </Field>
      <Field label="Qty" htmlFor="quantity">
        <input id="quantity" name="quantity" inputMode="decimal" defaultValue="1" className={inputClass} />
      </Field>
      <Field label="Unit price (£)" htmlFor="unit_price">
        <input id="unit_price" name="unit_price" inputMode="decimal" placeholder="0.00" required className={inputClass} />
      </Field>
    </div>
  );
}
