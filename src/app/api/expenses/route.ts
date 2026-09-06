import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/expenses?limit=50&employee_id=... -> recent expenses, optionally
// scoped to one employee (used for their salary payment history)
export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 50);
  const employeeId = req.nextUrl.searchParams.get("employee_id");
  const supabase = supabaseServer();

  let query = supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (employeeId) query = query.eq("employee_id", employeeId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ expenses: data });
}

// POST /api/expenses -> record money going out (purchase, salary, rent, other)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { category, amount, payment_method, note, expense_date, employee_id } = body;

  const validCategories = ["purchase_gst", "purchase_no_bill", "salary", "rent", "other"];
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: "Invalid expense category" }, { status: 400 });
  }
  if (!amount || Number(amount) <= 0) {
    return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      category,
      amount: Number(amount),
      payment_method: payment_method || null,
      note: note?.trim() || null,
      expense_date: expense_date || new Date().toISOString().slice(0, 10),
      employee_id: employee_id || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ expense: data }, { status: 201 });
}
