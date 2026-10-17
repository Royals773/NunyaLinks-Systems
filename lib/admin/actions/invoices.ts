"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { INVOICE_STATUSES, values } from "@/lib/admin/constants";
import { todayIso } from "@/lib/admin/format";
import { date, decimal, FormError, oneOf, pence, required, text, toState, uuid, type ActionState } from "@/lib/admin/forms";

function invoiceFields(form: FormData) {
  const clientId = uuid(form, "client_id");
  if (!clientId) throw new FormError("Choose a client.");
  const status = oneOf(form, "status", values(INVOICE_STATUSES), "draft");
  let paidDate = date(form, "paid_date");
  if (status === "paid" && !paidDate) paidDate = todayIso();
  if (status !== "paid") paidDate = null;
  return {
    client_id: clientId,
    project_id: uuid(form, "project_id"),
    status,
    issue_date: date(form, "issue_date") ?? todayIso(),
    due_date: date(form, "due_date"),
    paid_date: paidDate,
    vat_rate: decimal(form, "vat_rate", 0, 0, 100),
    notes: text(form, "notes"),
  };
}

export async function createInvoice(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  let id: string;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("invoices").insert(invoiceFields(form)).select("id").single();
    if (error) throw error;
    id = data.id;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/invoices/${id}`);
}

export async function updateInvoice(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing invoice." };
    const supabase = await createClient();
    const { error } = await supabase.from("invoices").update(invoiceFields(form)).eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  return { ok: "Saved." };
}

export async function markInvoicePaid(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing invoice." };
    const supabase = await createClient();
    const { error } = await supabase
      .from("invoices")
      .update({ status: "paid", paid_date: todayIso() })
      .eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  return { ok: "Marked as paid." };
}

export async function addInvoiceItem(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const invoiceId = uuid(form, "invoice_id");
    if (!invoiceId) return { error: "Missing invoice." };
    const supabase = await createClient();
    const { count } = await supabase
      .from("invoice_items")
      .select("id", { count: "exact", head: true })
      .eq("invoice_id", invoiceId);
    const { error } = await supabase.from("invoice_items").insert({
      invoice_id: invoiceId,
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

export async function deleteInvoiceItem(_s: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await requireAdmin();
  if (ctx.role !== "owner") return { error: "Only the owner can delete." };
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing line." };
    const supabase = await createClient();
    const { error } = await supabase.from("invoice_items").delete().eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  return null;
}

export async function deleteInvoice(_s: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await requireAdmin();
  if (ctx.role !== "owner") return { error: "Only the owner can delete records." };
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing invoice." };
    const supabase = await createClient();
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/invoices");
}
