
-- Add office_id FK to support_tickets
ALTER TABLE support_tickets
  ADD COLUMN office_id uuid REFERENCES offices(id) ON DELETE SET NULL;

-- Add office_id FK to chatbot_escalations
ALTER TABLE chatbot_escalations
  ADD COLUMN office_id uuid REFERENCES offices(id) ON DELETE SET NULL;

-- Helper function: returns per-office ticket + escalation counts
CREATE OR REPLACE FUNCTION get_office_stats()
RETURNS TABLE (
  office_id       uuid,
  ticket_count    bigint,
  open_tickets    bigint,
  escalation_count bigint,
  open_escalations bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    o.id                                          AS office_id,
    COUNT(DISTINCT st.id)                         AS ticket_count,
    COUNT(DISTINCT st.id) FILTER (WHERE st.status NOT IN ('resolved','closed'))  AS open_tickets,
    COUNT(DISTINCT ce.id)                         AS escalation_count,
    COUNT(DISTINCT ce.id) FILTER (WHERE ce.status NOT IN ('resolved'))           AS open_escalations
  FROM offices o
  LEFT JOIN support_tickets    st ON st.office_id = o.id
  LEFT JOIN chatbot_escalations ce ON ce.office_id = o.id
  GROUP BY o.id;
$$;
