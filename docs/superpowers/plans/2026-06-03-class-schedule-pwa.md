# Class Schedule PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js 14 PWA where IIM Kozhikode students pick their subjects once and get a personalised daily/weekly/term schedule view plus a downloadable `.ics` file with 15-minute pre-class reminders for Google/Apple Calendar.

**Architecture:** Next.js 14 App Router with a `/api/schedule` route that server-side fetches and caches both Google Sheets CSVs (schedule + course details) for 15 minutes. The frontend reads preferences from `localStorage`, filters the parsed data client-side, and generates the `.ics` using the `ics` package. No database, no auth, no backend beyond the Vercel deployment.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, papaparse, date-fns, ics, Jest + React Testing Library

> **UI tasks (Tasks 9–14):** Before implementing each page/component, invoke the `frontend-design` skill with the component description to produce a polished, production-grade interface. The plan provides the data logic and structure; the skill provides the design quality.

---

## File Map

```
schedule-app/
├── app/
│   ├── api/schedule/route.ts          NEW — fetch + cache both Sheets CSVs, return ClassEntry[]
│   ├── onboarding/page.tsx            NEW — programme → subject picker
│   ├── home/page.tsx                  NEW — Today/Week/Full Term tabs + Export
│   ├── layout.tsx                     MODIFY — add PWA meta, Sonner toaster
│   └── page.tsx                       NEW — redirect based on localStorage
├── components/
│   ├── onboarding/ProgrammePicker.tsx NEW — step 1 of onboarding
│   ├── onboarding/SubjectPicker.tsx   NEW — step 2 of onboarding
│   ├── ClassCard.tsx                  NEW — card: subject, classroom, time, faculty
│   ├── TodayTab.tsx                   NEW — today's classes
│   ├── WeekTab.tsx                    NEW — 7-day view
│   ├── FullTermTab.tsx                NEW — all classes, searchable
│   └── ExportButton.tsx               NEW — generate + download .ics
├── lib/
│   ├── types.ts                       NEW — ClassEntry, UserPreferences, CourseInfo, Programme
│   ├── storage.ts                     NEW — localStorage helpers
│   ├── parseCourses.ts                NEW — Sheet 2 CSV → Map<abbr, CourseInfo>
│   ├── parseSheet.ts                  NEW — Sheet 1 CSV + courseMap → ClassEntry[]
│   └── buildICS.ts                    NEW — ClassEntry[] → .ics string
├── __tests__/
│   ├── storage.test.ts                NEW
│   ├── parseCourses.test.ts           NEW
│   ├── parseSheet.test.ts             NEW
│   └── buildICS.test.ts               NEW
├── public/
│   ├── manifest.json                  NEW — PWA manifest
│   └── icons/                         NEW — 192×192 and 512×512 app icons
├── .env.local                         NEW — Google Sheet URLs (not committed)
├── .env.example                       NEW — template
├── jest.config.ts                     NEW
├── jest.setup.ts                      NEW
└── next.config.ts                     MODIFY — PWA headers
```

---

### Task 1: Bootstrap the Project

**Files:**
- Create: `schedule-app/` (Next.js root, already has `docs/`)
- Create: `.env.local`
- Create: `.env.example`
- Create: `jest.config.ts`
- Create: `jest.setup.ts`

- [ ] **Step 1: Initialise Next.js inside the existing directory**

From a terminal in `C:\Users\KANHAIYA\schedule-app`:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --no-turbopack
```

When prompted "A directory with existing files… continue?" → press `Y`.  
Accept all other defaults.

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install papaparse date-fns ics sonner
npm install --save-dev @types/papaparse
```

- [ ] **Step 3: Initialise shadcn/ui**

```bash
npx shadcn@latest init
```

Choose: style `Default`, base colour `Slate`, CSS variables `yes`.

Then add the components used in this project:

```bash
npx shadcn@latest add button card tabs checkbox badge input
```

- [ ] **Step 4: Install test dependencies**

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest
```

- [ ] **Step 5: Create `jest.config.ts`**

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
}

export default createJestConfig(config)
```

- [ ] **Step 6: Create `jest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Create `.env.example`**

```
# Paste the full public CSV export URL for each sheet.
# In Google Sheets: File → Share → Publish to web → CSV → Copy link.
# Or construct: https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv&gid=GID

GOOGLE_SHEET_SCHEDULE_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0
GOOGLE_SHEET_COURSES_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=YOUR_COURSES_GID
```

- [ ] **Step 8: Create `.env.local`** — fill in the real URLs from the college's Google Sheet

```
GOOGLE_SHEET_SCHEDULE_URL=<paste real URL>
GOOGLE_SHEET_COURSES_URL=<paste real URL>
```

- [ ] **Step 9: Add `test` script to `package.json`** (if not already present)

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch"
}
```

- [ ] **Step 10: Commit**

```bash
git init
git add -A
git commit -m "chore: bootstrap Next.js PWA project with test setup"
```

---

### Task 2: TypeScript Types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Create `lib/types.ts`**

```typescript
export type Programme = 'PGP-29' | 'PGPFIN06' | 'PGPLSM06'

export interface ClassEntry {
  classroom: string      // "D1" | "D2" | "D3" | "D4" | "E3" | "E4" | "E1" | "E2"
  subject: string        // exactly as in sheet, e.g. "GT-A" or "FC"
  subjectFull: string    // full name from Sheet 2, e.g. "Game Theory"
  faculty: string        // e.g. "Prof. Anirban Ghatak"
  date: string           // ISO "2026-06-09"
  dtStart: string        // "20260609T091500"
  dtEnd: string          // "20260609T103000"
  programme: Programme
}

export interface CourseInfo {
  abbreviation: string
  fullName: string
  faculty: string
  programme: Programme
}

export interface UserPreferences {
  programme: Programme
  subjects: string[]    // exact subject strings, e.g. ["GT-A", "FIS", "CMO"]
}

export interface SubjectGroup {
  base: string          // "GT"
  fullName: string      // "Game Theory"
  batches: string[]     // ["A", "B", "C"] — empty means no batches
  subjects: string[]    // ["GT-A", "GT-B", "GT-C"] or ["FC"]
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add shared TypeScript types"
```

