-- Enhance report_schedules table with new features
ALTER TABLE report_schedules 
ADD COLUMN IF NOT EXISTS custom_date_range jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS recipients_config jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS conditions jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS report_types text[] DEFAULT NULL;

-- Create email_delivery_logs table for tracking email events
CREATE TABLE IF NOT EXISTS email_delivery_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id text NOT NULL,
  recipient text NOT NULL,
  event_type text NOT NULL,
  campaign_type text DEFAULT NULL,
  report_name text DEFAULT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_email_id ON email_delivery_logs(email_id);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_recipient ON email_delivery_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_event_type ON email_delivery_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_timestamp ON email_delivery_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_campaign_type ON email_delivery_logs(campaign_type);

-- Enable RLS on email_delivery_logs
ALTER TABLE email_delivery_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read email delivery logs
CREATE POLICY "Allow authenticated users to read email delivery logs"
  ON email_delivery_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for service role to insert email delivery logs (webhooks)
CREATE POLICY "Allow service role to insert email delivery logs"
  ON email_delivery_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Add comments for documentation
COMMENT ON COLUMN report_schedules.custom_date_range IS 'Custom date range configuration: {type: "absolute|relative", start_date: "2024-01-01", end_date: "2024-12-31", relative_value: 7, relative_unit: "days"}';
COMMENT ON COLUMN report_schedules.recipients_config IS 'Recipients with roles: [{email: "user@example.com", role: "admin|manager|viewer", name: "John Doe"}]';
COMMENT ON COLUMN report_schedules.conditions IS 'Conditional generation rules: [{field: "total_customers", operator: ">", value: 100, logic: "AND"}]';
COMMENT ON COLUMN report_schedules.report_types IS 'Array of report types to include: ["customer_growth", "retention_churn", "satisfaction"]';

COMMENT ON TABLE email_delivery_logs IS 'Tracks email delivery events from SendGrid webhooks';
COMMENT ON COLUMN email_delivery_logs.email_id IS 'Unique identifier for the email (generated when sending)';
COMMENT ON COLUMN email_delivery_logs.event_type IS 'SendGrid event type: delivered, open, click, bounce, dropped, deferred, spam_report, unsubscribe';
COMMENT ON COLUMN email_delivery_logs.campaign_type IS 'Type of campaign: scheduled_report, email_campaign, manual_email';
COMMENT ON COLUMN email_delivery_logs.metadata IS 'Additional event data from SendGrid';