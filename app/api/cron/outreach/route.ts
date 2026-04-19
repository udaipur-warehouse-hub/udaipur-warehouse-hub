import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/gmail'
import { composeOutreachEmail } from '@/lib/ai'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isWeekend() {
  const day = new Date().getDay()
  return day === 0 || day === 6 // Sunday or Saturday
}

// Runs on schedule: sends cold outreach emails to pending targets
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Skip weekends — businesses ignore weekend emails (override with x-force-send header)
  const forceRun = request.headers.get('x-force-send') === 'true'
  if (isWeekend() && !forceRun) {
    return NextResponse.json({ sent: 0, message: 'Skipped — weekend' })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Smart daily limit based on account age
  // Week 1: 2/day, Week 2: 3/day, Week 3+: 5/day
  const { data: firstEmail } = await supabase
    .from('email_log')
    .select('created_at')
    .eq('email_type', 'cold_outreach')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  let dailyLimit = 2
  if (firstEmail) {
    const daysSinceFirst = Math.floor(
      (Date.now() - new Date(firstEmail.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceFirst >= 14) dailyLimit = 5
    else if (daysSinceFirst >= 7) dailyLimit = 3
  }

  // Check how many already sent today
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data: todayEmails } = await supabase
    .from('email_log')
    .select('id')
    .eq('email_type', 'cold_outreach')
    .eq('direction', 'outbound')
    .gte('created_at', todayStart.toISOString())

  const alreadySentToday = todayEmails?.length || 0
  const remaining = Math.max(0, dailyLimit - alreadySentToday)

  if (remaining === 0) {
    return NextResponse.json({ sent: 0, message: `Daily limit reached (${dailyLimit}/day)` })
  }

  // Get pending targets
  const { data: targets, error } = await supabase
    .from('outreach_targets')
    .select('*')
    .eq('status', 'pending')
    .limit(remaining)

  if (error || !targets || targets.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No pending targets' })
  }

  let sent = 0
  const results = []

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]

    // Random delay between emails (30-90 seconds) to look human
    if (i > 0) {
      const delay = 30000 + Math.random() * 60000
      await sleep(delay)
    }

    // Generate personalized email with AI
    const email = await composeOutreachEmail(
      target.company_name,
      target.industry,
      target.contact_name
    )

    // Add unsubscribe footer
    const bodyWithFooter = `${email.body}<br><p style="color:#999;font-size:11px;margin-top:30px;border-top:1px solid #eee;padding-top:10px;">You received this because we thought ${target.company_name} might benefit from warehouse space in Udaipur. If not relevant, simply reply STOP and we won't contact you again.</p>`

    // Send via Gmail
    const result = await sendEmail(target.contact_email, email.subject, bodyWithFooter)

    if (result.success) {
      await supabase
        .from('outreach_targets')
        .update({ status: 'emailed' })
        .eq('id', target.id)

      await supabase.from('email_log').insert({
        target_id: target.id,
        direction: 'outbound',
        email_type: 'cold_outreach',
        to_email: target.contact_email,
        from_email: 'aviral.india.udaipur@gmail.com',
        subject: email.subject,
        body: email.body,
        gmail_message_id: result.messageId,
        status: 'sent',
      })

      sent++
      results.push({ company: target.company_name, status: 'sent' })
    } else {
      // Mark as failed, don't retry bad emails
      await supabase
        .from('outreach_targets')
        .update({ status: 'not_interested' })
        .eq('id', target.id)

      await supabase.from('email_log').insert({
        target_id: target.id,
        direction: 'outbound',
        email_type: 'cold_outreach',
        to_email: target.contact_email,
        from_email: 'aviral.india.udaipur@gmail.com',
        subject: email.subject,
        body: email.body,
        status: 'failed',
      })

      results.push({ company: target.company_name, status: 'failed', error: result.error })
    }
  }

  return NextResponse.json({
    sent,
    total: targets.length,
    dailyLimit,
    alreadySentToday,
    results,
  })
}
