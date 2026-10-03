-- Create feedback_reminders table
CREATE TABLE IF NOT EXISTS feedback_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  reminder_sent_at timestamptz DEFAULT NULL,
  feedback_submitted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create feedback_responses table
CREATE TABLE IF NOT EXISTS feedback_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL REFERENCES customer_feedback(id) ON DELETE CASCADE,
  admin_id text NOT NULL,
  response_text text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  delivery_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create notification_rules table
CREATE TABLE IF NOT EXISTS notification_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL UNIQUE,
  trigger_event text NOT NULL,
  conditions jsonb DEFAULT '{}',
  recipients jsonb DEFAULT '[]',
  notification_channels jsonb DEFAULT '["in_app"]',
  email_template text DEFAULT NULL,
  priority text DEFAULT 'medium',
  status text DEFAULT 'enabled',
  is_system_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notification_triggers table
CREATE TABLE IF NOT EXISTS notification_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES notification_rules(id) ON DELETE CASCADE,
  triggered_at timestamptz DEFAULT now(),
  event_data jsonb DEFAULT '{}',
  recipients jsonb DEFAULT '[]',
  delivery_status text DEFAULT 'pending',
  notification_content jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for feedback_reminders
CREATE INDEX IF NOT EXISTS idx_feedback_reminders_ticket_id ON feedback_reminders(ticket_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reminders_customer_id ON feedback_reminders(customer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reminders_feedback_submitted ON feedback_reminders(feedback_submitted);
CREATE INDEX IF NOT EXISTS idx_feedback_reminders_reminder_sent_at ON feedback_reminders(reminder_sent_at);

-- Create indexes for feedback_responses
CREATE INDEX IF NOT EXISTS idx_feedback_responses_feedback_id ON feedback_responses(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_admin_id ON feedback_responses(admin_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_sent_at ON feedback_responses(sent_at DESC);

-- Create indexes for notification_rules
CREATE INDEX IF NOT EXISTS idx_notification_rules_trigger_event ON notification_rules(trigger_event);
CREATE INDEX IF NOT EXISTS idx_notification_rules_status ON notification_rules(status);
CREATE INDEX IF NOT EXISTS idx_notification_rules_is_system_default ON notification_rules(is_system_default);

-- Create indexes for notification_triggers
CREATE INDEX IF NOT EXISTS idx_notification_triggers_rule_id ON notification_triggers(rule_id);
CREATE INDEX IF NOT EXISTS idx_notification_triggers_triggered_at ON notification_triggers(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_triggers_delivery_status ON notification_triggers(delivery_status);

-- Enable RLS on all tables
ALTER TABLE feedback_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_triggers ENABLE ROW LEVEL SECURITY;

-- RLS policies for feedback_reminders
CREATE POLICY "Authenticated users can read feedback reminders" ON feedback_reminders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role has full access to feedback reminders" ON feedback_reminders FOR ALL TO service_role USING (true);

-- RLS policies for feedback_responses
CREATE POLICY "Authenticated users can read feedback responses" ON feedback_responses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert feedback responses" ON feedback_responses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Service role has full access to feedback responses" ON feedback_responses FOR ALL TO service_role USING (true);

-- RLS policies for notification_rules
CREATE POLICY "Authenticated users can read notification rules" ON notification_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage notification rules" ON notification_rules FOR ALL TO authenticated USING (true);
CREATE POLICY "Service role has full access to notification rules" ON notification_rules FOR ALL TO service_role USING (true);

-- RLS policies for notification_triggers
CREATE POLICY "Authenticated users can read notification triggers" ON notification_triggers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role has full access to notification triggers" ON notification_triggers FOR ALL TO service_role USING (true);

-- Insert default notification rules
INSERT INTO notification_rules (rule_name, trigger_event, conditions, recipients, notification_channels, priority, status, is_system_default)
VALUES
  ('New High-Priority Ticket Created', 'ticket_created', '{"priority": "High"}', '["all_admins"]', '["in_app", "email"]', 'high', 'enabled', true),
  ('Scheduled Report Failed to Generate', 'report_failed', '{}', '["super_admin", "full_access_admin"]', '["in_app", "email"]', 'high', 'enabled', true),
  ('Email Engagement Rate Dropped Below Threshold', 'engagement_dropped', '{"threshold": 20}', '["super_admin", "full_access_admin"]', '["in_app", "email"]', 'medium', 'enabled', true),
  ('Employee Reached Performance Milestone', 'performance_milestone', '{"tickets_resolved": 100}', '["employee", "manager"]', '["in_app"]', 'medium', 'enabled', true),
  ('Ticket Remained Unassigned for More Than 1 Hour', 'ticket_unassigned', '{"duration_hours": 1}', '["all_admins"]', '["in_app", "email"]', 'high', 'enabled', true)
ON CONFLICT (rule_name) DO NOTHING;