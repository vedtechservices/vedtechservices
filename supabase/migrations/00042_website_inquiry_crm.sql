-- Apply after 00041. Preserve existing records and RLS; contact writes now use the server API.
BEGIN;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS request_id uuid;
CREATE UNIQUE INDEX IF NOT EXISTS contact_submissions_request_id_idx ON public.contact_submissions(request_id);
CREATE INDEX IF NOT EXISTS contact_submissions_email_created_at_idx
 ON public.contact_submissions(email, created_at);
CREATE OR REPLACE FUNCTION public.submit_website_inquiry(
 p_request_id uuid, p_name text, p_email text, p_phone text, p_service text, p_message text
) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE saved_id uuid;
BEGIN
 -- Serialize submissions for one email across server instances; retries remain idempotent.
 PERFORM pg_advisory_xact_lock(hashtextextended(lower(p_email), 0));
 INSERT INTO public.contact_submissions(request_id,name,email,phone,service,message)
 VALUES(p_request_id,p_name,p_email,nullif(p_phone,''),nullif(p_service,''),p_message)
 ON CONFLICT(request_id) DO NOTHING RETURNING id INTO saved_id;
 IF saved_id IS NOT NULL THEN
  IF (SELECT count(*) FROM public.contact_submissions
      WHERE email = p_email AND created_at > now() - interval '1 hour') > 10 THEN
   RAISE EXCEPTION 'Inquiry submission limit reached' USING ERRCODE = 'P0429';
  END IF;
  INSERT INTO public.leads(name,email,phone,lead_source,lead_status,notes)
  VALUES(p_name,p_email,nullif(p_phone,''),'Website Form','New',concat_ws(E'\n',nullif(p_service,''),p_message,'Contact submission: ' || saved_id))
  ON CONFLICT (email) DO UPDATE SET
    notes = concat_ws(E'\n\n', public.leads.notes, EXCLUDED.notes), updated_at = now();
 END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_website_inquiry(uuid,text,text,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.submit_website_inquiry(uuid,text,text,text,text,text) TO service_role;
-- Prevent direct anonymous inserts from bypassing validation or forging retry IDs/status.
REVOKE INSERT ON public.contact_submissions FROM PUBLIC, anon, authenticated;
COMMIT;
