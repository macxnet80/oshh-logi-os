# Active Context

## Aktueller Stand (2026-03-24)

### Erledigt
- Next.js 16 Projekt aufgesetzt mit TypeScript, Tailwind v4, ESLint
- Brand Guideline komplett in `globals.css` implementiert (Farben, Fonts, Animationen)
- Supabase Client (Browser + Server) verbunden + DB-Schema live
- DB-Schema in Supabase ausgeführt mit 5 Seed-Mitarbeitern
- Generierte TypeScript-Types via `supabase gen types` (`database.types.ts`)
- UI-Basis-Komponenten: Button, Card, Badge, Input, Select
- Layout: Sticky Header mit Glassmorphism, Navigation
- Dashboard-Page mit Stats-Grid und Quick Action
- Abwesenheitsplaner: Kalender-Grid, Eintrage-Modal, Badge-System
- Server Component (Data Fetching) + Client Component (Interaktivität) Split
- Server Actions für Insert/Delete
- Temporäre anon RLS Policies für Entwicklung
- Flexible-Parkplatzbuchung (Parkshare-Flow) in `logi-os` Dashboard integriert
  - Client-Queries für verfügbare Plätze / Reservierung / Storno / App-Setting
  - UI-States: bereits gebucht, verfügbar, alles belegt
  - Sichtbarkeit für eingeloggte Nutzer mit `profiles.role = flexible` und logi-App-Zugang
- **Abstimmungen (logi-OS):** Tabellen `logi_polls` / `logi_poll_votes`. Nur **Dashboard** zeigt Abstimmungen; `/polls` und `/polls/[id]` leiten auf `/` um. **Admins:** `/polls/new` zum Anlegen + Menü „Abstimmung anlegen“.

### Offen
- Auth implementieren (Login, Middleware, geschützte Routen)
- Abwesenheiten löschen/bearbeiten (UI)
- Dashboard-Stats live aus DB
- Anon RLS Policies durch Auth-basierte ersetzen
- Optional: dedizierte Seite/Navigation für Parkplatzbuchung ergänzen (aktuell im Dashboard)

### Entscheidungen
- Tailwind v4 mit `@theme inline` statt JS-Config
- Supabase gen types für TypeScript-Integration (wichtig: `__InternalSupabase.PostgrestVersion`)
- Server/Client Component Split: Page = Server (fetch), Client = Interaktivität
- 5 Abwesenheitstypen: Urlaub, Frei, Früher gehen, Krank, Homeoffice
- Farbkodierung: Urlaub=Accent, Frei=Blau, Früher=Orange, Krank=Rot, HO=Grün
- Supabase Projekt `psymzrpsxqijjmfdjxov` (shared mit anderen Orendt-Projekten)
