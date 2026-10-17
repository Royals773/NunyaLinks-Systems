"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { QUOTE_STATUSES, values } from "@/lib/admin/constants";
import { todayIso } from "@/lib/admin/format";
import { date, decimal, FormError, oneOf, pence, required, text, toState, uuid, type ActionState } from "@/lib/admin/forms";

function quoteFields(form: FormData) {
  const clientId = uuid(form, "client_id");
  const leadId = uuid(form, "lead_id");
  if (!clientId && !leadId) throw new FormError("Choose a client or a lead.");
  return {
    client_id: clientId,
    lead_id: leadId,
    project_id: uuid(form, "project_id"),
    title: required(form, "title", "Title"),
    status: oneOf(form, "status", values(QUOTE_STATUSES), "draft"),
    issue_date: date(form, "issue_date") ?? todayIso(),
    valid_until: date(form, "valid_until"),
    vat_rate: decimal(form, "vat_rate", 0, 0, 100),
    notes: text(form, "notes"),
  };
}

export async function createQuote(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  let id: string;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("quotes").insert(quoteFields(form)).select("id").single();
    if (error) throw error;
    id = data.id;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/quotes/${id}`);
}

export async function updateQuote(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing quote." };
    const supabase = await createClient();
    const { error } = await supabase.from("quotes").update(quoteFields(form)).eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  return { ok: "Saved." };
}

export async function addQuoteItem(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const quoteId = uuid(form, "quote_id");
    if (!quoteId) return { error: "Missing quote." };
    const supabase = await createClient();
    const { count } = await supabase
      .from("quote_items")
      .select("id", { count: "exact", head: true })
      .eq("quote_id", quoteId);
    const { error } = await supabase.from("quote_items").insert({
      quote_id: quoteId,
      position: count ?? 0,
      description: required(form, "description", "Description", 500),
      quantity: decimal(form, "quantity", 1, 0.01, 100000),
      unit_price_pence: pence(form, "unit_price") ?? 0,
    });
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  return { ok: "Line added." };
}

export async function deleteQuoteItem(_s: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await requireAdmin();
  if (ctx.role !== "owner") return { error: "Only the owner can delete." };
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing line." };
    const supabase = await createClient();
    const { error } = await supabase.from("quote_items").delete().eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  return null;
}

/** Creates a draft invoice from an accepted quote, copying its lines. */
export async function convertQuoteToInvoice(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  let invoiceId: string;
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing quote." };
    const supabase = await createClient();
    const { data: quote, error } = await supabase
      .from("quotes")
      .select("*, quote_items(*)")
      .eq("id", id)
      .single();
    if (error) throw error;
    if (!quote.client_id) {
      return { error: "This quote is for a lead. Convert the lead to a client first." };
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        client_id: quote.client_id,
        project_id: quote.project_id,
        quote_id: quote.id,
        vat_rate: quote.vat_rate,
        notes: quote.notes,
      })
      .select("id")
      .single();
    if (invoiceError) throw invoiceError;
    invoiceId = invoice.id;

    const items = (quote.quote_items ?? []).map((item) => ({
      invoice_id: invoice.id,
      position: item.position,
      description: item.description,
      quantity: item.quantity,
      unit_price_pence: item.unit_price_pence,
    }));
    if (items.length) {
      const { error: itemsError } = await supabase.from("invoice_items").insert(items);
      if (itemsError) throw itemsError;
    }

    await supabase.from("quotes").update({ status: "accepted" }).eq("id", quote.id);
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/invoices/${invoiceId}`);
}

export async function deleteQuote(_s: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await requireAdmin();
  if (ctx.role !== "owner") return { error: "Only the owner can delete records." };
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing quote." };
    const supabase = await createClient();
    const { error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/quotes");
}
