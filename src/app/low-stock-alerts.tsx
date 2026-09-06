import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { sellingUnitLabel } from "@/lib/selling-unit";
import { Panel } from "@/components/panel";

// A simple, shop-wide "running low" line for now. Can become a per-item
// threshold later if that turns out to matter.
const LOW_STOCK_THRESHOLD = 5;

export async function LowStockAlerts() {
  const supabase = supabaseServer();
  const { data: items } = await supabase
    .from("products")
    .select("id, sku_code, name, current_stock, selling_unit")
    .eq("is_active", true)
    .not("current_stock", "is", null)
    .lte("current_stock", LOW_STOCK_THRESHOLD)
    .order("current_stock", { ascending: true })
    .limit(10);

  const rows = items ?? [];

  return (
    <Panel
      title="Low Stock"
      subtitle={`${rows.length} tracked item${rows.length === 1 ? "" : "s"} at or below ${LOW_STOCK_THRESHOLD}`}
      bodyClassName="p-0"
    >
      {rows.length === 0 ? (
        <p className="text-center text-muted py-8 text-sm">
          Nothing running low — only items with a stock number entered are checked.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {rows.map((p) => (
            <Link
              key={p.id}
              href={`/catalog?q=${encodeURIComponent(p.sku_code)}`}
              className="flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5 hover:bg-background text-sm"
            >
              <span className="min-w-0 truncate">{p.name}</span>
              <span className="text-danger font-medium shrink-0">
                {p.current_stock} {sellingUnitLabel(p.selling_unit)} left
              </span>
            </Link>
          ))}
        </div>
      )}
    </Panel>
  );
}
