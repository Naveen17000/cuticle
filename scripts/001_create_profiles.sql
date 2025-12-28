-- Create profiles table linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  status text check (status in ('online', 'away', 'busy', 'offline')) default 'offline',
  last_seen timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy "users_can_view_all_profiles"
  on public.profiles for select
  using (true);

create policy "users_can_insert_own_profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "users_can_update_own_profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "users_can_delete_own_profile"
  on public.profiles for delete
  using (auth.uid() = id);
