"use client";

import { useEffect, useState } from "react";
import type { RetailVendor, VendorLedgerEntry } from "@/lib/types";
import { Panel } from "@/components/panel";

export function VendorDetailClient({ vendorId }: { vendorId: string }) {
  const [vendor, setVendor] = useState<RetailVendor | null>(null);
  const [entries, setEntries] = useState<VendorLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/retail-vendors/${vendorId}`);
    const data = await res.json();
    if (res.ok) {
      setVendor(data.vendor);
      setEntries(data.entries ?? []);
    } else {
      setError(data.error || "Could not load vendor");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  if (loading) return <p className="text-muted py-10 text-center">Loading…</p>;
  if (error || !vendor) return <p className="text-danger py-10 text-center">{error || "Vendor not found"}</p>;

  // Running balance through the ledger, oldest first (entries already come sorted that way)
  let running = 0;
  const withRunning = entries.map((e) => {
    running += e.entry_type === "credit_sale" ? e.amount : -e.amount;
    return { ...e, running };
  });

  return (
    <div className="space-y-5">
      <Panel title={vendor.name} subtitle={[vendor.phone, vendor.address].filter(Boolean).join(" · ") || undefined}>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted">Current balance</span>
          <span className={`text-2xl font-bold ${vendor.balance > 0 ? "text-danger" : "text-success"}`}>
            {vendor.balance > 0 ? `₹${vendor.balance.toFixed(2)} owed` : "Settled up"}
          </span>
        </div>
      </Panel>

      <RecordEntryPanel
        vendorId={vendorId}
        onRecorded={(entry, newBalance) => {
          setEntries((list) => [...list, entry]);
          setVendor((v) => (v ? { ...v, balance: newBalance } : v));
        }}
      />

      <Panel title="Ledger history" subtitle={`${entries.length} entr${entries.length === 1 ? "y" : "ies"}`} bodyClassName="p-0">
        {entries.length === 0 ? (
          <p className="text-center text-muted py-10">No entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background text-muted text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Note</th>
                  <th className="px-4 py-2 font-medium text-right">Amount (₹)</th>
                  <th className="px-4 py-2 font-medium text-right">Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {withRunning.map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-4 py-2 text-muted">{e.entry_date}</td>
                    <td className="px-4 py-2">
                      {e.entry_type === "credit_sale" ? (
                        <span className="text-danger">Credit sale</span>
                      ) : (
                        <span className="text-success">Payment received</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-muted">{e.note || "—"}</td>
                    <td className="px-4 py-2 text-right">
                      {e.entry_type === "credit_sale" ? "+" : "−"}
                      {e.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">{e.running.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function RecordEntryPanel({
  vendorId,
  onRecorded,
}: {
  vendorId: string;
  onRecorded: (entry: VendorLedgerEntry, newBalance: number) => void;
}) {
  const [type, setType] = useState<"credit_sale" | "payment_received">("credit_sale");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!amount || Number(amount) <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/retail-vendors/${vendorId}/ledger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry_type: type, amount: Number(amount), note, entry_date: date }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not record entry");

      // recompute balance locally from the fresh row's perspective by refetching balance
      const balRes = await fetch(`/api/retail-vendors/${vendorId}`);
      const balData = await balRes.json();
      onRecorded(data.entry, balData.vendor.balance);
      setAmount("");
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel title="Record an entry">
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("credit_sale")}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              type === "credit_sale" ? "bg-copper text-white border-copper" : "border-border hover:bg-background"
            }`}
          >
            Credit sale (they owe more)
          </button>
          <button
            type="button"
            onClick={() => setType("payment_received")}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              type === "payment_received" ? "bg-copper text-white border-copper" : "border-border hover:bg-background"
            }`}
          >
            Payment received (they paid)
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="block text-xs font-medium text-muted mb-1">Amount (₹) *</span>
            <input className="input" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-muted mb-1">Date</span>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="block sm:col-span-1">
            <span className="block text-xs font-medium text-muted mb-1">Note (optional)</span>
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="what/why" />
          </label>
        </div>

        {error && (
          <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{error}</div>
        )}

        <button className="btn-primary" disabled={saving} onClick={submit}>
          {saving ? "Saving…" : "Add entry"}
        </button>
      </div>
    </Panel>
  );
}
