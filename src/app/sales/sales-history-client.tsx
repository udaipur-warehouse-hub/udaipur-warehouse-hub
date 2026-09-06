"use client";

import { useState } from "react";
import Link from "next/link";
import { Panel } from "@/components/panel";

type Sale = {
  id: string;
  invoice_number: string;
  created_at: string;
  bill_type: "gst" | "non_gst";
  payment_method: "cash" | "card" | "online";
  total_amount: number;
};

export function SalesHistoryClient({ sales }: { sales: Sale[] }) {
  const [tab, setTab] = useState<"gst" | "non_gst">("gst");
  const gstSales = sales.filter((s) => s.bill_type === "gst");
  const noBillSales = sales.filter((s) => s.bill_type === "non_gst");
  const shown = tab === "gst" ? gstSales : noBillSales;
  const total = shown.reduce((sum, s) => sum + Number(s.total_amount), 0);

  return (
    <Panel
      title="Sales History"
      subtitle={`${gstSales.length} GST bill${gstSales.length === 1 ? "" : "s"} · ${noBillSales.length} without bill`}
      bodyClassName="p-0"
      actions={
        <div className="flex rounded-lg border border-border overflow-hidden text-sm">
          <TabButton active={tab === "gst"} onClick={() => setTab("gst")}>
            GST Bills ({gstSales.length})
          </TabButton>
          <TabButton active={tab === "non_gst"} onClick={() => setTab("non_gst")} borderLeft>
            Without Bill ({noBillSales.length})
          </TabButton>
        </div>
      }
    >
      <div className="px-4 sm:px-5 py-2.5 border-b border-border text-sm text-muted flex justify-between">
        <span>{tab === "gst" ? "Billed sales, GST charged" : "No-bill sales, cash/off-book style"}</span>
        <span>Total: ₹{total.toFixed(2)}</span>
      </div>

      {shown.length === 0 ? (
        <p className="text-center text-muted py-10">No bills here yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background text-muted text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Invoice #</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Payment</th>
                <th className="px-4 py-2 font-medium text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((sale) => (
                <tr key={sale.id} className="border-t border-border">
                  <td className="px-4 py-2">
                    <Link href={`/invoice/${sale.id}`} className="text-copper-dark hover:underline font-mono text-xs">
                      {sale.invoice_number}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-muted">{new Date(sale.created_at).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-2 capitalize">{sale.payment_method}</td>
                  <td className="px-4 py-2 text-right">{Number(sale.total_amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function TabButton({
  active,
  onClick,
  borderLeft,
  children,
}: {
  active: boolean;
  onClick: () => void;
  borderLeft?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 ${borderLeft ? "border-l border-border" : ""} ${
        active ? "bg-copper text-white" : "hover:bg-background"
      }`}
    >
      {children}
    </button>
  );
}