---

### Task 3: Storage Utility (TDD)

**Files:**
- Create: `__tests__/storage.test.ts`
- Create: `lib/storage.ts`

- [ ] **Step 1: Write the failing tests in `__tests__/storage.test.ts`**

```typescript
import { getPreferences, setPreferences, getScheduleHash, setScheduleHash, clearPreferences } from '@/lib/storage'
import { UserPreferences } from '@/lib/types'

const store: Record<string, string> = {}
const localStorageMock = {
  getItem: jest.fn((k: string) => store[k] ?? null),
  setItem: jest.fn((k: string, v: string) => { store[k] = v }),
  removeItem: jest.fn((k: string) => { delete store[k] }),
  clear: jest.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

const PREFS: UserPreferences = { programme: 'PGP-29', subjects: ['GT-A', 'FIS'] }

beforeEach(() => localStorageMock.clear())

describe('storage', () => {
  it('returns null when no preferences are stored', () => {
    expect(getPreferences()).toBeNull()
  })

  it('stores and retrieves preferences', () => {
    setPreferences(PREFS)
    expect(getPreferences()).toEqual(PREFS)
  })

  it('returns null hash when not set', () => {
    expect(getScheduleHash()).toBeNull()
  })

  it('stores and retrieves schedule hash', () => {
    setScheduleHash('abc123')
    expect(getScheduleHash()).toBe('abc123')
  })

  it('clears both preferences and hash', () => {
    setPreferences(PREFS)
    setScheduleHash('abc123')
    clearPreferences()
    expect(getPreferences()).toBeNull()
    expect(getScheduleHash()).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- storage
```

Expected: `Cannot find module '@/lib/storage'`

- [ ] **Step 3: Implement `lib/storage.ts`**

```typescript
import { UserPreferences } from './types'

const PREFS_KEY = 'schedule_prefs'
const HASH_KEY = 'schedule_hash'

export function getPreferences(): UserPreferences | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(PREFS_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as UserPreferences } catch { return null }
}

export function setPreferences(prefs: UserPreferences): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}

export function getScheduleHash(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(HASH_KEY)
}

export function setScheduleHash(hash: string): void {
  localStorage.setItem(HASH_KEY, hash)
}

export function clearPreferences(): void {
  localStorage.removeItem(PREFS_KEY)
  localStorage.removeItem(HASH_KEY)
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- storage
```

Expected: `5 passed`

- [ ] **Step 5: Commit**

```bash
git add lib/storage.ts __tests__/storage.test.ts
git commit -m "feat: add localStorage storage utility"
```

---

### Task 4: Course Details Parser (TDD)

**Files:**
- Create: `__tests__/parseCourses.test.ts`
- Create: `lib/parseCourses.ts`

- [ ] **Step 1: Write the failing tests in `__tests__/parseCourses.test.ts`**

```typescript
import { parseCourses } from '@/lib/parseCourses'

const SAMPLE_CSV = `PGP 29/FIN 06/LSM 06 Term IV
Sl.No,Programme,Course,Section,Abbr.,Credit,Faculty
1,PGP 29,Game Theory,ABC,GT,3,Prof. Anirban Ghatak
2,,Investment Analysis and Portfolio Management,AB,IAPM,3,Prof. Aravind Sampath
1,PGPFIN06,Strategic Thinking (FIN-Core),A,ST (FIN-Core),3,Prof. Pratima Verma
1,PGPLSM06,Managing Business with Generative and Agentic AI,A,MBGAI (LSM),3,Prof. Swati Jain`

describe('parseCourses', () => {
  it('maps abbreviation to full name and faculty', () => {
    const map = parseCourses(SAMPLE_CSV)
    expect(map.get('GT')?.fullName).toBe('Game Theory')
    expect(map.get('GT')?.faculty).toBe('Prof. Anirban Ghatak')
  })

  it('assigns PGP-29 programme to PGP 29 entries', () => {
    const map = parseCourses(SAMPLE_CSV)
    expect(map.get('GT')?.programme).toBe('PGP-29')
  })

  it('inherits programme from previous row when column is empty', () => {
    const map = parseCourses(SAMPLE_CSV)
    expect(map.get('IAPM')?.programme).toBe('PGP-29')
  })

  it('handles programme-specific abbreviations with spaces and parens', () => {
    const map = parseCourses(SAMPLE_CSV)
    expect(map.get('ST (FIN-Core)')?.programme).toBe('PGPFIN06')
    expect(map.get('MBGAI (LSM)')?.programme).toBe('PGPLSM06')
  })

  it('skips header and non-data rows', () => {
    const map = parseCourses(SAMPLE_CSV)
    expect(map.has('Sl.No')).toBe(false)
    expect(map.has('PGP 29/FIN 06/LSM 06 Term IV')).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- parseCourses
```

Expected: `Cannot find module '@/lib/parseCourses'`

- [ ] **Step 3: Implement `lib/parseCourses.ts`**

