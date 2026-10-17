import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Small id/name lists for the select boxes on admin forms. */
export async function getRefs() {
  const supabase = await createClient();
  const [clients, leads, projects] = await Promise.all([
    supabase.from("clients").select("id, name").order("name"),
    supabase.from("leads").select("id, full_name, business_name").is("client_id", null).order("created_at", { ascending: false }).limit(200),
    supabase.from("projects").select("id, name").order("created_at", { ascending: false }).limit(200),
  ]);
  return {
    clients: clients.data ?? [],
    leads: (leads.data ?? []).map((l) => ({
      id: l.id,
      name: l.business_name ? `${l.full_name} (${l.business_name})` : l.full_name,
    })),
    projects: projects.data ?? [],
  };
}

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
