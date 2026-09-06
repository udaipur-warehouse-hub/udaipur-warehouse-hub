"use client";

import type { Product } from "@/lib/types";
import { MATERIAL_TYPES, COMPANIES } from "@/lib/catalog-options";
import { PresetSelect } from "./preset-select";
import { useEditableProduct } from "./use-editable-product";
import { NumberField } from "@/components/number-field";

const GST_RATES = [0, 5, 12, 18, 28];

// One editable row of the desktop SKU grid — every field saves the moment
// you leave the cell, like editing a spreadsheet.
export function SkuRow({
  sno,
  product,
  onSaved,
  onRemoved,
}: {
  sno: number;
  product: Product;
  onSaved: (p: Product) => void;
  onRemoved: (id: string) => void;
}) {
  const { values, set, save, status, remove } = useEditableProduct(product, onSaved);

  async function handleRemove() {
    if (!confirm(`Remove "${product.name}" from the catalog?`)) return;
    if (await remove()) onRemoved(product.id);
  }

  return (
    <tr className={`border-t border-border ${status === "error" ? "bg-danger/5" : ""}`}>
      <td className="px-2 py-1.5 text-xs text-muted text-center">{sno}</td>
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
        <PresetSelect
          value={values.material_type ?? ""}
          options={MATERIAL_TYPES}
          placeholder="Type"
          onChange={(v) => set("material_type", v)}
          onCommit={() => save("material_type")}
        />
      </td>
      <td className="p-0">
        <PresetSelect
          value={values.company ?? ""}
          options={COMPANIES}
          placeholder="Company"
          onChange={(v) => set("company", v)}
          onCommit={() => save("company")}
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
          value={values.selling_unit}
          onChange={(e) => {
            set("selling_unit", e.target.value as Product["selling_unit"]);
            setTimeout(() => save("selling_unit"), 0);
          }}
        >
          <option value="qty">By quantity</option>
          <option value="kg">By kg</option>
        </select>
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
        <select
          className="cell-input"
          value={values.price_type}
          onChange={(e) => {
            set("price_type", e.target.value as Product["price_type"]);
            setTimeout(() => save("price_type"), 0);
          }}
        >
          <option value="mrp">MRP</option>
          <option value="rate_based">As per rate</option>
        </select>
      </td>
      <td className="p-0">
        <NumberField
          className="cell-input text-right"
          value={values.selling_price}
          onChange={(v) => set("selling_price", v ?? 0)}
          onCommit={() => save("selling_price")}
        />
      </td>
      <td className="p-0">
        <NumberField
          className="cell-input text-right"
          placeholder="not tracked"
          allowNull
          value={values.current_stock}
          onChange={(v) => set("current_stock", v)}
          onCommit={() => save("current_stock")}
        />
      </td>
      <td className="px-2 text-center w-16">
        {status === "saving" && <span className="text-xs text-muted">saving…</span>}
        {status === "saved" && <span className="text-xs text-success">✓</span>}
        {status === "error" && <span className="text-xs text-danger">error</span>}
        {status === "idle" && (
          <button onClick={handleRemove} className="text-xs text-muted hover:text-danger" title="Remove item">
            ✕
          </button>
        )}
      </td>
    </tr>
  );
}
