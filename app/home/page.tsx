'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ClassEntry, UserPreferences } from '@/lib/types'
import { getPreferences, getScheduleHash, setScheduleHash } from '@/lib/storage'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TodayTab } from '@/components/TodayTab'
import { WeekTab } from '@/components/WeekTab'
import { FullTermTab } from '@/components/FullTermTab'
import { ExportButton } from '@/components/ExportButton'

function hashClasses(classes: ClassEntry[]): string {
  const str = classes.length + classes.slice(0, 3).map(c => c.dtStart + c.subject).join('')
  // Simple hash without btoa to avoid unicode issues
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return h.toString(36)
}

export default function HomePage() {
  const router = useRouter()
  const [myClasses, setMyClasses] = useState<ClassEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const p: UserPreferences | null = getPreferences()
    if (!p) { router.replace('/onboarding'); return }

    fetch('/api/schedule')
      .then(r => r.json())
      .then(data => {
        const all: ClassEntry[] = data.classes ?? []
        const mine = all.filter(c => p.subjects.includes(c.subject))
        setMyClasses(mine)

        const newHash = hashClasses(mine)
        const oldHash = getScheduleHash()
        if (oldHash && oldHash !== newHash) {
          toast.info('Schedule updated — re-export your calendar to get the latest changes.')
        }
        setScheduleHash(newHash)
      })
      .catch(() => {
        // API not configured yet — show empty state gracefully
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em' }}
          className="text-[11px] text-slate-500 uppercase animate-pulse"
        >
          Loading…
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen max-w-md mx-auto" style={{ background: '#0C1220' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-5 border-b border-slate-800/60">
        <div>
          <div
            style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.25em' }}
            className="text-[9px] text-yellow-600/60 uppercase mb-1"
          >
            IIM Kozhikode · Term IV
          </div>
          <h1
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-2xl text-slate-100 font-semibold leading-none"
          >
            My Schedule
          </h1>
        </div>
        <ExportButton classes={myClasses} />
      </div>

      {/* Tabs */}
      <div className="px-5 pt-4 pb-24">
        <Tabs defaultValue="today">
          <TabsList
            className="w-full mb-5 bg-slate-800/40 border border-slate-700/50 p-1 rounded-lg h-auto"
          >
            {['today', 'week', 'term'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}
                className="flex-1 text-[10px] uppercase py-2 rounded-md data-active:bg-yellow-400 data-active:text-slate-900 data-active:font-semibold text-slate-400 transition-all"
              >
                {tab === 'today' ? 'Today' : tab === 'week' ? 'Week' : 'Term'}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="today"><TodayTab classes={myClasses} /></TabsContent>
          <TabsContent value="week"><WeekTab classes={myClasses} /></TabsContent>
          <TabsContent value="term"><FullTermTab classes={myClasses} /></TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
