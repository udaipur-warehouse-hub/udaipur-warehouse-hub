import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { PrintButton } from "./print-button";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = supabaseServer();

  const [{ data: sale }, { data: items }, { data: settings }] = await Promise.all([
    supabase.from("sales").select("*").eq("id", id).single(),
    supabase.from("sale_items").select("*").eq("sale_id", id).order("id"),
    supabase.from("shop_settings").select("*").single(),
  ]);

  if (!sale) notFound();

  const paymentLabel: Record<string, string> = { cash: "Cash", card: "Card", online: "Online" };
  const isGst = sale.bill_type === "gst";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="no-print flex justify-between items-center mb-4">
        <a href="/billing" className="text-sm text-copper-dark hover:underline">
          ← New bill
        </a>
        <PrintButton />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-8 print:border-0 print:rounded-none">
        {/* No-bill sales print a bare slip on purpose: no shop name, no
            invoice number, nothing that makes it look like a formal bill —
            just what was bought and the amount. */}
        {isGst && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-copper-dark">{settings?.shop_name ?? "Ganpati Metals"}</h1>
              {settings?.address && <p className="text-sm text-muted">{settings.address}</p>}
              {settings?.gstin && <p className="text-sm text-muted">GSTIN: {settings.gstin}</p>}
              {settings?.phone && <p className="text-sm text-muted">Ph: {settings.phone}</p>}
            </div>

            <div className="flex justify-between text-sm mb-4 border-y border-border py-3">
              <div>
                <div className="font-semibold">{sale.invoice_number}</div>
                <div className="text-muted">{new Date(sale.created_at).toLocaleString("en-IN")}</div>
              </div>
              <div className="text-right">
                <div>GST Bill</div>
                <div className="text-muted">{paymentLabel[sale.payment_method]}</div>
              </div>
            </div>

            {(sale.customer_name || sale.customer_phone) && (
              <div className="text-sm mb-4">
                {sale.customer_name && <div>{sale.customer_name}</div>}
                {sale.customer_phone && <div className="text-muted">{sale.customer_phone}</div>}
              </div>
            )}
          </>
        )}

        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="py-1.5 font-medium">Item</th>
              <th className="py-1.5 font-medium text-right">Qty</th>
              <th className="py-1.5 font-medium text-right">Rate</th>
              <th className="py-1.5 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item) => (
              <tr key={item.id} className="border-b border-border/60">
                <td className="py-1.5">{item.name}</td>
                <td className="py-1.5 text-right">
                  {item.qty} {item.unit}
                </td>
                <td className="py-1.5 text-right">{Number(item.unit_price).toFixed(2)}</td>
                <td className="py-1.5 text-right">{Number(item.line_total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto max-w-[220px] space-y-1 text-sm">
          {isGst && (
            <>
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>₹{Number(sale.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">GST</span>
                <span>₹{Number(sale.gst_amount).toFixed(2)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between font-semibold text-base border-t border-border pt-1">
            <span>Total</span>
            <span>₹{Number(sale.total_amount).toFixed(2)}</span>
          </div>
        </div>

        {isGst && <p className="text-center text-xs text-muted mt-8">Thank you for shopping with us!</p>}
      </div>
    </div>
  );
}
