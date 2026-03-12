# Tech Context

## Stack
- Next.js 16.1.6 (App Router, Turbopack)
- React 19 mit React Compiler
- Tailwind CSS v4 (CSS-basierte Config via `@theme inline`)
- TypeScript strict mode
- Supabase JS v2 + SSR

## Projekt-Verzeichnis
- `/Users/larsmacario/Desktop/logi-os` (npm-Name: `logi-os`)
- Hinweis: Ordner musste lowercase sein wegen npm naming restrictions

## Key Files
- `src/app/globals.css` — Brand Guideline Tokens (Tailwind v4 @theme)
- `src/lib/types.ts` — TypeScript-Typen + ABSENCE_CONFIG
- `src/lib/supabase/client.ts` — Browser Supabase Client
- `src/lib/supabase/server.ts` — Server Supabase Client
- `src/lib/mock-data.ts` — Temporäre Mock-Daten
- `supabase/schema.sql` — DB-Schema + RLS Policies + Seed Data

## Dependencies
- `@supabase/supabase-js`, `@supabase/ssr`
- `lucide-react`
