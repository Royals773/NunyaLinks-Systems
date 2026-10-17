"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/admin/forms";

const GENERIC_SENT =
  "If that email has admin access, a sign-in link is on its way. Check your inbox (and spam folder).";

async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_SITE_URL ?? "";
}

export async function sendMagicLink(_state: ActionState, form: FormData): Promise<ActionState> {
  const raw = form.get("email");
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Only existing accounts can sign in — nobody can register here.
      shouldCreateUser: false,
      emailRedirectTo: `${await siteOrigin()}/admin/auth/confirm`,
    },
  });

  // Rate limiting is the one error worth surfacing; everything else gets
  // the same message so the form doesn't reveal which emails exist.
  if (error && error.status === 429) {
    return { error: "Too many sign-in requests. Please wait a few minutes and try again." };
  }
  return { ok: GENERIC_SENT };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
