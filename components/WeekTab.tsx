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

function formatDateHeader(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-3xl text-slate-600 mb-2 font-semibold italic"
        >
          Clear week
        </div>
        <div
          style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.15em' }}
          className="text-[10px] text-slate-700 uppercase"
        >
          No classes in the next 7 days
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {days.filter(d => byDate.has(d)).map(date => (
        <div key={date}>
          <div
            style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em' }}
            className="text-[9px] text-yellow-600/60 uppercase mb-2.5"
          >
            {formatDateHeader(date)}
          </div>
          <div className="flex flex-col gap-2">
            {byDate.get(date)!.map((c, i) => (
              <ClassCard key={c.dtStart + c.subject} entry={c} index={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
