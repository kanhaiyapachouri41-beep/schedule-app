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

function toLocalDateString(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function parseDate(raw: string): string | null {
  for (const fmt of DATE_FORMATS) {
    const d = dateParse(raw.trim(), fmt, new Date())
    if (isValid(d)) return toLocalDateString(d)
  }
  const d = new Date(raw)
  if (isValid(d)) return toLocalDateString(d)
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
