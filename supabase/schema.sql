-- ============================================
-- logi-OS Database Schema
-- Orendt Studios — Logistik Operations System
-- ============================================

-- Mitarbeiter
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Abwesenheiten
CREATE TABLE absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('vacation', 'day_off', 'leaving_early', 'sick', 'home_office')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_absences_employee ON absences(employee_id);
CREATE INDEX idx_absences_dates ON absences(start_date, end_date);
CREATE INDEX idx_absences_type ON absences(type);

-- Zugriff logi-OS (nur diese Tabelle; gemeinsame Auth-User bleiben unverändert)
CREATE TABLE logi_user_access (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  team TEXT NOT NULL CHECK (team IN ('logistik', 'produktion', 'sonstige')),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_logi_user_access_team ON logi_user_access (team);

ALTER TABLE logi_user_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "logi_user_access_select_own"
  ON logi_user_access FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Erste Admin-Zeile (einmalig, user_id aus auth.users). Admin darf z. B.
-- team 'sonstige' haben — Zugang zur App hat sie/er über is_admin.
-- INSERT INTO logi_user_access (user_id, team, is_admin)
-- VALUES ('<uuid>', 'sonstige', true);

-- RLS: logi_user_access (Logistik / logi-Admin) ODER profiles.role = 'admin'
-- (gemeinsame Haupt-App, keine Pflicht für eine logi_user_access-Zeile)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employees_select_logistik_or_admin"
  ON employees FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM logi_user_access l
      WHERE l.user_id = auth.uid()
      AND (l.team = 'logistik' OR l.is_admin)
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "absences_select_logistik_or_admin"
  ON absences FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM logi_user_access l
      WHERE l.user_id = auth.uid()
      AND (l.team = 'logistik' OR l.is_admin)
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "absences_insert_logistik_or_admin"
  ON absences FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM logi_user_access l
      WHERE l.user_id = auth.uid() AND l.is_admin = true
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    OR (
      EXISTS (
        SELECT 1 FROM logi_user_access l
        WHERE l.user_id = auth.uid() AND l.team = 'logistik'
      )
      AND employee_id IN (
        SELECT id FROM employees WHERE email = (SELECT auth.email())
      )
    )
  );

CREATE POLICY "absences_update_logistik_or_admin"
  ON absences FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM logi_user_access l
      WHERE l.user_id = auth.uid() AND l.is_admin = true
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    OR (
      EXISTS (
        SELECT 1 FROM logi_user_access l
        WHERE l.user_id = auth.uid() AND l.team = 'logistik'
      )
      AND employee_id IN (
        SELECT id FROM employees WHERE email = (SELECT auth.email())
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM logi_user_access l
      WHERE l.user_id = auth.uid() AND l.is_admin = true
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    OR (
      EXISTS (
        SELECT 1 FROM logi_user_access l
        WHERE l.user_id = auth.uid() AND l.team = 'logistik'
      )
      AND employee_id IN (
        SELECT id FROM employees WHERE email = (SELECT auth.email())
      )
    )
  );

CREATE POLICY "absences_delete_logistik_or_admin"
  ON absences FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM logi_user_access l
      WHERE l.user_id = auth.uid() AND l.is_admin = true
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    OR (
      EXISTS (
        SELECT 1 FROM logi_user_access l
        WHERE l.user_id = auth.uid() AND l.team = 'logistik'
      )
      AND employee_id IN (
        SELECT id FROM employees WHERE email = (SELECT auth.email())
      )
    )
  );

-- Seed: Beispiel-Mitarbeiter
INSERT INTO employees (email, full_name, department) VALUES
  ('max@orendt.com', 'Max Müller', 'Logistik'),
  ('anna@orendt.com', 'Anna Schmidt', 'Logistik'),
  ('tom@orendt.com', 'Tom Weber', 'Logistik'),
  ('lisa@orendt.com', 'Lisa Fischer', 'Produktion'),
  ('jan@orendt.com', 'Jan Hoffmann', 'Produktion');
