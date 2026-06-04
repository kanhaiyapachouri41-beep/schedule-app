import { ClassEntry } from './types'

function escapeICS(str: string): string {
  return str.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')
}

function generateUID(entry: ClassEntry): string {
  return `${entry.dtStart}-${entry.classroom}@iimk-schedule`
}

function buildTitle(entry: ClassEntry): string {
  const batchMatch = entry.subject.match(/-([A-C])$/)
  const batch = batchMatch ? ` · Batch ${batchMatch[1]}` : ''
  return `${entry.subjectFull}${batch}`
}

function buildDescription(entry: ClassEntry): string {
  const batchMatch = entry.subject.match(/-([A-C])$/)
  const lines: string[] = []
  if (entry.faculty) lines.push(`Faculty: ${entry.faculty}`)
  if (batchMatch) lines.push(`Batch: ${batchMatch[1]}`)
  lines.push(`Section: ${entry.classroom}`)
  lines.push('IIM Kozhikode')
  return lines.join('\\n')
}

export function buildICS(entries: ClassEntry[]): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//IIM Kozhikode Schedule//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:IIMK Class Schedule
X-WR-TIMEZONE:Asia/Kolkata
X-WR-CALDESC:Personal class schedule — IIM Kozhikode
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
    ics += `BEGIN:VEVENT
UID:${generateUID(entry)}
DTSTAMP:${now}
DTSTART;TZID=Asia/Kolkata:${entry.dtStart}
DTEND;TZID=Asia/Kolkata:${entry.dtEnd}
SUMMARY:${escapeICS(buildTitle(entry))}
LOCATION:${escapeICS(`Section ${entry.classroom}, IIM Kozhikode`)}
DESCRIPTION:${buildDescription(entry)}
STATUS:CONFIRMED
TRANSP:OPAQUE
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Class in 15 minutes
END:VALARM
END:VEVENT
`
  }

  ics += 'END:VCALENDAR'
  return ics
}
