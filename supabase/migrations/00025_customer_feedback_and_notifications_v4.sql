-- Create customer_feedback table
CREATE TABLE IF NOT EXISTS customer_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL,
  customer_id uuid DEFAULT NULL,
  employee_id uuid DEFAULT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  sentiment_score decimal(3,2) DEFAULT NULL,
  sentiment_label text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT customer_feedback_ticket_fkey FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  CONSTRAINT customer_feedback_customer_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Earlier migrations create customer_feedback for CRM and survey flows. Extend
-- that table for the ticket feedback form instead of dropping existing data.
ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS ticket_id uuid;
ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS employee_id uuid;
ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS review_text text;
ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS sentiment_score decimal(3,2);
ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS sentiment_label text;
ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DO $$ BEGIN
  ALTER TABLE customer_feedback ADD CONSTRAINT customer_feedback_ticket_fkey
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz DEFAULT NULL
);

-- Create indexes for performance
CREATE INDEX idx_customer_feedback_ticket_id ON customer_feedback(ticket_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_customer_id ON customer_feedback(customer_id);
CREATE INDEX idx_customer_feedback_employee_id ON customer_feedback(employee_id);
CREATE INDEX idx_customer_feedback_rating ON customer_feedback(rating);
CREATE INDEX idx_customer_feedback_created_at ON customer_feedback(created_at DESC);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for customer_feedback
CREATE POLICY "Allow authenticated users to read feedback"
  ON customer_feedback
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert feedback"
  ON customer_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to feedback"
  ON customer_feedback
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS policies for notifications
CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text OR user_id = 'all');

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Service role can manage all notifications"
  ON notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Enable Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Create function to calculate sentiment score
CREATE OR REPLACE FUNCTION calculate_sentiment_score(review_text text)
RETURNS TABLE(score decimal, label text)
LANGUAGE plpgsql
AS $$
DECLARE
  positive_words text[] := ARRAY['excellent', 'great', 'amazing', 'wonderful', 'fantastic', 'good', 'best', 'love', 'perfect', 'outstanding', 'helpful', 'professional', 'quick', 'fast', 'efficient', 'satisfied', 'happy', 'thank'];
  negative_words text[] := ARRAY['bad', 'poor', 'terrible', 'awful', 'worst', 'slow', 'unprofessional', 'rude', 'disappointed', 'frustrating', 'useless', 'horrible', 'angry', 'unhappy'];
  positive_count integer := 0;
  negative_count integer := 0;
  word text;
  sentiment_score decimal;
  sentiment_label text;
BEGIN
  review_text := lower(review_text);
  
  FOREACH word IN ARRAY positive_words LOOP
    positive_count := positive_count + (length(review_text) - length(replace(review_text, word, ''))) / length(word);
  END LOOP;
  
  FOREACH word IN ARRAY negative_words LOOP
    negative_count := negative_count + (length(review_text) - length(replace(review_text, word, ''))) / length(word);
  END LOOP;
  
  IF positive_count + negative_count = 0 THEN
    sentiment_score := 0;
    sentiment_label := 'neutral';
  ELSE
    sentiment_score := (positive_count - negative_count)::decimal / (positive_count + negative_count);
    
    IF sentiment_score > 0.3 THEN
      sentiment_label := 'positive';
    ELSIF sentiment_score < -0.3 THEN
      sentiment_label := 'negative';
    ELSE
      sentiment_label := 'neutral';
    END IF;
  END IF;
  
  RETURN QUERY SELECT sentiment_score, sentiment_label;
END;
$$;

-- Create trigger function
CREATE OR REPLACE FUNCTION update_feedback_sentiment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  sentiment_result record;
BEGIN
  IF NEW.review_text IS NOT NULL AND NEW.review_text != '' THEN
    SELECT * INTO sentiment_result FROM calculate_sentiment_score(NEW.review_text);
    NEW.sentiment_score := sentiment_result.score;
    NEW.sentiment_label := sentiment_result.label;
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER trigger_update_feedback_sentiment
  BEFORE INSERT OR UPDATE ON customer_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_sentiment();

-- Add comments
COMMENT ON TABLE customer_feedback IS 'Stores customer feedback and ratings for resolved tickets';
COMMENT ON TABLE notifications IS 'Stores in-app notifications for users';
