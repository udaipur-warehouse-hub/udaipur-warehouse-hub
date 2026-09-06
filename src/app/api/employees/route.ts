import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/employees?q=search -> active employees
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const supabase = supabaseServer();

  let query = supabase.from("employees").select("*").eq("is_active", true).order("name", { ascending: true });
  if (q) query = query.or(`name.ilike.%${q}%,role.ilike.%${q}%,phone.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ employees: data });
}

// POST /api/employees -> add an employee
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, role, phone, monthly_salary, joined_on } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Employee name is required" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("employees")
    .insert({
      name: name.trim(),
      role: role?.trim() || null,
      phone: phone?.trim() || null,
      monthly_salary: monthly_salary ? Number(monthly_salary) : null,
      joined_on: joined_on || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ employee: data }, { status: 201 });
}
