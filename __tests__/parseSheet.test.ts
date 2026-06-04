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
