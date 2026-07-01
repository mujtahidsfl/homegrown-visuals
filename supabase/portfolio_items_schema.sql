create table if not exists public.portfolio_items (
  id text primary key,
  title text not null,
  location text,
  service text not null,
  category text not null,
  description text,
  media_type text not null check (media_type in ('image', 'video', 'external')),
  source_kind text not null,
  source_url text,
  backup_storage_path text,
  thumbnail_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists portfolio_items_category_sort_idx
  on public.portfolio_items (category, sort_order);

create or replace function public.set_portfolio_items_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists portfolio_items_set_updated_at on public.portfolio_items;

create trigger portfolio_items_set_updated_at
before update on public.portfolio_items
for each row
execute function public.set_portfolio_items_updated_at();
