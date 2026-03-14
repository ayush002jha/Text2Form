-- ============================================
-- Migration 0002: Add User Authentication
-- ============================================

-- 1. Add user_id to forms table (optional, allowing guest forms)
ALTER TABLE public.forms
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster querying by user
CREATE INDEX idx_forms_user_id ON public.forms(user_id);

-- 2. Update RLS on forms
-- Anyone can still read forms
-- Anyone can still insert (user_id will just be null for guests)

-- 3. Update RLS on submissions to protect private forms
DROP POLICY IF EXISTS "Anyone can view submissions" ON public.submissions;

-- Allow reading submissions ONLY IF:
-- a) The form belongs to the logged-in user (private dashboard)
-- OR
-- b) The form has no user_id (public guest form)
CREATE POLICY "View submissions policy"
  ON public.submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.forms f
      WHERE f.id = submissions.form_id
      AND (f.user_id = auth.uid() OR f.user_id IS NULL)
    )
  );

-- Note: Anyone can still create submissions
