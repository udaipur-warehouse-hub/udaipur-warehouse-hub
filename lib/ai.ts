const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'

interface AIResponse {
  subject: string
  body: string
}

async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

const WAREHOUSE_CONTEXT = `You are an AI business development assistant for Udaipur Warehouse Hub.

Key details about the warehouse:
- 15,000 sq ft Grade-A warehouse space
- Location: Gukhar Magri, on NH-48 Golden Quadrilateral, Udaipur, Rajasthan
- Features: Loading docks, power backup, flexible leasing (short & long term), easy highway access
- Security and fire safety can be arranged if needed by tenant
- Suitable for: storage, distribution, e-commerce fulfillment, light manufacturing, cold storage setup

You write professional, warm, and concise business emails. No fluff. Get to the point.
Always sign off as "Aviral India | Udaipur Warehouse Hub".
Never make up facts. Stick to what's provided.`

export async function composeOutreachEmail(
  companyName: string,
  industry: string,
  contactName?: string
): Promise<AIResponse> {
  const prompt = `Write a cold outreach email to ${companyName} (industry: ${industry}).
${contactName ? `Contact person: ${contactName}.` : ''}

Goal: Introduce our 15,000 sq ft warehouse in Udaipur and explore if they need warehouse space.
Make it personal to their industry. Keep it under 150 words.
Be professional but human — not salesy.

Respond in this exact JSON format:
{"subject": "email subject line", "body": "email body in HTML with <p> tags"}`

  const response = await callGroq(WAREHOUSE_CONTEXT, prompt)
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch {}
  return {
    subject: `Warehouse Space in Udaipur — ${companyName}`,
    body: `<p>Hi${contactName ? ` ${contactName}` : ''},</p><p>We have a 15,000 sq ft Grade-A warehouse available at Gukhar Magri, Udaipur, on the NH-48 Golden Quadrilateral. Would this be useful for ${companyName}?</p><p>Happy to share more details or arrange a visit.</p><p>Best regards,<br>Aviral India | Udaipur Warehouse Hub</p>`,
  }
}

export async function composeFollowUpEmail(
  companyName: string,
  originalSubject: string,
  daysSince: number
): Promise<AIResponse> {
  const prompt = `Write a follow-up email to ${companyName}.
We sent them an initial email about our warehouse ${daysSince} days ago with subject "${originalSubject}" but got no reply.
Keep it very short (under 80 words). Gentle nudge, not pushy.

Respond in this exact JSON format:
{"subject": "Re: ${originalSubject}", "body": "email body in HTML with <p> tags"}`

  const response = await callGroq(WAREHOUSE_CONTEXT, prompt)
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch {}
  return {
    subject: `Re: ${originalSubject}`,
    body: `<p>Hi,</p><p>Just following up on my previous email about warehouse space in Udaipur. Would love to know if this is something ${companyName} might need.</p><p>Happy to chat whenever convenient.</p><p>Best,<br>Aviral India | Udaipur Warehouse Hub</p>`,
  }
}

export async function composeReplyEmail(
  senderName: string,
  incomingSubject: string,
  incomingBody: string
): Promise<AIResponse> {
  const prompt = `Someone replied to our warehouse outreach email. Compose a helpful reply.

Their name: ${senderName}
Subject: ${incomingSubject}
Their message: ${incomingBody}

Reply naturally based on what they asked or said. If they're interested, offer to schedule a site visit or call. If they ask about pricing, say we offer flexible rates and suggest a call to discuss. If they're not interested, thank them politely.
Keep it under 100 words.

Respond in this exact JSON format:
{"subject": "Re: ${incomingSubject}", "body": "reply body in HTML with <p> tags"}`

  const response = await callGroq(WAREHOUSE_CONTEXT, prompt)
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch {}
  return {
    subject: `Re: ${incomingSubject}`,
    body: `<p>Hi ${senderName},</p><p>Thank you for getting back to us! I'd be happy to discuss this further. Would you be available for a quick call or would you like to schedule a site visit?</p><p>Best regards,<br>Aviral India | Udaipur Warehouse Hub</p>`,
  }
}
