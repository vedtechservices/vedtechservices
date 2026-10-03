CREATE TABLE IF NOT EXISTS public.crm_audit_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name    text NOT NULL,
  record_id     text,
  action        text NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
  admin_id      text,
  admin_email   text,
  admin_role    text,
  old_data      jsonb,
  new_data      jsonb,
  changes       jsonb,
  ip_address    text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_audit_table    ON public.crm_audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_crm_audit_action   ON public.crm_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_crm_audit_created  ON public.crm_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_audit_admin    ON public.crm_audit_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_crm_audit_record   ON public.crm_audit_logs(record_id);

ALTER TABLE public.crm_audit_logs DISABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_email_unique') THEN
    ALTER TABLE public.leads ADD CONSTRAINT leads_email_unique UNIQUE (email);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_deal_value_non_negative') THEN
    ALTER TABLE public.leads ADD CONSTRAINT leads_deal_value_non_negative
      CHECK (estimated_deal_value IS NULL OR estimated_deal_value >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_score_range') THEN
    ALTER TABLE public.leads ADD CONSTRAINT leads_score_range
      CHECK (lead_score IS NULL OR (lead_score >= 0 AND lead_score <= 100));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'call_logs_duration_non_negative') THEN
    ALTER TABLE public.call_logs ADD CONSTRAINT call_logs_duration_non_negative
      CHECK (call_duration IS NULL OR call_duration >= 0);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.log_crm_audit(
  p_table_name  text,
  p_record_id   text,
  p_action      text,
  p_admin_id    text,
  p_admin_email text,
  p_admin_role  text,
  p_old_data    jsonb DEFAULT NULL,
  p_new_data    jsonb DEFAULT NULL,
  p_ip_address  text DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_changes jsonb := '{}'::jsonb;
  v_key     text;
BEGIN
  IF p_action = 'UPDATE' AND p_old_data IS NOT NULL AND p_new_data IS NOT NULL THEN
    FOR v_key IN SELECT jsonb_object_keys(p_new_data) LOOP
      IF (p_old_data ->> v_key) IS DISTINCT FROM (p_new_data ->> v_key) THEN
        v_changes := v_changes || jsonb_build_object(v_key, jsonb_build_object(
          'from', p_old_data -> v_key,
          'to',   p_new_data -> v_key
        ));
      END IF;
    END LOOP;
  END IF;

  INSERT INTO public.crm_audit_logs
    (table_name, record_id, action, admin_id, admin_email, admin_role,
     old_data, new_data, changes, ip_address)
  VALUES
    (p_table_name, p_record_id, p_action, p_admin_id, p_admin_email, p_admin_role,
     p_old_data, p_new_data, NULLIF(v_changes, '{}'::jsonb), p_ip_address);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;