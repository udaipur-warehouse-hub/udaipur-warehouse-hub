import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";

export default async function SalesHistoryPage() {
  const supabase = supabaseServer();
  const { data: sales } = await supabase
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-xl font-semibold mb-6">Sales History</h1>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-background text-muted text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Invoice #</th>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Payment</th>
              <th className="px-4 py-2 font-medium text-right">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {(!sales || sales.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  No bills raised yet.
                </td>
              </tr>
            )}
            {sales?.map((sale) => (
              <tr key={sale.id} className="border-t border-border">
                <td className="px-4 py-2">
                  <Link href={`/invoice/${sale.id}`} className="text-copper-dark hover:underline font-mono text-xs">
                    {sale.invoice_number}
                  </Link>
                </td>
                <td className="px-4 py-2 text-muted">
                  {new Date(sale.created_at).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-2">{sale.bill_type === "gst" ? "GST Bill" : "No Bill"}</td>
                <td className="px-4 py-2 capitalize">{sale.payment_method}</td>
                <td className="px-4 py-2 text-right">{Number(sale.total_amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
