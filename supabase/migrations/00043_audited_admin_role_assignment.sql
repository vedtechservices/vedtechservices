-- Server-only assignment: actor comes from the verified application session.
CREATE OR REPLACE FUNCTION public.assign_admin_role(p_actor_id uuid, p_target_id uuid, p_changes jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  actor public.admin_users%ROWTYPE;
  target public.admin_users%ROWTYPE;
BEGIN
  -- Serialize role assignments, including concurrent demotions of the actor.
  PERFORM pg_advisory_xact_lock(43001);
  SELECT * INTO actor FROM public.admin_users WHERE id = p_actor_id FOR UPDATE;
  IF actor.id IS NULL OR actor.is_active IS DISTINCT FROM true OR actor.role IS DISTINCT FROM 'super_admin' OR p_actor_id = p_target_id THEN
    RAISE EXCEPTION 'An active Super Admin must assign roles to another administrator';
  END IF;
  IF jsonb_typeof(p_changes) IS DISTINCT FROM 'object'
    OR NOT (p_changes ? 'role')
    OR p_changes->>'role' IS NULL
    OR p_changes->>'role' NOT IN ('admin', 'super_admin', 'full_access_admin', 'support_admin', 'billing_admin')
    OR EXISTS (SELECT 1 FROM jsonb_object_keys(p_changes) AS k(key)
      WHERE key NOT IN ('role', 'full_name', 'email', 'password_hash', 'is_active', 'updated_at')) THEN
    RAISE EXCEPTION 'Invalid administrator role update';
  END IF;
  SELECT * INTO target FROM public.admin_users WHERE id = p_target_id FOR UPDATE;
  IF target.id IS NULL THEN RAISE EXCEPTION 'Administrator not found'; END IF;
  UPDATE public.admin_users SET
    role = p_changes->>'role',
    full_name = CASE WHEN p_changes ? 'full_name' THEN p_changes->>'full_name' ELSE full_name END,
    email = CASE WHEN p_changes ? 'email' THEN p_changes->>'email' ELSE email END,
    password_hash = CASE WHEN p_changes ? 'password_hash' THEN p_changes->>'password_hash' ELSE password_hash END,
    is_active = CASE WHEN p_changes ? 'is_active' THEN (p_changes->>'is_active')::boolean ELSE is_active END,
    updated_at = now()
  WHERE id = p_target_id;
  INSERT INTO public.activity_logs(user_id, user_name, user_role, action, target_id, target_type, details)
  VALUES (actor.id, actor.email, actor.role, 'ASSIGN_ADMIN_ROLE', target.id::text, 'ADMIN_USER',
    jsonb_build_object('old_role', target.role, 'new_role', p_changes->>'role'));
END;
$$;
REVOKE ALL ON FUNCTION public.assign_admin_role(uuid, uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assign_admin_role(uuid, uuid, jsonb) TO service_role;
