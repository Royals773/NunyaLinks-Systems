"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { CLIENT_STATUSES, values } from "@/lib/admin/constants";
import { oneOf, required, text, toState, uuid, type ActionState } from "@/lib/admin/forms";

function clientFields(form: FormData) {
  return {
    name: required(form, "name", "Business name"),
    contact_name: text(form, "contact_name", 200),
    email: text(form, "email", 320),
    phone: text(form, "phone", 50),
    address: text(form, "address", 1000),
    status: oneOf(form, "status", values(CLIENT_STATUSES), "active"),
    notes: text(form, "notes"),
  };
}

export async function createClientRecord(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  let id: string;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("clients").insert(clientFields(form)).select("id").single();
    if (error) throw error;
    id = data.id;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/clients/${id}`);
}

export async function updateClientRecord(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing client." };
    const supabase = await createClient();
    const { error } = await supabase.from("clients").update(clientFields(form)).eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  return { ok: "Saved." };
}

export async function deleteClientRecord(_s: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await requireAdmin();
  if (ctx.role !== "owner") return { error: "Only the owner can delete records." };
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing client." };
    const supabase = await createClient();
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) throw error;
  } catch (e) {
    const state = toState(e);
    if (state?.error?.includes("linked")) {
      return { error: "This client still has projects, quotes or invoices. Remove those first." };
    }
    return state;
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/clients");
}
