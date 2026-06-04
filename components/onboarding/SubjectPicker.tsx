'use client'

import { useState } from 'react'
import { SubjectGroup, Programme } from '@/lib/types'

interface Props {
  groups: SubjectGroup[]
  programme: Programme
  onDone: (selected: string[]) => void
  onBack: () => void
}

export function SubjectPicker({ groups, onDone, onBack }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

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
        className="sticky top-0 z-10 px-6 py-4 border-b border-slate-800/60"
        style={{ background: 'rgba(12,18,32,0.95)', backdropFilter: 'blur(8px)' }}
      >
        <button
          onClick={onBack}
          style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.15em' }}
          className="text-[10px] text-slate-500 uppercase mb-3 flex items-center gap-1.5 hover:text-slate-300 transition-colors"
        >
          ← Back
        </button>
        <h1
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-2xl text-slate-100 font-normal leading-tight"
        >
          Your{' '}
          <em className="text-yellow-400 not-italic font-semibold">subjects</em>
        </h1>
        <p
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          className="text-[10px] text-slate-500 mt-1.5 tracking-wide"
        >
          {selected.size === 0
            ? 'TAP YOUR ENROLLED SUBJECTS'
            : `${selected.size} SUBJECT${selected.size > 1 ? 'S' : ''} SELECTED`}
        </p>
      </div>

      {/* Subject rows */}
      <div className="flex-1 px-5 py-2">
        {groups.map((group) => {
          const active = isSelected(group)
          const activeBatch = getSelectedBatch(group)

          return (
            <div
              key={group.base}
              className={[
                'flex items-center justify-between py-3.5 px-1 border-b transition-colors duration-150',
                active ? 'border-yellow-500/20' : 'border-slate-800/50',
              ].join(' ')}
            >
              <div className="flex-1 min-w-0 pr-4">
                <div
                  className={[
                    'text-sm leading-snug transition-colors',
                    active ? 'text-slate-100' : 'text-slate-300',
                  ].join(' ')}
                >
                  {group.fullName}
                </div>
                <div
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  className="text-[9px] text-slate-600 mt-0.5 tracking-wider"
                >
                  {group.base}
                </div>
              </div>

              {group.batches.length > 0 ? (
                <div className="flex gap-1.5 shrink-0">
                  {group.batches.map((batch) => {
                    const isActive = activeBatch === batch
                    return (
                      <button
                        key={batch}
                        onClick={() =>
                          isActive
                            ? setSelected((p) => {
                                const n = new Set(p)
                                n.delete(`${group.base}-${batch}`)
                                return n
                              })
                            : selectBatch(group, batch)
                        }
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        className={[
                          'w-8 h-8 rounded text-xs font-medium transition-all duration-150',
                          isActive
                            ? 'bg-yellow-400 text-slate-900 shadow-[0_0_10px_rgba(202,138,4,0.35)]'
                            : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200',
                        ].join(' ')}
                      >
                        {batch}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <button
                  onClick={() => toggleSubject(group.subjects[0])}
                  className={[
                    'w-6 h-6 rounded border-2 shrink-0 flex items-center justify-center transition-all duration-150',
                    active
                      ? 'bg-yellow-400 border-yellow-400 shadow-[0_0_8px_rgba(202,138,4,0.35)]'
                      : 'border-slate-600 hover:border-slate-400',
                  ].join(' ')}
                >
                  {active && (
                    <svg className="w-3 h-3 text-slate-900" fill="none" viewBox="0 0 12 12">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Sticky bottom CTA */}
      <div
        className="sticky bottom-0 p-4 pt-8"
        style={{ background: 'linear-gradient(to top, #0C1220 60%, transparent)' }}
      >
        <button
          disabled={selected.size === 0}
          onClick={() => onDone(Array.from(selected))}
          style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em' }}
          className={[
            'w-full py-4 rounded-xl text-sm uppercase font-medium transition-all duration-200',
            selected.size > 0
              ? 'bg-yellow-400 text-slate-900 shadow-[0_0_30px_rgba(202,138,4,0.25)] hover:bg-yellow-300 active:scale-[0.99]'
              : 'bg-slate-800/60 text-slate-600 cursor-not-allowed border border-slate-700/50',
          ].join(' ')}
        >
          {selected.size > 0
            ? `View Schedule — ${selected.size} Subject${selected.size > 1 ? 's' : ''}`
            : 'Select subjects to continue'}
        </button>
      </div>
    </div>
  )
}
