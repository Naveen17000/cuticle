create table if not exists public.contacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  contact_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, contact_id)
);

alter table public.contacts enable row level security;

-- Users can view their own contacts
create policy "Users can view own contacts"
  on contacts for select
  using ( auth.uid() = user_id or auth.uid() = contact_id );

-- Users can create contacts
create policy "Users can create contacts"
  on contacts for insert
  with check ( auth.uid() = user_id );

-- Users can update their own contacts
create policy "Users can update own contacts"
  on contacts for update
  using ( auth.uid() = user_id or auth.uid() = contact_id );