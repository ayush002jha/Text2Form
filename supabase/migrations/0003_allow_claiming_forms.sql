-- ============================================
-- Migration 0003: Allow claiming guest forms
-- ============================================

-- Allow a user to "claim" a form ONLY if it currently has no owner (user_id is NULL)
-- This prevents users from stealing forms that already belong to someone else.
CREATE POLICY "Allow claiming guest forms"
  ON public.forms FOR UPDATE
  USING (user_id IS NULL)
  WITH CHECK (user_id = auth.uid());
