-- Add 2FA columns to admin_users
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS totp_secret TEXT;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT FALSE;

-- Notifications Table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'warning', 'critical', 'ticket'
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE admin_notifications;

-- Policy for admins to read their own notifications
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view own notifications" 
ON admin_notifications FOR SELECT 
TO public 
USING (admin_id::text = current_setting('request.jwt.claims', true)::jsonb ->> 'sub');
