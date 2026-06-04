import { ClassEntry } from '@/lib/types'

function formatTime(dt: string): string {
  return dt.slice(9, 11) + ':' + dt.slice(11, 13)
}

const ACCENTS = [
  { border: 'rgba(201,166,82,0.8)',  bg: 'rgba(201,166,82,0.055)' },
  { border: 'rgba(72,190,175,0.75)', bg: 'rgba(72,190,175,0.05)'  },
  { border: 'rgba(160,130,220,0.75)',bg: 'rgba(160,130,220,0.05)' },
  { border: 'rgba(230,110,100,0.75)',bg: 'rgba(230,110,100,0.05)' },
  { border: 'rgba(100,170,215,0.75)',bg: 'rgba(100,170,215,0.05)' },
  { border: 'rgba(130,195,140,0.75)',bg: 'rgba(130,195,140,0.05)' },
  { border: 'rgba(235,155,90,0.75)', bg: 'rgba(235,155,90,0.05)'  },
  { border: 'rgba(200,140,180,0.75)',bg: 'rgba(200,140,180,0.05)' },
]

function accentFor(subject: string) {
  const base = subject.replace(/-[A-C]$/, '')
  let h = 0
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) | 0
  return ACCENTS[Math.abs(h) % ACCENTS.length]
}

interface Props {
  entry: ClassEntry
  index?: number
}

export function ClassCard({ entry, index = 0 }: Props) {
  const batchMatch = entry.subject.match(/-([A-C])$/)
  const batchLabel = batchMatch ? `Batch ${batchMatch[1]}` : null
  const accent = accentFor(entry.subject)

  return (
    <div
      style={{
        background: `linear-gradient(105deg, ${accent.bg} 0%, rgba(255,255,255,0.03) 40%)`,
        borderTop: '1px solid rgba(255,255,255,0.07)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        borderLeft: `3px solid ${accent.border}`,
        borderRadius: '14px',
        padding: '14px 18px 13px',
        animationDelay: `${index * 60}ms`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      className="animate-cardIn"
    >
      {/* Time row + classroom badge */}
      <div className="flex items-center justify-between mb-2">
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: '#C9A652',
            letterSpacing: '0.04em',
          }}
          className="text-[12px] font-medium tabular-nums"
        >
          {formatTime(entry.dtStart)}&thinsp;–&thinsp;{formatTime(entry.dtEnd)}
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            background: `rgba(255,255,255,0.05)`,
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#9E9CB8',
            borderRadius: '6px',
            padding: '2px 8px',
            fontSize: '10px',
            letterSpacing: '0.1em',
          }}
        >
          {entry.classroom}
        </div>
      </div>

      {/* Subject name */}
      <div
        style={{
          fontFamily: "'Fraunces', serif",
          color: '#F0EDE8',
          fontWeight: 600,
          lineHeight: 1.2,
        }}
        className="text-[1.05rem] mb-2"
      >
        {entry.subjectFull}
      </div>

      {/* Batch + Faculty */}
      {(batchLabel || entry.faculty) && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {batchLabel && (
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: accent.border,
                letterSpacing: '0.1em',
                background: accent.bg,
                borderRadius: '4px',
                padding: '1px 6px',
              }}
              className="text-[9px] uppercase"
            >
              {batchLabel}
            </span>
          )}
          {batchLabel && entry.faculty && (
            <span style={{ color: '#2E2C40' }} className="text-[10px]">·</span>
          )}
          {entry.faculty && (
            <span style={{ color: '#5C5A74', fontFamily: "'Outfit', sans-serif" }} className="text-[11px] truncate">
              {entry.faculty}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
