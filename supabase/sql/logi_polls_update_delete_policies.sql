-- Nach logi_polls_tables.sql: Bearbeiten/Löschen für Ersteller oder logi-Manager
-- (Profil admin / logi_user_access.is_admin).

create policy "logi_polls_update_managers"
  on public.logi_polls for update
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
    or exists (
      select 1 from public.logi_user_access a
      where a.user_id = auth.uid() and a.is_admin = true
    )
  )
  with check (
    created_by = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
    or exists (
      select 1 from public.logi_user_access a
      where a.user_id = auth.uid() and a.is_admin = true
    )
  );

create policy "logi_polls_delete_managers"
  on public.logi_polls for delete
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
    or exists (
      select 1 from public.logi_user_access a
      where a.user_id = auth.uid() and a.is_admin = true
    )
  );
