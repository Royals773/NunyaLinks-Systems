import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/supabase/database.types";
import { formatDate, formatMoney, lineTotal, todayIso, totals } from "./format";
import { DEFAULT_CONTRACT_TEMPLATE, DEFAULT_PROPOSAL_TEMPLATE } from "./default-templates";

export type DocumentKind = "proposal" | "contract";

export const PLACEHOLDERS: { key: string; description: string }[] = [
  { key: "date", description: "Today's date" },
  { key: "document.number", description: "The document's number, e.g. P-0001" },
  { key: "client.name", description: "Client or lead business name" },
  { key: "client.contact_name", description: "Main contact's name" },
  { key: "client.email", description: "Client email" },
  { key: "client.address", description: "Client address" },
  { key: "lead.biggest_task", description: "What the lead said is costing them time" },
  { key: "quote.title", description: "Quote title" },
  { key: "quote.number", description: "Quote number" },
  { key: "quote.items_table", description: "Table of quote lines with subtotal, VAT and total" },
  { key: "quote.total", description: "Quote total including VAT" },
  { key: "quote.valid_until", description: "Quote expiry date" },
  { key: "project.name", description: "Linked project name" },
  { key: "business.trading_name", description: "Your trading name (Settings)" },
  { key: "business.legal_name", description: "Your registered company name (Settings)" },
  { key: "business.company_number", description: "Company number (Settings)" },
  { key: "business.address", description: "Registered address (Settings)" },
  { key: "business.email", description: "Business email (Settings)" },
  { key: "business.phone", description: "Business phone (Settings)" },
  { key: "business.vat_number", description: "VAT number (Settings)" },
  { key: "business.signatory_name", description: "Who signs for NunyaLink (Settings)" },
  { key: "business.signatory_title", description: "Their position (Settings)" },
  { key: "business.payment_terms", description: "Standard payment terms (Settings)" },
  { key: "business.bank_details", description: "Bank details (Settings)" },
];

export function defaultTemplateBody(kind: DocumentKind) {
  return kind === "proposal" ? DEFAULT_PROPOSAL_TEMPLATE : DEFAULT_CONTRACT_TEMPLATE;
}

type Supabase = SupabaseClient<Database>;

/** Installs the built-in templates the first time a kind has none. */
export async function ensureDefaultTemplates(supabase: Supabase) {
  const { data } = await supabase.from("document_templates").select("kind");
  const have = new Set((data ?? []).map((t) => t.kind));
  const missing: Database["public"]["Tables"]["document_templates"]["Insert"][] = [];
  if (!have.has("proposal")) {
    missing.push({ kind: "proposal", name: "Standard proposal", body: DEFAULT_PROPOSAL_TEMPLATE, is_default: true });
  }
  if (!have.has("contract")) {
    missing.push({ kind: "contract", name: "Services agreement", body: DEFAULT_CONTRACT_TEMPLATE, is_default: true });
  }
  if (missing.length) await supabase.from("document_templates").insert(missing);
}

function escapeCell(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

export function itemsTable(
  items: { description: string; quantity: number; unit_price_pence: number }[],
  vatRate: number,
) {
  if (!items.length) return "[Add lines to the linked quote, or write the pricing here.]";
  const t = totals(items, vatRate);
  const rows = items.map(
    (i) =>
      `| ${escapeCell(i.description)} | ${Number(i.quantity)} | ${formatMoney(i.unit_price_pence)} | ${formatMoney(lineTotal(i))} |`,
  );
  const foot = [`| | | **Subtotal** | **${formatMoney(t.subtotal)}** |`];
  if (Number(vatRate) > 0) foot.push(`| | | VAT (${Number(vatRate)}%) | ${formatMoney(t.vat)} |`);
  foot.push(`| | | **Total** | **${formatMoney(t.total)}** |`);
  return ["| Item | Qty | Price | Amount |", "| --- | ---: | ---: | ---: |", ...rows, ...foot].join("\n");
}

export interface FillContext {
  documentNumber?: string;
  client?: Pick<Tables<"clients">, "name" | "contact_name" | "email" | "address"> | null;
  lead?: Pick<Tables<"leads">, "full_name" | "business_name" | "email" | "location" | "biggest_task"> | null;
  quote?: (Pick<Tables<"quotes">, "title" | "quote_number" | "valid_until" | "vat_rate"> & {
    items: { description: string; quantity: number; unit_price_pence: number }[];
  }) | null;
  project?: Pick<Tables<"projects">, "name"> | null;
  business?: Tables<"business_settings"> | null;
}

/**
 * Replaces {{placeholders}} with real values. Anything we don't have a
 * value for becomes a visible [bracketed note] so it's easy to spot and
 * fill in by hand before sending.
 */
export function fillTemplate(body: string, ctx: FillContext) {
  const b = ctx.business;
  const clientName = ctx.client?.name ?? ctx.lead?.business_name ?? ctx.lead?.full_name;
  const values: Record<string, string | null | undefined> = {
    date: formatDate(todayIso()),
    "document.number": ctx.documentNumber,
    "client.name": clientName,
    "client.contact_name": ctx.client?.contact_name ?? ctx.lead?.full_name,
    "client.email": ctx.client?.email ?? ctx.lead?.email,
    "client.address": ctx.client?.address ?? ctx.lead?.location,
    "lead.biggest_task": ctx.lead?.biggest_task,
    "quote.title": ctx.quote?.title,
    "quote.number": ctx.quote?.quote_number,
    "quote.items_table": ctx.quote ? itemsTable(ctx.quote.items, ctx.quote.vat_rate) : null,
    "quote.total": ctx.quote ? formatMoney(totals(ctx.quote.items, ctx.quote.vat_rate).total) : null,
    "quote.valid_until": ctx.quote?.valid_until ? formatDate(ctx.quote.valid_until) : null,
    "project.name": ctx.project?.name,
    "business.trading_name": b?.trading_name,
    "business.legal_name": b?.legal_name,
    "business.company_number": b?.company_number,
    "business.address": b?.address,
    "business.email": b?.email,
    "business.phone": b?.phone,
    "business.vat_number": b?.vat_number,
    "business.signatory_name": b?.signatory_name,
    "business.signatory_title": b?.signatory_title,
    "business.payment_terms": b?.payment_terms,
    "business.bank_details": b?.bank_details,
  };
  const labels = Object.fromEntries(PLACEHOLDERS.map((p) => [p.key, p.description.replace(/ \(Settings\)$/, "")]));

  return body.replace(/\{\{\s*([a-z_.]+)\s*\}\}/g, (match, key: string) => {
    if (!(key in values)) return match;
    const value = values[key];
    if (value && value.trim()) {
      // Multi-line values (addresses) render as separate lines in Markdown.
      return key === "quote.items_table" ? value : value.trim().replace(/\n+/g, ", ");
    }
    return `[${labels[key] ?? key}]`;
  });
}
