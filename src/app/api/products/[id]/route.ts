import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const EDITABLE_FIELDS = [
  "sku_code",
  "name",
  "category",
  "unit",
  "hsn_code",
  "gst_rate",
  "cost_price",
  "selling_price",
  "current_stock",
  "is_active",
] as const;

// PATCH /api/products/:id -> update one or more fields (used by the
// spreadsheet-style catalog grid — edit a cell, it saves on the spot).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const patch: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) patch[field] = body[field];
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No editable fields in request" }, { status: 400 });
  }
  patch.updated_at = new Date().toISOString();

  const supabase = supabaseServer();
  const { data, error } = await supabase.from("products").update(patch).eq("id", id).select().single();

  if (error) {
    const status = error.code === "23505" ? 409 : 500;
    const message = error.code === "23505" ? "This SKU code already exists" : error.message;
    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json({ product: data });
}
