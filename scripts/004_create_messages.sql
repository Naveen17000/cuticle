-- Create messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  encrypted_content text,
  encryption_metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  is_deleted boolean default false
);

-- Create index for faster queries
create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create index if not exists messages_created_at_idx on public.messages(created_at desc);

-- Enable RLS
alter table public.messages enable row level security;

-- RLS Policies for messages
create policy "users_can_view_conversation_messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_participants.conversation_id = messages.conversation_id
      and conversation_participants.user_id = auth.uid()
    )
  );

create policy "users_can_insert_messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversation_participants
      where conversation_participants.conversation_id = messages.conversation_id
      and conversation_participants.user_id = auth.uid()
    )
  );

create policy "users_can_update_own_messages"
  on public.messages for update
  using (auth.uid() = sender_id);

create policy "users_can_delete_own_messages"
  on public.messages for delete
  using (auth.uid() = sender_id);
