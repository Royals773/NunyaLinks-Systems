import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Only the private admin area needs a session — the public marketing site
// is left untouched.
export const config = {
  matcher: ["/admin/:path*"],
};
