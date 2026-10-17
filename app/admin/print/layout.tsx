import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin/auth";

export default async function PrintLayout({ children }: { children: ReactNode }) {
  const ctx = await getAdminContext();
  if (ctx.status !== "admin") redirect("/admin/login");
  return <main id="main-content" className="flex-1 bg-slate-100 py-8 print:bg-white print:py-0">{children}</main>;
}
