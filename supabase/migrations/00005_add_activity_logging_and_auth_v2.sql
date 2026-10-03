-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_name TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    target_id TEXT,
    target_type TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy for super_admin to read all logs
CREATE POLICY "Super admins can view all logs" 
ON activity_logs FOR SELECT 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'super_admin');

-- Add Reset Password columns to admin_users
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS reset_code TEXT;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS reset_code_expires TIMESTAMP WITH TIME ZONE;

-- Upgrade engineers table for better auth and reset
ALTER TABLE engineers ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE engineers ADD COLUMN IF NOT EXISTS reset_code TEXT;
ALTER TABLE engineers ADD COLUMN IF NOT EXISTS reset_code_expires TIMESTAMP WITH TIME ZONE;

-- Update existing engineers to use employee_id as initial password_hash if not set
UPDATE engineers SET password_hash = employee_id WHERE password_hash IS NULL;

-- Add comment explaining roles
COMMENT ON COLUMN admin_users.role IS 'Roles: super_admin, support_admin, billing_admin';
