
-- ── chat_sessions: persist ChatBot conversation history ──────────
CREATE TABLE chat_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token uuid NOT NULL UNIQUE,
  messages      jsonb NOT NULL DEFAULT '[]',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_can_upsert_own_session" ON chat_sessions
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ── offices: multi-branch management ────────────────────────────
CREATE TABLE offices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  branch_code     text NOT NULL UNIQUE,
  address         text NOT NULL,
  city            text NOT NULL,
  state           text NOT NULL DEFAULT 'Bihar',
  pincode         text,
  phone           text,
  email           text,
  manager_name    text,
  manager_phone   text,
  office_type     text NOT NULL DEFAULT 'branch' CHECK (office_type IN ('headquarters', 'branch', 'service_center', 'remote')),
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'coming_soon')),
  opened_at       date,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE offices ENABLE ROW LEVEL SECURITY;

-- Authenticated admins can do everything
CREATE POLICY "admins_manage_offices" ON offices
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public can read active offices (e.g. Contact page map)
CREATE POLICY "public_read_active_offices" ON offices
  FOR SELECT TO anon USING (status = 'active');

-- Seed headquarters + first expansion office
INSERT INTO offices (name, branch_code, address, city, state, pincode, phone, email, manager_name, office_type, status, opened_at) VALUES
  ('VedTech HQ', 'VTS-HQ', 'Samastipur, Bihar', 'Samastipur', 'Bihar', '848101', '+91 7858971869', 'vedtechservicess@gmail.com', 'Chandan Kumar Yajee', 'headquarters', 'active', '2022-01-01'),
  ('VedTech Branch 2', 'VTS-BR2', 'New Branch Address', 'TBD', 'Bihar', NULL, NULL, NULL, NULL, 'branch', 'active', CURRENT_DATE);
