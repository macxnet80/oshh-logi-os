-- Stundensatz & Vorsteuer (logi-OS) — im Supabase SQL Editor ausführen (idempotent).
alter table public.freelancers
  add column if not exists hourly_rate_eur numeric(12, 2) not null default 0;

alter table public.freelancers
  add column if not exists input_vat_deductible boolean not null default true;

comment on column public.freelancers.hourly_rate_eur is 'Stundensatz in EUR';
comment on column public.freelancers.input_vat_deductible is 'Vorsteuer abzugsfähig (umsatzsteuerlich)';

-- Wird von der App mit Service-Role aufgerufen, damit fehlende Spalten nachgezogen werden.
create or replace function public.logi_ensure_freelancer_billing_columns()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'freelancers'
      and column_name = 'hourly_rate_eur'
  ) then
    alter table public.freelancers
      add column hourly_rate_eur numeric(12, 2) not null default 0;
  end if;
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'freelancers'
      and column_name = 'input_vat_deductible'
  ) then
    alter table public.freelancers
      add column input_vat_deductible boolean not null default true;
  end if;
end;
$$;

revoke all on function public.logi_ensure_freelancer_billing_columns() from public;
grant execute on function public.logi_ensure_freelancer_billing_columns() to service_role;
