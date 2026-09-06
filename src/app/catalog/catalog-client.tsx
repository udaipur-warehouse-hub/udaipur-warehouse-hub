"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { ItemForm } from "./item-form";

export function CatalogClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function load(query = "") {
    setLoading(true);
    const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }

  useEffect(() => {
    const t = setTimeout(() => load(q), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <input
          className="input max-w-xs"
          placeholder="Search by name or SKU code…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn-primary ml-auto" onClick={() => setShowForm(true)}>
          + Add item
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-semibold mb-3">Add a new item</h2>
          <ItemForm
            onSaved={(p) => {
              setProducts((list) => [p, ...list]);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-background text-muted text-left">
            <tr>
              <th className="px-4 py-2 font-medium">SKU</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Category</th>
              <th className="px-4 py-2 font-medium">GST</th>
              <th className="px-4 py-2 font-medium text-right">Price (₹)</th>
              <th className="px-4 py-2 font-medium text-right">Stock</th>
            </tr>
          </thead>
          <tbody>
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  {q ? "No items match that search." : "No items yet — add your first one above."}
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-2 font-mono text-xs">{p.sku_code}</td>
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2 text-muted">{p.category || "—"}</td>
                <td className="px-4 py-2 text-muted">{p.gst_rate}%</td>
                <td className="px-4 py-2 text-right">{p.selling_price.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{p.current_stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
