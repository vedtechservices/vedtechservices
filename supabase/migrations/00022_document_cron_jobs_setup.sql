-- Documentation for Automated Cron Jobs Setup
-- 
-- This migration documents the required cron jobs for VedTech Services CRM.
-- These jobs must be configured manually in the Supabase dashboard or via SQL Editor.
--
-- IMPORTANT: pg_cron extension must be enabled by Supabase support team.
-- Contact Supabase support to enable pg_cron for your project.
--
-- Once pg_cron is enabled, run the following SQL commands in the Supabase SQL Editor:
--
-- 1. Daily Engagement Score Calculation (2 AM UTC):
-- 
-- SELECT cron.schedule(
--   'calculate-engagement-scores-daily',
--   '0 2 * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/calculate-engagement-scores',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
--   );
--   $$
-- );
--
-- 2. Hourly Scheduled Report Check:
--
-- SELECT cron.schedule(
--   'generate-scheduled-reports-hourly',
--   '0 * * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-scheduled-reports',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
--   );
--   $$
-- );
--
-- Replace YOUR_PROJECT_REF with your actual Supabase project reference.
-- Replace YOUR_ANON_KEY with your actual Supabase anon key.
--
-- To view scheduled jobs:
-- SELECT * FROM cron.job;
--
-- To unschedule a job:
-- SELECT cron.unschedule('job-name');

-- Create a table to track cron job execution logs (optional)
CREATE TABLE IF NOT EXISTS cron_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE cron_execution_logs IS 'Logs for automated cron job executions';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cron_logs_job_name ON cron_execution_logs(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_logs_executed_at ON cron_execution_logs(executed_at DESC);