"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { ItemForm } from "../catalog/item-form";
import { sellingUnitLabel } from "@/lib/selling-unit";

export function ItemSearch({ onPick, bare = false }: { onPick: (p: Product) => void; bare?: boolean }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const myRequestId = ++requestId.current;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (myRequestId !== requestId.current) return; // a newer search superseded this one
        setResults(data.products ?? []);
        setSearched(true);
      } finally {
        if (myRequestId === requestId.current) setLoading(false);
      }
    }, 150);
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
      <div className="relative">
        <input
          className="input"
          placeholder="Search item by name or SKU code…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">searching…</span>
        )}
      </div>

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

      {searched && !loading && results.length === 0 && !showAddNew && (
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
