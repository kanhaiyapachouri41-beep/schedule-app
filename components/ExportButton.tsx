'use client'

import { ClassEntry } from '@/lib/types'
import { buildICS } from '@/lib/buildICS'
import { toast } from 'sonner'

interface Props { classes: ClassEntry[] }

export function ExportButton({ classes }: Props) {
  function handleExport() {
    if (classes.length === 0) {
      toast.error('No classes to export. Complete setup first.')
      return
    }
    try {
      const icsString = buildICS(classes)
      const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'my-iimk-schedule.ics'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Calendar exported! Import into Google or Apple Calendar.')
    } catch {
      toast.error('Export failed — please try again.')
    }
  }

  return (
    <button
      onClick={handleExport}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.1em',
        background: 'rgba(201,166,82,0.1)',
        border: '1px solid rgba(201,166,82,0.25)',
        color: '#C9A652',
        borderRadius: '10px',
        padding: '8px 14px',
        fontSize: '11px',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        const t = e.currentTarget
        t.style.background = 'rgba(201,166,82,0.18)'
        t.style.borderColor = 'rgba(201,166,82,0.45)'
      }}
      onMouseLeave={e => {
        const t = e.currentTarget
        t.style.background = 'rgba(201,166,82,0.1)'
        t.style.borderColor = 'rgba(201,166,82,0.25)'
      }}
    >
      Export ↓
    </button>
  )
}
