import type { ActionState } from "@/lib/admin/forms";
import { formatMoney, lineTotal, totals } from "@/lib/admin/format";
import { InlineAction } from "./ActionForm";

type Item = { id: string; description: string; quantity: number; unit_price_pence: number };

export function LineItemsTable({
  items,
  vatRate,
  removeAction,
}: {
  items: Item[];
  vatRate: number;
  removeAction?: (s: ActionState, f: FormData) => Promise<ActionState>;
}) {
  const t = totals(items, vatRate);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-4">Description</th>
            <th className="py-2 pr-4 text-right">Qty</th>
            <th className="py-2 pr-4 text-right">Unit price</th>
            <th className="py-2 text-right">Amount</th>
            {removeAction && <th className="w-px py-2" />}
          </tr>
        </thead>
        <tbody>
          {items.length ? (
            items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 align-top">
                <td className="py-2.5 pr-4 text-ink">{item.description}</td>
                <td className="py-2.5 pr-4 text-right">{Number(item.quantity)}</td>
                <td className="py-2.5 pr-4 text-right">{formatMoney(item.unit_price_pence)}</td>
                <td className="py-2.5 text-right font-medium">{formatMoney(lineTotal(item))}</td>
                {removeAction && (
                  <td className="py-1.5 pl-3 text-right print:hidden">
                    <InlineAction action={removeAction} hidden={{ id: item.id }} label="Remove" variant="danger" />
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={removeAction ? 5 : 4} className="py-6 text-center text-slate-500">
                No lines yet.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot className="text-right">
          <tr>
            <td colSpan={3} className="pt-3 pr-4 text-slate-500">Subtotal</td>
            <td className="pt-3">{formatMoney(t.subtotal)}</td>
          </tr>
          {Number(vatRate) > 0 && (
            <tr>
              <td colSpan={3} className="pt-1 pr-4 text-slate-500">VAT ({Number(vatRate)}%)</td>
              <td className="pt-1">{formatMoney(t.vat)}</td>
            </tr>
          )}
          <tr>
            <td colSpan={3} className="pt-2 pr-4 font-semibold text-ink">Total</td>
            <td className="pt-2 text-base font-semibold text-ink">{formatMoney(t.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
