CREATE TABLE IF NOT EXISTS client_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  company_name TEXT,
  email TEXT,
  service TEXT,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT NOT NULL CHECK (char_length(review) BETWEEN 10 AND 2000),
  avatar TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES admin_users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS client_reviews_public_idx ON client_reviews (created_at DESC) WHERE status = 'APPROVED';
ALTER TABLE client_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON client_reviews FROM anon, authenticated;
GRANT ALL ON client_reviews TO service_role;
