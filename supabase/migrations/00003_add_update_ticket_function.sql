-- Create function to update ticket from admin
CREATE OR REPLACE FUNCTION update_ticket_admin(
  p_ticket_id UUID,
  p_status TEXT,
  p_engineer_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE support_tickets
  SET 
    status = p_status,
    engineer_id = p_engineer_id,
    notes = p_notes,
    updated_at = NOW()
  WHERE id = p_ticket_id;
END;
$$ LANGUAGE plpgsql;
