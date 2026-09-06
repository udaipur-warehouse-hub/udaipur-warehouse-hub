import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/credit-vendors?q=search -> vendors with their live balance
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const supabase = supabaseServer();

  let query = supabase
    .from("credit_vendor_balances")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (q) {
    query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ vendors: data });
}

// POST /api/credit-vendors -> add a new big credit vendor
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, address, payment_frequency, payment_amount } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Vendor name is required" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("credit_vendors")
    .insert({
      name: name.trim(),
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      payment_frequency: payment_frequency === "weekly" ? "weekly" : "monthly",
      payment_amount: payment_amount ? Number(payment_amount) : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ vendor: { ...data, balance: 0, last_activity: null } }, { status: 201 });
}
