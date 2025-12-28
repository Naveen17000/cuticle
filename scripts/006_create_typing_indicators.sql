-- Create typing_indicators table for real-time typing status
create table if not exists public.typing_indicators (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_typing boolean default false,
  updated_at timestamptz default now(),
  unique(conversation_id, user_id)
);

-- Enable RLS
alter table public.typing_indicators enable row level security;

-- RLS Policies
create policy "users_can_view_typing_in_conversations"
  on public.typing_indicators for select
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_participants.conversation_id = typing_indicators.conversation_id
      and conversation_participants.user_id = auth.uid()
    )
  );

create policy "users_can_update_own_typing"
  on public.typing_indicators for insert
  with check (auth.uid() = user_id);

create policy "users_can_update_typing_status"
  on public.typing_indicators for update
  using (auth.uid() = user_id);
