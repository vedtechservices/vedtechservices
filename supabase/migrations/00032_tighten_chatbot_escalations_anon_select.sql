
-- Remove the overly-permissive anon SELECT policy
DROP POLICY IF EXISTS "Allow anon select own" ON chatbot_escalations;
