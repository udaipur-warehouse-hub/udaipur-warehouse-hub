import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/retail-vendors/:id -> vendor (with balance) + full ledger history
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = supabaseServer();

  const [{ data: vendor, error: vErr }, { data: entries, error: eErr }] = await Promise.all([
    supabase.from("retail_vendor_balances").select("*").eq("id", id).single(),
    supabase
      .from("retail_vendor_ledger")
      .select("*")
      .eq("vendor_id", id)
      .order("entry_date", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (vErr || !vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  if (eErr) return NextResponse.json({ error: eErr.message }, { status: 500 });

  return NextResponse.json({ vendor, entries });
}

// PATCH /api/retail-vendors/:id -> edit vendor details or deactivate
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  for (const field of ["name", "firm_name", "phone", "address", "is_active"] as const) {
    if (field in body) patch[field] = body[field];
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No editable fields in request" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { error } = await supabase.from("retail_vendors").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
