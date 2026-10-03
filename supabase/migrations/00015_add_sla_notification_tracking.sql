ALTER TABLE chatbot_escalations 
ADD COLUMN IF NOT EXISTS sla_approaching_notified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS sla_breach_notified_at timestamp with time zone;

-- Also add a column for SLA notification preference to admin_profiles or similar if needed.
-- But for now, we'll assume it's enabled by default or stored in settings.
