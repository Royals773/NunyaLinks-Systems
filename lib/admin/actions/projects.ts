"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { PROJECT_STATUSES, PROJECT_TYPES, values } from "@/lib/admin/constants";
import { date, FormError, oneOf, pence, required, text, toState, uuid, type ActionState } from "@/lib/admin/forms";

function projectFields(form: FormData) {
  const clientId = uuid(form, "client_id");
  if (!clientId) throw new FormError("Choose a client.");
  return {
    client_id: clientId,
    name: required(form, "name", "Project name"),
    type: oneOf(form, "type", values(PROJECT_TYPES), "other"),
    status: oneOf(form, "status", values(PROJECT_STATUSES), "planned"),
    start_date: date(form, "start_date"),
    due_date: date(form, "due_date"),
    value_pence: pence(form, "value"),
    notes: text(form, "notes"),
  };
}

export async function createProject(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  let id: string;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("projects").insert(projectFields(form)).select("id").single();
    if (error) throw error;
    id = data.id;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/projects/${id}`);
}

export async function updateProject(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing project." };
    const supabase = await createClient();
    const { error } = await supabase.from("projects").update(projectFields(form)).eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  return { ok: "Saved." };
}

export async function deleteProject(_s: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await requireAdmin();
  if (ctx.role !== "owner") return { error: "Only the owner can delete records." };
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing project." };
    const supabase = await createClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/projects");
}

export async function addTask(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const projectId = uuid(form, "project_id");
    if (!projectId) return { error: "Missing project." };
    const supabase = await createClient();
    const { error } = await supabase.from("project_tasks").insert({
      project_id: projectId,
      title: required(form, "title", "Task", 300),
      due_date: date(form, "due_date"),
    });
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  return { ok: "Task added." };
}

export async function toggleTask(_s: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing task." };
    const supabase = await createClient();
    const { error } = await supabase
      .from("project_tasks")
      .update({ done: form.get("done") === "true" })
      .eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  return null;
}

export async function deleteTask(_s: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await requireAdmin();
  if (ctx.role !== "owner") return { error: "Only the owner can delete." };
  try {
    const id = uuid(form, "id");
    if (!id) return { error: "Missing task." };
    const supabase = await createClient();
    const { error } = await supabase.from("project_tasks").delete().eq("id", id);
    if (error) throw error;
  } catch (e) {
    return toState(e);
  }
  revalidatePath("/admin", "layout");
  return null;
}
