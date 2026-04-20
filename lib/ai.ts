const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'

interface AIResponse {
  subject: string
  body: string
}

// Randomize temperature and style to avoid pattern detection
function randomTemp(): number {
  return 0.75 + Math.random() * 0.2 // 0.75-0.95
}

const tones = ['casual and friendly', 'straightforward and professional', 'warm and conversational', 'brief and direct']
const signoffs = ['Best,', 'Regards,', 'Thanks,', 'Cheers,', 'Talk soon,', 'Looking forward,']
const senderNames = ['Avi', 'Avi Jain', 'AJ']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
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
      temperature: randomTemp(),
      max_tokens: 1024,
    }),
  })

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

const WAREHOUSE_CONTEXT = `You are Avi, a young businessman from Udaipur who owns a warehouse. You're writing emails yourself — NOT as a company, NOT as an AI, NOT as a marketing team. You're a real person reaching out.

About your warehouse:
- 15,000 sq ft at Gukhar Magri, Udaipur — directly on NH-48, which is the Delhi–Mumbai highway (part of the Golden Quadrilateral). Trucks heading between Delhi, Jaipur, Ahmedabad, and Mumbai all pass this route.
- The location means goods can reach Jaipur in ~4 hours, Ahmedabad in ~3.5 hours, and Delhi in ~8 hours without going through city traffic
- Ground floor, so loading/unloading is fast — no ramps or lifts needed
- Loading docks that can handle medium and large trucks
- Power backup so operations don't stop during outages
- Flexible lease terms — short term or long term, can discuss what works
- Good for: regional distribution, last-mile staging, inventory storage, e-commerce fulfilment, light manufacturing, seasonal stock

CRITICAL RULES — follow these strictly:
- Write like a real person typing an email, not a template
- NEVER use marketing language like "Grade-A", "premier", "state-of-the-art", "thrilled", "excited to reach out"
- NEVER use bullet points or numbered lists in emails
- NEVER start with "I hope this email finds you well" or "I came across your company"
- Use natural, slightly imperfect language — like a human would
- Vary sentence length. Mix short and long.
- Occasionally use contractions (don't, we've, that's)
- Keep emails SHORT — 60-120 words max. Real people write short emails
- Pick the 1-2 details most relevant to that company's industry. For logistics/distribution: lead with highway access and city reach times. For quick commerce: lead with ground-floor fast unloading. For manufacturers: lead with space and power backup.
- Sign off casually, not with a corporate signature block`

export async function composeOutreachEmail(
  companyName: string,
  industry: string,
  contactName?: string
): Promise<AIResponse> {
  const tone = pick(tones)
  const signoff = pick(signoffs)
  const sender = pick(senderNames)
  const wordLimit = 60 + Math.floor(Math.random() * 60) // 60-120 words

  const prompt = `Write a cold email to ${companyName} (${industry}).
${contactName ? `Person: ${contactName}.` : ''}

Tone: ${tone}
Max ${wordLimit} words. Sign off with "${signoff}" then "${sender}" on next line, then "Udaipur Warehouse Hub" below that.

Don't use their company name more than once. Don't list features. Just mention why your warehouse location or size might be useful for their kind of business, and ask if they'd want to know more.

IMPORTANT: Make this sound like a real person wrote it in 2 minutes, not a crafted marketing email.

Respond in this exact JSON format only, nothing else:
{"subject": "short natural subject line", "body": "email body in HTML with <p> tags"}`

  const response = await callGroq(WAREHOUSE_CONTEXT, prompt)
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch {}
  return {
    subject: `warehouse space in udaipur`,
    body: `<p>Hi${contactName ? ` ${contactName}` : ''},</p><p>I have a 15,000 sq ft ground-floor warehouse in Udaipur, directly on NH-48 — the Delhi–Mumbai highway. Goods from here reach Jaipur in 4 hours and Ahmedabad in 3.5, so it works well as a Rajasthan distribution base. Wondering if that'd be useful for ${companyName}'s ${industry.toLowerCase()} operations?</p><p>Happy to share details if relevant.</p><p>${signoff}<br>${sender}<br>Udaipur Warehouse Hub</p>`,
  }
}

export async function composeFollowUpEmail(
  companyName: string,
  originalSubject: string,
  daysSince: number
): Promise<AIResponse> {
  const sender = pick(senderNames)
  const approaches = [
    `Bumping this up. Sent you a note ${daysSince} days back about warehouse space in Udaipur. Any thoughts?`,
    `Hey, just circling back on this. Totally understand if it's not a fit — just wanted to check before I move on.`,
    `Quick follow-up on my earlier email. If warehouse space near Udaipur isn't something you need right now, no worries at all.`,
    `Checking in — did you get a chance to see my last email? If this isn't the right time, I completely understand.`,
  ]

  const prompt = `Write a very short follow-up email (under 50 words, just 2-3 sentences) to ${companyName}.

Use this as inspiration but rewrite naturally: "${pick(approaches)}"

Sign off with just "${sender}".

JSON format only:
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
    body: `<p>Hey, just bumping this. Let me know if warehouse space in Udaipur is something worth chatting about — happy to give you the details.</p><p>${sender}</p>`,
  }
}

export async function composeReplyEmail(
  senderName: string,
  incomingSubject: string,
  incomingBody: string
): Promise<AIResponse> {
  const sender = pick(senderNames)

  const prompt = `Someone replied to your warehouse outreach. Reply naturally as yourself (Avi).

Their name: ${senderName}
Subject: ${incomingSubject}
Their message: ${incomingBody}

Keep it under 80 words. Be natural and helpful. If interested, suggest a call or visit. If asking price, say it depends on space and duration, suggest a call. If not interested, say thanks and move on.

Don't sound corporate. Sound like you're replying from your phone.

JSON format only:
{"subject": "Re: ${incomingSubject}", "body": "reply in HTML with <p> tags, sign off as ${sender}"}`

  const response = await callGroq(WAREHOUSE_CONTEXT, prompt)
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch {}
  return {
    subject: `Re: ${incomingSubject}`,
    body: `<p>Hey ${senderName}, thanks for getting back! Happy to chat more about this. Want to hop on a quick call, or if you're ever in Udaipur I can show you the space?</p><p>${sender}</p>`,
  }
}
