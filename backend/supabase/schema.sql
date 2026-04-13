-- Run in Supabase SQL editor
create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  status text not null default 'Applied',
  location text not null default '',
  salary text not null default '',
  job_link text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.applications enable row level security;

drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users
for select using (auth.uid() = id);

drop policy if exists users_insert_own on public.users;
create policy users_insert_own on public.users
for insert with check (auth.uid() = id);

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists applications_select_own on public.applications;
create policy applications_select_own on public.applications
for select using (auth.uid() = user_id);

drop policy if exists applications_insert_own on public.applications;
create policy applications_insert_own on public.applications
for insert with check (auth.uid() = user_id);

drop policy if exists applications_update_own on public.applications;
create policy applications_update_own on public.applications
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists applications_delete_own on public.applications;
create policy applications_delete_own on public.applications
for delete using (auth.uid() = user_id);
