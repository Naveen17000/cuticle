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
