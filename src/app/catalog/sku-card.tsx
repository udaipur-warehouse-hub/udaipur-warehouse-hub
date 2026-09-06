"use client";

import type { Product } from "@/lib/types";
import { MATERIAL_TYPES, COMPANIES } from "@/lib/catalog-options";
import { PresetSelect } from "./preset-select";
import { useEditableProduct } from "./use-editable-product";
import { NumberField } from "@/components/number-field";

const GST_RATES = [0, 5, 12, 18, 28];

// Mobile view of one SKU — a stacked, labeled card instead of a wide table
// row, since a spreadsheet grid doesn't work on a small screen.
export function SkuCard({
  product,
  onSaved,
  onRemoved,
}: {
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
    <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <input
          className="cell-input font-medium text-base -ml-2 flex-1"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          onBlur={() => save("name")}
        />
        <button onClick={handleRemove} className="text-muted hover:text-danger px-1 shrink-0" title="Remove item">
          ✕
        </button>
      </div>

      <input
        className="cell-input font-mono text-xs text-muted -ml-2"
        value={values.sku_code}
        onChange={(e) => set("sku_code", e.target.value)}
        onBlur={() => save("sku_code")}
      />

      <div className="grid grid-cols-2 gap-2">
        <Field label="Type">
          <PresetSelect
            value={values.material_type ?? ""}
            options={MATERIAL_TYPES}
            placeholder="Type"
            onChange={(v) => set("material_type", v)}
            onCommit={() => save("material_type")}
          />
        </Field>
        <Field label="Company">
          <PresetSelect
            value={values.company ?? ""}
            options={COMPANIES}
            placeholder="Company"
            onChange={(v) => set("company", v)}
            onCommit={() => save("company")}
          />
        </Field>
        <Field label="Selling by">
          <select
            className="cell-input"
            value={values.selling_unit}
            onChange={(e) => {
              set("selling_unit", e.target.value as Product["selling_unit"]);
              setTimeout(() => save("selling_unit"), 0);
            }}
          >
            <option value="qty">Quantity</option>
            <option value="kg">Kg</option>
          </select>
        </Field>
        <Field label="GST">
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
        </Field>
        <Field label="Price type">
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
        </Field>
        <Field label="HSN code">
          <input
            className="cell-input"
            value={values.hsn_code ?? ""}
            onChange={(e) => set("hsn_code", e.target.value)}
            onBlur={() => save("hsn_code")}
          />
        </Field>
        <Field label="Price (₹)">
          <NumberField
            className="cell-input"
            value={values.selling_price}
            onChange={(v) => set("selling_price", v ?? 0)}
            onCommit={() => save("selling_price")}
          />
        </Field>
        <Field label="Stock">
          <NumberField
            className="cell-input"
            placeholder="not tracked"
            allowNull
            value={values.current_stock}
            onChange={(v) => set("current_stock", v)}
            onCommit={() => save("current_stock")}
          />
        </Field>
      </div>

      <div className="text-xs h-4">
        {status === "saving" && <span className="text-muted">saving…</span>}
        {status === "saved" && <span className="text-success">✓ saved</span>}
        {status === "error" && <span className="text-danger">could not save</span>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block text-[11px] font-medium text-muted mb-0.5">{label}</span>
      <div className="rounded-lg border border-border bg-background">{children}</div>
    </div>
  );
}
