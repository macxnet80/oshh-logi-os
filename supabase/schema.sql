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

-- RLS aktivieren
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;

-- Policies: Alle eingeloggten User können lesen
CREATE POLICY "Employees are viewable by authenticated users"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Absences are viewable by authenticated users"
  ON absences FOR SELECT
  TO authenticated
  USING (true);

-- Policies: User können eigene Abwesenheiten verwalten
CREATE POLICY "Users can insert own absences"
  ON absences FOR INSERT
  TO authenticated
  WITH CHECK (employee_id IN (
    SELECT id FROM employees WHERE email = (SELECT auth.email())
  ));

CREATE POLICY "Users can update own absences"
  ON absences FOR UPDATE
  TO authenticated
  USING (employee_id IN (
    SELECT id FROM employees WHERE email = (SELECT auth.email())
  ));

CREATE POLICY "Users can delete own absences"
  ON absences FOR DELETE
  TO authenticated
  USING (employee_id IN (
    SELECT id FROM employees WHERE email = (SELECT auth.email())
  ));

-- Seed: Beispiel-Mitarbeiter
INSERT INTO employees (email, full_name, department) VALUES
  ('max@orendt.com', 'Max Müller', 'Logistik'),
  ('anna@orendt.com', 'Anna Schmidt', 'Logistik'),
  ('tom@orendt.com', 'Tom Weber', 'Logistik'),
  ('lisa@orendt.com', 'Lisa Fischer', 'Produktion'),
  ('jan@orendt.com', 'Jan Hoffmann', 'Produktion');
