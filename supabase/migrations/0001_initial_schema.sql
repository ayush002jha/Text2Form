-- ============================================
-- AI Dynamic Form & Quiz Builder - Supabase Schema
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- FORMS TABLE
-- Stores AI-generated form schemas
-- ============================================
create table if not exists public.forms (
  id uuid primary key default uuid_generate_v4(),
  title text not null default 'Untitled Form',
  description text default '',
  schema jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================
-- SUBMISSIONS TABLE
-- Stores form/quiz responses
-- ============================================
create table if not exists public.submissions (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid not null references public.forms(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now()
);

-- Index for fast lookup of submissions by form
create index if not exists idx_submissions_form_id on public.submissions(form_id);

-- ============================================
-- ROW LEVEL SECURITY
-- Public access: anyone can create forms, view forms, and submit answers
-- ============================================

alter table public.forms enable row level security;
alter table public.submissions enable row level security;

-- Forms: anyone can read and insert
create policy "Anyone can view forms"
  on public.forms for select
  using (true);

create policy "Anyone can create forms"
  on public.forms for insert
  with check (true);

-- Submissions: anyone can read and insert
create policy "Anyone can view submissions"
  on public.submissions for select
  using (true);

create policy "Anyone can create submissions"
  on public.submissions for insert
  with check (true);
