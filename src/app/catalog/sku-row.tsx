"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";

const GST_RATES = [0, 5, 12, 18, 28];

// One editable row of the SKU grid. Every field saves the moment you leave
// the cell (blur) — no separate "save" button, like editing a spreadsheet.
export function SkuRow({
  product,
  onSaved,
  onRemoved,
}: {
  product: Product;
  onSaved: (p: Product) => void;
  onRemoved: (id: string) => void;
}) {
  const [values, setValues] = useState(product);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => setValues(product), [product]);

  function set<K extends keyof Product>(key: K, value: Product[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function save(field: keyof Product) {
    if (values[field] === product[field]) return; // nothing changed
    setStatus("saving");
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: values[field] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");
      setStatus("saved");
      onSaved(data.product as Product);
      setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 1200);
    } catch {
      setStatus("error");
      setValues(product); // revert
    }
  }

  async function removeRow() {
    if (!confirm(`Remove "${product.name}" from the catalog?`)) return;
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: false }),
    });
    if (res.ok) onRemoved(product.id);
  }

  return (
    <tr className={`border-t border-border ${status === "error" ? "bg-danger/5" : ""}`}>
      <td className="p-0">
        <input
          className="cell-input font-mono text-xs"
          value={values.sku_code}
          onChange={(e) => set("sku_code", e.target.value)}
          onBlur={() => save("sku_code")}
        />
      </td>
      <td className="p-0">
        <input
          className="cell-input"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          onBlur={() => save("name")}
        />
      </td>
      <td className="p-0">
        <input
          className="cell-input"
          value={values.category ?? ""}
          onChange={(e) => set("category", e.target.value)}
          onBlur={() => save("category")}
        />
      </td>
      <td className="p-0">
        <input
          className="cell-input"
          value={values.unit}
          onChange={(e) => set("unit", e.target.value)}
          onBlur={() => save("unit")}
        />
      </td>
      <td className="p-0">
        <input
          className="cell-input"
          value={values.hsn_code ?? ""}
          onChange={(e) => set("hsn_code", e.target.value)}
          onBlur={() => save("hsn_code")}
        />
      </td>
      <td className="p-0">
        <select
          className="cell-input"
          value={values.gst_rate}
          onChange={(e) => {
            set("gst_rate", Number(e.target.value));
            setTimeout(() => save("gst_rate"), 0);
          }}
        >
          {GST_RATES.map((r) => (
            <option key={r} value={r}>
              {r}%
            </option>
          ))}
        </select>
      </td>
      <td className="p-0">
        <input
          className="cell-input text-right"
          type="number"
          step="0.01"
          value={values.cost_price ?? ""}
          onChange={(e) => set("cost_price", e.target.value === "" ? null : Number(e.target.value))}
          onBlur={() => save("cost_price")}
        />
      </td>
      <td className="p-0">
        <input
          className="cell-input text-right"
          type="number"
          step="0.01"
          value={values.selling_price}
          onChange={(e) => set("selling_price", Number(e.target.value))}
          onBlur={() => save("selling_price")}
        />
      </td>
      <td className="p-0">
        <input
          className="cell-input text-right"
          type="number"
          step="0.01"
          value={values.current_stock}
          onChange={(e) => set("current_stock", Number(e.target.value))}
          onBlur={() => save("current_stock")}
        />
      </td>
      <td className="px-2 text-center w-16">
        {status === "saving" && <span className="text-xs text-muted">saving…</span>}
        {status === "saved" && <span className="text-xs text-success">✓</span>}
        {status === "error" && <span className="text-xs text-danger">error</span>}
        {status === "idle" && (
          <button onClick={removeRow} className="text-xs text-muted hover:text-danger" title="Remove item">
            ✕
          </button>
        )}
      </td>
    </tr>
  );
}
