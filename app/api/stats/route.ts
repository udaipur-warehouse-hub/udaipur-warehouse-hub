import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select('status')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const stats = {
    total_inquiries: inquiries.length,
    new_inquiries: inquiries.filter((i) => i.status === 'new').length,
    contacted: inquiries.filter((i) => i.status === 'contacted').length,
    negotiating: inquiries.filter((i) => i.status === 'negotiating').length,
    converted: inquiries.filter((i) => i.status === 'converted').length,
    rejected: inquiries.filter((i) => i.status === 'rejected').length,
  }

  return NextResponse.json(stats)
}
