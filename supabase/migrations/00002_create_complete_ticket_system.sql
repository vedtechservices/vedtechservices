-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create engineers table
CREATE TABLE IF NOT EXISTS engineers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  specialization TEXT,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create amc_plans table
CREATE TABLE IF NOT EXISTS amc_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_months INTEGER DEFAULT 12,
  features JSONB,
  response_time TEXT,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create amc_subscriptions table
CREATE TABLE IF NOT EXISTS amc_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  plan_id UUID REFERENCES amc_plans(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  payment_status TEXT DEFAULT 'pending',
  amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update support_tickets table with new fields
ALTER TABLE support_tickets 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id),
ADD COLUMN IF NOT EXISTS engineer_id UUID REFERENCES engineers(id),
ADD COLUMN IF NOT EXISTS service_type TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS sla_response_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS feedback_rating INTEGER,
ADD COLUMN IF NOT EXISTS feedback_comment TEXT,
ADD COLUMN IF NOT EXISTS is_amc_customer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_amc_subscriptions_customer ON amc_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_amc_subscriptions_status ON amc_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON support_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_engineer ON support_tickets(engineer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_service_type ON support_tickets(service_type);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE amc_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE amc_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Customers can view their own data"
  ON customers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create customer account"
  ON customers FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policies for AMC plans
CREATE POLICY "Anyone can view AMC plans"
  ON amc_plans FOR SELECT
  TO public
  USING (true);

-- RLS Policies for AMC subscriptions
CREATE POLICY "Customers can view their subscriptions"
  ON amc_subscriptions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create subscriptions"
  ON amc_subscriptions FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policies for engineers
CREATE POLICY "Anyone can view engineers"
  ON engineers FOR SELECT
  TO public
  USING (true);

-- Insert default AMC plans
INSERT INTO amc_plans (name, price, duration_months, features, response_time, is_popular) VALUES
('Basic AMC', 3999.00, 12, 
 '["1 PC / Laptop", "Software issues", "OS installation", "Remote support", "24-48 hrs response"]'::jsonb,
 '24-48 hours', false),
('Standard AMC', 7999.00, 12,
 '["2-3 Systems", "Hardware + Software", "Printer support", "Network support", "Priority support", "12-24 hrs response"]'::jsonb,
 '12-24 hours', true),
('Premium AMC', 14999.00, 12,
 '["Office / Shop / School", "Unlimited support", "On-site + Remote", "Network + Hardware", "Emergency support", "4-8 hrs response"]'::jsonb,
 '4-8 hours', false)
ON CONFLICT DO NOTHING;

-- Insert sample engineers
INSERT INTO engineers (name, email, phone, specialization, status) VALUES
('Rajesh Kumar', 'rajesh@vedtechservices.com', '+91-9876543210', 'Hardware & Networking', 'available'),
('Priya Sharma', 'priya@vedtechservices.com', '+91-9876543211', 'Software Development', 'available'),
('Amit Singh', 'amit@vedtechservices.com', '+91-9876543212', 'Full Stack Support', 'available')
ON CONFLICT DO NOTHING;

-- Create function to check AMC status
CREATE OR REPLACE FUNCTION check_customer_amc_status(customer_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_active_amc BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM amc_subscriptions amc
    JOIN customers c ON c.id = amc.customer_id
    WHERE c.email = customer_email
    AND amc.status = 'active'
    AND amc.end_date >= CURRENT_DATE
  ) INTO has_active_amc;
  
  RETURN has_active_amc;
END;
$$ LANGUAGE plpgsql;

-- Create function to get or create customer
CREATE OR REPLACE FUNCTION get_or_create_customer(
  p_email TEXT,
  p_name TEXT,
  p_phone TEXT,
  p_company TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  -- Try to find existing customer
  SELECT id INTO v_customer_id
  FROM customers
  WHERE email = p_email;
  
  -- If not found, create new customer
  IF v_customer_id IS NULL THEN
    INSERT INTO customers (email, name, phone, company, location)
    VALUES (p_email, p_name, p_phone, p_company, p_location)
    RETURNING id INTO v_customer_id;
  END IF;
  
  RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql;
