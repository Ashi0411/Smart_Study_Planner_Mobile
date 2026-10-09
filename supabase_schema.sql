-- ===============================================================
-- SMART LIFE & LEARNING PLANNER - SUPABASE POSTGRESQL & STORAGE SETUP
-- ===============================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- It automatically enables:
-- 1. Profiles Table with automatic user creation trigger
-- 2. User Tasks, Categories, and Work Plans tables with Row Level Security (RLS)
-- 3. Supabase Storage bucket for user avatars and attachments
-- ===============================================================

-- 1. PROFILES TABLE (Stores user account metadata)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) on Profiles
alter table public.profiles enable row level security;

-- Profiles Security Policies
create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- 2. TRIGGER: Automatically create profile entry on Supabase auth.users signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Student'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. USER TASKS TABLE
create table if not exists public.user_tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  category_id text,
  subcategory_id text,
  priority text default 'medium',
  due_date text,
  progress_percent integer default 0,
  is_today boolean default false,
  completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.user_tasks enable row level security;

create policy "Users can view only their own tasks"
  on public.user_tasks for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert only their own tasks"
  on public.user_tasks for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update only their own tasks"
  on public.user_tasks for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete only their own tasks"
  on public.user_tasks for delete
  to authenticated
  using (auth.uid() = user_id);

-- 4. USER WORK PLANS TABLE
create table if not exists public.user_work_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  category_id text not null,
  sub_plans jsonb default '[]'::jsonb,
  target_deadline text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.user_work_plans enable row level security;

create policy "Users can manage only their own work plans"
  on public.user_work_plans for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. SUPABASE STORAGE BUCKET (Avatars)
-- Creates 'avatars' storage bucket if it does not exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Storage RLS Policies: Authenticated users can upload their own avatar
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars');

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can update their own avatars"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
