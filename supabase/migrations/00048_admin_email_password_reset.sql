ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS auth_version uuid;

CREATE OR REPLACE FUNCTION public.rotate_admin_auth_version_on_password_change()
RETURNS trigger
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  IF NEW.password_hash IS DISTINCT FROM OLD.password_hash THEN
    NEW.auth_version = gen_random_uuid();
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER rotate_admin_auth_version_on_password_change
  BEFORE UPDATE OF password_hash ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.rotate_admin_auth_version_on_password_change();
REVOKE ALL ON FUNCTION public.rotate_admin_auth_version_on_password_change() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rotate_admin_auth_version_on_password_change() TO service_role;

CREATE TABLE public.admin_password_reset_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash text NOT NULL CHECK (email_hash ~ '^[a-f0-9]{64}$'),
  ip_hash text CHECK (ip_hash IS NULL OR ip_hash ~ '^[a-f0-9]{64}$'),
  admin_id uuid REFERENCES public.admin_users(id) ON DELETE CASCADE,
  code_hash text CHECK (code_hash IS NULL OR code_hash ~ '^[a-f0-9]{64}$'),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  verified_at timestamptz,
  consumed_at timestamptz
);
CREATE INDEX admin_password_reset_email_created_idx
  ON public.admin_password_reset_requests(email_hash, created_at DESC);
CREATE INDEX admin_password_reset_ip_created_idx
  ON public.admin_password_reset_requests(ip_hash, created_at DESC)
  WHERE ip_hash IS NOT NULL;
ALTER TABLE public.admin_password_reset_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_password_reset_requests FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.admin_password_reset_requests TO service_role;

CREATE FUNCTION public.issue_admin_password_reset(
  p_email_hash text,
  p_ip_hash text,
  p_admin_id uuid,
  p_code_hash text
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_admin_id uuid;
  v_allowed boolean;
BEGIN
  IF p_email_hash IS NULL OR p_email_hash !~ '^[a-f0-9]{64}$'
    OR (p_ip_hash IS NOT NULL AND p_ip_hash !~ '^[a-f0-9]{64}$')
    OR (p_code_hash IS NOT NULL AND p_code_hash !~ '^[a-f0-9]{64}$') THEN
    RAISE EXCEPTION 'Invalid password reset request';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('admin-reset-email:' || p_email_hash, 48128));
  IF p_ip_hash IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(hashtextextended('admin-reset-ip:' || p_ip_hash, 48128));
  END IF;

  DELETE FROM public.admin_password_reset_requests
  WHERE created_at < now() - interval '1 day';

  SELECT id INTO v_admin_id FROM public.admin_users
  WHERE id = p_admin_id AND is_active IS TRUE;

  SELECT count(*) < 3 INTO v_allowed
  FROM public.admin_password_reset_requests
  WHERE email_hash = p_email_hash AND created_at > now() - interval '15 minutes';
  IF p_ip_hash IS NOT NULL THEN
    v_allowed := v_allowed AND (
      SELECT count(*) < 10
      FROM public.admin_password_reset_requests
      WHERE ip_hash = p_ip_hash AND created_at > now() - interval '15 minutes'
    );
  END IF;

  IF NOT v_allowed THEN RETURN false; END IF;

  UPDATE public.admin_password_reset_requests
  SET consumed_at = now()
  WHERE email_hash = p_email_hash AND consumed_at IS NULL;

  INSERT INTO public.admin_password_reset_requests(
    email_hash, ip_hash, admin_id, code_hash, expires_at
  ) VALUES (
    p_email_hash, p_ip_hash, v_admin_id,
    CASE WHEN v_admin_id IS NULL THEN NULL ELSE p_code_hash END,
    CASE WHEN v_admin_id IS NULL THEN NULL ELSE now() + interval '10 minutes' END
  );
  RETURN true;
END;
$$;

