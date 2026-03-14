-- ============================================
-- Migration 0004: Tighten Submission Security
-- ============================================

-- Ensure that if a form is owned by a user, ONLY that user can see the submissions.
-- Guest forms (user_id IS NULL) remain public for viewing results.

DROP POLICY IF EXISTS "View submissions policy" ON public.submissions;

CREATE POLICY "View submissions policy"
  ON public.submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.forms f
      WHERE f.id = submissions.form_id
      AND (
        (f.user_id IS NOT NULL AND f.user_id = auth.uid()) -- Private: only owner
        OR 
        (f.user_id IS NULL) -- Public: anyone can see guest forms
      )
    )
  );
