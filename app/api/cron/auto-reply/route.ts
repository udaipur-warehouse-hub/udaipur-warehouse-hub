import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUnreadEmails, markAsRead, sendReply, sendEmail } from '@/lib/gmail'
import { composeReplyEmail } from '@/lib/ai'

const OWNER_ALERT_EMAIL = 'jainavi.aj@gmail.com'

async function alertOwner(companyName: string, senderEmail: string, subject: string, snippet: string) {
  const body = `<p><strong>Someone replied to your warehouse outreach.</strong></p>
<p><strong>Company:</strong> ${companyName || senderEmail}<br>
<strong>Email:</strong> ${senderEmail}<br>
<strong>Subject:</strong> ${subject}</p>
<p><strong>Their message:</strong><br>${snippet}</p>
<p style="margin-top:20px;color:#666;font-size:12px;">The AI has already sent an auto-reply. If they seem genuinely interested, follow up personally.</p>`
  await sendEmail(OWNER_ALERT_EMAIL, `Hot lead: ${companyName || senderEmail} replied`, body)
}

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
  let unsubscribed = 0

  for (const email of emails) {
    const emailMatch = email.from.match(/<(.+?)>/)
    const senderEmail = emailMatch ? emailMatch[1] : email.from
    const senderName = email.from.replace(/<.+>/, '').trim() || senderEmail

    // Skip system emails, mailing lists, and auto-responders
    const autoSenderPatterns = [
      'noreply', 'no-reply', 'mailer-daemon', 'notifications', 'newsletter',
      'postmaster', 'daemon', 'masscomm', 'automail', 'donotreply',
      'do-not-reply', 'bounce', 'listserv', 'majordomo', 'mailman',
      'unsubscribe', 'bulk', 'marketing@', 'info@',
    ]
    const isAutoSender = autoSenderPatterns.some(p => senderEmail.toLowerCase().includes(p))

    // Detect auto-reply / OOO by subject or body content
    const subjectLowerCheck = email.subject.toLowerCase()
    const bodyLowerCheck = email.body.toLowerCase()
    const autoReplyIndicators = [
      'auto-reply', 'autoreply', 'automatic reply', 'out of office',
      'on vacation', 'away from office', 'i am currently out',
      'auto generated', 'auto-generated', 'do not reply to this',
      'this is an automated', 'automatically generated',
      'delivery status', 'delivery failure', 'undeliverable',
      'mail delivery', 'returned mail',
    ]
    const isAutoReplyContent = autoReplyIndicators.some(
      ind => subjectLowerCheck.includes(ind) || bodyLowerCheck.includes(ind)
    )

    if (isAutoSender || isAutoReplyContent || senderEmail === 'aviral.india.udaipur@gmail.com') {
      await markAsRead(email.id)
      continue
    }

    // Anti-loop: skip if we already replied to this sender in the last 24h
    const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recentReply } = await supabase
      .from('email_log')
      .select('id')
      .eq('direction', 'outbound')
      .eq('to_email', senderEmail)
      .gte('created_at', cutoff24h)
      .limit(1)
      .single()

    if (recentReply) {
      // Already replied to this address recently — mark read, skip
      await markAsRead(email.id)
      continue
    }

    // Check if this sender is an outreach target
    const { data: target } = await supabase
      .from('outreach_targets')
      .select('*')
      .eq('contact_email', senderEmail)
      .single()

    // Check for STOP / unsubscribe
    const bodyLower = email.body.toLowerCase().trim()
    const isUnsubscribe =
      bodyLower === 'stop' ||
      bodyLower.startsWith('stop') ||
      bodyLower.includes('unsubscribe') ||
      bodyLower.includes('remove me') ||
      bodyLower.includes('not interested') ||
      subjectLowerCheck === 'stop'

    if (isUnsubscribe && target) {
      // Respect opt-out — mark as not_interested, don't reply
      await supabase
        .from('outreach_targets')
        .update({ status: 'not_interested', notes: 'Opted out via email' })
        .eq('id', target.id)

      await supabase.from('email_log').insert({
        target_id: target.id,
        direction: 'inbound',
        email_type: 'auto_reply',
        to_email: 'aviral.india.udaipur@gmail.com',
        from_email: senderEmail,
        subject: email.subject,
        body: 'UNSUBSCRIBED',
        gmail_message_id: email.id,
        status: 'sent',
      })

      await markAsRead(email.id)
      unsubscribed++
      continue
    }

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

      // Notify owner so they can personally follow up if the lead is warm
      await alertOwner(
        target?.company_name || '',
        senderEmail,
        email.subject,
        email.body.substring(0, 400)
      )
    }

    await markAsRead(email.id)
    processed++
  }

  return NextResponse.json({ processed, unsubscribed, total: emails.length })
}
