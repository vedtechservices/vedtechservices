-- 1. Create knowledge_base_articles table
CREATE TABLE IF NOT EXISTS knowledge_base_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create article_suggestion_metrics table
CREATE TABLE IF NOT EXISTS article_suggestion_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES knowledge_base_articles(id) ON DELETE CASCADE,
    times_suggested INTEGER DEFAULT 0,
    times_read INTEGER DEFAULT 0,
    resolved_queries INTEGER DEFAULT 0,
    escalations_after_suggestion INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add country column to service_invoices
ALTER TABLE service_invoices ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India';

-- 5. Enable RLS
ALTER TABLE knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_suggestion_metrics ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Public can read published articles
CREATE POLICY "Anyone can view published articles" ON knowledge_base_articles
    FOR SELECT USING (is_published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage articles" ON knowledge_base_articles
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage email templates" ON email_templates
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can view suggestion metrics" ON article_suggestion_metrics
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
    );

-- Anyone can increment suggestion metrics (via a secure function usually, but for now we'll allow update for authenticated or public if needed)
-- We'll use an RPC for incrementing to keep it secure.
CREATE OR REPLACE FUNCTION increment_article_metric(article_id UUID, metric_name TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO article_suggestion_metrics (article_id, times_suggested, times_read, resolved_queries, escalations_after_suggestion)
    VALUES (article_id, 0, 0, 0, 0)
    ON CONFLICT (article_id) DO NOTHING;

    IF metric_name = 'suggested' THEN
        UPDATE article_suggestion_metrics SET times_suggested = times_suggested + 1, updated_at = NOW() WHERE article_id = increment_article_metric.article_id;
    ELSIF metric_name = 'read' THEN
        UPDATE article_suggestion_metrics SET times_read = times_read + 1, updated_at = NOW() WHERE article_id = increment_article_metric.article_id;
    ELSIF metric_name = 'resolved' THEN
        UPDATE article_suggestion_metrics SET resolved_queries = resolved_queries + 1, updated_at = NOW() WHERE article_id = increment_article_metric.article_id;
    ELSIF metric_name = 'escalated' THEN
        UPDATE article_suggestion_metrics SET escalations_after_suggestion = escalations_after_suggestion + 1, updated_at = NOW() WHERE article_id = increment_article_metric.article_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Need unique constraint on article_id for ON CONFLICT to work
ALTER TABLE article_suggestion_metrics ADD CONSTRAINT article_suggestion_metrics_article_id_key UNIQUE (article_id);

-- Insert some default email templates
INSERT INTO email_templates (name, subject, body) VALUES
('Ticket Acknowledgment', 'Re: Your Support Request - {{ticket_id}}', 'Dear {{customer_name}},\n\nThank you for contacting VedTech Services. We have received your support request and will respond shortly.\n\nBest regards,\n{{admin_name}}\nVedTech Services'),
('Issue Resolved', 'Support Ticket Resolved - {{ticket_id}}', 'Dear {{customer_name}},\n\nYour issue has been successfully resolved. Please let us know if you need further assistance.\n\nBest regards,\n{{admin_name}}\nVedTech Services'),
('AMC Renewal Reminder', 'Reminder: Your AMC Plan is Expiring Soon', 'Dear {{customer_name}},\n\nYour AMC plan is expiring soon. Renew now to continue enjoying priority support.\n\nBest regards,\nVedTech Services team');

-- Insert some dummy Knowledge Base articles for the chatbot to suggest
INSERT INTO knowledge_base_articles (title, content, excerpt, category, tags) VALUES
('How to reset your password', 'To reset your password, click on the "Forgot Password" link on the login page and follow the instructions sent to your email.', 'Learn how to reset your account password quickly.', 'Account', '{"password", "reset", "login"}'),
('Understanding AMC Plans', 'Our AMC plans provide comprehensive IT support, including priority service and cost savings. We offer Basic, Standard, and Premium plans.', 'Overview of our Annual Maintenance Contracts.', 'AMC', '{"amc", "support", "plans"}'),
('How to raise a support ticket', 'You can raise a support ticket by visiting the "Support" page, filling out the form with your details and problem description.', 'Step-by-step guide to raising a ticket.', 'Support', '{"ticket", "help", "support"}');
