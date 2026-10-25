-- Run ONLY against a disposable Supabase database with migrations 00001-00042.
-- psql -v ON_ERROR_STOP=1 <isolated-db-connection> -f tests/inquiry-db.sql
-- This test creates a temporary failure trigger, then rolls back every change.
\set ON_ERROR_STOP on
BEGIN;
CREATE FUNCTION pg_temp.fail_inquiry_lead() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.name = '__inquiry_rollback_test__' THEN RAISE EXCEPTION 'test lead failure'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER inquiry_test_failure BEFORE INSERT ON public.leads
FOR EACH ROW EXECUTE FUNCTION pg_temp.fail_inquiry_lead();
SET LOCAL ROLE service_role;
DO $$
DECLARE req uuid := gen_random_uuid(); mail text := gen_random_uuid() || '@example.invalid';
 failed_req uuid := gen_random_uuid();
 rate_mail text := gen_random_uuid() || '@example.invalid';
 rate_req uuid := gen_random_uuid();
 i integer;
BEGIN
 PERFORM public.submit_website_inquiry(req,'Test',mail,'','IT','first');
 PERFORM public.submit_website_inquiry(req,'Test',mail,'','IT','first');
 IF (SELECT count(*) FROM public.contact_submissions WHERE request_id=req) <> 1 OR
    (SELECT count(*) FROM public.leads WHERE email=mail) <> 1 THEN RAISE EXCEPTION 'retry duplicated rows'; END IF;
 UPDATE public.leads SET lead_status='Won', notes='existing notes' WHERE email=mail;
 PERFORM public.submit_website_inquiry(gen_random_uuid(),'Different name',mail,'','IT','second');
 IF NOT EXISTS(SELECT 1 FROM public.leads WHERE email=mail AND name='Test' AND lead_status='Won'
     AND notes LIKE 'existing notes%' AND notes LIKE '%second%') THEN RAISE EXCEPTION 'existing lead was lost or inquiry missing'; END IF;
 BEGIN
   PERFORM public.submit_website_inquiry(failed_req,'__inquiry_rollback_test__',gen_random_uuid() || '@example.invalid','','','failure');
   RAISE EXCEPTION 'expected lead failure was not raised';
 EXCEPTION WHEN raise_exception THEN
   IF SQLERRM <> 'test lead failure' THEN RAISE; END IF;
 END;
 IF EXISTS(SELECT 1 FROM public.contact_submissions WHERE request_id=failed_req) THEN RAISE EXCEPTION 'partial inbox write survived'; END IF;
 FOR i IN 1..10 LOOP
  PERFORM public.submit_website_inquiry(CASE WHEN i=1 THEN rate_req ELSE gen_random_uuid() END,'Limit test',rate_mail,'','','message');
 END LOOP;
 -- Retrying an accepted request must succeed even after the quota is reached.
 PERFORM public.submit_website_inquiry(rate_req,'Limit test',rate_mail,'','','message');
 BEGIN
  PERFORM public.submit_website_inquiry(gen_random_uuid(),'Limit test',rate_mail,'','','message');
  RAISE EXCEPTION 'expected rate limit';
 EXCEPTION WHEN SQLSTATE 'P0429' THEN NULL;
 END;
 IF (SELECT count(*) FROM public.contact_submissions WHERE email=rate_mail) <> 10 THEN RAISE EXCEPTION 'rate limit leaked inbox insert'; END IF;
END $$;
RESET ROLE;
DO $$
DECLARE r text;
BEGIN
 FOREACH r IN ARRAY ARRAY['anon','authenticated'] LOOP
   IF has_function_privilege(r,'public.submit_website_inquiry(uuid,text,text,text,text,text)','EXECUTE') OR
      has_function_privilege(r,'public.check_expiring_amcs()','EXECUTE') OR
      has_table_privilege(r,'public.contact_submissions','INSERT') OR
      has_table_privilege(r,'public.contact_submissions','SELECT') THEN RAISE EXCEPTION 'unexpected public privilege for %',r; END IF;
 END LOOP;
 IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid='public.contact_submissions'::regclass) OR
    NOT (SELECT relrowsecurity FROM pg_class WHERE oid='public.leads'::regclass) THEN RAISE EXCEPTION 'RLS disabled'; END IF;
END $$;
ROLLBACK;
