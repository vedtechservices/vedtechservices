-- 1. Add SLA columns to chatbot_escalations
ALTER TABLE chatbot_escalations ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium';
ALTER TABLE chatbot_escalations ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE chatbot_escalations ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE chatbot_escalations ADD COLUMN IF NOT EXISTS sla_status TEXT DEFAULT 'Within SLA';

-- 2. Add region column to service_invoices
ALTER TABLE service_invoices ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'Asia-Pacific';

-- 3. Create sla_settings table
CREATE TABLE IF NOT EXISTS sla_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    priority TEXT NOT NULL UNIQUE,
    first_response_target_min INTEGER NOT NULL, -- in minutes
    resolution_target_min INTEGER NOT NULL, -- in minutes
    email_reply_target_min INTEGER NOT NULL, -- in minutes
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Insert default SLA settings
INSERT INTO sla_settings (priority, first_response_target_min, resolution_target_min, email_reply_target_min) VALUES
('High', 15, 120, 30),
('Medium', 30, 240, 60),
('Low', 60, 480, 120)
ON CONFLICT (priority) DO UPDATE SET
    first_response_target_min = EXCLUDED.first_response_target_min,
    resolution_target_min = EXCLUDED.resolution_target_min,
    email_reply_target_min = EXCLUDED.email_reply_target_min,
    updated_at = NOW();

-- 5. Update existing invoices with regions (heuristic)
UPDATE service_invoices SET region = 'North America' WHERE country IN ('USA', 'Canada');
UPDATE service_invoices SET region = 'Europe' WHERE country IN ('UK', 'Germany', 'France', 'Italy', 'Spain', 'Europe');
UPDATE service_invoices SET region = 'Middle East' WHERE country IN ('UAE', 'Saudi Arabia', 'Qatar');
UPDATE service_invoices SET region = 'Asia-Pacific' WHERE country IN ('India', 'Singapore', 'Japan', 'China', 'Hong Kong', 'Australia', 'New Zealand');

-- 6. Enable RLS on sla_settings
ALTER TABLE sla_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sla_settings" ON sla_settings
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
    );

CREATE POLICY "Anyone can view sla_settings" ON sla_settings
    FOR SELECT USING (true);
