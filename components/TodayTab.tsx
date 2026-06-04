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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-3xl text-slate-600 mb-2 font-semibold italic"
        >
          Free day
        </div>
        <div
          style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.15em' }}
          className="text-[10px] text-slate-700 uppercase"
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
