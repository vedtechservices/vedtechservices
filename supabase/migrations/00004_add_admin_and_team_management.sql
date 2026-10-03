-- Create admin_users table for secure admin credentials
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- No default administrator is seeded. Bootstrap the first admin out of band.
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON admin_users FROM PUBLIC, anon, authenticated;

-- Add more fields to engineers table
ALTER TABLE engineers ADD COLUMN IF NOT EXISTS employee_id TEXT UNIQUE;
ALTER TABLE engineers ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Technical';
ALTER TABLE engineers ADD COLUMN IF NOT EXISTS joining_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE engineers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE engineers ADD COLUMN IF NOT EXISTS assigned_tickets_count INTEGER DEFAULT 0;
ALTER TABLE engineers ADD COLUMN IF NOT EXISTS resolved_tickets_count INTEGER DEFAULT 0;

-- Create function to update engineer stats
CREATE OR REPLACE FUNCTION update_engineer_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update assigned tickets count
  UPDATE engineers
  SET assigned_tickets_count = (
    SELECT COUNT(*) FROM support_tickets 
    WHERE engineer_id = NEW.engineer_id 
    AND status IN ('open', 'in-progress', 'waiting')
  ),
  resolved_tickets_count = (
    SELECT COUNT(*) FROM support_tickets 
    WHERE engineer_id = NEW.engineer_id 
    AND status IN ('resolved', 'closed')
  )
  WHERE id = NEW.engineer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for engineer stats
DROP TRIGGER IF EXISTS trigger_update_engineer_stats ON support_tickets;
CREATE TRIGGER trigger_update_engineer_stats
AFTER INSERT OR UPDATE ON support_tickets
FOR EACH ROW
WHEN (NEW.engineer_id IS NOT NULL)
EXECUTE FUNCTION update_engineer_stats();

-- Create function to add engineer
CREATE OR REPLACE FUNCTION add_engineer(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_specialization TEXT,
  p_employee_id TEXT DEFAULT NULL,
  p_department TEXT DEFAULT 'Technical'
)
RETURNS UUID AS $$
DECLARE
  v_engineer_id UUID;
BEGIN
  INSERT INTO engineers (name, email, phone, specialization, employee_id, department, status)
  VALUES (p_name, p_email, p_phone, p_specialization, p_employee_id, p_department, 'available')
  RETURNING id INTO v_engineer_id;
  
  RETURN v_engineer_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update engineer
CREATE OR REPLACE FUNCTION update_engineer(
  p_engineer_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_specialization TEXT,
  p_status TEXT,
  p_department TEXT DEFAULT 'Technical'
)
RETURNS VOID AS $$
BEGIN
  UPDATE engineers
  SET 
    name = p_name,
    email = p_email,
    phone = p_phone,
    specialization = p_specialization,
    status = p_status,
    department = p_department,
    updated_at = NOW()
  WHERE id = p_engineer_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to delete engineer
CREATE OR REPLACE FUNCTION delete_engineer(p_engineer_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Unassign all tickets from this engineer
  UPDATE support_tickets
  SET engineer_id = NULL
  WHERE engineer_id = p_engineer_id;
  
  -- Delete the engineer
  DELETE FROM engineers WHERE id = p_engineer_id;
END;
$$ LANGUAGE plpgsql;

-- Sensitive admin and employee data is accessed only by trusted server code.
