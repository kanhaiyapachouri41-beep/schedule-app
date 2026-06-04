'use client'

import { useMemo } from 'react'
import { ClassEntry } from '@/lib/types'
import { ClassCard } from './ClassCard'

interface Props { classes: ClassEntry[] }

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function toISO(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function formatDateHeader(iso: string): { day: string; date: string } {
  const d = new Date(iso + 'T00:00:00')
  return {
    day: DAYS[d.getDay()],
    date: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
  }
}

export function WeekTab({ classes }: Props) {
  const days = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      return toISO(d)
    })
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
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div
          style={{ fontFamily: "'Fraunces', serif", color: '#2E2C42', fontWeight: 400 }}
          className="text-[2rem] italic mb-2"
        >
          Clear week
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.15em',
            color: '#28263A',
          }}
          className="text-[10px] uppercase"
        >
          No classes in the next 7 days
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-7">
      {days.filter(d => byDate.has(d)).map(date => {
        const { day, date: dateStr } = formatDateHeader(date)
        return (
          <div key={date}>
            <div className="flex items-baseline gap-2 mb-3">
              <span
                style={{ fontFamily: "'Fraunces', serif", color: '#F0EDE8', fontWeight: 600 }}
                className="text-[15px]"
              >
                {day}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#3E3C52',
                  letterSpacing: '0.06em',
                }}
                className="text-[11px]"
              >
                {dateStr}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {byDate.get(date)!.map((c, i) => (
                <ClassCard key={c.dtStart + c.subject} entry={c} index={i} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
