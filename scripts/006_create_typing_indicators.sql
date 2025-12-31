create table if not exists public.typing_indicators (
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  updated_at timestamp with time zone default now(),
  primary key (conversation_id, user_id)
);

alter table public.typing_indicators enable row level security;

create policy "View typing indicators"
  on typing_indicators for select
  using (
    exists (
      select 1 from conversation_participants
      where conversation_id = typing_indicators.conversation_id
      and user_id = auth.uid()
    )
  );

create policy "Update typing indicators"
  on typing_indicators for insert
  with check ( auth.uid() = user_id );
  
create policy "Delete typing indicators"
  on typing_indicators for delete
  using ( auth.uid() = user_id );