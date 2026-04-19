-- Outreach targets (companies to email)
CREATE TABLE outreach_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  city TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'emailed', 'replied', 'interested', 'not_interested', 'converted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email log (every email sent or received)
CREATE TABLE email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID REFERENCES outreach_targets(id) ON DELETE SET NULL,
  direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  email_type TEXT NOT NULL CHECK (email_type IN ('cold_outreach', 'follow_up', 'auto_reply', 'inquiry_notification')),
  to_email TEXT NOT NULL,
  from_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  gmail_message_id TEXT,
  gmail_thread_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at on outreach_targets
CREATE TRIGGER outreach_targets_updated_at
  BEFORE UPDATE ON outreach_targets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE outreach_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Only admins can manage targets and email log
CREATE POLICY "Admins can manage targets"
  ON outreach_targets FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage email log"
  ON email_log FOR ALL
  TO authenticated
  USING (true);

-- Service role needs full access for cron jobs
CREATE POLICY "Service can manage targets"
  ON outreach_targets FOR ALL
  USING (true);

CREATE POLICY "Service can manage email log"
  ON email_log FOR ALL
  USING (true);
