-- Add engagement_score and location fields to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- Create survey_email_templates table
CREATE TABLE IF NOT EXISTS survey_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL CHECK (template_type IN ('Survey Invitation', 'Follow-Up', 'Thank You')),
  subject_line TEXT NOT NULL,
  message_body TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modify existing report_schedules table to add missing fields
ALTER TABLE report_schedules
ADD COLUMN IF NOT EXISTS report_name TEXT,
ADD COLUMN IF NOT EXISTS report_type TEXT,
ADD COLUMN IF NOT EXISTS day_of_week TEXT CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
ADD COLUMN IF NOT EXISTS day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31 OR day_of_month = -1),
ADD COLUMN IF NOT EXISTS time_of_day TIME DEFAULT '08:00:00',
ADD COLUMN IF NOT EXISTS export_format TEXT CHECK (export_format IN ('PDF', 'Excel', 'Both')),
ADD COLUMN IF NOT EXISTS email_body TEXT,
ADD COLUMN IF NOT EXISTS date_range TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_engagement_score ON customers(engagement_score);
CREATE INDEX IF NOT EXISTS idx_customers_country ON customers(country);
CREATE INDEX IF NOT EXISTS idx_survey_email_templates_type ON survey_email_templates(template_type);

-- RLS policies for survey_email_templates
ALTER TABLE survey_email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all survey email templates"
  ON survey_email_templates FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('Super Admin', 'Full Access Admin', 'Support Only Admin', 'Billing Only Admin')));

CREATE POLICY "Admins can create survey email templates"
  ON survey_email_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('Super Admin', 'Full Access Admin')));

CREATE POLICY "Admins can update survey email templates"
  ON survey_email_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('Super Admin', 'Full Access Admin')));

CREATE POLICY "Admins can delete survey email templates"
  ON survey_email_templates FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('Super Admin', 'Full Access Admin')));