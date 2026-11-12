-- Extend the existing cookie-owned Support Inbox, not the separate legacy support_tickets workflow.
ALTER TABLE public.chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_owner_hash_key;
CREATE INDEX support_owner_latest ON public.chat_sessions(owner_hash,created_at DESC,id DESC) WHERE owner_hash IS NOT NULL;
ALTER TABLE public.chat_sessions
  ADD COLUMN ticket_number text UNIQUE,
  ADD COLUMN ticket_request uuid UNIQUE,
  ADD COLUMN ticket_category text CHECK(ticket_category IN ('software','hardware','network','maintenance','general')),
  ADD COLUMN ticket_priority text NOT NULL DEFAULT 'medium' CHECK(ticket_priority IN ('low','medium','high')),
  ADD COLUMN ticket_created_at timestamptz;
-- A non-cycling sequence is concurrency safe. Rollbacks may leave gaps. The counter never resets,
-- so year boundaries cannot reuse a number, and numbers longer than six digits are not truncated.
CREATE SEQUENCE public.support_ticket_number_seq NO CYCLE;
REVOKE ALL ON SEQUENCE public.support_ticket_number_seq FROM PUBLIC,anon,authenticated;
GRANT USAGE,SELECT ON SEQUENCE public.support_ticket_number_seq TO service_role;

CREATE FUNCTION public.support_next_ticket_number(p_at timestamptz DEFAULT clock_timestamp()) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE n text;
BEGIN
 n=nextval('support_ticket_number_seq')::text;
 RETURN 'VTS-'||to_char(p_at AT TIME ZONE 'Asia/Kolkata','YYYY')||'-'||lpad(n,GREATEST(6,length(n)),'0');
END $$;
REVOKE ALL ON FUNCTION public.support_next_ticket_number(timestamptz) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.support_next_ticket_number(timestamptz) TO service_role;

CREATE FUNCTION public.support_submit_ticket(p_id uuid,p_owner text,p_request uuid,p_category text,p_description text,p_name text,p_email text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE c public.chat_sessions%ROWTYPE; prior public.chat_sessions%ROWTYPE; n text; stamp timestamptz;
BEGIN
 IF p_owner IS NULL OR p_request IS NULL OR p_category IS NULL OR p_category NOT IN ('software','hardware','network','maintenance','general')
   OR COALESCE(length(btrim(p_description)),0) NOT BETWEEN 10 AND 2000
   OR COALESCE(length(btrim(p_name)),0) NOT BETWEEN 1 AND 100
   OR COALESCE(length(btrim(p_email)),0) NOT BETWEEN 3 AND 254
   OR btrim(p_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
   RAISE EXCEPTION 'Invalid ticket details' USING ERRCODE='22023';
 END IF;
 -- Serialize all submissions from this cookie, including concurrent retries/new requests.
 PERFORM pg_advisory_xact_lock(hashtextextended(p_owner,46001));
 SELECT * INTO c FROM chat_sessions WHERE id=p_id AND owner_hash=p_owner FOR UPDATE;
 IF c.id IS NULL THEN RAISE EXCEPTION 'Not found' USING ERRCODE='42501'; END IF;
 SELECT * INTO prior FROM chat_sessions WHERE ticket_request=p_request;
 IF prior.id IS NOT NULL THEN
   IF prior.owner_hash IS DISTINCT FROM p_owner OR prior.ticket_category IS DISTINCT FROM p_category
     OR prior.issue IS DISTINCT FROM btrim(p_description) OR prior.customer_name IS DISTINCT FROM btrim(p_name)
     OR prior.customer_email IS DISTINCT FROM lower(btrim(p_email)) THEN
     RAISE EXCEPTION 'Request conflict' USING ERRCODE='23505';
   END IF;
   RETURN jsonb_build_object('id',prior.id,'ticket_number',prior.ticket_number,'status',prior.status,'category',prior.ticket_category,'created_at',prior.ticket_created_at);
 END IF;
 -- Keep older requests accessible to the same cookie. Never overwrite a submitted/live request.
 IF c.ticket_number IS NOT NULL OR c.status<>'ai' THEN
   INSERT INTO chat_sessions(session_token,owner_hash,created_at) VALUES(gen_random_uuid(),p_owner,clock_timestamp()) RETURNING * INTO c;
 END IF;
 stamp=clock_timestamp();
 n=support_next_ticket_number(stamp);
 UPDATE chat_sessions SET ticket_number=n,ticket_request=p_request,ticket_category=p_category,ticket_created_at=stamp,
   customer_name=btrim(p_name),customer_email=lower(btrim(p_email)),issue=btrim(p_description),status='pending',
   assigned_to=NULL,ai_request=NULL,ai_started_at=NULL,notification_status='none',updated_at=stamp WHERE id=c.id;
 INSERT INTO support_messages(id,conversation_id,sender,body) VALUES
   (gen_random_uuid(),c.id,'user',btrim(p_description)),
   (gen_random_uuid(),c.id,'system','Support request submitted. Waiting for review; no agent connection or response time is promised.');
 RETURN jsonb_build_object('id',c.id,'ticket_number',n,'status','pending','category',p_category,'created_at',stamp);
END $$;
REVOKE ALL ON FUNCTION public.support_submit_ticket(uuid,text,uuid,text,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.support_submit_ticket(uuid,text,uuid,text,text,text,text) TO service_role;

-- Append fields so existing view column ordering and grants remain intact.
CREATE OR REPLACE VIEW public.support_inbox AS
SELECT c.id,c.status,c.customer_name,c.issue,c.assigned_to,c.updated_at,c.notification_status,
 EXISTS(SELECT 1 FROM public.support_messages m WHERE m.conversation_id=c.id AND m.sender='user' AND m.seq>c.agent_seen) AS unread,
 c.ticket_number,c.ticket_category,c.ticket_priority,c.ticket_created_at,c.customer_email,c.created_at
FROM public.chat_sessions c WHERE c.owner_hash IS NOT NULL AND c.status IN ('pending','active','resolved');
REVOKE ALL ON public.support_inbox FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.support_inbox TO service_role;
