"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { DOCUMENT_STATUSES, values } from "@/lib/admin/constants";
import { defaultTemplateBody, ensureDefaultTemplates, fillTemplate, type DocumentKind } from "@/lib/admin/documents";
import { FormError, oneOf, required, text, toState, uuid, type ActionState } from "@/lib/admin/forms";

const MAX_BODY = 200000;

export async function createDocument(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  let id: string;
  try {
    const kind = oneOf(form, "kind", ["proposal", "contract"], "proposal") as DocumentKind;
    const clientId = uuid(form, "client_id");
    const leadId = uuid(form, "lead_id");
    if (!clientId && !leadId) throw new FormError("Choose a client or a lead.");
    const quoteId = uuid(form, "quote_id");
    const projectId = uuid(form, "project_id");
    let templateId = uuid(form, "template_id");

    const supabase = await createClient();
    await ensureDefaultTemplates(supabase);

    let template = templateId
      ? (await supabase.from("document_templates").select("id, body, kind").eq("id", templateId).maybeSingle()).data
      : null;
    if (!template || template.kind !== kind) {
      template = (
        await supabase.from("document_templates").select("id, body, kind").eq("kind", kind).order("is_default", { ascending: false }).limit(1).maybeSingle()
      ).data;
    }
    templateId = template?.id ?? null;

    const [client, lead, quote, project, business] = await Promise.all([
      clientId ? supabase.from("clients").select("name, contact_name, email, address").eq("id", clientId).maybeSingle() : null,
      leadId ? supabase.from("leads").select("full_name, business_name, email, location, biggest_task").eq("id", leadId).maybeSingle() : null,
      quoteId ? supabase.from("quotes").select("title, quote_number, valid_until, vat_rate, lead_id, quote_items(description, quantity, unit_price_pence, position)").eq("id", quoteId).maybeSingle() : null,
      projectId ? supabase.from("projects").select("name").eq("id", projectId).maybeSingle() : null,
      supabase.from("business_settings").select("*").maybeSingle(),
    ]);

    // A client converted from a lead still has the lead's original enquiry.
    let leadRow = lead?.data ?? null;
    if (!leadRow && clientId) {
      const { data: c } = await supabase.from("clients").select("lead_id").eq("id", clientId).maybeSingle();
      const sourceLead = c?.lead_id ?? quote?.data?.lead_id;
      if (sourceLead) {
        leadRow = (await supabase.from("leads").select("full_name, business_name, email, location, biggest_task").eq("id", sourceLead).maybeSingle()).data;
      }
    }

    const quoteRow = quote?.data
      ? { ...quote.data, items: [...(quote.data.quote_items ?? [])].sort((a, b) => a.position - b.position) }
      : null;
    const title =
      text(form, "title", 200) ??
      `${kind === "proposal" ? "Proposal" : "Services agreement"}${quoteRow ? ` — ${quoteRow.title}` : ""}`;

    // Insert first to get the document number, then fill the template.
    const { data: inserted, error } = await supabase
      .from("documents")
      .insert({ kind, title, client_id: clientId, lead_id: leadId, quote_id: quoteId, project_id: projectId, template_id: templateId })
      .select("id, doc_number")
      .single();
    if (error) throw error;
    id = inserted.id;

    const body = fillTemplate(template?.body ?? defaultTemplateBody(kind), {
      documentNumber: inserted.doc_number,
      client: client?.data,
      lead: leadRow,
      quote: quoteRow,
      project: project?.data,
      business: business.data,
    });
    const { error: updateError } = await supabase.from("documents").update({ body: body.slice(0, MAX_BODY) }).eq("id", id);
    if (updateError) throw updateError;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/documents/${id}`);
}

export async function updateDocument(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing document." };
    const raw = form.get("body");
    const body = typeof raw === "string" ? raw : "";
    if (body.length > MAX_BODY) return { error: "This document is too long to save." };
    const supabase = await createClient();
    const { error } = await supabase
      .from("documents")
      .update({
        title: required(form, "title", "Title"),
        status: oneOf(form, "status", values(DOCUMENT_STATUSES), "draft"),
        body,
      })
      .eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  return { ok: "Saved." };
}

export async function deleteDocument(_s: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await requireAdmin();
  if (ctx.role !== "owner") return { error: "Only the owner can delete records." };
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing document." };
    const supabase = await createClient();
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/documents");
}

// ---------------------------------------------------------------- templates

export async function createTemplate(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  let id: string;
  try {
    const kind = oneOf(form, "kind", ["proposal", "contract"], "proposal") as DocumentKind;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("document_templates")
      .insert({ kind, name: required(form, "name", "Template name"), body: defaultTemplateBody(kind) })
      .select("id")
      .single();
    if (error) throw error;
    id = data.id;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/settings/templates/${id}`);
}

export async function updateTemplate(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing template." };
    const raw = form.get("body");
    const body = typeof raw === "string" ? raw : "";
    if (body.length > MAX_BODY) return { error: "This template is too long to save." };
    const supabase = await createClient();
    const { data: current } = await supabase.from("document_templates").select("kind").eq("id", id).single();
    const makeDefault = form.get("is_default") === "on";
    if (makeDefault && current) {
      await supabase.from("document_templates").update({ is_default: false }).eq("kind", current.kind).neq("id", id);
    }
    const { error } = await supabase
      .from("document_templates")
      .update({ name: required(form, "name", "Template name"), body, ...(makeDefault ? { is_default: true } : {}) })
      .eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  return { ok: "Template saved." };
}

export async function resetTemplate(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing template." };
    const supabase = await createClient();
    const { data: current, error: readError } = await supabase.from("document_templates").select("kind").eq("id", id).single();
    if (readError) throw readError;
    const { error } = await supabase
      .from("document_templates")
      .update({ body: defaultTemplateBody(current.kind as DocumentKind) })
      .eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/settings/templates/${String(form.get("id"))}`);
}

export async function deleteTemplate(_s: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await requireAdmin();
  if (ctx.role !== "owner") return { error: "Only the owner can delete templates." };
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing template." };
    const supabase = await createClient();
    const { error } = await supabase.from("document_templates").delete().eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/settings/templates");
}

// ------------------------------------------------------------ business details

export async function updateBusinessSettings(_s: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await requireAdmin();
  if (ctx.role !== "owner") return { error: "Only the owner can change business details." };
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("business_settings")
      .update({
        trading_name: text(form, "trading_name", 200),
        legal_name: text(form, "legal_name", 200),
        company_number: text(form, "company_number", 50),
        address: text(form, "address", 1000),
        email: text(form, "email", 320),
        phone: text(form, "phone", 50),
        website: text(form, "website", 200),
        vat_number: text(form, "vat_number", 50),
        signatory_name: text(form, "signatory_name", 200),
        signatory_title: text(form, "signatory_title", 200),
        payment_terms: text(form, "payment_terms", 2000),
        bank_details: text(form, "bank_details", 2000),
      })
      .eq("id", true);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  return { ok: "Business details saved." };
}
