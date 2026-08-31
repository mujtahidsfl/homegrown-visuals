create table if not exists public.hgv_booking_jobs (
  booking_id text primary key,
  request_id uuid not null,
  payload jsonb not null default '{}'::jsonb,
  contact_email text,
  contact_phone text,
  contact_id text,
  opportunity_id text unique,
  appointment_id text unique,
  calendar_id text,
  assigned_user_id text,
  appointment_start timestamptz,
  appointment_end timestamptz,
  invoice_id text unique,
  invoice_number text,
  invoice_status text,
  invoice_lease_owner uuid,
  invoice_lease_expires_at timestamptz,
  status text not null default 'processing' check (
    status in ('processing', 'opportunity_created', 'scheduled', 'confirmed', 'invoice_created', 'invoiced', 'cancelled', 'failed')
  ),
  lease_owner uuid,
  lease_expires_at timestamptz,
  error text,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hgv_booking_jobs add column if not exists booking_id text;
alter table public.hgv_booking_jobs add column if not exists request_id uuid;
alter table public.hgv_booking_jobs add column if not exists payload jsonb not null default '{}'::jsonb;
alter table public.hgv_booking_jobs add column if not exists contact_email text;
alter table public.hgv_booking_jobs add column if not exists contact_phone text;
alter table public.hgv_booking_jobs add column if not exists contact_id text;
alter table public.hgv_booking_jobs add column if not exists opportunity_id text;
alter table public.hgv_booking_jobs add column if not exists appointment_id text;
alter table public.hgv_booking_jobs add column if not exists calendar_id text;
alter table public.hgv_booking_jobs add column if not exists assigned_user_id text;
alter table public.hgv_booking_jobs add column if not exists appointment_start timestamptz;
alter table public.hgv_booking_jobs add column if not exists appointment_end timestamptz;
alter table public.hgv_booking_jobs add column if not exists invoice_id text;
alter table public.hgv_booking_jobs add column if not exists invoice_number text;
alter table public.hgv_booking_jobs add column if not exists invoice_status text;
alter table public.hgv_booking_jobs add column if not exists invoice_lease_owner uuid;
alter table public.hgv_booking_jobs add column if not exists invoice_lease_expires_at timestamptz;
alter table public.hgv_booking_jobs add column if not exists status text not null default 'processing';
alter table public.hgv_booking_jobs add column if not exists lease_owner uuid;
alter table public.hgv_booking_jobs add column if not exists lease_expires_at timestamptz;
alter table public.hgv_booking_jobs add column if not exists error text;
alter table public.hgv_booking_jobs add column if not exists submitted_at timestamptz not null default now();
alter table public.hgv_booking_jobs add column if not exists created_at timestamptz not null default now();
alter table public.hgv_booking_jobs add column if not exists updated_at timestamptz not null default now();

create unique index if not exists hgv_booking_jobs_booking_id_uidx
  on public.hgv_booking_jobs (booking_id);
create unique index if not exists hgv_booking_jobs_opportunity_id_uidx
  on public.hgv_booking_jobs (opportunity_id) where opportunity_id is not null;
create unique index if not exists hgv_booking_jobs_appointment_id_uidx
  on public.hgv_booking_jobs (appointment_id) where appointment_id is not null;
create unique index if not exists hgv_booking_jobs_invoice_id_uidx
  on public.hgv_booking_jobs (invoice_id) where invoice_id is not null;

create index if not exists hgv_booking_jobs_contact_pending_idx
  on public.hgv_booking_jobs (contact_id, calendar_id, created_at desc)
  where appointment_id is null and status in ('opportunity_created', 'processing');

alter table public.hgv_booking_jobs enable row level security;

create or replace function public.claim_hgv_booking(
  p_booking_id text,
  p_payload jsonb,
  p_request_id uuid,
  p_contact_email text default null,
  p_contact_phone text default null,
  p_calendar_id text default null,
  p_submitted_at timestamptz default now()
)
returns table (
  acquired boolean,
  booking_id text,
  status text,
  contact_id text,
  opportunity_id text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.hgv_booking_jobs%rowtype;
begin
  insert into public.hgv_booking_jobs (
    booking_id, request_id, payload, contact_email, contact_phone, calendar_id,
    submitted_at, lease_owner, lease_expires_at
  ) values (
    p_booking_id, p_request_id, p_payload, p_contact_email, p_contact_phone, p_calendar_id,
    coalesce(p_submitted_at, now()), p_request_id, now() + interval '2 minutes'
  )
  on conflict (booking_id) do nothing
  returning * into current_row;

  if found then
    return query select true, current_row.booking_id, current_row.status, current_row.contact_id, current_row.opportunity_id;
    return;
  end if;

  update public.hgv_booking_jobs
  set lease_owner = p_request_id,
      lease_expires_at = now() + interval '2 minutes',
      status = 'processing',
      error = null,
      updated_at = now()
  where hgv_booking_jobs.booking_id = p_booking_id
    and hgv_booking_jobs.opportunity_id is null
    and (hgv_booking_jobs.status = 'failed' or hgv_booking_jobs.lease_expires_at < now())
  returning * into current_row;

  if found then
    return query select true, current_row.booking_id, current_row.status, current_row.contact_id, current_row.opportunity_id;
    return;
  end if;

  select * into current_row from public.hgv_booking_jobs where hgv_booking_jobs.booking_id = p_booking_id;
  return query select false, current_row.booking_id, current_row.status, current_row.contact_id, current_row.opportunity_id;
end;
$$;

create or replace function public.claim_hgv_appointment(
  p_appointment_id text,
  p_contact_id text,
  p_calendar_id text default null
)
returns setof public.hgv_booking_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate_count integer;
  candidate_booking_id text;
begin
  return query
    select * from public.hgv_booking_jobs where appointment_id = p_appointment_id limit 1;
  if found then return; end if;

  select count(*), min(booking_id)
  into candidate_count, candidate_booking_id
  from public.hgv_booking_jobs
  where contact_id = p_contact_id
    and appointment_id is null
    and status = 'opportunity_created'
    and created_at > now() - interval '24 hours'
    and (p_calendar_id is null or calendar_id is null or calendar_id = p_calendar_id);

  if candidate_count <> 1 then return; end if;

  update public.hgv_booking_jobs
  set appointment_id = p_appointment_id,
      calendar_id = coalesce(p_calendar_id, calendar_id),
      updated_at = now()
  where booking_id = candidate_booking_id
    and appointment_id is null
  returning * into current_row;

  if not found then return; end if;

  return next current_row;
  return;
end;
$$;

revoke all on function public.claim_hgv_booking(text, jsonb, uuid, text, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.claim_hgv_appointment(text, text, text) from public, anon, authenticated;
grant execute on function public.claim_hgv_booking(text, jsonb, uuid, text, text, text, timestamptz) to service_role;
grant execute on function public.claim_hgv_appointment(text, text, text) to service_role;

create or replace function public.claim_hgv_invoice(
  p_booking_id text,
  p_request_id uuid
)
returns table (
  acquired boolean,
  booking_id text,
  status text,
  contact_id text,
  opportunity_id text,
  assigned_user_id text,
  invoice_id text,
  invoice_status text,
  payload jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.hgv_booking_jobs%rowtype;
begin
  update public.hgv_booking_jobs
  set invoice_lease_owner = p_request_id,
      invoice_lease_expires_at = now() + interval '2 minutes',
      invoice_status = 'processing',
      error = null,
      updated_at = now()
  where hgv_booking_jobs.booking_id = p_booking_id
    and hgv_booking_jobs.opportunity_id is not null
    and hgv_booking_jobs.invoice_id is null
    and (
      hgv_booking_jobs.invoice_status is null
      or hgv_booking_jobs.invoice_status = 'failed'
      or hgv_booking_jobs.invoice_lease_expires_at < now()
    )
  returning * into current_row;

  if found then
    return query select true, current_row.booking_id, current_row.status, current_row.contact_id,
      current_row.opportunity_id, current_row.assigned_user_id, current_row.invoice_id,
      current_row.invoice_status, current_row.payload;
    return;
  end if;

  select * into current_row from public.hgv_booking_jobs where hgv_booking_jobs.booking_id = p_booking_id;
  if not found then return; end if;
  return query select false, current_row.booking_id, current_row.status, current_row.contact_id,
    current_row.opportunity_id, current_row.assigned_user_id, current_row.invoice_id,
    current_row.invoice_status, current_row.payload;
end;
$$;

revoke all on function public.claim_hgv_invoice(text, uuid) from public, anon, authenticated;
grant execute on function public.claim_hgv_invoice(text, uuid) to service_role;
