import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { currentFinancialYear } from "@/lib/financial-year";

type CartItem = {
  product_id: string | null;
  sku_code: string;
  name: string;
  unit: string;
  qty: number;
  unit_price: number;
  gst_rate: number;
};

// POST /api/sales -> finalize a retail counter bill.
// Runs as one DB transaction (see create_sale SQL function) so the invoice
// number, line items and stock deduction all succeed or all fail together.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { bill_type, payment_method, customer_name, customer_phone, items, discount_type, discount_value } =
    body as {
      bill_type: "gst" | "non_gst";
      payment_method: "cash" | "card" | "online";
      customer_name?: string;
      customer_phone?: string;
      items: CartItem[];
      discount_type?: "percent" | "amount" | null;
      discount_value?: number;
    };

  if (!bill_type || !payment_method || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "bill_type, payment_method and at least one item are required" },
      { status: 400 }
    );
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase.rpc("create_sale", {
    p_bill_type: bill_type,
    p_payment_method: payment_method,
    p_customer_name: customer_name ?? "",
    p_customer_phone: customer_phone ?? "",
    p_financial_year: currentFinancialYear(),
    p_items: items,
    p_discount_type: discount_type || null,
    p_discount_value: discount_value || 0,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sale: data }, { status: 201 });
}
