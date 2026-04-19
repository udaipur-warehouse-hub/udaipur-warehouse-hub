const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me'

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (!data.access_token) {
    throw new Error(`Gmail auth failed: ${JSON.stringify(data)}`)
  }
  return data.access_token
}

function encodeEmail(to: string, subject: string, body: string, from?: string): string {
  const sender = from || 'aviral.india.udaipur@gmail.com'
  const email = [
    `From: Udaipur Warehouse Hub <${sender}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    body,
  ].join('\r\n')

  return Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function sendEmail(to: string, subject: string, htmlBody: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const accessToken = await getAccessToken()
    const raw = encodeEmail(to, subject, htmlBody)

    const res = await fetch(`${GMAIL_API}/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    })

    const data = await res.json()
    if (data.id) {
      return { success: true, messageId: data.id }
    }
    return { success: false, error: JSON.stringify(data) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function getUnreadEmails(): Promise<Array<{ id: string; from: string; subject: string; body: string; date: string }>> {
  const accessToken = await getAccessToken()

  const listRes = await fetch(`${GMAIL_API}/messages?q=is:unread&maxResults=20`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const listData = await listRes.json()

  if (!listData.messages || listData.messages.length === 0) return []

  const emails = []
  for (const msg of listData.messages) {
    const msgRes = await fetch(`${GMAIL_API}/messages/${msg.id}?format=full`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const msgData = await msgRes.json()

    const headers = msgData.payload?.headers || []
    const from = headers.find((h: { name: string }) => h.name === 'From')?.value || ''
    const subject = headers.find((h: { name: string }) => h.name === 'Subject')?.value || ''
    const date = headers.find((h: { name: string }) => h.name === 'Date')?.value || ''

    let body = ''
    if (msgData.payload?.body?.data) {
      body = Buffer.from(msgData.payload.body.data, 'base64').toString('utf-8')
    } else if (msgData.payload?.parts) {
      const textPart = msgData.payload.parts.find(
        (p: { mimeType: string }) => p.mimeType === 'text/plain' || p.mimeType === 'text/html'
      )
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8')
      }
    }

    emails.push({ id: msg.id, from, subject, body, date })
  }

  return emails
}

export async function markAsRead(messageId: string): Promise<void> {
  const accessToken = await getAccessToken()
  await fetch(`${GMAIL_API}/messages/${messageId}/modify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
  })
}

export async function sendReply(messageId: string, threadId: string, to: string, subject: string, htmlBody: string): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = await getAccessToken()
    const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`
    const raw = encodeEmail(to, replySubject, htmlBody)

    const res = await fetch(`${GMAIL_API}/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw, threadId }),
    })

    const data = await res.json()
    return data.id ? { success: true } : { success: false, error: JSON.stringify(data) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
