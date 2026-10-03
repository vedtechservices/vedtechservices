-- Add CRM columns to existing customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS customer_type text DEFAULT 'Individual',
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS registration_date timestamptz DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS profile_photo text,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS lifetime_value numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS health_score text DEFAULT 'Green';

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  company_name text,
  lead_source text DEFAULT 'Website Form',
  lead_status text DEFAULT 'New',
  assigned_sales_rep uuid,
  estimated_deal_value numeric DEFAULT 0,
  lead_score numeric DEFAULT 0,
  tags text[],
  notes text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Create email_campaigns table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name text NOT NULL,
  campaign_type text DEFAULT 'Newsletter',
  subject_line text NOT NULL,
  sender_name text DEFAULT 'VedTech Services',
  sender_email text DEFAULT 'info@vedtechservices.in ',
  email_content text NOT NULL,
  recipient_selection jsonb,
  status text DEFAULT 'Draft',
  scheduled_at timestamptz,
  sent_at timestamptz,
  recipients_count integer DEFAULT 0,
  open_rate numeric DEFAULT 0,
  click_rate numeric DEFAULT 0,
  bounce_rate numeric DEFAULT 0,
  unsubscribe_rate numeric DEFAULT 0,
  created_by uuid,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Create customer_segments table
CREATE TABLE IF NOT EXISTS public.customer_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_name text NOT NULL,
  segment_criteria jsonb NOT NULL,
  customer_count integer DEFAULT 0,
  is_predefined boolean DEFAULT FALSE,
  created_by uuid,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Create call_logs table
CREATE TABLE IF NOT EXISTS public.call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid,
  lead_id uuid,
  call_type text DEFAULT 'Outbound',
  call_date timestamptz DEFAULT NOW(),
  call_duration integer,
  call_outcome text DEFAULT 'Answered',
  notes text,
  logged_by uuid,
  created_at timestamptz DEFAULT NOW()
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_title text NOT NULL,
  customer_id uuid,
  lead_id uuid,
  meeting_date timestamptz NOT NULL,
  meeting_type text DEFAULT 'Phone',
  meeting_status text DEFAULT 'Scheduled',
  assigned_sales_rep uuid,
  notes text,
  created_by uuid,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_title text NOT NULL,
  task_description text,
  assigned_to uuid,
  due_date timestamptz,
  priority text DEFAULT 'Medium',
  task_status text DEFAULT 'To Do',
  related_customer_id uuid,
  related_lead_id uuid,
  created_by uuid,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Create customer_feedback table
CREATE TABLE IF NOT EXISTS public.customer_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid,
  feedback_type text DEFAULT 'General Feedback',
  rating integer,
  feedback_text text,
  feedback_date timestamptz DEFAULT NOW(),
  created_at timestamptz DEFAULT NOW()
);

-- Create customer_interactions table to log all interactions
CREATE TABLE IF NOT EXISTS public.customer_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid,
  interaction_type text NOT NULL,
  interaction_data jsonb,
  interaction_date timestamptz DEFAULT NOW(),
  created_by uuid,
  created_at timestamptz DEFAULT NOW()
);

