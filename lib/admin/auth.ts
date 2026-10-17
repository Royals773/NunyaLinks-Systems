import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminContext =
  | { status: "signed-out" }
  | { status: "not-admin"; email: string | null }
  | {
      status: "admin";
      userId: string;
      email: string | null;
      role: "owner" | "staff";
      name: string | null;
    };

/** Who is signed in, and are they on the admin list? Cached per request. */
export const getAdminContext = cache(async (): Promise<AdminContext> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return { status: "signed-out" };

  const email = typeof claims.email === "string" ? claims.email : null;
  const { data: admin } = await supabase
    .from("admin_users")
    .select("role, full_name")
    .eq("user_id", claims.sub)
    .maybeSingle();

  if (!admin) return { status: "not-admin", email };
  return {
    status: "admin",
    userId: claims.sub,
    email,
    role: admin.role === "owner" ? "owner" : "staff",
    name: admin.full_name,
  };
});

/** Use at the top of every admin Server Action. */
export async function requireAdmin() {
  const ctx = await getAdminContext();
  if (ctx.status !== "admin") redirect("/admin/login");
  return ctx;
}
