import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getAdminContext } from "@/lib/admin/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const ctx = await getAdminContext();
  if (ctx.status === "admin") redirect("/admin");
  const { error } = await searchParams;

  return (
    <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Logo />
        <h1 className="mt-6 text-xl font-semibold text-ink">Admin sign in</h1>
        <p className="mt-1 text-sm text-slate-600">
          We&rsquo;ll email you a secure link — no password needed.
        </p>
        {error === "link" && (
          <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            That sign-in link has expired or was already used. Request a new one below.
          </p>
        )}
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
