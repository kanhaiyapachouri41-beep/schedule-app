'use client'

import { useMemo } from 'react'
import { ClassEntry } from '@/lib/types'
import { ClassCard } from './ClassCard'

interface Props { classes: ClassEntry[] }

export function TodayTab({ classes }: Props) {
  const today = new Date()
  const todayISO = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  const todayClasses = useMemo(
    () =>
      classes
        .filter(c => c.date === todayISO)
        .sort((a, b) => a.dtStart.localeCompare(b.dtStart)),
    [classes, todayISO],
  )

  if (todayClasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div
          style={{ fontFamily: "'Fraunces', serif", color: '#2E2C42', fontWeight: 400 }}
          className="text-[2rem] italic mb-2"
        >
          Free day
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.15em',
            color: '#28263A',
          }}
          className="text-[10px] uppercase"
        >
          No classes scheduled today
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {todayClasses.map((c, i) => (
        <ClassCard key={c.dtStart + c.subject} entry={c} index={i} />
      ))}
    </div>
  )
}
