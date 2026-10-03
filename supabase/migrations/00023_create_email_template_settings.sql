-- Create email_template_settings table for customizable email templates
CREATE TABLE IF NOT EXISTS email_template_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_color text NOT NULL DEFAULT '#0a1f44',
  secondary_color text NOT NULL DEFAULT '#1e3a8a',
  accent_color text NOT NULL DEFAULT '#3b82f6',
  logo_url text DEFAULT NULL,
  footer_content text DEFAULT NULL,
  company_name text NOT NULL DEFAULT 'VED TECH SERVICES',
  company_tagline text NOT NULL DEFAULT 'Digital Solutions | Endless Possibilities',
  company_address text DEFAULT 'Samastipur, Bihar, India',
  company_phone text DEFAULT '+91 7858971869',
  company_email text DEFAULT 'info@vedtechservices.in ',
  company_website text DEFAULT 'https://vedtechservices.in',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_template_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read
CREATE POLICY "Allow authenticated users to read email template settings"
  ON email_template_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for service role to insert/update (Edge Functions)
CREATE POLICY "Allow service role to manage email template settings"
  ON email_template_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert default VedTech branding
INSERT INTO email_template_settings (
  primary_color,
  secondary_color,
  accent_color,
  company_name,
  company_tagline,
  company_address,
  company_phone,
  company_email,
  company_website
) VALUES (
  '#0a1f44',
  '#1e3a8a',
  '#3b82f6',
  'VED TECH SERVICES',
  'Digital Solutions | Endless Possibilities',
  'Samastipur, Bihar, India',
  '+91 7858971869',
  'info@vedtechservices.in ',
  'https://vedtechservices.in'
) ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_template_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_email_template_settings_updated_at_trigger
  BEFORE UPDATE ON email_template_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_email_template_settings_updated_at();