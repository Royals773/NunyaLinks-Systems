import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/lib/admin/auth";
import { updateBusinessSettings } from "@/lib/admin/actions/documents";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, Field, inputClass, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const [{ data: b }, ctx] = await Promise.all([
    supabase.from("business_settings").select("*").maybeSingle(),
    getAdminContext(),
  ]);
  const isOwner = ctx.status === "admin" && ctx.role === "owner";
  const input = (name: keyof NonNullable<typeof b>, label: string, hint?: string, type = "text") => (
    <Field label={label} htmlFor={name} hint={hint}>
      <input id={name} name={name} type={type} defaultValue={(b?.[name] as string | null) ?? ""} className={inputClass} disabled={!isOwner} />
    </Field>
  );
  const area = (name: keyof NonNullable<typeof b>, label: string, hint?: string) => (
    <Field label={label} htmlFor={name} hint={hint} className="sm:col-span-2">
      <textarea id={name} name={name} rows={3} defaultValue={(b?.[name] as string | null) ?? ""} className={inputClass} disabled={!isOwner} />
    </Field>
  );

  return (
    <>
      <PageHeader title="Settings" description="Business details used on proposals, contracts and invoices." />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_20rem]">
        <Card title="Business details">
          {!isOwner && <p className="mb-4 text-sm text-slate-500">Only the owner can change these.</p>}
          <ActionForm action={updateBusinessSettings} submitLabel="Save details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {input("trading_name", "Trading name")}
              {input("legal_name", "Registered company name", "As shown on Companies House, e.g. NunyaLink Systems Ltd")}
              {input("company_number", "Company number")}
              {input("vat_number", "VAT number", "Leave blank if not VAT registered")}
              {input("email", "Email", undefined, "email")}
              {input("phone", "Phone")}
              {input("website", "Website")}
              <div className="hidden sm:block" />
              {input("signatory_name", "Who signs contracts", "Your full name")}
              {input("signatory_title", "Their position", "e.g. Director")}
              {area("address", "Registered address")}
              {area("payment_terms", "Standard payment terms", "Used in proposals and contracts")}
              {area("bank_details", "Bank details", "Optional — available as {{business.bank_details}} in templates")}
            </div>
          </ActionForm>
        </Card>
        <Card title="Document templates">
          <p className="text-sm text-slate-600">
            Change the standard wording of your proposals and contracts. New documents start from these.
          </p>
          <Link href="/admin/settings/templates" className="mt-4 inline-block text-sm font-semibold text-navy hover:underline">
            Edit templates →
          </Link>
        </Card>
      </div>
    </>
  );
}
