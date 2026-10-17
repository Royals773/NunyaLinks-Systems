import "server-only";
import type { AuditRequestPayload } from "@/lib/audit";
import { createPublicClient } from "@/lib/supabase/public";

const clip = (value: string, max: number) => (value ? value.slice(0, max) : null);

/**
 * Saves an Opportunity Review submission into the NunyaLink Admin leads
 * list. Best-effort by design: a database problem must never stop the
 * visitor's submission, the notification email or the Google Sheet flow.
 */
export async function saveWebsiteLead(payload: AuditRequestPayload) {
  try {
    const supabase = createPublicClient();
    const { error } = await supabase.from("leads").insert({
      full_name: clip(payload.fullName, 200) ?? "Unknown",
      business_name: clip(payload.businessName, 200),
      email: clip(payload.email, 320) ?? "",
      phone: clip(payload.phone, 50),
      location: clip(payload.location, 200),
      contact_method: clip(payload.contactMethod, 50),
      industry: clip(payload.industry, 200),
      employees: clip(payload.employees, 50),
      biggest_task: clip(payload.process, 4000),
      hours_per_week: clip(payload.hoursPerWeek, 50),
    });
    if (error) console.error("Could not save website lead to admin:", error.message);
  } catch (error) {
    console.error("Could not save website lead to admin:", error);
  }
}