```typescript
import Papa from 'papaparse'
import { CourseInfo, Programme } from './types'

const PROGRAMME_NAME_MAP: Record<string, Programme> = {
  'PGP 29': 'PGP-29',
  'PGPFIN06': 'PGPFIN06',
  'PGPLSM06': 'PGPLSM06',
}

export function parseCourses(csv: string): Map<string, CourseInfo> {
  const { data } = Papa.parse<string[]>(csv, { header: false, skipEmptyLines: true })
  const courseMap = new Map<string, CourseInfo>()
  let currentProgramme: Programme = 'PGP-29'

  for (const row of data) {
    const slNo = row[0]?.trim()
    if (!slNo || isNaN(Number(slNo))) continue  // skip header/title rows

    const programmeName = row[1]?.trim()
    const fullName = row[2]?.trim()
    const abbreviation = row[4]?.trim()
    const faculty = row[6]?.trim()

    if (!abbreviation || !fullName) continue

    if (programmeName && PROGRAMME_NAME_MAP[programmeName]) {
      currentProgramme = PROGRAMME_NAME_MAP[programmeName]
    }

    courseMap.set(abbreviation, {
      abbreviation,
      fullName,
      faculty: faculty || '',
      programme: currentProgramme,
    })
  }

  return courseMap
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- parseCourses
```

Expected: `5 passed`

- [ ] **Step 5: Commit**

```bash
git add lib/parseCourses.ts __tests__/parseCourses.test.ts
git commit -m "feat: add course details CSV parser"
```

---

### Task 5: Schedule Sheet Parser (TDD)

**Files:**
- Create: `__tests__/parseSheet.test.ts`
- Create: `lib/parseSheet.ts`

- [ ] **Step 1: Write the failing tests in `__tests__/parseSheet.test.ts`**

```typescript
import { parseSheet, groupSubjectsByProgramme } from '@/lib/parseSheet'
import { parseCourses } from '@/lib/parseCourses'

const COURSES_CSV = `PGP 29/FIN 06/LSM 06 Term IV
Sl.No,Programme,Course,Section,Abbr.,Credit,Faculty
1,PGP 29,Game Theory,ABC,GT,3,Prof. Anirban Ghatak
2,,Global Business Strategy,AB,GBS,3,Prof. Venkataraman S
1,PGPFIN06,Strategic Thinking (FIN-Core),A,ST (FIN-Core),3,Prof. Pratima Verma`

// Mimics the real sheet structure: 4 header rows, then section-header row, then data
const SCHEDULE_CSV = `INDIAN INSTITUTE OF MANAGEMENT KOZHIKODE
PROGRAMMES OFFICE
PGP 29/FIN 06/LSM 06 CLASS SCHEDULE -TERM IV
DATE,TIME,PGP-29,PGP-29,PGP-29,PGP-29,PGP-29,PGP-29,PGPFIN06,PGPLSM06
,,D1,D2,D3,D4,E3,E4,E1,E2
,REGISTRATION (June 08th & 09th 2026),,,,,,,,
"Tuesday, 9 June, 2026",10.45-12.00,GT-A,,GBS-A,,,,,
"Tuesday, 9 June, 2026",13.30-14.30,LUNCH BREAK,,,,,,, 
"Tuesday, 9 June, 2026",09.15-10.30,,,,,,,ST (FIN-Core),`

describe('parseSheet', () => {
  const courseMap = parseCourses(COURSES_CSV)
  const entries = parseSheet(SCHEDULE_CSV, courseMap)

  it('resolves subject full name from course map', () => {
    const gt = entries.find(e => e.subject === 'GT-A')
    expect(gt?.subjectFull).toBe('Game Theory')
    expect(gt?.faculty).toBe('Prof. Anirban Ghatak')
  })

  it('assigns classroom from column header', () => {
    const gt = entries.find(e => e.subject === 'GT-A')
    expect(gt?.classroom).toBe('D1')
    const gbs = entries.find(e => e.subject === 'GBS-A')
    expect(gbs?.classroom).toBe('D3')
  })

  it('formats dtStart and dtEnd correctly from time slot', () => {
    const gt = entries.find(e => e.subject === 'GT-A')
    expect(gt?.dtStart).toBe('20260609T104500')
    expect(gt?.dtEnd).toBe('20260609T120000')
  })

  it('skips LUNCH BREAK rows', () => {
    expect(entries.every(e => e.subject !== 'LUNCH BREAK')).toBe(true)
  })

  it('skips empty registration rows', () => {
    expect(entries.find(e => e.subject.startsWith('REGISTRATION'))).toBeUndefined()
  })

  it('assigns PGPFIN06 programme to E1 column', () => {
    const st = entries.find(e => e.subject === 'ST (FIN-Core)')
    expect(st?.programme).toBe('PGPFIN06')
    expect(st?.classroom).toBe('E1')
  })
})

describe('groupSubjectsByProgramme', () => {
  const courseMap = parseCourses(COURSES_CSV)
  const entries = parseSheet(SCHEDULE_CSV, courseMap)

  it('groups batched subjects together', () => {
    const groups = groupSubjectsByProgramme(entries, 'PGP-29')
    const gt = groups.find(g => g.base === 'GT')
    expect(gt?.batches).toContain('A')
    expect(gt?.subjects).toContain('GT-A')
  })

  it('returns non-batched subjects with empty batches array', () => {
    const groups = groupSubjectsByProgramme(entries, 'PGPFIN06')
    const st = groups.find(g => g.base === 'ST (FIN-Core)')
    expect(st?.batches).toHaveLength(0)
    expect(st?.subjects).toEqual(['ST (FIN-Core)'])
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- parseSheet
```

Expected: `Cannot find module '@/lib/parseSheet'`

- [ ] **Step 3: Implement `lib/parseSheet.ts`**

