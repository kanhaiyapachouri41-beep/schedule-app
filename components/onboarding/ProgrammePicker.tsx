'use client'

import { Programme } from '@/lib/types'
import { useState } from 'react'

const PROGRAMMES: {
  value: Programme; label: string; batchLabel: string; fullLabel: string; abbr: string
}[] = [
  {
    value: 'PGP-29',
    label: 'PGP-29',
    batchLabel: 'Batch 29',
    fullLabel: 'Post Graduate Programme',
    abbr: '29',
  },
  {
    value: 'PGPFIN06',
    label: 'PGP Finance',
    batchLabel: 'Batch 06',
    fullLabel: 'Finance Specialisation',
    abbr: 'FIN',
  },
  {
    value: 'PGPLSM06',
    label: 'PGP LSM',
    batchLabel: 'Batch 06',
    fullLabel: 'Liberal Studies & Management',
    abbr: 'LSM',
  },
]

interface Props {
  onSelect: (p: Programme) => void
}

export function ProgrammePicker({ onSelect }: Props) {
  const [selected, setSelected] = useState<Programme | null>(null)

  function handleSelect(p: Programme) {
    setSelected(p)
    setTimeout(() => onSelect(p), 200)
  }

  return (
    <div className="flex flex-col min-h-screen px-5 pt-14 pb-10">
      {/* Header */}
      <div className="mb-10 animate-slideUp">
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.22em',
            color: 'rgba(201,166,82,0.55)',
          }}
          className="text-[9px] uppercase mb-5"
        >
          IIM Kozhikode · Term IV
        </p>
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            color: '#F0EDE8',
            fontWeight: 600,
            lineHeight: 1.12,
          }}
          className="text-[2.4rem]"
        >
          Choose your{' '}
          <em style={{ color: '#C9A652', fontStyle: 'italic' }}>programme</em>
        </h1>
        <p style={{ color: '#4E4B65', fontFamily: "'Outfit', sans-serif" }} className="text-[14px] mt-3 leading-relaxed">
          Your timetable will be built around your programme and enrolled subjects.
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {PROGRAMMES.map((p, i) => {
          const isSelected = selected === p.value
          return (
            <button
              key={p.value}
              onClick={() => handleSelect(p.value)}
              className="animate-slideUp text-left w-full"
              style={{ animationDelay: `${80 + i * 75}ms` }}
            >
              <div
                style={{
                  background: isSelected ? 'rgba(201,166,82,0.07)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isSelected ? 'rgba(201,166,82,0.32)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '14px',
                  padding: '18px 20px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease',
                  boxShadow: isSelected ? '0 0 28px rgba(201,166,82,0.07)' : 'none',
                }}
              >
                {/* Watermark abbr */}
                <div
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: '68px',
                    fontWeight: 700,
                    position: 'absolute',
                    right: '12px',
                    bottom: '-16px',
                    lineHeight: 1,
                    userSelect: 'none',
                    pointerEvents: 'none',
                    letterSpacing: '-0.02em',
                    color: isSelected ? 'rgba(201,166,82,0.1)' : 'rgba(255,255,255,0.04)',
                    transition: 'color 0.18s ease',
                  }}
                >
                  {p.abbr}
                </div>

                <div className="relative">
                  <p
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: '0.18em',
                      color: isSelected ? 'rgba(201,166,82,0.65)' : 'rgba(255,255,255,0.22)',
                      transition: 'color 0.18s ease',
                    }}
                    className="text-[9px] uppercase mb-2"
                  >
                    {p.batchLabel}
                  </p>
                  <h2
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontWeight: 600,
                      color: isSelected ? '#F0EDE8' : '#7E7C96',
                      transition: 'color 0.18s ease',
                    }}
                    className="text-[1.2rem] leading-tight mb-0.5"
                  >
                    {p.label}
                  </h2>
                  <p
                    style={{
                      color: isSelected ? '#6B6882' : '#3E3C52',
                      fontFamily: "'Outfit', sans-serif",
                      transition: 'color 0.18s ease',
                    }}
                    className="text-[13px]"
                  >
                    {p.fullLabel}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <p
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.18em',
          color: '#28263A',
        }}
        className="mt-auto pt-10 text-[9px] uppercase text-center"
      >
        Changeable from settings
      </p>
    </div>
  )
}
