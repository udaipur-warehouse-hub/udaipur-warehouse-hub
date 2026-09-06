"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CreditVendor } from "@/lib/types";
import { Panel } from "@/components/panel";

export function VendorListClient() {
  const [vendors, setVendors] = useState<CreditVendor[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  async function load(query = "") {
    setLoading(true);
    const res = await fetch(`/api/credit-vendors?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setVendors(data.vendors ?? []);
    setLoading(false);
  }

  useEffect(() => {
    const t = setTimeout(() => load(q), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const totalOwed = vendors.reduce((sum, v) => sum + v.balance, 0);

  return (
    <div className="space-y-5">
      <Panel
        title="Credit Vendors"
        subtitle={`${vendors.length} vendor${vendors.length === 1 ? "" : "s"} · ₹${totalOwed.toFixed(2)} owed to you in total`}
        actions={
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            + Add vendor
          </button>
        }
        bodyClassName="p-0"
      >
        <div className="px-4 sm:px-5 py-3 border-b border-border">
          <input
            className="input max-w-xs"
            placeholder="Search by name or phone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {!loading && vendors.length === 0 && (
          <p className="text-center text-muted py-10">
            {q ? "No vendors match that search." : "No vendors yet — add your first one above."}
          </p>
        )}

        <div className="divide-y divide-border">
          {vendors.map((v) => (
            <Link
              key={v.id}
              href={`/credit-vendors/${v.id}`}
              className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 hover:bg-background transition-colors"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{v.name}</div>
                <div className="text-xs text-muted">
                  {v.phone || "no phone"}
                  {v.payment_amount && ` · ₹${v.payment_amount}/${v.payment_frequency}`}
                </div>
              </div>
              <div className={`text-right shrink-0 font-semibold ${v.balance > 0 ? "text-danger" : "text-success"}`}>
                {v.balance > 0 ? `₹${v.balance.toFixed(2)}` : "Settled"}
              </div>
            </Link>
          ))}
        </div>
      </Panel>

      {showAdd && <AddVendorModal onClose={() => setShowAdd(false)} onAdded={(v) => setVendors((list) => [v, ...list])} />}
    </div>
  );
}

function AddVendorModal({ onClose, onAdded }: { onClose: () => void; onAdded: (v: CreditVendor) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("monthly");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/credit-vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          address,
          payment_frequency: frequency,
          payment_amount: paymentAmount || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save vendor");
      onAdded(data.vendor);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-semibold mb-3">Add a credit vendor</h2>
        {error && (
          <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2 mb-3">
            {error}
          </div>
        )}
        <div className="space-y-3">
          <label className="block">
            <span className="block text-xs font-medium text-muted mb-1">Name *</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-muted mb-1">Phone</span>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-muted mb-1">Address</span>
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-muted mb-1">Pays every</span>
              <select className="input" value={frequency} onChange={(e) => setFrequency(e.target.value as "weekly" | "monthly")}>
                <option value="weekly">Week</option>
                <option value="monthly">Month</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-muted mb-1">Agreed amount (₹)</span>
              <input
                className="input"
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={saving} onClick={save}>
            {saving ? "Saving…" : "Save vendor"}
          </button>
        </div>
      </div>
    </div>
  );
}
