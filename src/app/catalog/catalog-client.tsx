"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { SkuRow } from "./sku-row";
import { NewSkuRow } from "./new-sku-row";

const COLUMNS = [
  "SKU code",
  "Name",
  "Category",
  "Unit",
  "HSN",
  "GST",
  "Cost (₹)",
  "Price (₹)",
  "Stock",
  "",
];

export function CatalogClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

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
        <span className="text-sm text-muted">
          {q ? `${products.length} match` : `Showing ${products.length}${products.length === 300 ? "+" : ""} item${products.length === 1 ? "" : "s"}`}
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-background text-muted text-left">
            <tr>
              {COLUMNS.map((c) => (
                <th key={c} className="px-2 py-2 font-medium whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <NewSkuRow onCreated={(p) => setProducts((list) => [p, ...list])} />

            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-8 text-center text-muted">
                  {q ? "No items match that search." : "No items yet — add your first one in the row above."}
                </td>
              </tr>
            )}

            {products.map((p) => (
              <SkuRow
                key={p.id}
                product={p}
                onSaved={(updated) =>
                  setProducts((list) => list.map((x) => (x.id === updated.id ? updated : x)))
                }
                onRemoved={(id) => setProducts((list) => list.filter((x) => x.id !== id))}
              />
            ))}
          </tbody>
        </table>
      </div>

      {!q && products.length === 300 && (
        <p className="text-xs text-muted mt-2">
          Showing the first 300 items — use search above to find a specific one.
        </p>
      )}
    </div>
  );
}