CREATE FUNCTION public.verify_admin_password_reset(
  p_email_hash text,
  p_code_hash text
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_request public.admin_password_reset_requests%ROWTYPE;
BEGIN
  IF p_email_hash IS NULL OR p_code_hash IS NULL
    OR p_email_hash !~ '^[a-f0-9]{64}$' OR p_code_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Invalid password reset request';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('admin-reset-email:' || p_email_hash, 48128));
  SELECT * INTO v_request
  FROM public.admin_password_reset_requests
  WHERE email_hash = p_email_hash AND consumed_at IS NULL
  ORDER BY created_at DESC, id DESC
  LIMIT 1 FOR UPDATE;

  IF v_request.id IS NULL OR v_request.code_hash IS NULL THEN RETURN false; END IF;
  IF v_request.expires_at <= now() OR v_request.attempts >= 5 THEN
    UPDATE public.admin_password_reset_requests SET consumed_at = now() WHERE id = v_request.id;
    RETURN false;
  END IF;

  UPDATE public.admin_password_reset_requests
  SET attempts = attempts + 1,
      verified_at = CASE WHEN code_hash = p_code_hash THEN now() ELSE verified_at END,
      consumed_at = CASE WHEN code_hash <> p_code_hash AND attempts + 1 >= 5 THEN now() ELSE consumed_at END
  WHERE id = v_request.id;
  RETURN v_request.code_hash = p_code_hash;
END;
$$;

CREATE FUNCTION public.complete_admin_password_reset(
  p_email_hash text,
  p_code_hash text,
  p_password_hash text
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_request public.admin_password_reset_requests%ROWTYPE;
  v_admin public.admin_users%ROWTYPE;
BEGIN
  IF p_email_hash IS NULL OR p_code_hash IS NULL OR p_password_hash IS NULL
    OR p_email_hash !~ '^[a-f0-9]{64}$'
    OR p_code_hash !~ '^[a-f0-9]{64}$'
    OR p_password_hash !~ '^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$' THEN
    RAISE EXCEPTION 'Invalid password reset request';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('admin-reset-email:' || p_email_hash, 48128));
  SELECT * INTO v_request
  FROM public.admin_password_reset_requests
  WHERE email_hash = p_email_hash AND consumed_at IS NULL
  ORDER BY created_at DESC, id DESC
  LIMIT 1 FOR UPDATE;

  IF v_request.id IS NULL OR v_request.code_hash IS DISTINCT FROM p_code_hash
    OR v_request.expires_at <= now()
    OR v_request.verified_at IS NULL
    OR v_request.verified_at < now() - interval '5 minutes'
    OR v_request.attempts > 5 THEN
    RETURN false;
  END IF;

  SELECT * INTO v_admin FROM public.admin_users
  WHERE id = v_request.admin_id AND is_active IS TRUE FOR UPDATE;
  IF v_admin.id IS NULL THEN
    UPDATE public.admin_password_reset_requests SET consumed_at = now() WHERE email_hash = p_email_hash AND consumed_at IS NULL;
    RETURN false;
  END IF;

  UPDATE public.admin_users
  SET password_hash = p_password_hash, reset_code = NULL,
      reset_code_expires = NULL, updated_at = now()
  WHERE id = v_admin.id;
  UPDATE public.admin_password_reset_requests
  SET consumed_at = now()
  WHERE email_hash = p_email_hash AND consumed_at IS NULL;
  INSERT INTO public.activity_logs(
    user_id, user_name, user_role, action, target_id, target_type, details
  ) VALUES (
    v_admin.id, v_admin.email, v_admin.role, 'ADMIN_PASSWORD_RESET',
    v_admin.id::text, 'ADMIN_USER', jsonb_build_object('method', 'email_otp')
  );
  RETURN true;
END;
$$;

CREATE FUNCTION public.invalidate_admin_password_reset(p_email_hash text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF p_email_hash IS NULL OR p_email_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Invalid password reset request';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('admin-reset-email:' || p_email_hash, 48128));
  UPDATE public.admin_password_reset_requests
  SET consumed_at = now()
  WHERE email_hash = p_email_hash AND consumed_at IS NULL;
END;
$$;

REVOKE ALL ON FUNCTION
  public.issue_admin_password_reset(text, text, uuid, text),
  public.verify_admin_password_reset(text, text),
  public.complete_admin_password_reset(text, text, text),
  public.invalidate_admin_password_reset(text)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION
  public.issue_admin_password_reset(text, text, uuid, text),
  public.verify_admin_password_reset(text, text),
  public.complete_admin_password_reset(text, text, text),
  public.invalidate_admin_password_reset(text)
TO service_role;
