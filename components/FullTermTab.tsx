'use client'

import { useMemo, useState } from 'react'
import { ClassEntry } from '@/lib/types'
import { ClassCard } from './ClassCard'

interface Props { classes: ClassEntry[] }

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDateHeader(iso: string): { day: string; date: string } {
  const d = new Date(iso + 'T00:00:00')
  return {
    day: DAYS[d.getDay()],
    date: `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
  }
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
    <div className="flex flex-col gap-5">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search subject, room, faculty…"
          style={{
            fontFamily: "'Outfit', sans-serif",
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            color: '#F0EDE8',
            fontSize: '14px',
            width: '100%',
            padding: '12px 40px 12px 16px',
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(201,166,82,0.3)' }}
          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
        />
        {query ? (
          <button
            onClick={() => setQuery('')}
            style={{ color: '#4E4B65', position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }}
            className="text-lg leading-none hover:text-stone-300 transition-colors"
          >
            ×
          </button>
        ) : (
          <svg
            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3E3C52' }}
            width="14" height="14" viewBox="0 0 14 14" fill="none"
          >
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {byDate.size === 0 && (
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.14em',
            color: '#28263A',
          }}
          className="py-16 text-center text-[10px] uppercase"
        >
          No results
        </div>
      )}

      {Array.from(byDate.entries()).map(([date, entries]) => {
        const { day, date: dateStr } = formatDateHeader(date)
        return (
          <div key={date}>
            <div className="flex items-baseline gap-2 mb-3">
              <span
                style={{ fontFamily: "'JetBrains Mono', monospace", color: '#C9A652', letterSpacing: '0.1em' }}
                className="text-[10px] uppercase"
              >
                {day}
              </span>
              <span
                style={{ fontFamily: "'JetBrains Mono', monospace", color: '#3E3C52', letterSpacing: '0.06em' }}
                className="text-[10px]"
              >
                {dateStr}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {entries.map((c, i) => (
                <ClassCard key={c.dtStart + c.subject} entry={c} index={i} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
