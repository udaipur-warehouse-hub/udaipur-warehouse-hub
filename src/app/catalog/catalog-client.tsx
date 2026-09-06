"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import { SkuRow } from "./sku-row";
import { NewSkuRow } from "./new-sku-row";
import { SkuCard } from "./sku-card";
import { ItemForm } from "./item-form";
import { Panel } from "@/components/panel";

const COLUMNS = [
  "S.No.",
  "SKU code",
  "Name",
  "Type",
  "Company",
  "HSN",
  "Selling by",
  "GST",
  "Price type",
  "Price (₹)",
  "Stock",
  "",
];

export function CatalogClient() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [loading, setLoading] = useState(true);
  const [showMobileAdd, setShowMobileAdd] = useState(false);

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

  const countLabel = q
    ? `${products.length} match${products.length === 1 ? "" : "es"}`
    : `${products.length}${products.length === 300 ? "+" : ""} item${products.length === 1 ? "" : "s"}`;

  return (
    <Panel
      title="Item Catalog"
      subtitle={countLabel}
      bodyClassName="p-0"
      actions={
        <button className="btn-primary sm:hidden" onClick={() => setShowMobileAdd(true)}>
          + Add SKU
        </button>
      }
    >
      {/* Search toolbar strip */}
      <div className="px-4 sm:px-5 py-3 border-b border-border">
        <input
          className="input max-w-xs"
          placeholder="Search by name or SKU code…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* Mobile: "add new" opens as a full form, not a cramped inline row */}
      {showMobileAdd && (
        <div className="sm:hidden fixed inset-0 z-20 bg-black/30 flex items-end" onClick={() => setShowMobileAdd(false)}>
          <div
            className="bg-surface w-full rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-semibold mb-3">Add a new SKU</h2>
            <ItemForm
              onSaved={(p) => {
                setProducts((list) => [p, ...list]);
                setShowMobileAdd(false);
              }}
              onCancel={() => setShowMobileAdd(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop / tablet: Excel-style grid, one row per SKU.
          overflow-x (not overflow) so the Type/Company search dropdowns
          aren't clipped vertically while the wide table still scrolls sideways. */}
      <div className="hidden sm:block overflow-x-auto overflow-y-visible">
        <table className="w-full text-sm min-w-[1100px]">
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

            {products.map((p, i) => (
              <SkuRow
                key={p.id}
                sno={i + 1}
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

      {/* Mobile: stacked cards, one per SKU */}
      <div className="sm:hidden p-4 space-y-3">
        {!loading && products.length === 0 && (
          <p className="text-center text-muted py-8">
            {q ? "No items match that search." : "No items yet — tap “+ Add SKU” above."}
          </p>
        )}
        {products.map((p, i) => (
          <div key={p.id}>
            <div className="text-xs text-muted mb-1 px-1">#{i + 1}</div>
            <SkuCard
              product={p}
              onSaved={(updated) =>
                setProducts((list) => list.map((x) => (x.id === updated.id ? updated : x)))
              }
              onRemoved={(id) => setProducts((list) => list.filter((x) => x.id !== id))}
            />
          </div>
        ))}
      </div>

      {!q && products.length === 300 && (
        <p className="text-xs text-muted px-4 sm:px-5 py-3 border-t border-border">
          Showing the first 300 items — use search above to find a specific one.
        </p>
      )}
    </Panel>
  );
}
