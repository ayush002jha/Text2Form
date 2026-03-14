-- ============================================
-- Migration 0006: Fix forms update policy
-- ============================================

-- Previously, "Allow claiming guest forms" was too restrictive.
-- It only allowed specifically changing user_id from NULL to current auth.uid().
-- We need to allow:
-- 1. Owners to edit their own forms.
-- 2. Guests (or anyone) to edit unclaimed forms.

DROP POLICY IF EXISTS "Allow claiming guest forms" ON public.forms;

CREATE POLICY "Allow update for owners and guests"
  ON public.forms FOR UPDATE
  USING (user_id IS NULL OR user_id = auth.uid())
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
