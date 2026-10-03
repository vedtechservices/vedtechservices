-- Add lead_time_weeks to inventory_items
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS lead_time_weeks integer DEFAULT 4;

-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency text NOT NULL DEFAULT 'INR',
    rates jsonb NOT NULL,
    last_updated timestamp with time zone DEFAULT now()
);

-- Enable RLS for exchange_rates
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all users" ON exchange_rates FOR SELECT USING (true);

-- Create chatbot_escalations table
CREATE TABLE IF NOT EXISTS chatbot_escalations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name text,
    customer_identifier text,
    message text,
    status text DEFAULT 'pending', -- pending, viewed, resolved
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for chatbot_escalations
ALTER TABLE chatbot_escalations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for authenticated admins" ON chatbot_escalations 
    FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "Enable insert for all" ON chatbot_escalations 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for admins" ON chatbot_escalations 
    FOR UPDATE USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Enable Realtime for chatbot_escalations
ALTER PUBLICATION supabase_realtime ADD TABLE chatbot_escalations;
