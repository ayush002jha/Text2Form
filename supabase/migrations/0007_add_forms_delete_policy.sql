-- ============================================
-- Migration 0007: Add Form Deletion Policy
-- ============================================

-- Allow users to delete forms they own
CREATE POLICY "Allow owners to delete their own forms"
  ON public.forms FOR DELETE
  USING (user_id = auth.uid());
