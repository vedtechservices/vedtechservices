-- Fix engineers table RLS policies to allow admin operations

-- Create helper function to check if user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view engineers" ON public.engineers;

-- Create comprehensive RLS policies for engineers table

-- Allow everyone to view engineers (public access)
CREATE POLICY "Allow public to view engineers"
  ON public.engineers FOR SELECT
  TO public
  USING (true);

-- Allow admins to insert new engineers
CREATE POLICY "Allow admins to insert engineers"
  ON public.engineers FOR INSERT
  TO public
  WITH CHECK (is_admin());

-- Allow admins to update engineers
CREATE POLICY "Allow admins to update engineers"
  ON public.engineers FOR UPDATE
  TO public
  USING (is_admin())
  WITH CHECK (is_admin());

-- Allow admins to delete engineers
CREATE POLICY "Allow admins to delete engineers"
  ON public.engineers FOR DELETE
  TO public
  USING (is_admin());

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_engineers_email ON public.engineers(email);
CREATE INDEX IF NOT EXISTS idx_engineers_employee_id ON public.engineers(employee_id);