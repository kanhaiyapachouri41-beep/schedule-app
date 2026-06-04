'use client'

import { Programme } from '@/lib/types'
import { useState } from 'react'

const PROGRAMMES: { value: Programme; label: string; fullLabel: string; batch: string; desc: string }[] = [
  {
    value: 'PGP-29',
    label: 'PGP 29',
    fullLabel: 'Post Graduate Programme',
    batch: 'Batch 29',
    desc: '6 sections · 50+ electives',
  },
  {
    value: 'PGPFIN06',
    label: 'PGP Finance',
    fullLabel: 'Finance Specialisation',
    batch: 'Batch 06',
    desc: 'Finance core + electives',
  },
  {
    value: 'PGPLSM06',
    label: 'PGP LSM',
    fullLabel: 'Liberal Studies & Management',
    batch: 'Batch 06',
    desc: 'Liberal studies core + electives',
  },
]

interface Props {
  onSelect: (p: Programme) => void
}

export function ProgrammePicker({ onSelect }: Props) {
  const [selected, setSelected] = useState<Programme | null>(null)

  function handleSelect(p: Programme) {
    setSelected(p)
    setTimeout(() => onSelect(p), 180)
  }

  return (
    <div className="flex flex-col min-h-screen p-6 pt-14">
      <div className="mb-10">
        <div
          style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.25em' }}
          className="text-[10px] text-yellow-600/70 uppercase mb-3"
        >
          IIM Kozhikode · Term IV
        </div>
        <h1
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-4xl text-slate-100 leading-tight font-normal"
        >
          Select your<br />
          <em className="text-yellow-400 not-italic font-semibold">Programme</em>
        </h1>
        <p className="mt-3 text-sm text-slate-400 leading-relaxed">
          Your schedule will be personalised around<br />your programme and enrolled subjects.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {PROGRAMMES.map((p) => (
          <button
            key={p.value}
            onClick={() => handleSelect(p.value)}
            className={[
              'group relative w-full text-left rounded-xl border transition-all duration-200 p-5',
              selected === p.value
                ? 'border-yellow-500/60 bg-yellow-500/5 shadow-[0_0_24px_rgba(202,138,4,0.12)]'
                : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/70 hover:bg-slate-800/50',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div
                  style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em' }}
                  className="text-[9px] text-yellow-600/60 uppercase mb-1.5"
                >
                  {p.batch}
                </div>
                <div
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  className="text-xl text-slate-100 font-semibold leading-tight"
                >
                  {p.label}
                </div>
                <div className="text-sm text-slate-400 mt-0.5">{p.fullLabel}</div>
              </div>
              <div
                className={[
                  'mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200',
                  selected === p.value
                    ? 'border-yellow-400 bg-yellow-400'
                    : 'border-slate-600 group-hover:border-slate-400',
                ].join(' ')}
              >
                {selected === p.value && (
                  <div className="w-2 h-2 rounded-full bg-slate-900" />
                )}
              </div>
            </div>
            <div
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              className="mt-3 text-[10px] text-slate-600"
            >
              {p.desc}
            </div>
          </button>
        ))}
      </div>

      <p
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
        className="mt-auto pt-10 text-[10px] text-slate-700 text-center tracking-widest"
      >
        CHANGEABLE FROM SETTINGS
      </p>
    </div>
  )
}
