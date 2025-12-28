-- Create contacts table for managing user connections
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references auth.users(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'blocked')) default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, contact_id)
);

-- Enable RLS
alter table public.contacts enable row level security;

-- RLS Policies for contacts
create policy "users_can_view_own_contacts"
  on public.contacts for select
  using (auth.uid() = user_id or auth.uid() = contact_id);

create policy "users_can_create_contacts"
  on public.contacts for insert
  with check (auth.uid() = user_id);

create policy "users_can_update_own_contacts"
  on public.contacts for update
  using (auth.uid() = user_id);

create policy "users_can_delete_own_contacts"
  on public.contacts for delete
  using (auth.uid() = user_id);