-- Create helper function to check if user can manage CRM
CREATE OR REPLACE FUNCTION public.can_manage_crm()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND (role = 'super_admin' OR role = 'full_access_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRM managers to view leads" ON public.leads;
CREATE POLICY "Allow CRM managers to view leads" ON public.leads
FOR SELECT TO public
USING (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to insert leads" ON public.leads;
CREATE POLICY "Allow CRM managers to insert leads" ON public.leads
FOR INSERT TO public
WITH CHECK (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to update leads" ON public.leads;
CREATE POLICY "Allow CRM managers to update leads" ON public.leads
FOR UPDATE TO public
USING (can_manage_crm())
WITH CHECK (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to delete leads" ON public.leads;
CREATE POLICY "Allow CRM managers to delete leads" ON public.leads
FOR DELETE TO public
USING (can_manage_crm());

-- RLS Policies for email_campaigns table
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRM managers to view campaigns" ON public.email_campaigns;
CREATE POLICY "Allow CRM managers to view campaigns" ON public.email_campaigns
FOR SELECT TO public
USING (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to insert campaigns" ON public.email_campaigns;
CREATE POLICY "Allow CRM managers to insert campaigns" ON public.email_campaigns
FOR INSERT TO public
WITH CHECK (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to update campaigns" ON public.email_campaigns;
CREATE POLICY "Allow CRM managers to update campaigns" ON public.email_campaigns
FOR UPDATE TO public
USING (can_manage_crm())
WITH CHECK (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to delete campaigns" ON public.email_campaigns;
CREATE POLICY "Allow CRM managers to delete campaigns" ON public.email_campaigns
FOR DELETE TO public
USING (can_manage_crm());

-- RLS Policies for customer_segments table
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRM managers to view segments" ON public.customer_segments;
CREATE POLICY "Allow CRM managers to view segments" ON public.customer_segments
FOR SELECT TO public
USING (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to insert segments" ON public.customer_segments;
CREATE POLICY "Allow CRM managers to insert segments" ON public.customer_segments
FOR INSERT TO public
WITH CHECK (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to update segments" ON public.customer_segments;
CREATE POLICY "Allow CRM managers to update segments" ON public.customer_segments
FOR UPDATE TO public
USING (can_manage_crm())
WITH CHECK (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to delete segments" ON public.customer_segments;
CREATE POLICY "Allow CRM managers to delete segments" ON public.customer_segments
FOR DELETE TO public
USING (can_manage_crm());

-- RLS Policies for call_logs table
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRM managers to view call logs" ON public.call_logs;
CREATE POLICY "Allow CRM managers to view call logs" ON public.call_logs
FOR SELECT TO public
USING (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to insert call logs" ON public.call_logs;
CREATE POLICY "Allow CRM managers to insert call logs" ON public.call_logs
FOR INSERT TO public
WITH CHECK (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to update call logs" ON public.call_logs;
CREATE POLICY "Allow CRM managers to update call logs" ON public.call_logs
FOR UPDATE TO public
USING (can_manage_crm())
WITH CHECK (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to delete call logs" ON public.call_logs;
CREATE POLICY "Allow CRM managers to delete call logs" ON public.call_logs
FOR DELETE TO public
USING (can_manage_crm());

-- RLS Policies for meetings table
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRM managers to view meetings" ON public.meetings;
CREATE POLICY "Allow CRM managers to view meetings" ON public.meetings
FOR SELECT TO public
USING (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to insert meetings" ON public.meetings;
CREATE POLICY "Allow CRM managers to insert meetings" ON public.meetings
FOR INSERT TO public
WITH CHECK (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to update meetings" ON public.meetings;
CREATE POLICY "Allow CRM managers to update meetings" ON public.meetings
FOR UPDATE TO public
USING (can_manage_crm())
WITH CHECK (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to delete meetings" ON public.meetings;
CREATE POLICY "Allow CRM managers to delete meetings" ON public.meetings
FOR DELETE TO public
USING (can_manage_crm());

-- RLS Policies for tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRM managers to view tasks" ON public.tasks;
CREATE POLICY "Allow CRM managers to view tasks" ON public.tasks
FOR SELECT TO public
USING (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to insert tasks" ON public.tasks;
CREATE POLICY "Allow CRM managers to insert tasks" ON public.tasks
FOR INSERT TO public
WITH CHECK (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to update tasks" ON public.tasks;
CREATE POLICY "Allow CRM managers to update tasks" ON public.tasks
FOR UPDATE TO public
USING (can_manage_crm())
WITH CHECK (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to delete tasks" ON public.tasks;
CREATE POLICY "Allow CRM managers to delete tasks" ON public.tasks
FOR DELETE TO public
USING (can_manage_crm());

-- RLS Policies for customer_feedback table
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRM managers to view feedback" ON public.customer_feedback;
CREATE POLICY "Allow CRM managers to view feedback" ON public.customer_feedback
FOR SELECT TO public
USING (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to insert feedback" ON public.customer_feedback;
CREATE POLICY "Allow CRM managers to insert feedback" ON public.customer_feedback
FOR INSERT TO public
WITH CHECK (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to update feedback" ON public.customer_feedback;
CREATE POLICY "Allow CRM managers to update feedback" ON public.customer_feedback
FOR UPDATE TO public
USING (can_manage_crm())
WITH CHECK (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to delete feedback" ON public.customer_feedback;
CREATE POLICY "Allow CRM managers to delete feedback" ON public.customer_feedback
FOR DELETE TO public
USING (can_manage_crm());

-- RLS Policies for customer_interactions table
ALTER TABLE public.customer_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow CRM managers to view interactions" ON public.customer_interactions;
CREATE POLICY "Allow CRM managers to view interactions" ON public.customer_interactions
FOR SELECT TO public
USING (can_manage_crm());

DROP POLICY IF EXISTS "Allow CRM managers to insert interactions" ON public.customer_interactions;
CREATE POLICY "Allow CRM managers to insert interactions" ON public.customer_interactions
FOR INSERT TO public
WITH CHECK (can_manage_crm());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email_crm ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status_crm ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_rep ON public.leads(assigned_sales_rep);
CREATE INDEX IF NOT EXISTS idx_call_logs_customer ON public.call_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_lead ON public.call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_meetings_customer ON public.meetings(customer_id);
CREATE INDEX IF NOT EXISTS idx_meetings_lead ON public.meetings(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer ON public.customer_interactions(customer_id);

-- Insert predefined customer segments
INSERT INTO public.customer_segments (segment_name, segment_criteria, is_predefined)
VALUES 
('Active AMC Customers', '{"amc_status": "active"}', TRUE),
('Expired AMC Customers', '{"amc_status": "expired"}', TRUE),
('High-Value Customers', '{"lifetime_value_min": 50000}', TRUE),
('Inactive Customers', '{"last_interaction_days": 90}', TRUE),
('New Customers (Last 30 Days)', '{"registration_days": 30}', TRUE)
ON CONFLICT DO NOTHING;
