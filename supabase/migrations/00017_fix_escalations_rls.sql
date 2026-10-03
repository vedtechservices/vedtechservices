-- Ensure we start clean for these policies
DROP POLICY IF EXISTS "Enable insert for all" ON chatbot_escalations;
DROP POLICY IF EXISTS "Enable read for authenticated admins" ON chatbot_escalations;
DROP POLICY IF EXISTS "Enable update for admins" ON chatbot_escalations;
DROP POLICY IF EXISTS "Allow anyone to insert escalations" ON chatbot_escalations;
DROP POLICY IF EXISTS "Allow admins to select escalations" ON chatbot_escalations;
DROP POLICY IF EXISTS "Allow admins to update escalations" ON chatbot_escalations;

-- Create helper function for admin check
CREATE OR REPLACE FUNCTION public.can_manage_escalations()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Anyone can insert (for chatbot and test creation)
-- We use a more explicit policy
CREATE POLICY "Allow insertions" ON chatbot_escalations
FOR INSERT TO public
WITH CHECK (true);

-- 2. Admins can view all
CREATE POLICY "Allow admin select" ON chatbot_escalations
FOR SELECT TO public
USING (can_manage_escalations());

-- 3. Admins can update
CREATE POLICY "Allow admin update" ON chatbot_escalations
FOR UPDATE TO public
USING (can_manage_escalations())
WITH CHECK (can_manage_escalations());

-- 4. Admins can delete
CREATE POLICY "Allow admin delete" ON chatbot_escalations
FOR DELETE TO public
USING (can_manage_escalations());
