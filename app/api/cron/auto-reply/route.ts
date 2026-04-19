import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUnreadEmails, markAsRead, sendReply } from '@/lib/gmail'
import { composeReplyEmail } from '@/lib/ai'

// Runs on schedule: reads inbox, auto-replies using AI
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const emails = await getUnreadEmails()

  if (emails.length === 0) {
    return NextResponse.json({ processed: 0, message: 'No unread emails' })
  }

  let processed = 0

  for (const email of emails) {
    // Extract sender email from "Name <email>" format
    const emailMatch = email.from.match(/<(.+?)>/)
    const senderEmail = emailMatch ? emailMatch[1] : email.from
    const senderName = email.from.replace(/<.+>/, '').trim() || senderEmail

    // Skip system emails, noreply, newsletters etc.
    if (
      senderEmail.includes('noreply') ||
      senderEmail.includes('no-reply') ||
      senderEmail.includes('mailer-daemon') ||
      senderEmail.includes('notifications') ||
      senderEmail.includes('newsletter') ||
      senderEmail === 'aviral.india.udaipur@gmail.com'
    ) {
      await markAsRead(email.id)
      continue
    }

    // Check if this sender is an outreach target
    const { data: target } = await supabase
      .from('outreach_targets')
      .select('*')
      .eq('contact_email', senderEmail)
      .single()

    if (target) {
      // Update target status to replied
      await supabase
        .from('outreach_targets')
        .update({ status: 'replied' })
        .eq('id', target.id)

      // Log the inbound email
      await supabase.from('email_log').insert({
        target_id: target.id,
        direction: 'inbound',
        email_type: 'auto_reply',
        to_email: 'aviral.india.udaipur@gmail.com',
        from_email: senderEmail,
        subject: email.subject,
        body: email.body.substring(0, 2000),
        gmail_message_id: email.id,
        status: 'sent',
      })
    }

    // Compose AI reply
    const reply = await composeReplyEmail(senderName, email.subject, email.body.substring(0, 1000))

    // Send reply
    const result = await sendReply(email.id, email.id, senderEmail, reply.subject, reply.body)

    if (result.success) {
      // Log outbound reply
      await supabase.from('email_log').insert({
        target_id: target?.id || null,
        direction: 'outbound',
        email_type: 'auto_reply',
        to_email: senderEmail,
        from_email: 'aviral.india.udaipur@gmail.com',
        subject: reply.subject,
        body: reply.body,
        status: 'sent',
      })
    }

    await markAsRead(email.id)
    processed++
  }

  return NextResponse.json({ processed, total: emails.length })
}
