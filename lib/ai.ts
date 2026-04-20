const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'

interface AIResponse {
  subject: string
  body: string
}

export interface EmailClassification {
  type: 'GENUINE_INTEREST' | 'REDIRECT' | 'AUTO_ACK' | 'NOT_INTERESTED' | 'OOO'
  reason: string
  redirect_contact?: string
}

function randomTemp(): number {
  return 0.75 + Math.random() * 0.2 // 0.75-0.95
}

const tones = ['professional but approachable', 'straightforward and professional', 'clear and direct', 'businesslike but warm']
const signoffs = ['Best regards,', 'Regards,', 'Thanks,', 'Best,', 'With regards,']
const senderNames = ['Avi Jain']

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

const WAREHOUSE_CONTEXT = `You are Avi, a young businessman from Udaipur who owns a warehouse. You're writing cold emails yourself — NOT as a company, NOT as an AI. You're a real person reaching out to see if a business needs warehouse space.

WAREHOUSE FACTS (use only what's relevant to the recipient's industry):
- Size: 15,000 sq ft, ground floor (no ramps, trucks load directly)
- Address: Gukhar Magri, NH-48, Udaipur, Rajasthan 313001
- Location: Directly on National Highway 48 — the Delhi–Mumbai highway (Golden Quadrilateral). This is one of India's busiest freight corridors.
- Road reach from here: Jaipur ~4 hrs, Ahmedabad ~3.5 hrs, Delhi ~8 hrs, Mumbai ~10 hrs — all via highway, no city traffic
- Why this matters: Companies distributing into Rajasthan/Gujarat usually warehouse in Jaipur or Ahmedabad. Udaipur on NH-48 cuts delivery time to South Rajasthan (Udaipur, Kota, Chittorgarh, Bhilwara) by 2-3 hours compared to shipping from Jaipur.
- Power backup: 24/7 power — no disruption during outages
- Loading docks: handles medium and large trucks
- Flexible lease: short-term or long-term, can be negotiated

HOW TO MATCH WAREHOUSE TO INDUSTRY:
- Paints/building materials (Asian Paints, Berger, JK Cement, etc.): They need regional depots close to dealer networks in South Rajasthan. From Udaipur they can reach Bhilwara, Chittorgarh, Kota, Banswara distributors in under 3 hours. Big factories but no depot in this region.
- Logistics/transport companies: Highway access means their trucks don't enter Udaipur city. Fast turnaround.
- FMCG/consumer goods: South Rajasthan is underserved. Brands ship from Jaipur losing half a day. An Udaipur depot means same-day delivery to local distributors.
- Quick commerce (Blinkit, Zepto, Swiggy Instamart, BigBasket): They're expanding dark stores. NH-48 location means fast inbound supply. Ground floor = fast unloading for perishables.
- E-commerce/D2C brands: Rajasthan fulfilment without going through Jaipur. Can reach Kota, Ajmer, Jodhpur via NH.
- Marble/granite: Udaipur is Rajasthan's marble hub. A storage yard near NH-48 means exporters can consolidate and load containers without city traffic.
- Chemicals/industrial: Space, power backup, highway for raw material receipt and finished goods dispatch.

CRITICAL WRITING RULES:
- Professional but human — like a business owner writing personally, not a marketing team
- NEVER: "Grade-A", "premier", "state-of-the-art", "thrilled", "excited to reach out", "hope this finds you well", "I came across your company", "Hey", "Cheers"
- NEVER use bullet points or numbered lists in the email body
- Keep it SHORT — 80–120 words max. One clear business point, one ask.
- Open with something directly relevant to THEIR business — a problem they have or a gap this solves
- Mention the full address once (Gukhar Magri, NH-48, Udaipur, Rajasthan 313001)
- Pick ONE angle that matters most for their industry (see list above). Don't mention unrelated features.
- Use measured language — "I thought it might be relevant", "worth a conversation", "happy to share details"
- End with a polite, low-pressure ask — "Would it be worth a brief call?" or "Happy to share more details if relevant."
- Sign off professionally: "Best regards," or "Regards," — followed by full name and company name`

// Industry-specific angle hints for the prompt
function getIndustryHint(industry: string): string {
  const i = industry.toLowerCase()
  if (i.includes('paint') || i.includes('cement') || i.includes('building') || i.includes('construction'))
    return 'Focus on: South Rajasthan dealer network coverage. Bhilwara, Kota, Chittorgarh can be reached in under 3 hours from this warehouse — most brands are still shipping from Jaipur and losing half a day.'
  if (i.includes('marble') || i.includes('granite') || i.includes('stone'))
    return 'Focus on: Udaipur is the marble hub. A ground-floor space on NH-48 means consolidating stock and loading export containers without getting stuck in city traffic.'
  if (i.includes('quick commerce') || i.includes('dark store') || i.includes('grocery') || i.includes('instant'))
    return 'Focus on: Ground floor for fast unloading, NH-48 for inbound supply from Ahmedabad/Jaipur. Useful as a mother hub feeding dark stores in Udaipur city.'
  if (i.includes('logistics') || i.includes('transport') || i.includes('freight'))
    return 'Focus on: Highway-direct location. Trucks don\'t enter city traffic. Can use as a cross-docking or staging point on the Delhi–Mumbai corridor.'
  if (i.includes('fmcg') || i.includes('consumer') || i.includes('food') || i.includes('beverage'))
    return 'Focus on: South Rajasthan is underserved from Jaipur. An Udaipur depot means same-day delivery to Udaipur, Bhilwara, Banswara distributors instead of next-day.'
  if (i.includes('e-commerce') || i.includes('d2c') || i.includes('online'))
    return 'Focus on: Rajasthan fulfilment without routing through Jaipur. Can reach Kota, Ajmer, Jodhpur via highway for faster delivery SLAs.'
  if (i.includes('chemical') || i.includes('pharmaceutical') || i.includes('pharma'))
    return 'Focus on: 24/7 power backup (no cold chain breaks), ground floor loading, highway access for both inbound raw materials and outbound dispatch.'
  return 'Focus on: Highway access to reach Jaipur (4h), Ahmedabad (3.5h), Delhi (8h) for regional distribution. Useful as a Rajasthan depot.'
}

