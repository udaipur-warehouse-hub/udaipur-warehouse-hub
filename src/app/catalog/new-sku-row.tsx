"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { MATERIAL_TYPES, COMPANIES } from "@/lib/catalog-options";
import { PresetSelect } from "./preset-select";

const GST_RATES = [0, 5, 12, 18, 28];
const BLANK = {
  sku_code: "",
  name: "",
  material_type: "",
  company: "",
  hsn_code: "",
  selling_unit: "qty" as "qty" | "kg",
  gst_rate: 18,
  price_type: "mrp" as "mrp" | "rate_based",
  cost_price: "",
  selling_price: "",
  current_stock: "",
};

// The always-present blank row at the top of the desktop grid. Fill in SKU
// code, name and price, then tab/click away — it saves itself and a fresh
// blank row appears in its place.
export function NewSkuRow({ onCreated }: { onCreated: (p: Product) => void }) {
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function tryCreate() {
    if (!form.sku_code.trim() || !form.name.trim() || !form.selling_price) return;
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
          current_stock: form.current_stock === "" ? null : Number(form.current_stock),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save item");
      onCreated(data.product as Product);
      setForm(BLANK);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-t border-border bg-copper/5">
      <td className="px-2 py-1.5 text-xs text-muted text-center">—</td>
      <td className="p-0">
        <input
          className="cell-input font-mono text-xs"
          placeholder="SKU code"
          value={form.sku_code}
          onChange={(e) => set("sku_code", e.target.value)}
          onBlur={tryCreate}
        />
      </td>
      <td className="p-0">
        <input
          className="cell-input"
          placeholder="Item name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          onBlur={tryCreate}
        />
      </td>
      <td className="p-0">
        <PresetSelect
          value={form.material_type}
          options={MATERIAL_TYPES}
          placeholder="Type"
          onChange={(v) => set("material_type", v)}
          onCommit={tryCreate}
        />
      </td>
      <td className="p-0">
        <PresetSelect
          value={form.company}
          options={COMPANIES}
          placeholder="Company"
          onChange={(v) => set("company", v)}
          onCommit={tryCreate}
        />
      </td>
      <td className="p-0">
        <input
          className="cell-input"
          placeholder="HSN"
          value={form.hsn_code}
          onChange={(e) => set("hsn_code", e.target.value)}
          onBlur={tryCreate}
        />
      </td>
      <td className="p-0">
        <select
          className="cell-input"
          value={form.selling_unit}
          onChange={(e) => set("selling_unit", e.target.value as "qty" | "kg")}
        >
          <option value="qty">By quantity</option>
          <option value="kg">By kg</option>
        </select>
      </td>
      <td className="p-0">
        <select
          className="cell-input"
          value={form.gst_rate}
          onChange={(e) => set("gst_rate", Number(e.target.value))}
        >
          {GST_RATES.map((r) => (
            <option key={r} value={r}>
              {r}%
            </option>
          ))}
        </select>
      </td>
      <td className="p-0">
        <select
          className="cell-input"
          value={form.price_type}
          onChange={(e) => set("price_type", e.target.value as "mrp" | "rate_based")}
        >
          <option value="mrp">MRP</option>
          <option value="rate_based">As per rate</option>
        </select>
      </td>
      <td className="p-0">
        <input
          className="cell-input text-right"
          type="number"
          step="0.01"
          placeholder="Price *"
          value={form.selling_price}
          onChange={(e) => set("selling_price", e.target.value)}
          onBlur={tryCreate}
        />
      </td>
      <td className="p-0">
        <input
          className="cell-input text-right"
          type="number"
          step="0.01"
          placeholder="not tracked"
          value={form.current_stock}
          onChange={(e) => set("current_stock", e.target.value)}
          onBlur={tryCreate}
        />
      </td>
      <td className="px-2 text-center w-16 text-xs text-muted">
        {saving ? "saving…" : error ? <span className="text-danger">{error}</span> : "+ new"}
      </td>
    </tr>
  );
}
