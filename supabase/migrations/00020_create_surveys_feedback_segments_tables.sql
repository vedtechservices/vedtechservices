-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_name text NOT NULL,
  survey_description text,
  survey_status text NOT NULL DEFAULT 'Draft' CHECK (survey_status IN ('Draft', 'Active', 'Closed')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create survey_questions table
CREATE TABLE IF NOT EXISTS survey_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid REFERENCES surveys(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('text', 'rating', 'multiple_choice', 'yes_no')),
  options jsonb,
  required boolean DEFAULT false,
  question_order integer,
  created_at timestamptz DEFAULT now()
);

-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid REFERENCES surveys(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id),
  response_data jsonb NOT NULL,
  submitted_at timestamptz DEFAULT now()
);

-- Create customer_feedback table
CREATE TABLE IF NOT EXISTS customer_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  feedback_type text NOT NULL CHECK (feedback_type IN ('Ticket Feedback', 'Service Feedback', 'General Feedback')),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback_text text,
  sentiment text CHECK (sentiment IN ('Positive', 'Neutral', 'Negative')),
  created_at timestamptz DEFAULT now()
);

-- Create customer_segments table
CREATE TABLE IF NOT EXISTS customer_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_name text NOT NULL UNIQUE,
  segment_criteria jsonb NOT NULL,
  customer_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(survey_status);
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_customer_id ON survey_responses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_customer_id ON customer_feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_type ON customer_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_customer_segments_created_by ON customer_segments(created_by);

-- Enable RLS
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for surveys (admin access)
CREATE POLICY "Admins can view all surveys" ON surveys FOR SELECT USING (true);
CREATE POLICY "Admins can insert surveys" ON surveys FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update surveys" ON surveys FOR UPDATE USING (true);
CREATE POLICY "Admins can delete surveys" ON surveys FOR DELETE USING (true);

-- RLS Policies for survey_questions (admin access)
CREATE POLICY "Admins can view all survey questions" ON survey_questions FOR SELECT USING (true);
CREATE POLICY "Admins can insert survey questions" ON survey_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update survey questions" ON survey_questions FOR UPDATE USING (true);
CREATE POLICY "Admins can delete survey questions" ON survey_questions FOR DELETE USING (true);

-- RLS Policies for survey_responses (admin access)
CREATE POLICY "Admins can view all survey responses" ON survey_responses FOR SELECT USING (true);
CREATE POLICY "Admins can insert survey responses" ON survey_responses FOR INSERT WITH CHECK (true);

-- RLS Policies for customer_feedback (admin access)
CREATE POLICY "Admins can view all feedback" ON customer_feedback FOR SELECT USING (true);
CREATE POLICY "Admins can insert feedback" ON customer_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update feedback" ON customer_feedback FOR UPDATE USING (true);
CREATE POLICY "Admins can delete feedback" ON customer_feedback FOR DELETE USING (true);

-- RLS Policies for customer_segments (admin access)
CREATE POLICY "Admins can view all segments" ON customer_segments FOR SELECT USING (true);
CREATE POLICY "Admins can insert segments" ON customer_segments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update segments" ON customer_segments FOR UPDATE USING (true);
CREATE POLICY "Admins can delete segments" ON customer_segments FOR DELETE USING (true);