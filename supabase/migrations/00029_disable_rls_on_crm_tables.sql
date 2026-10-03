-- Keep CRM records private. Browser localStorage/custom auth is not a database
-- authorization boundary; trusted server routes must perform CRM CRUD.
DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'leads', 'email_campaigns', 'customer_segments', 'call_logs', 'meetings',
    'tasks', 'customer_feedback', 'customer_interactions'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated', table_name);
  END LOOP;
END $$;
