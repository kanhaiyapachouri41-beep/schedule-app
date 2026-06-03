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
