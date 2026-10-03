-- Update chatbot_escalations to store full messages history
ALTER TABLE chatbot_escalations ADD COLUMN IF NOT EXISTS messages jsonb DEFAULT '[]'::jsonb;

-- Optional: Add a specific table for report delivery tracking for easier verification
CREATE TABLE IF NOT EXISTS report_delivery_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type text NOT NULL, -- e.g., 'weekly_performance'
    recipient_email text NOT NULL,
    status text NOT NULL, -- 'Success', 'Failed'
    error_message text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for report_delivery_logs
ALTER TABLE report_delivery_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super Admins can view logs" ON report_delivery_logs 
    FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'super_admin'));
