'use client'

import { useMemo, useState } from 'react'
import { ClassEntry } from '@/lib/types'
import { ClassCard } from './ClassCard'

interface Props { classes: ClassEntry[] }

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDateHeader(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function FullTermTab({ classes }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return classes
    const q = query.toLowerCase()
    return classes.filter(
      c =>
        c.subjectFull.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.classroom.toLowerCase().includes(q) ||
        c.faculty.toLowerCase().includes(q),
    )
  }, [classes, query])

  const byDate = useMemo(() => {
    const map = new Map<string, ClassEntry[]>()
    for (const c of [...filtered].sort((a, b) => a.dtStart.localeCompare(b.dtStart))) {
      const list = map.get(c.date) ?? []
      list.push(c)
      map.set(c.date, list)
    }
    return map
  }, [filtered])

  return (
    <div className="flex flex-col gap-4">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search subject, classroom, faculty…"
          style={{ fontFamily: "'DM Sans', sans-serif", background: '#111827' }}
          className="w-full px-4 py-3 rounded-xl border border-slate-700/60 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-yellow-500/40 transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {byDate.size === 0 && (
        <div
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          className="py-12 text-center text-[11px] text-slate-600 uppercase tracking-widest"
        >
          No results
        </div>
      )}

      {Array.from(byDate.entries()).map(([date, entries]) => (
        <div key={date}>
          <div
            style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em' }}
            className="text-[9px] text-yellow-600/60 uppercase mb-2.5"
          >
            {formatDateHeader(date)}
          </div>
          <div className="flex flex-col gap-2">
            {entries.map((c, i) => (
              <ClassCard key={c.dtStart + c.subject} entry={c} index={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
