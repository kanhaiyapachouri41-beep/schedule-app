'use client'

import { useState, useMemo } from 'react'
import { SubjectGroup, Programme } from '@/lib/types'

interface Props {
  groups: SubjectGroup[]
  programme: Programme
  onDone: (selected: string[]) => void
  onBack: () => void
  initialSelected?: string[]
}

export function SubjectPicker({ groups, onDone, onBack, initialSelected = [] }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected))
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return groups
    const q = query.toLowerCase()
    return groups.filter(
      g => g.fullName.toLowerCase().includes(q) || g.base.toLowerCase().includes(q),
    )
  }, [groups, query])

  function selectBatch(group: SubjectGroup, batch: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      group.subjects.forEach((s) => next.delete(s))
      next.add(`${group.base}-${batch}`)
      return next
    })
  }

  function toggleSubject(subject: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(subject)) next.delete(subject)
      else next.add(subject)
      return next
    })
  }

  function getSelectedBatch(group: SubjectGroup): string | null {
    for (const b of group.batches) {
      if (selected.has(`${group.base}-${b}`)) return b
    }
    return null
  }

  function isSelected(group: SubjectGroup): boolean {
    return group.subjects.some((s) => selected.has(s))
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky header */}
      <div
        style={{
          background: 'rgba(9,9,16,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
        className="sticky top-0 z-10 px-5 pt-5 pb-4"
      >
        <button
          onClick={onBack}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.15em',
            color: '#4E4B65',
          }}
          className="text-[10px] uppercase mb-4 flex items-center gap-1.5 hover:text-stone-400 transition-colors"
        >
          ← Back
        </button>
        <h1
          style={{ fontFamily: "'Fraunces', serif", color: '#F0EDE8', fontWeight: 600 }}
          className="text-2xl leading-tight"
        >
          Your{' '}
          <em style={{ color: '#C9A652', fontStyle: 'italic' }}>subjects</em>
        </h1>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.14em',
            color: selected.size > 0 ? '#C9A652' : '#3E3C52',
          }}
          className="text-[10px] uppercase mt-1.5 transition-colors"
        >
          {selected.size === 0
            ? 'Tap your enrolled subjects'
            : `${selected.size} subject${selected.size > 1 ? 's' : ''} selected`}
        </p>

        {/* Search */}
        <div className="relative mt-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search subjects…"
            style={{
              fontFamily: "'Outfit', sans-serif",
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              color: '#F0EDE8',
              fontSize: '13px',
              width: '100%',
              padding: '9px 36px 9px 13px',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(201,166,82,0.3)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              style={{ color: '#4E4B65', position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)' }}
              className="text-lg leading-none hover:text-stone-300 transition-colors"
            >
              ×
            </button>
          ) : (
            <svg
              style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', color: '#3E3C52', pointerEvents: 'none' }}
              width="13" height="13" viewBox="0 0 14 14" fill="none"
            >
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
      </div>

      {/* Subject list */}
      <div className="flex-1 px-5 py-1">
        {filtered.length === 0 && (
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.14em',
              color: '#28263A',
            }}
            className="py-12 text-center text-[10px] uppercase"
          >
            No subjects match
          </div>
        )}

        {filtered.map((group) => {
          const active = isSelected(group)
          const activeBatch = getSelectedBatch(group)

          return (
            <div
              key={group.base}
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                transition: 'border-color 0.15s',
              }}
              className="flex items-center justify-between py-2.5 gap-3"
            >
              <div className="flex-1 min-w-0">
                <div
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    color: active ? '#F0EDE8' : '#7E7C96',
                    fontWeight: active ? 500 : 400,
                    transition: 'color 0.15s',
                  }}
                  className="text-[13px] leading-snug"
                >
                  {group.fullName}
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#2E2C40',
                    letterSpacing: '0.12em',
                  }}
                  className="text-[9px] mt-0.5 uppercase"
                >
                  {group.base}
                </div>
              </div>

              {group.batches.length > 0 ? (
                <div className="flex gap-1 shrink-0">
                  {group.batches.map((batch) => {
                    const batchActive = activeBatch === batch
                    return (
                      <button
                        key={batch}
                        onClick={() =>
                          batchActive
                            ? setSelected((p) => {
                                const n = new Set(p)
                                n.delete(`${group.base}-${batch}`)
                                return n
                              })
                            : selectBatch(group, batch)
                        }
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 500,
                          transition: 'all 0.15s ease',
                          background: batchActive ? '#C9A652' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${batchActive ? '#C9A652' : 'rgba(255,255,255,0.1)'}`,
                          color: batchActive ? '#090910' : '#5C5A74',
                          boxShadow: batchActive ? '0 0 10px rgba(201,166,82,0.3)' : 'none',
                        }}
                      >
                        {batch}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <button
                  onClick={() => toggleSubject(group.subjects[0])}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    border: `1.5px solid ${active ? '#C9A652' : 'rgba(255,255,255,0.15)'}`,
                    background: active ? '#C9A652' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                    boxShadow: active ? '0 0 8px rgba(201,166,82,0.3)' : 'none',
                  }}
                >
                  {active && (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#090910" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Sticky CTA */}
      <div
        className="sticky bottom-0 px-5 pb-8 pt-10"
        style={{ background: 'linear-gradient(to top, #090910 60%, transparent)' }}
      >
        <button
          disabled={selected.size === 0}
          onClick={() => onDone(Array.from(selected))}
          style={{
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '0.06em',
            fontWeight: 600,
            fontSize: '14px',
            transition: 'all 0.2s ease',
            background: selected.size > 0 ? '#C9A652' : 'rgba(255,255,255,0.05)',
            color: selected.size > 0 ? '#090910' : '#3E3C52',
            border: `1px solid ${selected.size > 0 ? '#C9A652' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: '14px',
            padding: '16px',
            width: '100%',
            boxShadow: selected.size > 0 ? '0 0 32px rgba(201,166,82,0.2)' : 'none',
          }}
        >
          {selected.size > 0
            ? `View My Schedule — ${selected.size} Subject${selected.size > 1 ? 's' : ''}`
            : 'Select subjects to continue'}
        </button>
      </div>
    </div>
  )
}
