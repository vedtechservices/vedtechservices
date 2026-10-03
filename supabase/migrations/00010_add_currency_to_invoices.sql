-- Base invoice schema used by customer and admin billing views.
CREATE TABLE IF NOT EXISTS service_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS service_invoices_customer_id_idx ON service_invoices(customer_id);

ALTER TABLE service_invoices ADD COLUMN currency text DEFAULT 'INR';
