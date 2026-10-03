-- Archival table for logs
CREATE TABLE IF NOT EXISTS activity_logs_archive (
    id UUID PRIMARY KEY,
    user_id UUID,
    user_name TEXT,
    user_role TEXT,
    action TEXT,
    target_id TEXT,
    target_type TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Engineer Notifications Table
CREATE TABLE IF NOT EXISTS engineer_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID REFERENCES engineers(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for engineer notifications
ALTER PUBLICATION supabase_realtime ADD TABLE engineer_notifications;

-- Update engineers table for better management
ALTER TABLE engineers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';
ALTER TABLE engineers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE engineers ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'engineer';

-- RLS for engineer notifications
ALTER TABLE engineer_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Engineers can view own notifications" 
ON engineer_notifications FOR SELECT 
TO public 
USING (engineer_id::text = current_setting('request.jwt.claims', true)::jsonb ->> 'sub');
