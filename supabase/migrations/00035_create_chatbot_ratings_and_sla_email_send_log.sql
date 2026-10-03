
-- ── chatbot_ratings ──────────────────────────────────────────────
CREATE TABLE chatbot_ratings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token uuid NOT NULL,
  escalation_id uuid REFERENCES chatbot_escalations(id) ON DELETE SET NULL,
  rating        smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE chatbot_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can insert their own rating (anon / public widget)
CREATE POLICY "anyone_can_insert_rating" ON chatbot_ratings
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Anyone can read their own rating by session_token
CREATE POLICY "anyone_can_read_own_rating" ON chatbot_ratings
  FOR SELECT TO anon, authenticated USING (true);

-- ── sla_email_send_log ───────────────────────────────────────────
CREATE TABLE sla_email_send_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escalation_id   uuid REFERENCES chatbot_escalations(id) ON DELETE SET NULL,
  email_type      text NOT NULL CHECK (email_type IN ('breached', 'approaching')),
  recipient_count integer NOT NULL DEFAULT 0,
  triggered_by    text,          -- admin email / identifier
  sent_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sla_email_send_log ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can read logs
CREATE POLICY "admins_can_read_send_log" ON sla_email_send_log
  FOR SELECT TO authenticated USING (true);

-- Service-role (Edge Function) inserts via service key — no policy needed for that path
-- But allow authenticated inserts too (belt-and-suspenders)
CREATE POLICY "admins_can_insert_send_log" ON sla_email_send_log
  FOR INSERT TO authenticated WITH CHECK (true);
