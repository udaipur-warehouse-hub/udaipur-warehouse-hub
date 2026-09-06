import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { istMonthRange } from "@/lib/ist-month-range";

// GET /api/finance/summary -> this month's cashflow: money in vs money out
export async function GET() {
  const supabase = supabaseServer();
  const { startUtc, endUtc, startDate, endDate } = istMonthRange();

  const [{ data: sales }, { data: retailPayments }, { data: creditPayments }, { data: expenses }, { data: retailBalances }, { data: creditBalances }] =
    await Promise.all([
      supabase.from("sales").select("total_amount").gte("created_at", startUtc).lt("created_at", endUtc),
      supabase
        .from("retail_vendor_ledger")
        .select("amount")
        .eq("entry_type", "payment_received")
        .gte("entry_date", startDate)
        .lt("entry_date", endDate),
      supabase
        .from("credit_vendor_ledger")
        .select("amount")
        .eq("entry_type", "payment_received")
        .gte("entry_date", startDate)
        .lt("entry_date", endDate),
      supabase.from("expenses").select("category, amount").gte("expense_date", startDate).lt("expense_date", endDate),
      supabase.from("retail_vendor_balances").select("balance").eq("is_active", true),
      supabase.from("credit_vendor_balances").select("balance").eq("is_active", true),
    ]);

  const sum = (rows: { amount?: number; total_amount?: number }[] | null, field: "amount" | "total_amount") =>
    (rows ?? []).reduce((s, r) => s + Number(r[field] ?? 0), 0);

  const salesRevenue = sum(sales, "total_amount");
  const vendorPaymentsIn = sum(retailPayments, "amount") + sum(creditPayments, "amount");
  const totalIn = salesRevenue + vendorPaymentsIn;

  const expenseRows = expenses ?? [];
  const totalOut = expenseRows.reduce((s, e) => s + Number(e.amount), 0);
  const byCategory: Record<string, number> = {};
  for (const e of expenseRows) byCategory[e.category] = (byCategory[e.category] ?? 0) + Number(e.amount);

  const outstandingReceivable =
    (retailBalances ?? []).reduce((s, v) => s + Number(v.balance), 0) +
    (creditBalances ?? []).reduce((s, v) => s + Number(v.balance), 0);

  return NextResponse.json({
    month: startDate.slice(0, 7),
    inflow: { salesRevenue, vendorPaymentsIn, total: totalIn },
    outflow: { total: totalOut, byCategory },
    net: totalIn - totalOut,
    outstandingReceivable,
  });
}
