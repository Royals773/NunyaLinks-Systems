import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";

/**
 * Session-less client for server code acting on behalf of an anonymous
 * website visitor (e.g. saving an Opportunity Review submission as a lead).
 * The database only lets this role INSERT new website leads.
 */
export function createPublicClient() {
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
