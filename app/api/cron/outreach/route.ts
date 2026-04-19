import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/gmail'
import { composeOutreachEmail } from '@/lib/ai'

// Runs on schedule: sends cold outreach emails to pending targets
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get pending targets (max 5 per run to avoid spam)
  const { data: targets, error } = await supabase
    .from('outreach_targets')
    .select('*')
    .eq('status', 'pending')
    .limit(5)

  if (error || !targets || targets.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No pending targets' })
  }

  let sent = 0
  const results = []

  for (const target of targets) {
    // Generate personalized email with AI
    const email = await composeOutreachEmail(
      target.company_name,
      target.industry,
      target.contact_name
    )

    // Send via Gmail
    const result = await sendEmail(target.contact_email, email.subject, email.body)

    if (result.success) {
      // Update target status
      await supabase
        .from('outreach_targets')
        .update({ status: 'emailed' })
        .eq('id', target.id)

      // Log the email
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
      // Log failed attempt
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

  return NextResponse.json({ sent, total: targets.length, results })
}
