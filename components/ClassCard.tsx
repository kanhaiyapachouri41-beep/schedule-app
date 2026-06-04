import { ClassEntry } from '@/lib/types'

function formatTime(dt: string): string {
  // "20260609T104500" → "10:45"
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
        background: '#111827',
        borderLeft: '3px solid #C9A84C',
        borderRadius: '0 10px 10px 0',
        animationDelay: `${index * 60}ms`,
      }}
      className="relative flex flex-col gap-2 px-4 py-3.5 border border-slate-800/60 border-l-0 rounded-r-xl animate-fadeIn"
    >
      {/* Top row: subject + classroom badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-lg text-slate-100 leading-tight font-semibold"
          >
            {entry.subjectFull}
          </div>
          {batchLabel && (
            <div
              style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}
              className="text-[10px] text-yellow-600/70 uppercase mt-0.5"
            >
              {batchLabel}
            </div>
          )}
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            background: 'rgba(201,168,76,0.12)',
            border: '1px solid rgba(201,168,76,0.3)',
          }}
          className="shrink-0 px-2.5 py-1 rounded-full text-[11px] text-yellow-400 font-medium tracking-widest"
        >
          {entry.classroom}
        </div>
      </div>

      {/* Bottom row: faculty + time */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-[12px] text-slate-500 truncate flex-1">
          {entry.faculty}
        </div>
        <div
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          className="shrink-0 text-[12px] text-slate-300 tabular-nums"
        >
          {formatTime(entry.dtStart)}
          <span className="text-slate-600 mx-1">–</span>
          {formatTime(entry.dtEnd)}
        </div>
      </div>
    </div>
  )
}
