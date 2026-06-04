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
      style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}
      className="text-[10px] uppercase text-yellow-400 border border-yellow-400/30 px-3 py-1.5 rounded-lg hover:bg-yellow-400/10 hover:border-yellow-400/60 transition-all active:scale-95"
    >
      Export ↓
    </button>
  )
}