```typescript
import Papa from 'papaparse'
import { parse as dateParse, isValid } from 'date-fns'
import { ClassEntry, CourseInfo, Programme, SubjectGroup } from './types'

const SECTION_PROGRAMME: Record<string, Programme> = {
  D1: 'PGP-29', D2: 'PGP-29', D3: 'PGP-29',
  D4: 'PGP-29', E3: 'PGP-29', E4: 'PGP-29',
  E1: 'PGPFIN06',
  E2: 'PGPLSM06',
}

const SKIP_SUBJECTS = new Set([
  'LUNCH BREAK', 'MEETING', 'MID TERM EXAMINATION', 'REGISTRATION',
])

const DATE_FORMATS = [
  'EEEE, d MMMM, yyyy',
  'EEEE, MMMM d, yyyy',
  'd MMMM yyyy',
  'MMMM d, yyyy',
  'dd/MM/yyyy',
  'MM/dd/yyyy',
  'd-MMM-yyyy',
]

function parseDate(raw: string): string | null {
  for (const fmt of DATE_FORMATS) {
    const d = dateParse(raw.trim(), fmt, new Date())
    if (isValid(d)) return d.toISOString().split('T')[0]
  }
  const d = new Date(raw)
  if (isValid(d)) return d.toISOString().split('T')[0]
  return null
}

function parseTime(raw: string): { start: string; end: string } | null {
  const m = raw.trim().match(/^(\d{2})\.(\d{2})-(\d{2})\.(\d{2})$/)
  if (!m) return null
  return { start: `${m[1]}:${m[2]}`, end: `${m[3]}:${m[4]}` }
}

function toDt(date: string, time: string): string {
  return date.replace(/-/g, '') + 'T' + time.replace(':', '') + '00'
}

function lookupCourse(subject: string, map: Map<string, CourseInfo>): CourseInfo | null {
  if (map.has(subject)) return map.get(subject)!
  const base = subject.replace(/-[A-C]$/, '')
  return map.get(base) ?? null
}

export function parseSheet(csv: string, courseMap: Map<string, CourseInfo>): ClassEntry[] {
  const { data } = Papa.parse<string[]>(csv, { header: false, skipEmptyLines: false })
  const entries: ClassEntry[] = []

  // Find the row where col[2] === 'D1' and col[3] === 'D2'
  let headerIdx = -1
  for (let i = 0; i < data.length; i++) {
    if (data[i][2]?.trim() === 'D1' && data[i][3]?.trim() === 'D2') {
      headerIdx = i
      break
    }
  }
  if (headerIdx === -1) return entries

  const sectionHeaders = data[headerIdx].slice(2).map(h => h.trim())
  // ['D1', 'D2', 'D3', 'D4', 'E3', 'E4', 'E1', 'E2']

  for (let i = headerIdx + 1; i < data.length; i++) {
    const row = data[i]
    const dateRaw = row[0]?.trim()
    const timeRaw = row[1]?.trim()
    if (!dateRaw || !timeRaw) continue

    const date = parseDate(dateRaw)
    if (!date) continue

    const time = parseTime(timeRaw)
    if (!time) continue

    for (let col = 0; col < sectionHeaders.length; col++) {
      const classroom = sectionHeaders[col]
      const subject = row[col + 2]?.trim()
      if (!subject || !classroom) continue
      if (SKIP_SUBJECTS.has(subject)) continue

      const course = lookupCourse(subject, courseMap)
      entries.push({
        classroom,
        subject,
        subjectFull: course?.fullName ?? subject,
        faculty: course?.faculty ?? '',
        date,
        dtStart: toDt(date, time.start),
        dtEnd: toDt(date, time.end),
        programme: SECTION_PROGRAMME[classroom] ?? 'PGP-29',
      })
    }
  }

  return entries
}

export function groupSubjectsByProgramme(
  entries: ClassEntry[],
  programme: Programme,
): SubjectGroup[] {
  const map = new Map<string, SubjectGroup>()

  for (const entry of entries) {
    if (entry.programme !== programme) continue

    const batchMatch = entry.subject.match(/-([A-C])$/)
    const base = batchMatch ? entry.subject.slice(0, -2) : entry.subject
    const batch = batchMatch?.[1] ?? null

    if (!map.has(base)) {
      map.set(base, { base, fullName: entry.subjectFull, batches: [], subjects: [] })
    }
    const group = map.get(base)!
    if (batch && !group.batches.includes(batch)) group.batches.push(batch)
    if (!group.subjects.includes(entry.subject)) group.subjects.push(entry.subject)
  }

  // Sort batches alphabetically
  for (const g of map.values()) g.batches.sort()

  return Array.from(map.values()).sort((a, b) => a.fullName.localeCompare(b.fullName))
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- parseSheet
```

Expected: `8 passed`

- [ ] **Step 5: Commit**

```bash
git add lib/parseSheet.ts __tests__/parseSheet.test.ts
git commit -m "feat: add schedule CSV parser and subject grouping"
```

---

### Task 6: ICS Builder (TDD)

**Files:**
- Create: `__tests__/buildICS.test.ts`
- Create: `lib/buildICS.ts`

- [ ] **Step 1: Write the failing tests in `__tests__/buildICS.test.ts`**

```typescript
import { buildICS } from '@/lib/buildICS'
import { ClassEntry } from '@/lib/types'

const ENTRIES: ClassEntry[] = [
  {
    classroom: 'D1',
    subject: 'GT-A',
    subjectFull: 'Game Theory',
    faculty: 'Prof. Anirban Ghatak',
    date: '2026-06-09',
    dtStart: '20260609T104500',
    dtEnd: '20260609T120000',
    programme: 'PGP-29',
  },
  {
    classroom: 'D3',
    subject: 'FC',
    subjectFull: 'Financial Crisis',
    faculty: 'Prof. Mridul Kumar Saggar',
    date: '2026-06-09',
    dtStart: '20260609T091500',
    dtEnd: '20260609T103000',
    programme: 'PGP-29',
  },
]

describe('buildICS', () => {
  let ics: string
  beforeAll(() => { ics = buildICS(ENTRIES) })

  it('generates a valid ICS envelope', () => {
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('END:VEVENT')
  })

  it('formats batched subject title as "Name (Batch X) — CLASSROOM"', () => {
    expect(ics).toContain('Game Theory (Batch A) — D1')
  })

  it('formats non-batched subject title as "Name — CLASSROOM"', () => {
    expect(ics).toContain('Financial Crisis — D3')
  })

  it('includes VALARM with 15-minute trigger', () => {
    expect(ics).toContain('BEGIN:VALARM')
    expect(ics).toContain('-PT15M')
    expect(ics).toContain('END:VALARM')
  })

  it('includes correct start and end datetimes', () => {
    expect(ics).toContain('20260609T104500')
    expect(ics).toContain('20260609T120000')
  })

  it('includes location and description', () => {
    expect(ics).toContain('Classroom D1')
    expect(ics).toContain('Prof. Anirban Ghatak')
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- buildICS
```

