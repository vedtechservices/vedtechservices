-- Create report_templates table for saved custom reports
CREATE TABLE IF NOT EXISTS report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name text NOT NULL,
  data_source text NOT NULL CHECK (data_source IN ('Customers', 'Leads', 'Tickets', 'Sales', 'Campaigns', 'Tasks')),
  metrics jsonb NOT NULL DEFAULT '[]'::jsonb,
  dimensions jsonb NOT NULL DEFAULT '[]'::jsonb,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  chart_type text NOT NULL CHECK (chart_type IN ('Line', 'Bar', 'Pie', 'Donut', 'Table', 'Heatmap')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create report_schedules table for automated report generation
CREATE TABLE IF NOT EXISTS report_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_template_id uuid REFERENCES report_templates(id) ON DELETE CASCADE,
  frequency text NOT NULL CHECK (frequency IN ('Daily', 'Weekly', 'Monthly', 'Quarterly')),
  recipient_emails text[] NOT NULL,
  email_subject text NOT NULL,
  last_run_at timestamptz,
  next_run_at timestamptz,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create report_history table for tracking generated reports
CREATE TABLE IF NOT EXISTS report_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_template_id uuid REFERENCES report_templates(id) ON DELETE SET NULL,
  report_name text NOT NULL,
  generated_by uuid REFERENCES auth.users(id),
  file_url text,
  file_format text CHECK (file_format IN ('PDF', 'Excel', 'CSV')),
  generated_at timestamptz DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_report_templates_created_by ON report_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_report_schedules_next_run ON report_schedules(next_run_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_report_history_generated_at ON report_history(generated_at DESC);