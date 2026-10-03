
-- 1. Add session_token column to chatbot_escalations
ALTER TABLE chatbot_escalations
  ADD COLUMN IF NOT EXISTS session_token uuid DEFAULT gen_random_uuid();

-- 2. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_chatbot_escalations_session_token
  ON chatbot_escalations (session_token);

-- 3. SECURITY DEFINER RPC so anon customers can safely fetch their own escalation
CREATE OR REPLACE FUNCTION get_customer_escalation(p_session_token uuid)
RETURNS TABLE (
  id uuid,
  customer_name text,
  message text,
  status text,
  sla_status text,
  priority text,
  created_at timestamptz,
  first_response_at timestamptz,
  resolved_at timestamptz,
  messages jsonb
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    id, customer_name, message, status, sla_status, priority,
    created_at, first_response_at, resolved_at, messages
  FROM chatbot_escalations
  WHERE session_token = p_session_token
  LIMIT 1;
$$;

-- 4. Grant execute to anon so chatbot widget can call it
GRANT EXECUTE ON FUNCTION get_customer_escalation(uuid) TO anon;
GRANT EXECUTE ON FUNCTION get_customer_escalation(uuid) TO authenticated;
