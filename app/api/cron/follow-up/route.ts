import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/gmail'
import { composeFollowUpEmail } from '@/lib/ai'

// Runs on schedule: sends follow-up to targets who haven't replied in 3+ days
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get targets that were emailed 3+ days ago but haven't replied
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

  const { data: targets } = await supabase
    .from('outreach_targets')
    .select('*')
    .eq('status', 'emailed')
    .lt('updated_at', threeDaysAgo)
    .limit(5)

  if (!targets || targets.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No follow-ups needed' })
  }

  let sent = 0

  for (const target of targets) {
    // Get the original outreach email
    const { data: originalEmail } = await supabase
      .from('email_log')
      .select('subject, created_at')
      .eq('target_id', target.id)
      .eq('email_type', 'cold_outreach')
      .single()

    // Check if we already sent a follow-up
    const { data: existingFollowUp } = await supabase
      .from('email_log')
      .select('id')
      .eq('target_id', target.id)
      .eq('email_type', 'follow_up')
      .limit(1)

    if (existingFollowUp && existingFollowUp.length > 0) {
      continue // Already followed up, skip
    }

    const daysSince = originalEmail
      ? Math.floor((Date.now() - new Date(originalEmail.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 3

    const email = await composeFollowUpEmail(
      target.company_name,
      originalEmail?.subject || 'Warehouse Space in Udaipur',
      daysSince
    )

    const result = await sendEmail(target.contact_email, email.subject, email.body)

    if (result.success) {
      await supabase.from('email_log').insert({
        target_id: target.id,
        direction: 'outbound',
        email_type: 'follow_up',
        to_email: target.contact_email,
        from_email: 'aviral.india.udaipur@gmail.com',
        subject: email.subject,
        body: email.body,
        gmail_message_id: result.messageId,
        status: 'sent',
      })
      sent++
    }
  }

  return NextResponse.json({ sent, total: targets?.length || 0 })
}
