-- Fix infinite recursion in conversation_participants RLS policies
-- Drop the problematic policies
drop policy if exists "users_can_view_own_participants" on public.conversation_participants;
drop policy if exists "users_can_add_participants" on public.conversation_participants;

-- Create corrected policies without self-reference
create policy "users_can_view_own_participants"
  on public.conversation_participants for select
  using (user_id = auth.uid());

create policy "users_can_add_participants"
  on public.conversation_participants for insert
  with check (user_id = auth.uid());
