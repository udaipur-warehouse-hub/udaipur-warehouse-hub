import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUnreadEmails, markAsRead, sendReply, sendEmail } from '@/lib/gmail'
import { composeReplyEmail, classifyInboundEmail } from '@/lib/ai'

const AVI_EMAIL = 'jainavi.aj@gmail.com'
const RATNESH_EMAIL = 'ratneshshah67@gmail.com'

async function alertGenuineLead(
  companyName: string,
  senderEmail: string,
  subject: string,
  messageSnippet: string,
  aiReplied: boolean
) {
  const body = `<p><strong>Genuine lead — ${companyName || senderEmail} replied to your warehouse outreach.</strong></p>
<p><strong>Company:</strong> ${companyName || '—'}<br>
<strong>Email:</strong> ${senderEmail}<br>
<strong>Subject:</strong> ${subject}</p>
<p><strong>What they said:</strong><br>${messageSnippet}</p>
<p style="color:#333;margin-top:16px;">${aiReplied ? 'The AI has already sent an initial reply. Follow up personally to close this.' : 'The AI could not send a reply — follow up manually.'}</p>`

  // Alert both Avi and Ratnesh — these are the only emails worth their attention
  await Promise.all([
    sendEmail(AVI_EMAIL, `Lead reply: ${companyName || senderEmail}`, body),
    sendEmail(RATNESH_EMAIL, `Lead reply: ${companyName || senderEmail}`, body),
  ])
}

async function alertRedirect(
  companyName: string,
  senderEmail: string,
  subject: string,
  messageSnippet: string,
  redirectContact: string | null
) {
  const body = `<p><strong>${companyName || senderEmail} is redirecting you to a different contact.</strong></p>
<p><strong>From:</strong> ${senderEmail}<br>
<strong>Subject:</strong> ${subject}</p>
${redirectContact ? `<p><strong>New contact to reach:</strong> ${redirectContact}</p>` : ''}
<p><strong>Their full message:</strong><br>${messageSnippet}</p>
<p style="color:#333;margin-top:16px;">Add the new contact as an outreach target manually if relevant.</p>`

  // Only alert Avi for redirects — Ratnesh doesn't need this
  await sendEmail(AVI_EMAIL, `New contact found: ${companyName || senderEmail}`, body)
}

// Runs on schedule: reads inbox, classifies with AI, auto-replies to genuine leads
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
  let skipped = 0

  for (const email of emails) {
    const emailMatch = email.from.match(/<(.+?)>/)
    const senderEmail = emailMatch ? emailMatch[1] : email.from
    const senderName = email.from.replace(/<.+>/, '').trim() || senderEmail

    // Hard skip — definitely system/bot senders, never worth processing
    const hardSkipPatterns = [
      'mailer-daemon', 'postmaster', 'bounce', 'daemon',
      'masscomm', 'listserv', 'majordomo', 'mailman',
    ]
    if (
      hardSkipPatterns.some(p => senderEmail.toLowerCase().includes(p)) ||
      senderEmail === 'aviral.india.udaipur@gmail.com'
    ) {
      await markAsRead(email.id)
      skipped++
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
      await markAsRead(email.id)
      skipped++
      continue
    }

    // Look up outreach target
    const { data: target } = await supabase
      .from('outreach_targets')
      .select('*')
      .eq('contact_email', senderEmail)
      .single()

    // Use AI to classify what kind of email this actually is
    const classification = await classifyInboundEmail(
      email.subject,
      email.body.substring(0, 1200),
      target?.company_name
    )

    // --- GENUINE_INTEREST: real human showing interest ---
    if (classification.type === 'GENUINE_INTEREST') {
      if (target) {
        await supabase
          .from('outreach_targets')
          .update({ status: 'replied' })
          .eq('id', target.id)

        await supabase.from('email_log').insert({
          target_id: target.id,
          direction: 'inbound',
          email_type: 'auto_reply',
          to_email: 'aviral.india.udaipur@gmail.com',
          from_email: senderEmail,
          subject: email.subject,
          body: email.body.substring(0, 2000),
          gmail_message_id: email.id,
          status: 'received',
        })
      }

      const reply = await composeReplyEmail(senderName, email.subject, email.body.substring(0, 1000))
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
      }

      // Alert both Avi and Ratnesh — genuine lead
      await alertGenuineLead(
        target?.company_name || '',
        senderEmail,
        email.subject,
        email.body.substring(0, 500),
        result.success
      )

      await markAsRead(email.id)
      processed++
      continue
    }

    // --- NOT_INTERESTED / STOP: respect opt-out ---
    if (classification.type === 'NOT_INTERESTED') {
      if (target) {
        await supabase
          .from('outreach_targets')
          .update({ status: 'not_interested', notes: 'Declined via email' })
          .eq('id', target.id)

        await supabase.from('email_log').insert({
          target_id: target.id,
          direction: 'inbound',
          email_type: 'auto_reply',
          to_email: 'aviral.india.udaipur@gmail.com',
          from_email: senderEmail,
          subject: email.subject,
          body: email.body.substring(0, 500),
          gmail_message_id: email.id,
          status: 'received',
        })
      }
      await markAsRead(email.id)
      unsubscribed++
      continue
    }

    // --- REDIRECT: they're pointing to a different contact ---
    if (classification.type === 'REDIRECT') {
      await alertRedirect(
        target?.company_name || senderEmail,
        senderEmail,
        email.subject,
        email.body.substring(0, 600),
        classification.redirect_contact || null
      )
      await markAsRead(email.id)
      skipped++
      continue
    }

    // --- AUTO_ACK / OOO: "we'll get back to you", out of office, etc. ---
    // Just mark read, no reply, no alert — not worth anyone's time
    await markAsRead(email.id)
    skipped++
  }

  return NextResponse.json({ processed, unsubscribed, skipped, total: emails.length })
}
