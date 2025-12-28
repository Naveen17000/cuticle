-- Add last_read_at to conversation_participants
alter table if exists public.conversation_participants
  add column if not exists last_read_at timestamptz null;

-- Optional index for faster comparison
create index if not exists conversation_participants_last_read_idx on public.conversation_participants(last_read_at);
