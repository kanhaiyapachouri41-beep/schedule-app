# Class Schedule PWA — Design Spec
**Date:** 2026-06-03
**Project:** IIM Kozhikode PGP-29 Personalised Class Schedule

---

## Problem

Each term, the college shares a public Google Sheet with the full class schedule for all sections and programmes. Students are not enrolled in all subjects. There is no personalised view — students must manually scan the sheet to find their classes. There is no notification system.

## Goal

A PWA that students set up once, shows their personal schedule, and exports a calendar file that triggers a 15-minute notification before each class via Google Calendar or Apple Calendar.

---

## Data Source

**Google Sheet:** Public ("anyone with the link can view"), shared by the college each term.

**Sheet 1 — Term IV Schedule:**
- Column A: Date — when fetched as CSV from Google Sheets, arrives as a formatted date string (e.g. `"June 9, 2026"` or `"09/06/2026"`) → parsed to ISO date. Not an Excel serial number.
- Column B: Time slot (e.g. `09.15-10.30` → parsed to `09:15` / `10:30`)
- Columns C–J: Subject abbreviations per section/classroom (D1, D2, D3, D4, E3, E4, E1, E2)
- Special rows: `LUNCH BREAK`, `MEETING`, `MID TERM EXAMINATION` — these are skipped
- Section column header = classroom name (e.g. a class in column D3 → classroom D3)

**Programme → column mapping:**
| Column | Header | Programme |
|--------|--------|-----------|
| C | D1 | PGP-29 |
| D | D2 | PGP-29 |
| E | D3 | PGP-29 |
| F | D4 | PGP-29 |
| G | E3 | PGP-29 |
| H | E4 | PGP-29 |
| I | E1 | PGPFIN06 |
| J | E2 | PGPLSM06 |

**Sheet 2 — Course Details:**
- Maps subject abbreviation → full name, faculty, programme, credits
- Programmes: PGP-29, PGPFIN06, PGPLSM06

**Classroom derivation:** The classroom is the column header (D1–E4) of the column in which a subject appears. No separate classroom column exists.

**Batch suffixes:** Some subjects are split into batches (e.g. GT-A, GT-B, GT-C for Game Theory). The batch suffix is part of the subject string in the schedule. Students select their specific batch during onboarding.

---

## Architecture

```
Google Sheet (public CSV export URL)
        │
        ▼
Next.js API Route — /api/schedule
  - Fetches CSV from env var GOOGLE_SHEET_CSV_URL (server-side, avoids CORS)
  - Parses rows into structured JSON
  - Cache-Control: s-maxage=900 (Vercel edge, 15-min cache)
        │
        ▼
React Frontend (Next.js App Router, PWA)
  - Checks localStorage on load
  - Routes to /onboarding (first visit) or /home (returning)
  - Fetches /api/schedule, filters to user's selected subjects
  - Renders Today / Week / Full Term views
  - Exports personalised .ics file
```

---

## Data Model

Each class entry returned by `/api/schedule`:

```ts
interface ClassEntry {
  classroom: string      // "D1" | "D2" | "D3" | "D4" | "E3" | "E4" | "E1" | "E2"
  subject: string        // Abbreviation as in sheet, e.g. "GT-A"
  subjectFull: string    // Full name from Sheet 2, e.g. "Game Theory"
  faculty: string        // e.g. "Prof. Anirban Ghatak"
  date: string           // ISO: "2026-06-09"
  dtStart: string        // "20260609T091500"
  dtEnd: string          // "20260609T103000"
}
```

---

## Onboarding Flow (one-time)

**Step 1 — Programme selection:**
Student picks one of: PGP-29 | PGPFIN06 | PGPLSM06

**Step 2 — Subject selection:**
- App scans Sheet 1 to find all subject strings for the selected programme's columns
- Cross-references Sheet 2 for full names
- Groups batched subjects together:
  ```
  Game Theory          [A]  [B]  [C]   ← pick one
  IAPM                 [A]  [B]         ← pick one
  Financial Crisis      ✓               ← tick / untick
  ```
- Student selects exactly their enrolled subjects + batches
- Saved to localStorage as `{ programme, subjects: string[] }`

---

## Home Screen

**Three tabs:**

1. **Today** — classes for the current date, chronological order
2. **Week** — 7-day scrollable view
3. **Full Term** — all classes grouped by date, searchable

**Class card layout (priority order):**
1. Subject full name (large, prominent)
2. Classroom (prominent)
3. Time (start–end)
4. Faculty (smaller, secondary)

**Export button** — always visible in header. Generates and downloads a `.ics` file containing all the student's classes for the term.

**Schedule refresh** — on each app open, silently re-fetches `/api/schedule` in the background. If content differs from last fetch, shows a toast: _"Schedule updated — re-export your calendar to get the latest changes."_

**Edit preferences** — accessible from settings/profile. Re-runs onboarding flow.

---

## ICS Export

Each class becomes a calendar event:

```
SUMMARY: Game Theory (Batch A) — D1
LOCATION: Classroom D1
DESCRIPTION: Prof. Anirban Ghatak
DTSTART;TZID=Asia/Kolkata:20260609T101500
DTEND;TZID=Asia/Kolkata:20260609T120000
BEGIN:VALARM
  TRIGGER:-PT15M
  ACTION:DISPLAY
  DESCRIPTION:Class starting in 15 minutes
END:VALARM
```

Timezone: `Asia/Kolkata` (IST, UTC+5:30) — hardcoded, no DST ambiguity.
Library: `ics` npm package.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| ICS generation | `ics` npm package |
| Hosting | Vercel (free tier) |
| Persistence | localStorage (no auth, no backend DB) |
| Caching | Vercel edge cache via `Cache-Control` header |
| Config | `GOOGLE_SHEET_CSV_URL` env variable (set in Vercel dashboard) |

---

## File Structure

```
/app
  /api/schedule/route.ts     — fetch + cache Google Sheet, return JSON
  /page.tsx                  — root: check localStorage, redirect
  /onboarding/page.tsx       — programme → subject picker
  /home/page.tsx             — Today / Week / Full Term + Export

/lib
  parseSheet.ts              — CSV rows → ClassEntry[]
  buildICS.ts                — ClassEntry[] → .ics string
  storage.ts                 — localStorage helpers (get/set preferences)

/public
  manifest.json              — PWA manifest
  sw.js                      — service worker (for installability)
```

---

## Out of Scope (v1)

- Shareable schedule URLs (planned for v2 — Approach C)
- User accounts / cloud sync
- Push notifications via Web Push (handled by calendar app instead)
- Admin interface for uploading schedules

---

## Future (v2)

- Encode preferences in URL: `scheduleapp.com/s?programme=PGP-29&subjects=GT-A,FIS,CMO`
- Students share a link; recipient gets an identical schedule setup instantly
