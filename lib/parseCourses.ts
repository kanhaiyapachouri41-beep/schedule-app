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
