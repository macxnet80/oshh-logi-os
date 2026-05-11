-- Foundation for automatic HR sync (Personio now, Lucca later)

alter table public.absences
  add column if not exists source text not null default 'manual',
  add column if not exists external_absence_id text,
  add column if not exists source_event_id text,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'absences_source_check'
  ) then
    alter table public.absences
      add constraint absences_source_check
      check (source in ('manual', 'personio', 'lucca'));
  end if;
end
$$;

create unique index if not exists absences_source_external_absence_uidx
  on public.absences (source, external_absence_id)
  where external_absence_id is not null;

create index if not exists absences_source_date_idx
  on public.absences (source, start_date, end_date);

create table if not exists public.hr_identity_mappings (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('personio', 'lucca')),
  external_person_id text not null,
  email_normalized text not null,
  profile_id uuid references public.profiles(id) on delete set null,
  sync_status text not null default 'matched' check (sync_status in ('matched', 'unmatched', 'ignored')),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, external_person_id),
  unique (provider, email_normalized)
);

create index if not exists hr_identity_mappings_profile_idx
  on public.hr_identity_mappings (profile_id);

create index if not exists hr_identity_mappings_status_idx
  on public.hr_identity_mappings (provider, sync_status);

create table if not exists public.hr_sync_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('personio', 'lucca')),
  status text not null check (status in ('running', 'success', 'partial', 'failed')),
  triggered_by text not null default 'scheduler',
  timezone text not null default 'Europe/Berlin',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  window_start timestamptz,
  window_end timestamptz,
  counts jsonb not null default '{}'::jsonb,
  error_message text
);

create index if not exists hr_sync_runs_started_idx
  on public.hr_sync_runs (started_at desc);

create index if not exists hr_sync_runs_status_idx
  on public.hr_sync_runs (status, started_at desc);
