import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// POST /api/retail-vendors/:id/ledger -> record a credit sale or a payment
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { entry_type, amount, note, entry_date } = body;

  if (!["credit_sale", "payment_received"].includes(entry_type)) {
    return NextResponse.json({ error: "entry_type must be credit_sale or payment_received" }, { status: 400 });
  }
  if (!amount || Number(amount) <= 0) {
    return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("retail_vendor_ledger")
    .insert({
      vendor_id: id,
      entry_type,
      amount: Number(amount),
      note: note?.trim() || null,
      entry_date: entry_date || new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entry: data }, { status: 201 });
}
