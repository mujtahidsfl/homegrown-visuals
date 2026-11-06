-- Customer accounts: profile and saved addresses for logged-in customers.
-- Each customer can only read and write their own rows (RLS on auth.uid()).
-- Safe to re-run.

create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default '',
  address text not null check (length(trim(address)) > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists customer_addresses_user_idx on public.customer_addresses(user_id);

alter table public.customer_profiles enable row level security;
alter table public.customer_addresses enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customer_profiles' and policyname = 'own profile') then
    create policy "own profile" on public.customer_profiles
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customer_addresses' and policyname = 'own addresses') then
    create policy "own addresses" on public.customer_addresses
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end
$$;