export async function composeOutreachEmail(
  companyName: string,
  industry: string,
  contactName?: string
): Promise<AIResponse> {
  const tone = pick(tones)
  const signoff = pick(signoffs)
  const sender = pick(senderNames)

  const industryHint = getIndustryHint(industry)

  const prompt = `Write a cold outreach email to ${companyName}, a ${industry} company.
${contactName ? `Recipient: ${contactName}.` : ''}
Tone: ${tone}

ANGLE FOR THIS INDUSTRY:
${industryHint}

Sign off: "${signoff}" / "${sender}" / "Aviral India"

Rules:
- 80–120 words only
- Include the address (Gukhar Magri, NH-48, Udaipur, Rajasthan 313001) once so they can look it up
- Open with something relevant to their business, not a generic intro
- One clear point. One soft ask at the end.
- Real person tone — not corporate

Respond in this exact JSON format, nothing else:
{"subject": "short natural subject line", "body": "email body in HTML with <p> tags"}`

  const response = await callGroq(WAREHOUSE_CONTEXT, prompt)
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch {}
  return {
    subject: `warehouse space in Udaipur — on NH-48`,
    body: `<p>Hi${contactName ? ` ${contactName}` : ''},</p><p>I own a 15,000 sq ft ground-floor warehouse at Gukhar Magri, NH-48, Udaipur, Rajasthan 313001 — directly on the Delhi–Mumbai highway. From here you can cover Jaipur in 4 hours and Ahmedabad in 3.5, which makes it a useful Rajasthan distribution base without routing through Jaipur.</p><p>Wondering if ${companyName} could use this for ${industry.toLowerCase()} operations in the region. Happy to share details if it's worth a look.</p><p>${signoff}<br>${sender}<br>Aviral India</p>`,
  }
}

export async function composeFollowUpEmail(
  companyName: string,
  originalSubject: string,
  daysSince: number
): Promise<AIResponse> {
  const sender = pick(senderNames)
  const approaches = [
    `Bumping this up — sent you a note ${daysSince} days back about the NH-48 warehouse in Udaipur. Any thoughts?`,
    `Just checking in on my last email. No worries if the timing's off — just wanted to follow up before moving on.`,
    `Quick follow-up. If warehouse space near Udaipur isn't something you need right now, totally fine — just let me know.`,
    `Circling back on this one. Did you get a chance to look at my earlier note? Happy to give you more details if useful.`,
  ]

  const prompt = `Write a very short follow-up email (under 50 words, 2-3 sentences) to ${companyName}.

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
    body: `<p>Hey, just bumping this. Let me know if the warehouse space on NH-48 Udaipur is worth a chat — happy to share details.</p><p>${sender}</p>`,
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

Keep it under 80 words. Be helpful and human.
- If they sound interested: suggest a call or say you can show them the space
- If asking about price or terms: say it depends on the space needed and duration, suggest a quick call to sort it out
- If not interested: say thanks, no hard feelings, move on
- If asking where exactly it is: Gukhar Magri, NH-48, Udaipur — they can search on Google Maps

Don't sound corporate. Reply like you're on your phone.

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
    body: `<p>Hey ${senderName}, thanks for getting back! Happy to walk you through the details. Want to hop on a quick call, or if you're in Udaipur I can show you the space — it's right on NH-48 at Gukhar Magri.</p><p>${sender}</p>`,
  }
}

export async function classifyInboundEmail(
  subject: string,
  body: string,
  companyName?: string
): Promise<EmailClassification> {
  const prompt = `You received this email in response to a warehouse rental cold outreach. Classify it.

Company: ${companyName || 'unknown'}
Subject: ${subject}
Message: ${body}

Classify into exactly one of these types:
- GENUINE_INTEREST: A real human is actually interested, asking questions, wants details, or wants to discuss. Even a short "tell me more" counts.
- REDIRECT: They're saying you contacted the wrong person and are pointing to someone else (may include a name or email).
- AUTO_ACK: Auto-generated acknowledgment — "we have received your email", "we'll get back to you", "thank you for contacting us", ticket number assigned, etc.
- NOT_INTERESTED: They're declining, saying they don't need it, or asking to be removed.
- OOO: Out of office, on leave, vacation, will return on X date.

Rules:
- If unsure between GENUINE_INTEREST and anything else, lean toward the non-interest type — we only want to alert the owner for real leads
- A message that says "we'll get back to you" is AUTO_ACK, not GENUINE_INTEREST
- If they mention a specific person's name or email to contact instead, type is REDIRECT

Respond in this exact JSON format only:
{"type": "TYPE", "reason": "one line why", "redirect_contact": "email or name if REDIRECT, else null"}`

  const response = await callGroq(
    'You are classifying emails for a warehouse owner. Be conservative — only mark GENUINE_INTEREST if a real human is showing real interest.',
    prompt
  )

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch {}

  // Default to AUTO_ACK when unsure — better to under-alert than spam the owner
  return { type: 'AUTO_ACK', reason: 'Could not classify, defaulting to skip' }
}
