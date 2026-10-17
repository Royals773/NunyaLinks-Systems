import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/auth/"];

/**
 * Refreshes the Supabase session cookie on every /admin request and sends
 * signed-out visitors to the login page. Admin *authorisation* (is this
 * user allowed in?) is enforced again in the admin layout and by the
 * database's row-level security — this is only the first gate.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
          for (const [key, value] of Object.entries(headers ?? {})) {
            supabaseResponse.headers.set(key, value);
          }
        },
      },
    },
  );

  // Do not run other code between creating the client and getClaims():
  // getClaims() is what refreshes and verifies the session.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => path.startsWith(p));

  if (!signedIn && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    const redirect = NextResponse.redirect(url);
    for (const cookie of supabaseResponse.cookies.getAll()) {
      redirect.cookies.set(cookie);
    }
    return redirect;
  }

  supabaseResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
  return supabaseResponse;
}
