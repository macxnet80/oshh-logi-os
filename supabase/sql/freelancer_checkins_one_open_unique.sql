-- Maximal eine offene Session (check_out IS NULL) pro Freelancer.
-- Verhindert doppelte Check-ins bei parallelen Requests und schützt die Datenintegrität.

create unique index if not exists freelancer_checkins_one_open_per_freelancer
  on public.freelancer_checkins (freelancer_id)
  where (check_out is null);
