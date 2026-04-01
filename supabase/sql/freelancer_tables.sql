-- Freelancer Checkin/Checkout (logi-OS)
-- Einmal im Supabase SQL Editor ausführen (oder als Migration).
-- API nutzt Service Role; RLS schützt bei Nutzung des User-JWT.

create table if not exists public.freelancers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pin text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists freelancers_active_idx
  on public.freelancers (is_active);

create table if not exists public.freelancer_checkins (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.freelancers (id) on delete cascade,
  check_in timestamptz not null,
  check_out timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists freelancer_checkins_freelancer_idx
  on public.freelancer_checkins (freelancer_id);

create index if not exists freelancer_checkins_check_in_idx
  on public.freelancer_checkins (check_in desc);

comment on table public.freelancers is 'Externe Freelancer ohne Auth; PIN für Checkin-Terminal';
comment on table public.freelancer_checkins is 'Checkin/Checkout-Zeiten (offene Session: check_out IS NULL)';

alter table public.freelancers enable row level security;
alter table public.freelancer_checkins enable row level security;

-- logi-OS Admin: profiles.role = admin ODER logi_user_access.is_admin
-- (gleiches Muster wie logi_polls_update_delete_policies.sql)

create policy "freelancers_select_admins"
  on public.freelancers for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
    or exists (
      select 1 from public.logi_user_access a
      where a.user_id = auth.uid() and a.is_admin = true
    )
  );

create policy "freelancers_insert_admins"
  on public.freelancers for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
    or exists (
      select 1 from public.logi_user_access a
      where a.user_id = auth.uid() and a.is_admin = true
    )
  );

create policy "freelancers_update_admins"
  on public.freelancers for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
    or exists (
      select 1 from public.logi_user_access a
      where a.user_id = auth.uid() and a.is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
    or exists (
      select 1 from public.logi_user_access a
      where a.user_id = auth.uid() and a.is_admin = true
    )
  );

create policy "freelancers_delete_admins"
  on public.freelancers for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
    or exists (
      select 1 from public.logi_user_access a
      where a.user_id = auth.uid() and a.is_admin = true
    )
  );

create policy "freelancer_checkins_select_admins"
  on public.freelancer_checkins for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
    or exists (
      select 1 from public.logi_user_access a
      where a.user_id = auth.uid() and a.is_admin = true
    )
  );

create policy "freelancer_checkins_insert_admins"
  on public.freelancer_checkins for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
    or exists (
      select 1 from public.logi_user_access a
      where a.user_id = auth.uid() and a.is_admin = true
    )
  );

create policy "freelancer_checkins_update_admins"
  on public.freelancer_checkins for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
    or exists (
      select 1 from public.logi_user_access a
      where a.user_id = auth.uid() and a.is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
    or exists (
      select 1 from public.logi_user_access a
      where a.user_id = auth.uid() and a.is_admin = true
    )
  );

create policy "freelancer_checkins_delete_admins"
  on public.freelancer_checkins for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
    or exists (
      select 1 from public.logi_user_access a
      where a.user_id = auth.uid() and a.is_admin = true
    )
  );
