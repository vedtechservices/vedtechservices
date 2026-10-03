-- Tables queried by the checked-in app but absent from migrations 00001-00039.
-- Sensitive legacy browser operations are intentionally not granted here;
-- they require protected server routes.

CREATE TABLE IF NOT EXISTS public.login_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
  email text,
  action text NOT NULL,
  status text,
  device_info jsonb,
  user_agent text,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_audit_logs_created_at_idx ON public.login_audit_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_submissions_created_at_idx ON public.contact_submissions(created_at DESC);

CREATE TABLE IF NOT EXISTS public.customer_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS customer_notifications_customer_idx ON public.customer_notifications(customer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.part_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id uuid REFERENCES public.engineers(id) ON DELETE SET NULL,
  repair_id uuid REFERENCES public.hardware_repairs(id) ON DELETE SET NULL,
  item_id uuid REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS part_requests_engineer_idx ON public.part_requests(engineer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.chatbot_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text NOT NULL,
  message_id text NOT NULL,
  feedback text NOT NULL CHECK (feedback IN ('positive', 'negative', 'up', 'down')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- AuthContext queries profiles for Supabase Auth users. That context currently
-- has no call sites in the app; this is the minimal conventional own-row schema.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- CustomerDetail and two Edge Function queries use the legacy "tickets" name.
-- Keep one source of truth by exposing support_tickets through a read-only view.
CREATE OR REPLACE VIEW public.tickets WITH (security_invoker = true) AS
  SELECT * FROM public.support_tickets;
REVOKE ALL ON public.tickets FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.tickets TO service_role;

CREATE OR REPLACE FUNCTION public.check_expiring_amcs()
RETURNS TABLE(customer_id uuid, plan_name text, email text, days_left integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, p.name, c.email, (a.end_date - CURRENT_DATE)::integer
  FROM public.amc_subscriptions AS a
  JOIN public.customers AS c ON c.id = a.customer_id
  JOIN public.amc_plans AS p ON p.id = a.plan_id
  WHERE a.status = 'active'
    AND a.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30;
$$;
REVOKE ALL ON FUNCTION public.check_expiring_amcs() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_expiring_amcs() TO service_role;

-- Current custom admin/employee sessions are held by the app, not represented
-- in Postgres JWT claims. Public inserts are limited to form/feedback intake.
ALTER TABLE public.login_audit_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.login_audit_logs FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.login_audit_logs TO service_role;

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can submit contact requests" ON public.contact_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);
REVOKE ALL ON public.contact_submissions FROM PUBLIC, anon, authenticated;
GRANT INSERT ON public.contact_submissions TO anon, authenticated;

ALTER TABLE public.customer_notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.customer_notifications FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.customer_notifications TO service_role;

ALTER TABLE public.part_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.part_requests FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.part_requests TO service_role;

ALTER TABLE public.chatbot_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can submit chatbot feedback" ON public.chatbot_feedback
  FOR INSERT TO anon, authenticated WITH CHECK (true);
GRANT INSERT ON public.chatbot_feedback TO anon, authenticated;

-- Engineer repair photos use public URLs and upload beneath repair-photos/.
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;
CREATE POLICY "Public repair photo uploads" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'uploads' AND name LIKE 'repair-photos/%');

