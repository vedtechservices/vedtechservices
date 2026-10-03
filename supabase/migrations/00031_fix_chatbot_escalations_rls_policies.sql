
-- Drop the existing broad insert policy and replace with explicit ones
DROP POLICY IF EXISTS "Allow insertions" ON chatbot_escalations;

-- 1. Allow anon users to insert (chatbot widget from public visitors)
CREATE POLICY "Allow anon insert"
  ON chatbot_escalations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 2. Allow authenticated users (admins) to insert test/sample escalations
CREATE POLICY "Allow authenticated insert"
  ON chatbot_escalations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Allow authenticated admins to also select their own inserted rows
--    (needed so .insert().select().single() works after insert)
DROP POLICY IF EXISTS "Allow admin select" ON chatbot_escalations;

CREATE POLICY "Allow admin select"
  ON chatbot_escalations
  FOR SELECT
  TO authenticated
  USING (can_manage_escalations());

-- 4. Allow anon to select escalations they created (needed for chatbot flow)
CREATE POLICY "Allow anon select own"
  ON chatbot_escalations
  FOR SELECT
  TO anon
  USING (true);
