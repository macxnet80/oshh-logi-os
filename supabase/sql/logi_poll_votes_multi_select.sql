-- Mehrfachauswahl für logi_poll_votes (nach initialem logi_polls_tables.sql).
-- Einmal ausführen, wenn die alte Unique-Constraint (poll_id, user_id) noch existiert.

alter table public.logi_poll_votes drop constraint if exists logi_poll_votes_poll_id_user_id_key;

alter table public.logi_poll_votes
  add constraint logi_poll_votes_poll_user_option_key
  unique (poll_id, user_id, selected_option);

drop policy if exists "logi_poll_votes_delete_own" on public.logi_poll_votes;

create policy "logi_poll_votes_delete_own"
  on public.logi_poll_votes for delete
  to authenticated
  using (auth.uid() = user_id);

comment on table public.logi_poll_votes is 'Mehrfachauswahl: eine Zeile pro Nutzer und gewählter Option';
