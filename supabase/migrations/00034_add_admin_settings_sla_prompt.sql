
-- Admin settings table for customisable system-level config
CREATE TABLE admin_settings (
  key   text PRIMARY KEY,
  value text NOT NULL,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default SLA email prompt
INSERT INTO admin_settings (key, value, label, description) VALUES
(
  'sla_email_prompt',
  'You are a professional IT support operations assistant for VedTech Services. Write a concise, professional HTML email body (no <html>/<head>/<body> tags — inner content only) notifying the support team about an SLA issue. Use clear headings, a data table for key facts, and inline CSS for styling. Keep it under 300 words.',
  'SLA Breach Email Prompt',
  'Custom instructions sent to the AI when generating SLA breach / approaching emails. You can add brand tone, formatting rules, or extra context here.'
);

-- RLS: only authenticated (admins) can read/write
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read settings"
  ON admin_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can update settings"
  ON admin_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
