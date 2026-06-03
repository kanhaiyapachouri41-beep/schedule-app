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
