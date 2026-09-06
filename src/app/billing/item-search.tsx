"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { ItemForm } from "../catalog/item-form";
import { sellingUnitLabel } from "@/lib/selling-unit";

export function ItemSearch({ onPick, bare = false }: { onPick: (p: Product) => void; bare?: boolean }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [searched, setSearched] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.products ?? []);
      setSearched(true);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  function pick(p: Product) {
    onPick(p);
    setQ("");
    setResults([]);
    setSearched(false);
  }

  return (
    <div className={bare ? "" : "rounded-2xl border border-border bg-surface p-4"}>
      <input
        className="input"
        placeholder="Search item by name or SKU code…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {results.length > 0 && (
        <div className="mt-3 divide-y divide-border border border-border rounded-lg overflow-hidden">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => pick(p)}
              className="w-full text-left px-3 py-3 text-sm hover:bg-background flex justify-between items-center gap-3"
            >
              <span className="min-w-0">
                <span className="block truncate">{p.name}</span>
                <span className="text-muted text-xs">
                  {[p.material_type, p.company].filter(Boolean).join(" · ") || p.sku_code}
                </span>
              </span>
              <span className="text-muted text-xs shrink-0 text-right">
                ₹{p.selling_price}/{sellingUnitLabel(p.selling_unit)}
                <br />
                {p.current_stock === null ? "stock not tracked" : `stock ${p.current_stock}`}
              </span>
            </button>
          ))}
        </div>
      )}

      {searched && results.length === 0 && !showAddNew && (
        <div className="mt-3 text-sm text-muted flex items-center justify-between">
          <span>No item found for &ldquo;{q}&rdquo;.</span>
          <button className="btn-secondary" onClick={() => setShowAddNew(true)}>
            + Add &ldquo;{q}&rdquo; as new item
          </button>
        </div>
      )}

      {showAddNew && (
        <div className="mt-4 border-t border-border pt-4">
          <h3 className="font-medium mb-3 text-sm">New item</h3>
          <ItemForm
            initialName={q}
            onSaved={(p) => {
              setShowAddNew(false);
              pick(p);
            }}
            onCancel={() => setShowAddNew(false)}
          />
        </div>
      )}
    </div>
  );
}
