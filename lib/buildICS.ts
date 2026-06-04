import { ClassEntry } from './types'

function buildTitle(entry: ClassEntry): string {
  const batchMatch = entry.subject.match(/-([A-C])$/)
  const batch = batchMatch ? ` (Batch ${batchMatch[1]})` : ''
  return `${entry.subjectFull}${batch} — ${entry.classroom}`
}

function escapeICS(str: string): string {
  return str.replace(/([,;\\])/g, '\\$1')
    .replace(/\n/g, '\\n')
}

function generateUID(entry: ClassEntry): string {
  return `${entry.date}-${entry.dtStart}-${entry.classroom}@schedule-app.local`
}

export function buildICS(entries: ClassEntry[]): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Schedule App//NONSGML Event//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Class Schedule
X-WR-TIMEZONE:Asia/Kolkata
X-WR-CALDESC:Personal class schedule
BEGIN:VTIMEZONE
TZID:Asia/Kolkata
BEGIN:STANDARD
DTSTART:19700101T000000
TZOFFSETFROM:+0530
TZOFFSETTO:+0530
TZNAME:IST
END:STANDARD
END:VTIMEZONE
`

  for (const entry of entries) {
    const title = buildTitle(entry)
    const uid = generateUID(entry)
    const location = `Classroom ${entry.classroom}`
    const description = entry.faculty
    const startDT = entry.dtStart
    const endDT = entry.dtEnd

    ics += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${startDT}
DTEND:${endDT}
SUMMARY:${escapeICS(title)}
LOCATION:${escapeICS(location)}
DESCRIPTION:${escapeICS(description)}
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Class starting in 15 minutes
END:VALARM
END:VEVENT
`
  }

  ics += 'END:VCALENDAR'
  return ics
}
