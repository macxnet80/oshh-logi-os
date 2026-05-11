# Projekt: OSHH-Logi-OS

## Ziel
Zentrale interne Plattform fuer operative Team-Prozesse (Check-in, Abwesenheiten, Polls, Nutzer-/Freelancer-Verwaltung).
Zielgruppe sind interne Mitarbeitende, Freelancer und Admin-Rollen.

## Tech-Stack
Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Supabase (Auth + Postgres), ESLint.

## Architektur
Feature-orientierte Struktur in `src/app/**` mit zugehoerigen Actions und API-Routen.
Geteilte UI-Bausteine in `src/components/**`, Datenzugriff und Policies in `src/lib/**`.

## Entscheidungen & Constraints
Authentifizierung/Autorisierung ueber Supabase und serverseitige Guards.
Design-Standards werden ueber ein gemeinsames `DESIGN_SYSTEM.md` gepflegt und zwischen Projekten synchron gehalten.
