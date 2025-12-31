create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  
  -- ZERO KNOWLEDGE: No plain text 'content' column exists.

  -- 1. Recipient Copy (Encrypted for the other person)
  encrypted_content text not null,
  encryption_metadata jsonb not null, 

  -- 2. Sender Copy (Encrypted for myself so I can read history)
  sender_encrypted_content text,
  sender_encryption_metadata jsonb,

  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.messages enable row level security;

-- Policies
create policy "Users can view messages in their conversations"
  on messages for select
  using (
    exists (
      select 1 from conversation_participants
      where conversation_id = messages.conversation_id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert messages into their conversations"
  on messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from conversation_participants
      where conversation_id = messages.conversation_id
      and user_id = auth.uid()
    )
  );