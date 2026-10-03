-- Normalize privileges after the legacy feature migrations. Custom browser
-- auth/localStorage does not authorize access to sensitive database records.
DO $$
DECLARE relation record;
BEGIN
  FOR relation IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', relation.schemaname, relation.tablename);
    EXECUTE format('REVOKE ALL ON TABLE %I.%I FROM PUBLIC, anon, authenticated', relation.schemaname, relation.tablename);
  END LOOP;
END $$;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- The employee repair screen scopes work using this explicit assignment key.
ALTER TABLE public.hardware_repairs
  ADD COLUMN IF NOT EXISTS assigned_engineer_id uuid REFERENCES public.engineers(id) ON DELETE SET NULL;

-- Repair photos are uploaded through the authenticated Next.js API.
DROP POLICY IF EXISTS "Public repair photo uploads" ON storage.objects;

-- PostgreSQL functions default to EXECUTE for PUBLIC. Remove that implicit
-- API surface, then explicitly retain only the documented public operations.
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT EXECUTE ON FUNCTION public.get_customer_escalation(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.generate_ticket_id() TO anon, authenticated, service_role;

-- Only explicitly intended, non-sensitive public reads/writes are re-granted.
GRANT SELECT ON public.amc_plans, public.exchange_rates, public.offices,
  public.knowledge_base_articles TO anon, authenticated;
GRANT INSERT ON public.support_tickets, public.contact_submissions,
  public.chatbot_feedback, public.chatbot_ratings, public.chatbot_escalations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Public requests may be submitted, but customer/ticket records and contact
-- submissions cannot be read or changed through the anonymous API.
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Anyone can create support tickets" ON public.support_tickets;
CREATE POLICY "Public can submit support tickets" ON public.support_tickets
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public can submit contact requests" ON public.contact_submissions;
CREATE POLICY "Public can submit contact requests" ON public.contact_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public can submit chatbot feedback" ON public.chatbot_feedback;
CREATE POLICY "Public can submit chatbot feedback" ON public.chatbot_feedback
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anyone_can_read_own_rating" ON public.chatbot_ratings;
DROP POLICY IF EXISTS "anyone_can_insert_rating" ON public.chatbot_ratings;
CREATE POLICY "Public can submit chatbot ratings" ON public.chatbot_ratings
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon insert" ON public.chatbot_escalations;
CREATE POLICY "Public can submit chatbot escalations" ON public.chatbot_escalations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view AMC plans" ON public.amc_plans;
CREATE POLICY "Public can read AMC plans" ON public.amc_plans
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Enable read for all users" ON public.exchange_rates;
CREATE POLICY "Public can read exchange rates" ON public.exchange_rates
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_read_active_offices" ON public.offices;
CREATE POLICY "Public can read active offices" ON public.offices
  FOR SELECT TO anon, authenticated USING (status = 'active');
DROP POLICY IF EXISTS "Anyone can view published articles" ON public.knowledge_base_articles;
CREATE POLICY "Public can read published articles" ON public.knowledge_base_articles
  FOR SELECT TO anon, authenticated USING (is_published = true);

-- RPC returns only the escalation associated with an unguessable session token.
REVOKE ALL ON FUNCTION public.check_expiring_amcs() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_expiring_amcs() TO service_role;
REVOKE ALL ON FUNCTION public.get_customer_escalation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_customer_escalation(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.increment_article_metric(article_id uuid, metric_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF metric_name NOT IN ('suggested', 'read', 'resolved', 'escalated') THEN
    RAISE EXCEPTION 'Invalid metric';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.knowledge_base_articles WHERE id = article_id AND is_published) THEN
    RETURN;
  END IF;
  INSERT INTO public.article_suggestion_metrics (article_id, times_suggested, times_read, resolved_queries, escalations_after_suggestion)
  VALUES (article_id, 0, 0, 0, 0) ON CONFLICT (article_id) DO NOTHING;
  IF metric_name = 'suggested' THEN
    UPDATE public.article_suggestion_metrics SET times_suggested = times_suggested + 1, updated_at = now() WHERE article_suggestion_metrics.article_id = increment_article_metric.article_id;
  ELSIF metric_name = 'read' THEN
    UPDATE public.article_suggestion_metrics SET times_read = times_read + 1, updated_at = now() WHERE article_suggestion_metrics.article_id = increment_article_metric.article_id;
  ELSIF metric_name = 'resolved' THEN
    UPDATE public.article_suggestion_metrics SET resolved_queries = resolved_queries + 1, updated_at = now() WHERE article_suggestion_metrics.article_id = increment_article_metric.article_id;
  ELSE
    UPDATE public.article_suggestion_metrics SET escalations_after_suggestion = escalations_after_suggestion + 1, updated_at = now() WHERE article_suggestion_metrics.article_id = increment_article_metric.article_id;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.increment_article_metric(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_article_metric(uuid, text) TO anon, authenticated, service_role;
