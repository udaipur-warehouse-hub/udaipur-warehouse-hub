import { supabaseServer } from "@/lib/supabase-server";
import { BackLink } from "@/components/back-link";
import { SalesHistoryClient } from "./sales-history-client";

export default async function SalesHistoryPage() {
  const supabase = supabaseServer();
  const { data: sales } = await supabase
    .from("sales")
    .select("id, invoice_number, created_at, bill_type, payment_method, total_amount")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <BackLink />
      <SalesHistoryClient sales={sales ?? []} />
    </div>
  );
}