Expected: `Cannot find module '@/lib/buildICS'`

- [ ] **Step 3: Implement `lib/buildICS.ts`**

```typescript
import { createEvents, EventAttributes } from 'ics'
import { ClassEntry } from './types'

type DateArray = [number, number, number, number, number]

function toDtArray(dt: string): DateArray {
  return [
    parseInt(dt.slice(0, 4)),
    parseInt(dt.slice(4, 6)),
    parseInt(dt.slice(6, 8)),
    parseInt(dt.slice(9, 11)),
    parseInt(dt.slice(11, 13)),
  ]
}

function buildTitle(entry: ClassEntry): string {
  const batchMatch = entry.subject.match(/-([A-C])$/)
  const batch = batchMatch ? ` (Batch ${batchMatch[1]})` : ''
  return `${entry.subjectFull}${batch} — ${entry.classroom}`
}

export function buildICS(entries: ClassEntry[]): string {
  const events: EventAttributes[] = entries.map((e) => ({
    start: toDtArray(e.dtStart),
    end: toDtArray(e.dtEnd),
    title: buildTitle(e),
    location: `Classroom ${e.classroom}`,
    description: e.faculty,
    alarms: [{
      action: 'display',
      description: 'Class starting in 15 minutes',
      trigger: { minutes: 15, before: true },
    }],
  }))

  const { error, value } = createEvents(events)
  if (error || !value) throw new Error(`ICS generation failed: ${error?.message}`)
  return value
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- buildICS
```

Expected: `6 passed`

- [ ] **Step 5: Commit**

```bash
git add lib/buildICS.ts __tests__/buildICS.test.ts
git commit -m "feat: add ICS builder with 15-minute VALARM"
```

---

### Task 7: API Route

**Files:**
- Create: `app/api/schedule/route.ts`

- [ ] **Step 1: Create `app/api/schedule/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { parseCourses } from '@/lib/parseCourses'
import { parseSheet } from '@/lib/parseSheet'

export const revalidate = 900 // Vercel ISR: re-fetch every 15 minutes

export async function GET() {
  const scheduleUrl = process.env.GOOGLE_SHEET_SCHEDULE_URL
  const coursesUrl = process.env.GOOGLE_SHEET_COURSES_URL

  if (!scheduleUrl || !coursesUrl) {
    return NextResponse.json({ error: 'Sheet URLs not configured' }, { status: 500 })
  }

  try {
    const [scheduleRes, coursesRes] = await Promise.all([
      fetch(scheduleUrl, { next: { revalidate: 900 } }),
      fetch(coursesUrl, { next: { revalidate: 900 } }),
    ])

    if (!scheduleRes.ok || !coursesRes.ok) {
      throw new Error('Failed to fetch Google Sheet')
    }

    const [scheduleCsv, coursesCsv] = await Promise.all([
      scheduleRes.text(),
      coursesRes.text(),
    ])

    const courseMap = parseCourses(coursesCsv)
    const classes = parseSheet(scheduleCsv, courseMap)

    return NextResponse.json(
      { classes },
      { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=60' } },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verify the route works locally**

```bash
npm run dev
```

Open `http://localhost:3000/api/schedule` in a browser.  
Expected: JSON response `{ "classes": [...] }` with hundreds of entries.  
If you see `{ "error": "Sheet URLs not configured" }`, confirm `.env.local` has both URLs set.

- [ ] **Step 3: Commit**

```bash
git add app/api/schedule/route.ts
git commit -m "feat: add /api/schedule route with 15-min Vercel edge cache"
```

---

### Task 8: Root Page — Routing Logic

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `app/page.tsx` with routing logic**

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPreferences } from '@/lib/storage'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const prefs = getPreferences()
    router.replace(prefs ? '/home' : '/onboarding')
  }, [router])

  return null
}
```

- [ ] **Step 2: Add Sonner toaster and PWA meta to `app/layout.tsx`**

Open `app/layout.tsx`. Add the Sonner `<Toaster />` and PWA viewport meta. The file should look like this:

```typescript
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My Schedule',
  description: 'Personalised class schedule for IIM Kozhikode students',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'My Schedule' },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx app/layout.tsx
git commit -m "feat: add root routing and layout with PWA meta"
```

---

### Task 9: Onboarding — Programme & Subject Picker

> **Before implementing the UI:** Invoke the `frontend-design` skill with this brief: *"Onboarding flow for a class schedule PWA. Step 1: pick programme (PGP-29, PGPFIN06, PGPLSM06) as large tappable cards. Step 2: subject selection list with batched subjects showing inline [A] [B] [C] batch buttons and non-batched subjects as checkboxes. Mobile-first, dark slate theme, clean and academic-feeling."*

**Files:**
- Create: `app/onboarding/page.tsx`
- Create: `components/onboarding/ProgrammePicker.tsx`
- Create: `components/onboarding/SubjectPicker.tsx`

- [ ] **Step 1: Create `components/onboarding/ProgrammePicker.tsx`**

```typescript
'use client'

import { Programme } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'

