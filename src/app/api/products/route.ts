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
    .limit(q ? 50 : 300);

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
  const {
    sku_code,
    name,
    material_type,
    company,
    hsn_code,
    selling_unit,
    gst_rate,
    price_type,
    cost_price,
    selling_price,
    current_stock,
  } = body;

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
      material_type: material_type?.trim() || null,
      company: company?.trim() || null,
      unit: selling_unit === "kg" ? "kg" : "pcs",
      selling_unit: selling_unit === "kg" ? "kg" : "qty",
      hsn_code: hsn_code?.trim() || null,
      gst_rate: gst_rate ?? 0,
      price_type: price_type === "rate_based" ? "rate_based" : "mrp",
      cost_price: cost_price ?? null,
      selling_price,
      // No number entered = not tracked yet. Only an explicit number (0 included) starts tracking.
      current_stock: current_stock === null || current_stock === undefined ? null : current_stock,
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
