import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // IST today window
  const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000)
  const todayStartIST = new Date(nowIST)
  todayStartIST.setHours(0, 0, 0, 0)
  const todayStartUTC = new Date(todayStartIST.getTime() - 5.5 * 60 * 60 * 1000)

  const [inquiriesRes, targetsRes, sentTodayRes, totalSentRes] = await Promise.all([
    supabase.from('inquiries').select('status'),
    supabase.from('outreach_targets').select('status'),
    supabase.from('email_log').select('id', { count: 'exact' })
      .eq('email_type', 'cold_outreach').eq('direction', 'outbound').eq('status', 'sent')
      .gte('created_at', todayStartUTC.toISOString()),
    supabase.from('email_log').select('id', { count: 'exact' })
      .eq('email_type', 'cold_outreach').eq('direction', 'outbound').eq('status', 'sent'),
  ])

  const inquiries = inquiriesRes.data || []
  const targets = targetsRes.data || []

  const replied = targets.filter((t) => t.status === 'replied' || t.status === 'interested' || t.status === 'converted').length
  const emailed = targets.filter((t) => t.status !== 'pending' && t.status !== 'not_interested').length
  const replyRate = emailed > 0 ? Math.round((replied / emailed) * 100) : 0

  const stats = {
    total_inquiries: inquiries.length,
    new_inquiries: inquiries.filter((i) => i.status === 'new').length,
    contacted: inquiries.filter((i) => i.status === 'contacted').length,
    negotiating: inquiries.filter((i) => i.status === 'negotiating').length,
    converted: inquiries.filter((i) => i.status === 'converted').length,
    rejected: inquiries.filter((i) => i.status === 'rejected').length,
    // Outreach stats
    outreach_sent_today: sentTodayRes.count || 0,
    outreach_total_sent: totalSentRes.count || 0,
    outreach_replied: replied,
    outreach_pending: targets.filter((t) => t.status === 'pending').length,
    outreach_reply_rate: replyRate,
  }

  return NextResponse.json(stats)
}
