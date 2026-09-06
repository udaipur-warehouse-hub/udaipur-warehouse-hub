import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/products?q=search -> list/search active items (for catalog page + billing search)
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const supabase = supabaseServer();

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .limit(50);

  if (q) {
    query = query.or(`name.ilike.%${q}%,sku_code.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

// POST /api/products -> add a new item (used by catalog page and the
// "quick add" flow while billing)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sku_code, name, category, unit, hsn_code, gst_rate, cost_price, selling_price, current_stock } = body;

  if (!sku_code || !name || selling_price === undefined) {
    return NextResponse.json(
      { error: "sku_code, name and selling_price are required" },
      { status: 400 }
    );
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("products")
    .insert({
      sku_code: String(sku_code).trim(),
      name: String(name).trim(),
      category: category?.trim() || null,
      unit: unit?.trim() || "pcs",
      hsn_code: hsn_code?.trim() || null,
      gst_rate: gst_rate ?? 0,
      cost_price: cost_price ?? null,
      selling_price,
      current_stock: current_stock ?? 0,
    })
    .select()
    .single();

  if (error) {
    const status = error.code === "23505" ? 409 : 500; // unique violation on sku_code
    const message = error.code === "23505" ? "This SKU code already exists" : error.message;
    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json({ product: data }, { status: 201 });
}
