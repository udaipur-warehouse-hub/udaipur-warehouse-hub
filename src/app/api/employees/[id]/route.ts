import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/employees/:id -> employee + their payment (salary expense) history
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = supabaseServer();

  const [{ data: employee, error: eErr }, { data: payments, error: pErr }] = await Promise.all([
    supabase.from("employees").select("*").eq("id", id).single(),
    supabase
      .from("expenses")
      .select("*")
      .eq("employee_id", id)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  if (eErr || !employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  return NextResponse.json({ employee, payments });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  for (const field of ["name", "role", "phone", "monthly_salary", "joined_on", "is_active"] as const) {
    if (field in body) patch[field] = body[field];
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No editable fields in request" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { error } = await supabase.from("employees").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
