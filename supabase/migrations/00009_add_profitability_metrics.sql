-- Add financial columns to hardware_repairs
ALTER TABLE hardware_repairs 
ADD COLUMN IF NOT EXISTS parts_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS labor_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_charge NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_price NUMERIC DEFAULT 0;

-- Calculate total price as sum of parts + labor + service charge if not provided
CREATE OR REPLACE FUNCTION update_repair_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_price = NEW.parts_cost + NEW.labor_cost + NEW.service_charge;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_repair_total
BEFORE INSERT OR UPDATE ON hardware_repairs
FOR EACH ROW
EXECUTE FUNCTION update_repair_total();

-- Create the base schema used by the inventory UI and later part requests.
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  stock_level INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 5,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add more metadata to inventory
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS supplier_name TEXT,
ADD COLUMN IF NOT EXISTS last_restocked_at TIMESTAMP WITH TIME ZONE;

-- Add engineer performance metadata to support_tickets
ALTER TABLE support_tickets
ADD COLUMN IF NOT EXISTS resolution_time_minutes INTEGER, -- calculated upon closing
ADD COLUMN IF NOT EXISTS first_response_time_minutes INTEGER;
