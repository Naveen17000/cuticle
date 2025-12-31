-- Create conversations table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create conversation_participants junction table
create table if not exists public.conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(conversation_id, user_id)
);

-- Enable RLS
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;

-- RLS Policies for conversations
create policy "users_can_view_own_conversations"
  on public.conversations for select
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_participants.conversation_id = conversations.id
      and conversation_participants.user_id = auth.uid()
    )
  );

create policy "users_can_create_conversations"
  on public.conversations for insert
  with check (true);

-- RLS Policies for conversation_participants
create policy "users_can_view_own_participants"
  on public.conversation_participants for select
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversation_participants.conversation_id
      and cp.user_id = auth.uid()
    )
  );

create policy "users_can_add_participants"
  on public.conversation_participants for insert
  with check (
    exists (
      select 1 from public.conversation_participants
      where conversation_participants.conversation_id = conversation_id
      and conversation_participants.user_id = auth.uid()
    )
  );
-- Conversations Table
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  last_message_at timestamp with time zone default timezone('utc'::text, now()),
  is_group boolean default false,
  name text
);

-- Participants Table (Link Users to Conversations)
create table if not exists public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()),
  last_read_at timestamp with time zone default timezone('utc'::text, now()), -- Track read status
  primary key (conversation_id, user_id)
);

-- Enable RLS
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;

-- Policies
create policy "Users can view conversations they are part of"
  on conversations for select
  using (
    exists (
      select 1 from conversation_participants
      where conversation_id = conversations.id
      and user_id = auth.uid()
    )
  );

create policy "Participants can view other participants"
  on conversation_participants for select
  using (
    exists (
      select 1 from conversation_participants cp
      where cp.conversation_id = conversation_participants.conversation_id
      and cp.user_id = auth.uid()
    )
  );
  
create policy "Users can create conversations"
  on conversations for insert
  with check (true);
  
create policy "Users can join conversations"
  on conversation_participants for insert
  with check (auth.uid() = user_id);