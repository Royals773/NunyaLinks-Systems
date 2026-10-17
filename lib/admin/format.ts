// Display helpers for the admin area. All money is stored as integer pence.

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

export function formatMoney(pence: number | null | undefined) {
  if (pence === null || pence === undefined) return "—";
  return gbp.format(pence / 100);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = value.length === 10 ? new Date(`${value}T00:00:00Z`) : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

/** Today's date in the UK, as YYYY-MM-DD. */
export function todayIso() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date());
}

export interface LineItem {
  quantity: number;
  unit_price_pence: number;
}

export function lineTotal(item: LineItem) {
  return Math.round(Number(item.quantity) * item.unit_price_pence);
}

export function totals(items: LineItem[], vatRate: number) {
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const vat = Math.round((subtotal * Number(vatRate)) / 100);
  return { subtotal, vat, total: subtotal + vat };
}

export function isOverdue(invoice: { status: string; due_date: string | null }) {
  return invoice.status === "sent" && !!invoice.due_date && invoice.due_date < todayIso();
}
