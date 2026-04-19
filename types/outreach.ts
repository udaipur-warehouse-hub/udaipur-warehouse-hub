export interface OutreachTarget {
  id: string
  company_name: string
  industry: string
  contact_name: string | null
  contact_email: string
  city: string | null
  notes: string | null
  status: 'pending' | 'emailed' | 'replied' | 'interested' | 'not_interested' | 'converted'
  created_at: string
  updated_at: string
}

export interface EmailLog {
  id: string
  target_id: string | null
  direction: 'outbound' | 'inbound'
  email_type: 'cold_outreach' | 'follow_up' | 'auto_reply' | 'inquiry_notification'
  to_email: string
  from_email: string
  subject: string
  body: string | null
  gmail_message_id: string | null
  gmail_thread_id: string | null
  status: 'sent' | 'failed' | 'pending'
  created_at: string
}
