# System Patterns

## Architektur
- Next.js App Router mit Client/Server Components
- Server Components als Default, `"use client"` nur wenn nötig
- Supabase für Auth + DB (später Realtime)

## Komponenten-Struktur
```
src/components/
├── ui/          → Wiederverwendbare Basis-Komponenten
├── layout/      → Header, Navigation
└── absences/    → Feature-spezifisch
```

## Styling-Pattern
- Tailwind v4 mit Custom Theme Tokens
- Orendt Brand Guideline durchgängig
- `font-display` (Sora) für Headlines, `font-body` (Instrument Sans) für Text
- Status-Farben: free/reserved/occupied/released

## Daten-Pattern (aktuell)
- Mock-Daten in `src/lib/mock-data.ts`
- Geplant: Supabase-Queries in Server Components + Client Hooks

## Code-Konventionen
- Deutsche UI-Texte, englischer Code
- forwardRef für Input-Komponenten
- ABSENCE_CONFIG als zentrale Type-Config
