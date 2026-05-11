# Projekt: OSHH-Logi-OS

## Sprache
Antworte auf Deutsch.

## Was das ist
Interne Logistik- und Operations-App fuer ORENDT.
Sie deckt u. a. Login, Check-in, Abwesenheiten, Polls sowie Admin-Bereiche fuer User und Freelancer ab.

## Wichtige Befehle
- Dev: `npm run dev`
- Build: `npm run build`
- Test: `npm run lint`

## Konventionen
- Next.js App Router mit Code unter `src/app`, wiederverwendbare UI in `src/components`.
- Supabase ist zentrale Daten- und Auth-Schicht (`src/lib/supabase/**`).
- Design-Vorgaben werden ueber `DESIGN_SYSTEM.md` projektweit konsistent gehalten.

## Memory
Lies zu Beginn jeder Session `.agents/memory/project.md` und `.agents/memory/current.md`.
Bei `update memory`: aktualisiere `current.md`, `project.md` nur bei Architektur-Aenderungen.
