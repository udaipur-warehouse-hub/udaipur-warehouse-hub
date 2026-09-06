import { supabaseServer } from "@/lib/supabase-server";
import { istDayRange } from "@/lib/ist-day-range";
import { Panel } from "@/components/panel";

export async function TodaysSummary() {
  const supabase = supabaseServer();
  const { startUtc, endUtc } = istDayRange();

  const { data: sales } = await supabase
    .from("sales")
    .select("total_amount, gst_amount, payment_method")
    .gte("created_at", startUtc)
    .lt("created_at", endUtc);

  const rows = sales ?? [];
  const billCount = rows.length;
  const revenue = rows.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const gstCollected = rows.reduce((sum, s) => sum + Number(s.gst_amount), 0);
  const byMethod = { cash: 0, card: 0, online: 0 } as Record<string, number>;
  for (const s of rows) byMethod[s.payment_method] = (byMethod[s.payment_method] ?? 0) + Number(s.total_amount);

  return (
    <Panel title="Today's Summary" subtitle={new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long" })}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Bills" value={String(billCount)} />
        <Stat label="Revenue" value={`₹${revenue.toFixed(0)}`} />
        <Stat label="GST collected" value={`₹${gstCollected.toFixed(0)}`} />
        <Stat label="Cash · Card · Online" value={`₹${byMethod.cash.toFixed(0)} · ₹${byMethod.card.toFixed(0)} · ₹${byMethod.online.toFixed(0)}`} small />
      </div>
    </Panel>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-xl bg-background p-3">
      <div className="text-xs text-muted mb-1">{label}</div>
      <div className={small ? "text-sm font-semibold" : "text-xl font-bold"}>{value}</div>
    </div>
  );
}
