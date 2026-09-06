import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/retail-vendors?q=search -> vendors with their live balance
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const supabase = supabaseServer();

  let query = supabase
    .from("retail_vendor_balances")
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

// POST /api/retail-vendors -> add a new vendor
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, address } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Vendor name is required" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("retail_vendors")
    .insert({ name: name.trim(), phone: phone?.trim() || null, address: address?.trim() || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ vendor: { ...data, balance: 0, last_activity: null } }, { status: 201 });
}
