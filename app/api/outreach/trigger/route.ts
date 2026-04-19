import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Admin-only trigger for outreach/follow-up/auto-reply crons
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action } = await request.json()
  const cronSecret = process.env.CRON_SECRET

  const baseUrl = process.env.APP_URL || 'https://udaipur-warehouse-hub-sandy.vercel.app'

  let endpoint = ''
  if (action === 'outreach') endpoint = '/api/cron/outreach'
  else if (action === 'follow-up') endpoint = '/api/cron/follow-up'
  else if (action === 'auto-reply') endpoint = '/api/cron/auto-reply'
  else return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  const res = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'x-cron-secret': cronSecret || '' },
  })

  const data = await res.json()
  return NextResponse.json(data)
}