const PROGRAMMES: { value: Programme; label: string; description: string }[] = [
  { value: 'PGP-29', label: 'PGP-29', description: 'Post Graduate Programme — Batch 29' },
  { value: 'PGPFIN06', label: 'PGP Finance 06', description: 'Finance specialisation' },
  { value: 'PGPLSM06', label: 'PGP LSM 06', description: 'Liberal Studies & Management' },
]

interface Props {
  onSelect: (p: Programme) => void
}

export function ProgrammePicker({ onSelect }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Welcome</h1>
      <p className="text-muted-foreground">Select your programme to get started.</p>
      <div className="flex flex-col gap-3 mt-2">
        {PROGRAMMES.map((p) => (
          <Card
            key={p.value}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelect(p.value)}
          >
            <CardContent className="pt-5 pb-5">
              <div className="font-semibold text-lg">{p.label}</div>
              <div className="text-sm text-muted-foreground">{p.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/onboarding/SubjectPicker.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { SubjectGroup, Programme } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

interface Props {
  groups: SubjectGroup[]
  programme: Programme
  onDone: (selected: string[]) => void
}

export function SubjectPicker({ groups, programme, onDone }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggleSubject(subject: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(subject)) next.delete(subject)
      else next.add(subject)
      return next
    })
  }

  function selectBatch(group: SubjectGroup, batch: string) {
    setSelected(prev => {
      const next = new Set(prev)
      // Remove any other batch of the same base subject first
      group.subjects.forEach(s => next.delete(s))
      const subjectKey = `${group.base}-${batch}`
      next.add(subjectKey)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Your Subjects</h1>
      <p className="text-muted-foreground">Select exactly the subjects you are enrolled in.</p>

      <div className="flex flex-col gap-3 mt-2">
        {groups.map((group) => (
          <div key={group.base} className="flex items-center justify-between py-3 border-b">
            <div>
              <div className="font-medium">{group.fullName}</div>
              <div className="text-xs text-muted-foreground">{group.base}</div>
            </div>
            {group.batches.length > 0 ? (
              <div className="flex gap-2">
                {group.batches.map((batch) => {
                  const subjectKey = `${group.base}-${batch}`
                  const isActive = selected.has(subjectKey)
                  return (
                    <button
                      key={batch}
                      onClick={() => isActive ? setSelected(p => { const n = new Set(p); n.delete(subjectKey); return n }) : selectBatch(group, batch)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-muted-foreground text-muted-foreground hover:border-primary hover:text-primary'
                      }`}
                    >
                      {batch}
                    </button>
                  )
                })}
              </div>
            ) : (
              <Checkbox
                checked={selected.has(group.subjects[0])}
                onCheckedChange={() => toggleSubject(group.subjects[0])}
              />
            )}
          </div>
        ))}
      </div>

      <Button
        className="mt-4 w-full"
        disabled={selected.size === 0}
        onClick={() => onDone(Array.from(selected))}
      >
        Show My Schedule ({selected.size} selected)
      </Button>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/onboarding/page.tsx`**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Programme, ClassEntry, SubjectGroup } from '@/lib/types'
import { setPreferences } from '@/lib/storage'
import { groupSubjectsByProgramme } from '@/lib/parseSheet'
import { ProgrammePicker } from '@/components/onboarding/ProgrammePicker'
import { SubjectPicker } from '@/components/onboarding/SubjectPicker'

type Step = 'programme' | 'subjects'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('programme')
  const [programme, setProgramme] = useState<Programme | null>(null)
  const [allClasses, setAllClasses] = useState<ClassEntry[]>([])
  const [groups, setGroups] = useState<SubjectGroup[]>([])
  const [loading, setLoading] = useState(false)

  async function handleProgrammeSelect(p: Programme) {
    setProgramme(p)
    setLoading(true)
    const res = await fetch('/api/schedule')
    const data = await res.json()
    const classes: ClassEntry[] = data.classes ?? []
    setAllClasses(classes)
    setGroups(groupSubjectsByProgramme(classes, p))
    setLoading(false)
    setStep('subjects')
  }

  function handleSubjectsDone(subjects: string[]) {
    if (!programme) return
    setPreferences({ programme, subjects })
    router.push('/home')
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      {step === 'programme' && <ProgrammePicker onSelect={handleProgrammeSelect} />}
      {step === 'subjects' && !loading && (
        <SubjectPicker groups={groups} programme={programme!} onDone={handleSubjectsDone} />
      )}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading subjects…</div>
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 4: Verify onboarding flow in browser**

```bash
npm run dev
```

Open `http://localhost:3000`. You should be redirected to `/onboarding`.  
- Step 1: three programme cards are shown  
- Click PGP-29: loading spinner, then subject list appears  
- Subjects with batches show [A] [B] [C] badge buttons  
- Single subjects show a checkbox  
- "Show My Schedule" button is disabled until at least one subject selected  
- Clicking it saves to localStorage and navigates to `/home` (404 for now)

- [ ] **Step 5: Commit**

```bash
git add app/onboarding/page.tsx components/onboarding/
git commit -m "feat: add onboarding flow — programme and subject picker"
```

---

### Task 10: ClassCard Component + Home Page Shell

> **Before implementing:** Invoke the `frontend-design` skill with this brief: *"Class card for a schedule app. Shows: (1) subject full name — large and bold; (2) classroom badge — e.g. 'D1' in a coloured pill; (3) time — e.g. '10:45 – 12:00'; (4) faculty name — small and secondary. Cards stack vertically. Mobile-first, dark slate theme."*

**Files:**
- Create: `components/ClassCard.tsx`
- Create: `app/home/page.tsx`

- [ ] **Step 1: Create `components/ClassCard.tsx`**

```typescript
import { ClassEntry } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function formatTime(dt: string): string {
  // "20260609T104500" → "10:45"
  return dt.slice(9, 11) + ':' + dt.slice(11, 13)
}

interface Props {
  entry: ClassEntry
}

export function ClassCard({ entry }: Props) {
  const batchMatch = entry.subject.match(/-([A-C])$/)
  const batchLabel = batchMatch ? ` · Batch ${batchMatch[1]}` : ''

  return (
    <Card className="w-full">
      <CardContent className="pt-4 pb-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base truncate">
            {entry.subjectFull}{batchLabel}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">{entry.faculty}</div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge variant="secondary" className="font-mono text-xs">
            {entry.classroom}
          </Badge>
          <span className="text-sm font-medium tabular-nums">
            {formatTime(entry.dtStart)} – {formatTime(entry.dtEnd)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Create `app/home/page.tsx` shell**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ClassEntry, UserPreferences } from '@/lib/types'
import { getPreferences, getScheduleHash, setScheduleHash } from '@/lib/storage'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TodayTab } from '@/components/TodayTab'
import { WeekTab } from '@/components/WeekTab'
import { FullTermTab } from '@/components/FullTermTab'
import { ExportButton } from '@/components/ExportButton'

function hashClasses(classes: ClassEntry[]): string {
  return btoa(classes.length + classes.slice(0, 3).map(c => c.dtStart + c.subject).join(''))
}

export default function HomePage() {
  const router = useRouter()
  const [prefs, setPrefs] = useState<UserPreferences | null>(null)
  const [myClasses, setMyClasses] = useState<ClassEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const p = getPreferences()
    if (!p) { router.replace('/onboarding'); return }
    setPrefs(p)

    fetch('/api/schedule')
      .then(r => r.json())
      .then(data => {
        const all: ClassEntry[] = data.classes ?? []
        const mine = all.filter(c => p.subjects.includes(c.subject))
        setMyClasses(mine)

        const newHash = hashClasses(mine)
        const oldHash = getScheduleHash()
        if (oldHash && oldHash !== newHash) {
          toast.info('Schedule updated — re-export your calendar to get the latest changes.')
        }
        setScheduleHash(newHash)
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading your schedule…</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen max-w-md mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">My Schedule</h1>
        <ExportButton classes={myClasses} />
      </div>
      <Tabs defaultValue="today">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="today" className="flex-1">Today</TabsTrigger>
          <TabsTrigger value="week" className="flex-1">Week</TabsTrigger>
          <TabsTrigger value="term" className="flex-1">Full Term</TabsTrigger>
        </TabsList>
        <TabsContent value="today"><TodayTab classes={myClasses} /></TabsContent>
        <TabsContent value="week"><WeekTab classes={myClasses} /></TabsContent>
        <TabsContent value="term"><FullTermTab classes={myClasses} /></TabsContent>
      </Tabs>
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ClassCard.tsx app/home/page.tsx
git commit -m "feat: add ClassCard and home page shell with tabs"
```

---

### Task 11: TodayTab

**Files:**
- Create: `components/TodayTab.tsx`

- [ ] **Step 1: Create `components/TodayTab.tsx`**

```typescript
'use client'

import { useMemo } from 'react'
import { ClassEntry } from '@/lib/types'
import { ClassCard } from './ClassCard'

interface Props { classes: ClassEntry[] }

export function TodayTab({ classes }: Props) {
  const today = new Date().toISOString().split('T')[0]

  const todayClasses = useMemo(
    () => classes
      .filter(c => c.date === today)
      .sort((a, b) => a.dtStart.localeCompare(b.dtStart)),
    [classes, today],
  )

  if (todayClasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <div className="font-medium">No classes today</div>
        <div className="text-sm text-muted-foreground mt-1">Enjoy your free day</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {todayClasses.map((c) => (
        <ClassCard key={c.dtStart + c.subject} entry={c} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Start dev server, complete onboarding, check Today tab. If today has no classes, temporarily change `today` to `'2026-06-09'` to see sample cards, then revert.

- [ ] **Step 3: Commit**

```bash
git add components/TodayTab.tsx
git commit -m "feat: add Today tab"
```

---

### Task 12: WeekTab

**Files:**
- Create: `components/WeekTab.tsx`

- [ ] **Step 1: Create `components/WeekTab.tsx`**

```typescript
'use client'

import { useMemo } from 'react'
import { ClassEntry } from '@/lib/types'
import { ClassCard } from './ClassCard'

interface Props { classes: ClassEntry[] }

const DAY_LABELS: Record<string, string> = {
  0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday',
  4: 'Thursday', 5: 'Friday', 6: 'Saturday',
}

function formatDateHeader(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return `${DAY_LABELS[d.getDay()]}, ${d.getDate()} ${d.toLocaleString('en', { month: 'long' })}`
}

export function WeekTab({ classes }: Props) {
  const days = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dates: string[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      dates.push(d.toISOString().split('T')[0])
    }
    return dates
  }, [])

  const byDate = useMemo(() => {
    const map = new Map<string, ClassEntry[]>()
    for (const d of days) {
      const cs = classes
        .filter(c => c.date === d)
        .sort((a, b) => a.dtStart.localeCompare(b.dtStart))
      if (cs.length > 0) map.set(d, cs)
    }
    return map
  }, [classes, days])

  if (byDate.size === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        No classes in the next 7 days
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {days.filter(d => byDate.has(d)).map((date) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {formatDateHeader(date)}
          </h3>
          <div className="flex flex-col gap-2">
            {byDate.get(date)!.map(c => (
              <ClassCard key={c.dtStart + c.subject} entry={c} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/WeekTab.tsx
git commit -m "feat: add Week tab (7-day view)"
```

---

### Task 13: FullTermTab

**Files:**
- Create: `components/FullTermTab.tsx`

- [ ] **Step 1: Create `components/FullTermTab.tsx`**

```typescript
'use client'

import { useMemo, useState } from 'react'
import { ClassEntry } from '@/lib/types'
import { ClassCard } from './ClassCard'
import { Input } from '@/components/ui/input'

interface Props { classes: ClassEntry[] }

function formatDateHeader(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return `${days[d.getDay()]} ${d.getDate()} ${d.toLocaleString('en', { month: 'long', year: 'numeric' })}`
}

export function FullTermTab({ classes }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return classes
    const q = query.toLowerCase()
    return classes.filter(
      c =>
        c.subjectFull.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.classroom.toLowerCase().includes(q) ||
        c.faculty.toLowerCase().includes(q),
    )
  }, [classes, query])

  const byDate = useMemo(() => {
    const map = new Map<string, ClassEntry[]>()
    for (const c of filtered.sort((a, b) => a.dtStart.localeCompare(b.dtStart))) {
      const list = map.get(c.date) ?? []
      list.push(c)
      map.set(c.date, list)
    }
    return map
  }, [filtered])

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Search subject, classroom, faculty…"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {byDate.size === 0 && (
        <div className="py-12 text-center text-muted-foreground">No results</div>
      )}
      {Array.from(byDate.entries()).map(([date, entries]) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {formatDateHeader(date)}
          </h3>
          <div className="flex flex-col gap-2">
            {entries.map(c => (
              <ClassCard key={c.dtStart + c.subject} entry={c} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/FullTermTab.tsx
git commit -m "feat: add Full Term tab with search"
```

---

### Task 14: Export Button

**Files:**
- Create: `components/ExportButton.tsx`

- [ ] **Step 1: Create `components/ExportButton.tsx`**

```typescript
'use client'

import { ClassEntry } from '@/lib/types'
import { buildICS } from '@/lib/buildICS'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props { classes: ClassEntry[] }

export function ExportButton({ classes }: Props) {
  function handleExport() {
    try {
      const icsString = buildICS(classes)
      const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'my-schedule.ics'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Calendar exported! Import the .ics file into Google or Apple Calendar.')
    } catch {
      toast.error('Export failed. Please try again.')
    }
  }

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      Export Calendar
    </Button>
  )
}
```

- [ ] **Step 2: Verify the full end-to-end flow**

1. Complete onboarding, pick 3–5 subjects  
2. On home screen, tap "Export Calendar"  
3. A file `my-schedule.ics` should download  
4. Open the file — confirm it has events with correct titles, times, locations  
5. Import into Google Calendar — confirm events appear with 15-min notification alerts

- [ ] **Step 3: Commit**

```bash
git add components/ExportButton.tsx
git commit -m "feat: add Export Calendar button with ICS download"
```

---

### Task 15: PWA Manifest

**Files:**
- Create: `public/manifest.json`
- Modify: `next.config.ts`

- [ ] **Step 1: Create placeholder app icons**

Create two square PNG images (any solid colour with text "MS") and save them as:
- `public/icons/icon-192.png` (192×192)
- `public/icons/icon-512.png` (512×512)

You can generate these at [https://realfavicongenerator.net](https://realfavicongenerator.net) or use any image editor. For now, any 192×192 and 512×512 PNG will work.

- [ ] **Step 2: Create `public/manifest.json`**

```json
{
  "name": "My Schedule — IIMK",
  "short_name": "My Schedule",
  "description": "Personalised class schedule for IIM Kozhikode students",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- [ ] **Step 3: Add PWA security headers to `next.config.ts`**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ]
  },
}

export default nextConfig
```

- [ ] **Step 4: Verify PWA install prompt**

```bash
npm run dev
```

Open Chrome DevTools → Application → Manifest. Confirm the manifest loads correctly.  
On a real Android device or Chrome with mobile emulation: look for the "Add to Home screen" prompt.

- [ ] **Step 5: Run all tests to confirm nothing is broken**

```bash
npm test
```

Expected: all test suites pass.

- [ ] **Step 6: Commit**

```bash
git add public/manifest.json public/icons/ next.config.ts
git commit -m "feat: add PWA manifest and security headers"
```

---

### Task 16: Deploy to Vercel

**Files:** none — configuration via Vercel dashboard

- [ ] **Step 1: Push to GitHub**

Create a new repository on GitHub named `schedule-app`, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/schedule-app.git
git push -u origin main
```

- [ ] **Step 2: Connect to Vercel**

Go to [vercel.com](https://vercel.com), import the `schedule-app` repository, accept defaults.

- [ ] **Step 3: Set environment variables in Vercel**

In Vercel dashboard → Settings → Environment Variables, add:

```
GOOGLE_SHEET_SCHEDULE_URL = <your real URL>
GOOGLE_SHEET_COURSES_URL  = <your real URL>
```

- [ ] **Step 4: Trigger a redeploy and verify**

After adding env vars, trigger a redeploy. Visit the production URL:
1. Onboarding works end-to-end  
2. `/api/schedule` returns JSON  
3. Export downloads a valid `.ics`  
4. Chrome on Android shows "Add to Home Screen" prompt

- [ ] **Step 5: Test the calendar import on a real phone**

1. Export the `.ics` on your phone  
2. Import into Google Calendar  
3. Confirm a class event appears with the correct time  
4. Confirm the 15-minute notification is set on the event

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Google Sheets public CSV fetch | Task 7 |
| 15-min cache | Task 7 (`revalidate = 900`) |
| Programme selection | Task 9 |
| Subject + batch selection | Task 9 |
| Classroom derived from column header | Task 5 (`parseSheet`) |
| localStorage one-time setup | Tasks 3, 9 |
| Today / Week / Full Term tabs | Tasks 11, 12, 13 |
| Class card: classroom + subject prominent | Task 10 |
| ICS with VALARM 15 min | Task 6 |
| ICS download | Task 14 |
| Schedule change detection toast | Task 10 (home page) |
| PWA manifest | Task 15 |
| IST timezone (floating times) | Task 6 |
| Deployment | Task 16 |

All spec requirements are covered. ✓
