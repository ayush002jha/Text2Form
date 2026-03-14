-- ============================================
-- Add Quiz & Scoring Support
-- ============================================

-- Add is_quiz to forms table
alter table public.forms 
  add column if not exists is_quiz boolean not null default false;

-- Add score to submissions table
alter table public.submissions 
  add column if not exists score integer;
