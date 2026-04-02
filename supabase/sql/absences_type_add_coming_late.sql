-- Erweitert absences.type um 'coming_late' (Später kommen).
-- Einmal auf der Supabase-Instanz ausführen, falls CHECK auf type existiert.

ALTER TABLE public.absences DROP CONSTRAINT IF EXISTS absences_type_check;

ALTER TABLE public.absences ADD CONSTRAINT absences_type_check CHECK (
  type IN (
    'vacation',
    'day_off',
    'leaving_early',
    'coming_late',
    'sick',
    'home_office'
  )
);
