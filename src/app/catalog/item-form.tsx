"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

const GST_RATES = [0, 5, 12, 18, 28];

export function ItemForm({
  initialName = "",
  onSaved,
  onCancel,
}: {
  initialName?: string;
  onSaved: (product: Product) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState({
    sku_code: "",
    name: initialName,
    category: "",
    unit: "pcs",
    hsn_code: "",
    gst_rate: 18,
    cost_price: "",
    selling_price: "",
    current_stock: "0",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.sku_code.trim() || !form.name.trim() || !form.selling_price) {
      setError("SKU code, name and selling price are required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          gst_rate: Number(form.gst_rate),
          cost_price: form.cost_price ? Number(form.cost_price) : null,
          selling_price: Number(form.selling_price),
          current_stock: Number(form.current_stock || 0),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save item");
      onSaved(data.product as Product);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="SKU code *">
          <input
            className="input"
            value={form.sku_code}
            onChange={(e) => set("sku_code", e.target.value)}
            placeholder="e.g. UTN-1001"
            autoFocus
          />
        </Field>
        <Field label="Item name *">
          <input
            className="input"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Steel Kadhai 10 inch"
          />
        </Field>
        <Field label="Category">
          <input
            className="input"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="e.g. Cookware"
          />
        </Field>
        <Field label="Unit">
          <input
            className="input"
            value={form.unit}
            onChange={(e) => set("unit", e.target.value)}
            placeholder="pcs / kg / set"
          />
        </Field>
        <Field label="HSN code">
          <input
            className="input"
            value={form.hsn_code}
            onChange={(e) => set("hsn_code", e.target.value)}
          />
        </Field>
        <Field label="GST rate">
          <select
            className="input"
            value={form.gst_rate}
            onChange={(e) => set("gst_rate", Number(e.target.value))}
          >
            {GST_RATES.map((r) => (
              <option key={r} value={r}>
                {r}%
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cost price (₹)">
          <input
            className="input"
            type="number"
            step="0.01"
            value={form.cost_price}
            onChange={(e) => set("cost_price", e.target.value)}
          />
        </Field>
        <Field label="Selling price (₹) *">
          <input
            className="input"
            type="number"
            step="0.01"
            value={form.selling_price}
            onChange={(e) => set("selling_price", e.target.value)}
          />
        </Field>
        <Field label="Opening stock">
          <input
            className="input"
            type="number"
            step="0.01"
            value={form.current_stock}
            onChange={(e) => set("current_stock", e.target.value)}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save item"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted mb-1">{label}</span>
      {children}
    </label>
  );
}
