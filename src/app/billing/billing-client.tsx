"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CartLine, Product } from "@/lib/types";
import { ItemSearch } from "./item-search";

type BillType = "gst" | "non_gst";
type PaymentMethod = "cash" | "card" | "online";

export function BillingClient() {
  const router = useRouter();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [billType, setBillType] = useState<BillType>("gst");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addToCart(p: Product) {
    setCart((lines) => {
      const existing = lines.find((l) => l.product_id === p.id);
      if (existing) {
        return lines.map((l) => (l.product_id === p.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [
        ...lines,
        {
          product_id: p.id,
          sku_code: p.sku_code,
          name: p.name,
          unit: p.unit,
          qty: 1,
          unit_price: p.selling_price,
          gst_rate: p.gst_rate,
        },
        ...[],
      ];
    });
  }

  function updateLine(index: number, patch: Partial<CartLine>) {
    setCart((lines) => lines.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function removeLine(index: number) {
    setCart((lines) => lines.filter((_, i) => i !== index));
  }

  const { subtotal, gstAmount, total } = useMemo(() => {
    let sub = 0;
    let gst = 0;
    for (const l of cart) {
      const lineTotal = l.qty * l.unit_price;
      sub += lineTotal;
      if (billType === "gst") gst += (lineTotal * l.gst_rate) / 100;
    }
    return { subtotal: sub, gstAmount: gst, total: sub + gst };
  }, [cart, billType]);

  async function completeSale() {
    if (cart.length === 0) {
      setError("Add at least one item to the bill");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bill_type: billType,
          payment_method: paymentMethod,
          customer_name: customerName,
          customer_phone: customerPhone,
          items: cart,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not complete sale");
      router.push(`/invoice/${data.sale.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <ItemSearch onPick={addToCart} />

        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background text-muted text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Item</th>
                <th className="px-3 py-2 font-medium w-20">Qty</th>
                <th className="px-3 py-2 font-medium w-28">Price (₹)</th>
                <th className="px-3 py-2 font-medium w-24 text-right">Total (₹)</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-muted">
                    Search and add items above to start the bill.
                  </td>
                </tr>
              )}
              {cart.map((line, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-2">
                    {line.name}
                    <div className="text-xs text-muted font-mono">{line.sku_code}</div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0.01}
                      step="0.01"
                      className="input py-1"
                      value={line.qty}
                      onChange={(e) => updateLine(i, { qty: Number(e.target.value) })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="input py-1"
                      value={line.unit_price}
                      onChange={(e) => updateLine(i, { unit_price: Number(e.target.value) })}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">{(line.qty * line.unit_price).toFixed(2)}</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => removeLine(i)} className="text-danger text-xs">
                      remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-4">
          <div>
            <span className="block text-xs font-medium text-muted mb-1">Bill type</span>
            <div className="flex gap-2">
              <ToggleButton active={billType === "gst"} onClick={() => setBillType("gst")}>
                With GST bill
              </ToggleButton>
              <ToggleButton active={billType === "non_gst"} onClick={() => setBillType("non_gst")}>
                Without bill
              </ToggleButton>
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-muted mb-1">Payment method</span>
            <div className="flex gap-2 flex-wrap">
              {(["cash", "card", "online"] as PaymentMethod[]).map((m) => (
                <ToggleButton key={m} active={paymentMethod === m} onClick={() => setPaymentMethod(m)}>
                  {m[0].toUpperCase() + m.slice(1)}
                </ToggleButton>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="block text-xs font-medium text-muted mb-1">Customer name (optional)</span>
            <input className="input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-muted mb-1">Phone (optional)</span>
            <input className="input" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </label>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 space-y-2 text-sm">
          <Row label="Subtotal" value={subtotal} />
          {billType === "gst" && <Row label="GST" value={gstAmount} />}
          <div className="border-t border-border pt-2">
            <Row label="Total" value={total} bold />
          </div>
        </div>

        {error && (
          <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button onClick={completeSale} disabled={submitting} className="btn-primary w-full py-3 text-base">
          {submitting ? "Saving…" : "Complete sale & print bill"}
        </button>
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
        active ? "bg-copper text-white border-copper" : "border-border hover:bg-background"
      }`}
    >
      {children}
    </button>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-base" : "text-muted"}`}>
      <span>{label}</span>
      <span>₹{value.toFixed(2)}</span>
    </div>
  );
}
