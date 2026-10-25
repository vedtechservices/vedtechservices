-- Application-cookie ownership is enforced in server routes; no public table/RPC access.
ALTER TABLE public.chat_sessions ADD COLUMN owner_hash text UNIQUE;
ALTER TABLE public.chat_sessions ADD COLUMN status text NOT NULL DEFAULT 'ai' CHECK (status IN ('ai','pending','active','resolved'));
ALTER TABLE public.chat_sessions ADD COLUMN customer_name text;
ALTER TABLE public.chat_sessions ADD COLUMN customer_email text;
ALTER TABLE public.chat_sessions ADD COLUMN issue text;
ALTER TABLE public.chat_sessions ADD COLUMN assigned_to uuid REFERENCES public.admin_users(id);
ALTER TABLE public.chat_sessions ADD COLUMN ai_request uuid;
ALTER TABLE public.chat_sessions ADD COLUMN ai_started_at timestamptz;
ALTER TABLE public.chat_sessions ADD COLUMN visitor_seen bigint NOT NULL DEFAULT 0;
ALTER TABLE public.chat_sessions ADD COLUMN agent_seen bigint NOT NULL DEFAULT 0;
ALTER TABLE public.chat_sessions ADD COLUMN notification_status text NOT NULL DEFAULT 'none';
ALTER TABLE public.chat_sessions ADD COLUMN notification_started_at timestamptz;
ALTER TABLE public.chat_sessions ADD COLUMN notification_attempt_at timestamptz;
ALTER TABLE public.chat_sessions ADD COLUMN notification_claim uuid;
ALTER TABLE public.chat_sessions ADD COLUMN notification_payload jsonb;
CREATE TABLE public.support_messages (
  seq bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id uuid NOT NULL UNIQUE,
  conversation_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK(sender IN ('user','ai','agent','system')),
  agent_id uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
  body text NOT NULL CHECK(length(body) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX support_messages_conversation_seq ON public.support_messages(conversation_id,seq);
CREATE INDEX support_inbox_updated ON public.chat_sessions(updated_at DESC) WHERE owner_hash IS NOT NULL;
CREATE VIEW public.support_inbox AS
SELECT c.id,c.status,c.customer_name,c.issue,c.assigned_to,c.updated_at,c.notification_status,
  EXISTS(SELECT 1 FROM public.support_messages m WHERE m.conversation_id=c.id AND m.sender='user' AND m.seq>c.agent_seen) AS unread
FROM public.chat_sessions c WHERE c.owner_hash IS NOT NULL AND c.status IN ('pending','active','resolved');
REVOKE ALL ON public.support_inbox FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.support_inbox TO service_role;
CREATE TABLE public.support_presence (admin_id uuid PRIMARY KEY REFERENCES public.admin_users(id) ON DELETE CASCADE, seen_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.support_rate_limits (key text PRIMARY KEY, window_start timestamptz NOT NULL DEFAULT now(), hits int NOT NULL DEFAULT 1);
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.chat_sessions, public.support_messages, public.support_presence, public.support_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.chat_sessions, public.support_messages, public.support_presence, public.support_rate_limits TO service_role;
REVOKE ALL ON SEQUENCE public.support_messages_seq_seq FROM PUBLIC, anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.support_messages_seq_seq TO service_role;

CREATE FUNCTION public.support_rate(p_key text, p_limit int) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE n int;
BEGIN
  INSERT INTO support_rate_limits AS r(key) VALUES(p_key)
  ON CONFLICT(key) DO UPDATE SET
    hits=CASE WHEN r.window_start < now()-interval '1 minute' THEN 1 ELSE r.hits+1 END,
    window_start=CASE WHEN r.window_start < now()-interval '1 minute' THEN now() ELSE r.window_start END
  RETURNING hits INTO n;
  RETURN n<=p_limit;
END $$;

-- Mutations serialize on the conversation row. AI completion is a conditional commit.
CREATE FUNCTION public.support_mutate(p_id uuid, p_owner text, p_actor uuid, p_action text, p_request uuid, p_body text DEFAULT '', p_contact jsonb DEFAULT '{}')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE c public.chat_sessions%ROWTYPE; a public.admin_users%ROWTYPE; who text; existing public.support_messages%ROWTYPE;
BEGIN
  IF p_actor IS NOT NULL THEN
    SELECT * INTO a FROM admin_users WHERE id=p_actor FOR SHARE;
    IF a.id IS NULL OR a.is_active IS DISTINCT FROM true OR a.role NOT IN ('super_admin','support_admin') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
  END IF;
  SELECT * INTO c FROM chat_sessions WHERE id=p_id AND owner_hash IS NOT NULL FOR UPDATE;
  IF c.id IS NULL OR (p_actor IS NULL AND c.owner_hash IS DISTINCT FROM p_owner) THEN RAISE EXCEPTION 'Not found' USING ERRCODE='42501'; END IF;
  IF p_actor IS NULL AND p_action NOT IN ('message','handoff','seen','ai_finish') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
  IF p_action='seen' THEN
    IF p_body !~ '^[0-9]{1,16}$' THEN RAISE EXCEPTION 'Invalid seen cursor'; END IF;
    UPDATE chat_sessions SET visitor_seen=CASE WHEN p_actor IS NULL THEN GREATEST(visitor_seen,LEAST(p_body::bigint,COALESCE((SELECT max(seq) FROM support_messages WHERE conversation_id=p_id),0))) ELSE visitor_seen END,
      agent_seen=CASE WHEN p_actor IS NOT NULL THEN GREATEST(agent_seen,LEAST(p_body::bigint,COALESCE((SELECT max(seq) FROM support_messages WHERE conversation_id=p_id),0))) ELSE agent_seen END WHERE id=p_id;
  ELSIF p_action='message' THEN
    IF length(btrim(p_body)) NOT BETWEEN 1 AND 4000 OR p_request IS NULL THEN RAISE EXCEPTION 'Invalid message'; END IF;
    SELECT * INTO existing FROM support_messages WHERE id=p_request;
    IF existing.id IS NOT NULL THEN
      IF existing.conversation_id<>p_id OR existing.body<>btrim(p_body) OR existing.agent_id IS DISTINCT FROM p_actor OR existing.sender<>(CASE WHEN p_actor IS NULL THEN 'user' ELSE 'agent' END) THEN RAISE EXCEPTION 'Request conflict'; END IF;
      IF c.status='ai' AND c.ai_request=p_request AND c.ai_started_at<now()-interval '45 seconds' THEN
        UPDATE chat_sessions SET ai_started_at=now() WHERE id=p_id;
        RETURN jsonb_build_object('generate',true,'duplicate',true);
      END IF;
      RETURN jsonb_build_object('duplicate',true);
    END IF;
    IF c.status='resolved' THEN RAISE EXCEPTION 'Conversation resolved; reopen first'; END IF;
    IF p_actor IS NOT NULL AND (c.status<>'active' OR c.assigned_to IS DISTINCT FROM p_actor) THEN RAISE EXCEPTION 'Accept this conversation first'; END IF;
    IF p_actor IS NULL AND c.status='ai' AND c.ai_request IS NOT NULL AND c.ai_started_at>now()-interval '45 seconds' THEN RAISE EXCEPTION 'AI response pending'; END IF;
    IF (SELECT count(*) FROM support_messages WHERE conversation_id=p_id)>=2000 THEN RAISE EXCEPTION 'Conversation limit reached'; END IF;
    who=CASE WHEN p_actor IS NULL THEN 'user' ELSE 'agent' END;
    INSERT INTO support_messages(id,conversation_id,sender,body,agent_id) VALUES(p_request,p_id,who,btrim(p_body),p_actor);
    IF p_actor IS NOT NULL THEN
      INSERT INTO activity_logs(user_id,user_name,user_role,action,target_id,target_type,details)
      VALUES(a.id,a.email,a.role,'SUPPORT_MESSAGE',p_id::text,'CHAT_SESSION',jsonb_build_object('message_id',p_request));
    END IF;
    UPDATE chat_sessions SET updated_at=now(), ai_request=CASE WHEN status='ai' THEN p_request ELSE NULL END,
      ai_started_at=CASE WHEN status='ai' THEN now() ELSE NULL END WHERE id=p_id;
    RETURN jsonb_build_object('generate',c.status='ai' AND p_actor IS NULL);
  ELSIF p_action='ai_finish' THEN
    IF c.status='ai' AND c.ai_request=p_request THEN
      INSERT INTO support_messages(id,conversation_id,sender,body) VALUES(gen_random_uuid(),p_id,'ai',left(p_body,4000));
      UPDATE chat_sessions SET ai_request=NULL, ai_started_at=NULL, updated_at=now() WHERE id=p_id;
    END IF;
  ELSIF p_action='handoff' THEN
    IF c.status IN ('pending','active') THEN RETURN '{}'::jsonb; END IF;
    IF COALESCE(length(btrim(p_contact->>'name')),0) NOT BETWEEN 1 AND 100 OR length(p_contact->>'email')>254
      OR COALESCE(p_contact->>'email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      OR length(btrim(p_body)) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Name, email and issue required'; END IF;
    UPDATE chat_sessions SET status='pending', assigned_to=NULL, ai_request=NULL, customer_name=btrim(p_contact->>'name'),
      customer_email=lower(btrim(p_contact->>'email')), issue=btrim(p_body), updated_at=now(),
      notification_status=CASE WHEN notification_status='none' THEN 'pending' ELSE notification_status END WHERE id=p_id;
    INSERT INTO support_messages(id,conversation_id,sender,body) VALUES(gen_random_uuid(),p_id,'system','Human support requested. Waiting for an agent; response time is not guaranteed.');
  ELSIF p_action='accept' THEN
    IF c.status NOT IN ('pending','active') OR (c.assigned_to IS NOT NULL AND c.assigned_to<>p_actor) THEN RAISE EXCEPTION 'Already assigned or unavailable'; END IF;
    UPDATE chat_sessions SET status='active', assigned_to=p_actor, ai_request=NULL, updated_at=now() WHERE id=p_id;
  ELSIF p_action IN ('resolve','reopen','release') THEN
    IF c.assigned_to IS NOT NULL AND c.assigned_to<>p_actor AND a.role<>'super_admin' THEN RAISE EXCEPTION 'Assigned to another agent'; END IF;
    IF p_action='reopen' AND c.status<>'resolved' THEN RAISE EXCEPTION 'Only resolved conversations can reopen'; END IF;
    IF p_action='release' AND c.status<>'active' THEN RAISE EXCEPTION 'Only active conversations can be released'; END IF;
    UPDATE chat_sessions SET status=CASE WHEN p_action='resolve' THEN 'resolved' ELSE 'pending' END, assigned_to=NULL, ai_request=NULL, updated_at=now() WHERE id=p_id;
  ELSE RAISE EXCEPTION 'Unsupported operation'; END IF;
  IF p_actor IS NOT NULL AND p_action NOT IN ('seen','message') THEN
    INSERT INTO activity_logs(user_id,user_name,user_role,action,target_id,target_type)
    VALUES(a.id,a.email,a.role,'SUPPORT_'||upper(p_action),p_id::text,'CHAT_SESSION');
  END IF;
  RETURN '{}'::jsonb;
END $$;

CREATE FUNCTION public.support_notification(p_id uuid, p_claim uuid, p_result text DEFAULT NULL, p_payload jsonb DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE c public.chat_sessions%ROWTYPE;
BEGIN
 SELECT * INTO c FROM chat_sessions WHERE id=p_id AND owner_hash IS NOT NULL FOR UPDATE;
 IF p_result IS NOT NULL THEN
   IF c.notification_claim=p_claim AND p_result IN ('sent','failed','unknown') THEN
     UPDATE chat_sessions SET notification_status=p_result WHERE id=p_id;
   END IF;
   RETURN '{}'::jsonb;
 END IF;
 IF c.notification_status NOT IN ('pending','failed','sending') OR (c.notification_status='sending' AND c.notification_attempt_at>now()-interval '1 minute') THEN RETURN NULL; END IF;
 IF c.notification_started_at<now()-interval '23 hours' THEN
   UPDATE chat_sessions SET notification_status='unknown' WHERE id=p_id; RETURN NULL;
 END IF;
 UPDATE chat_sessions SET notification_status='sending', notification_claim=p_claim, notification_attempt_at=now(),
   notification_started_at=COALESCE(notification_started_at,now()), notification_payload=COALESCE(notification_payload,p_payload)
 WHERE id=p_id RETURNING * INTO c;
 RETURN c.notification_payload;
END $$;

REVOKE ALL ON FUNCTION public.support_rate(text,int), public.support_mutate(uuid,text,uuid,text,uuid,text,jsonb), public.support_notification(uuid,uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.support_rate(text,int), public.support_mutate(uuid,text,uuid,text,uuid,text,jsonb), public.support_notification(uuid,uuid,text,jsonb) TO service_role;
