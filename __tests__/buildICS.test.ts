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
