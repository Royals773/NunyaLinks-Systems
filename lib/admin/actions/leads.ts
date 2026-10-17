"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { LEAD_SOURCES, LEAD_STATUSES, values } from "@/lib/admin/constants";
import { date, oneOf, required, text, toState, uuid, type ActionState } from "@/lib/admin/forms";

function leadFields(form: FormData) {
  return {
    full_name: required(form, "full_name", "Name"),
    business_name: text(form, "business_name", 200),
    email: required(form, "email", "Email", 320),
    phone: text(form, "phone", 50),
    location: text(form, "location", 200),
    industry: text(form, "industry", 200),
    biggest_task: text(form, "biggest_task", 4000),
    source: oneOf(form, "source", values(LEAD_SOURCES), "other"),
    status: oneOf(form, "status", values(LEAD_STATUSES), "new"),
    next_follow_up: date(form, "next_follow_up"),
    notes: text(form, "notes"),
  };
}

export async function createLead(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  let id: string;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("leads").insert(leadFields(form)).select("id").single();
    if (error) throw error;
    id = data.id;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/leads/${id}`);
}

export async function updateLead(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing lead." };
    const supabase = await createClient();
    const { error } = await supabase.from("leads").update(leadFields(form)).eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  return { ok: "Saved." };
}

export async function convertLeadToClient(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  let clientId: string;
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing lead." };
    const supabase = await createClient();
    const { data: lead, error } = await supabase.from("leads").select("*").eq("id", id).single();
    if (error) throw error;

    if (lead.client_id) {
      clientId = lead.client_id;
    } else {
      const { data: client, error: insertError } = await supabase
        .from("clients")
        .insert({
          name: lead.business_name || lead.full_name,
          contact_name: lead.full_name,
          email: lead.email,
          phone: lead.phone,
          address: lead.location,
          lead_id: lead.id,
        })
        .select("id")
        .single();
      if (insertError) throw insertError;
      clientId = client.id;

      const { error: updateError } = await supabase
        .from("leads")
        .update({ client_id: clientId, status: "won" })
        .eq("id", lead.id);
      if (updateError) throw updateError;

      // Quotes raised against the lead now belong to the client too.
      await supabase.from("quotes").update({ client_id: clientId }).eq("lead_id", lead.id).is("client_id", null);
    }
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/clients/${clientId}`);
}

export async function deleteLead(_s: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await requireAdmin();
  if (ctx.role !== "owner") return { error: "Only the owner can delete records." };
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing lead." };
    const supabase = await createClient();
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/leads");
}
