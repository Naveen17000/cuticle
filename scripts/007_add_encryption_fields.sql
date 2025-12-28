-- Add public_key column to profiles for storing Kyber public keys
alter table public.profiles
add column if not exists public_key text;

-- Add index for faster public key lookups
create index if not exists profiles_public_key_idx on public.profiles(public_key);
