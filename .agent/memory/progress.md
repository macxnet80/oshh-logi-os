# Progress

## v0.1 — MVP Setup (2026-03-12) ✅
- [x] Projekt-Scaffolding (Next.js 16, Tailwind v4, TypeScript)
- [x] Brand Guideline implementiert
- [x] UI-Komponenten (Button, Card, Badge, Input, Select)
- [x] Layout (Header mit Glassmorphism-Navigation)
- [x] Dashboard-Page
- [x] Abwesenheitsplaner mit Kalender-Grid
- [x] Eintrage-Modal
- [x] DB-Schema SQL + live in Supabase
- [x] Supabase-Integration (Server Components + Server Actions)
- [x] Generierte TypeScript-Types
- [x] Build erfolgreich

## v0.2 — Auth + Polish (geplant)
- [ ] Auth (Login/Logout mit Supabase Auth)
- [ ] Middleware für geschützte Routen
- [ ] Anon RLS Policies durch Auth-basierte ersetzen
- [ ] Abwesenheiten bearbeiten/löschen (UI)

## v0.2.1 — Flexible Parkplatzbuchung (2026-03-24) ✅
- [x] Parkshare-Flex-Booking-Verhalten in `logi-os` übernommen
- [x] Supabase-Clientlogik für verfügbare Plätze + Reservierung + Storno ergänzt
- [x] Dashboard zeigt Buchungsmodul für `profiles.role = flexible` (mit logi-App-Zugang)
- [x] Lint für geänderte Dateien erfolgreich

## v0.2.2 — Abstimmungen mit logi_polls (2026-03-24) ✅
- [x] Dedizierte Tabellen `logi_polls` / `logi_poll_votes` + RLS (siehe `supabase/sql/logi_polls_tables.sql`)
- [x] Types, Server Actions, Listen-/Detailseiten, Dashboard-Integration
- [x] `PollVote` nutzt nur noch `pollId`; alte Poll-Helfer (`aggregate`, `responses-read`, `constants`) entfernt
- [x] `npm run build` erfolgreich

## v0.3 — Erweiterungen (geplant)
- [ ] Dashboard-Stats live aus DB
- [ ] Filterfunktion nach Abteilung
- [ ] Realtime-Updates
- [ ] Weitere Features (TBD)
