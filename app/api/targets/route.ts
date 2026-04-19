import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('outreach_targets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Support single or bulk insert
  const targets = Array.isArray(body) ? body : [body]

  const { data, error } = await supabase
    .from('outreach_targets')
    .insert(targets.map((t: { company_name: string; industry: string; contact_email: string; contact_name?: string; city?: string; notes?: string }) => ({
      company_name: t.company_name,
      industry: t.industry,
      contact_email: t.contact_email,
      contact_name: t.contact_name || null,
      city: t.city || null,
      notes: t.notes || null,
    })))
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
