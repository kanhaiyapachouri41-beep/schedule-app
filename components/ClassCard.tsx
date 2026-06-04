import { ClassEntry } from '@/lib/types'

function formatTime(dt: string): string {
  return dt.slice(9, 11) + ':' + dt.slice(11, 13)
}

interface Props {
  entry: ClassEntry
  index?: number
}

export function ClassCard({ entry, index = 0 }: Props) {
  const batchMatch = entry.subject.match(/-([A-C])$/)
  const batchLabel = batchMatch ? `Batch ${batchMatch[1]}` : null

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '15px 18px 14px',
        animationDelay: `${index * 65}ms`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      className="animate-fadeIn"
    >
      {/* Time row + classroom badge */}
      <div className="flex items-center justify-between mb-2.5">
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: '#C9A652',
            letterSpacing: '0.04em',
          }}
          className="text-[13px] font-medium tabular-nums"
        >
          {formatTime(entry.dtStart)}&nbsp;–&nbsp;{formatTime(entry.dtEnd)}
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            background: 'rgba(201,166,82,0.1)',
            border: '1px solid rgba(201,166,82,0.22)',
            color: '#C9A652',
            borderRadius: '7px',
            padding: '2px 9px',
            fontSize: '11px',
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
          lineHeight: 1.25,
        }}
        className="text-[1.1rem] mb-1"
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
                color: '#4E4B65',
                letterSpacing: '0.12em',
              }}
              className="text-[10px] uppercase"
            >
              {batchLabel}
            </span>
          )}
          {batchLabel && entry.faculty && (
            <span style={{ color: '#2E2C40' }} className="text-[10px]">·</span>
          )}
          {entry.faculty && (
            <span style={{ color: '#5C5A74', fontFamily: "'Outfit', sans-serif" }} className="text-[12px] truncate">
              {entry.faculty}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
