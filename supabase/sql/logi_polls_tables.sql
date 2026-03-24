-- logi-OS Team-Umfragen (getrennt von surveys/questions/responses der Haupt-App)
-- Einmal im Supabase SQL Editor ausführen (oder als Migration).

create table if not exists public.logi_polls (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  question text not null,
  options jsonb not null,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists logi_polls_active_created_idx
  on public.logi_polls (is_active, created_at desc);

create table if not exists public.logi_poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.logi_polls (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  selected_option text not null,
  updated_at timestamptz not null default now(),
  unique (poll_id, user_id, selected_option)
);

create index if not exists logi_poll_votes_poll_id_idx
  on public.logi_poll_votes (poll_id);

alter table public.logi_polls enable row level security;
alter table public.logi_poll_votes enable row level security;

-- Lesen: eingeloggte Nutzer (Middleware schützt logi-OS ohnehin)
create policy "logi_polls_select_authenticated"
  on public.logi_polls for select
  to authenticated
  using (true);

create policy "logi_poll_votes_select_authenticated"
  on public.logi_poll_votes for select
  to authenticated
  using (true);

-- Stimme: nur eigene Zeile anlegen/ändern
create policy "logi_poll_votes_insert_own"
  on public.logi_poll_votes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "logi_poll_votes_update_own"
  on public.logi_poll_votes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "logi_poll_votes_delete_own"
  on public.logi_poll_votes for delete
  to authenticated
  using (auth.uid() = user_id);

-- Neue Umfragen: nur als Ersteller (Admin legt per App an; created_by = auth.uid())
create policy "logi_polls_insert_creator"
  on public.logi_polls for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Bearbeiten/Löschen: Ersteller oder Profil-Admin / logi_user_access.is_admin
-- (siehe logi_polls_update_delete_policies.sql für nachträgliche Projekte)

comment on table public.logi_polls is 'Kurzumfragen nur für logi-OS';
comment on table public.logi_poll_votes is 'Mehrfachauswahl: eine Zeile pro Nutzer und gewählter Option';
