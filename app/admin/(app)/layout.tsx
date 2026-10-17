import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getAdminContext } from "@/lib/admin/auth";
import { signOut } from "@/lib/admin/actions/session";
import AdminNav from "./AdminNav";

export default async function AdminAppLayout({ children }: { children: ReactNode }) {
  const ctx = await getAdminContext();
  if (ctx.status === "signed-out") redirect("/admin/login");

  if (ctx.status === "not-admin") {
    return (
      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold text-ink">No admin access</h1>
          <p className="mt-2 text-sm text-slate-600">
            {ctx.email ?? "This account"} isn&rsquo;t on the NunyaLink admin list. Ask the owner to add you.
          </p>
          <form action={signOut} className="mt-6">
            <button type="submit" className="text-sm font-semibold text-navy hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="bg-ink px-4 py-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:shrink-0 lg:flex-col lg:py-6">
        <div className="flex items-center justify-between gap-3 lg:block">
          <Link href="/admin" aria-label="NunyaLink admin home">
            <Logo variant="light" />
          </Link>
          <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-300 lg:mt-3 lg:inline-block">
            Admin
          </span>
        </div>
        <div className="mt-4 lg:mt-8 lg:flex-1">
          <AdminNav />
        </div>
        <div className="mt-4 hidden border-t border-white/10 pt-4 text-xs text-slate-400 lg:block">
          <p className="truncate" title={ctx.email ?? undefined}>{ctx.name ?? ctx.email}</p>
          <p className="capitalize">{ctx.role}</p>
          <div className="mt-3 flex gap-4">
            <Link href="/" className="hover:text-white">View site</Link>
            <form action={signOut}>
              <button type="submit" className="hover:text-white">Sign out</button>
            </form>
          </div>
        </div>
      </aside>
      <main id="main-content" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {children}
        <form action={signOut} className="mt-10 text-center lg:hidden">
          <button type="submit" className="text-sm font-medium text-slate-500 hover:text-ink">
            Sign out
          </button>
        </form>
      </main>
    </div>
  );
}
