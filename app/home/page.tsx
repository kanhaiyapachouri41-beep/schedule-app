'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ClassEntry, UserPreferences } from '@/lib/types'
import { getPreferences, getScheduleHash, setScheduleHash } from '@/lib/storage'
import { TodayTab } from '@/components/TodayTab'
import { WeekTab } from '@/components/WeekTab'
import { FullTermTab } from '@/components/FullTermTab'
import { ExportButton } from '@/components/ExportButton'

function hashClasses(classes: ClassEntry[]): string {
  const str = classes.length + classes.slice(0, 3).map(c => c.dtStart + c.subject).join('')
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return h.toString(36)
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type Tab = 'today' | 'week' | 'term'

function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderLeft: '3px solid rgba(255,255,255,0.06)',
        borderRadius: '14px',
        padding: '14px 18px 13px',
        animationDelay: `${delay}ms`,
      }}
      className="animate-pulse"
    >
      <div className="flex items-center justify-between mb-2.5">
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '12px', width: '72px' }} />
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '6px', height: '20px', width: '30px' }} />
      </div>
      <div style={{ background: 'rgba(255,255,255,0.09)', borderRadius: '4px', height: '17px', width: '62%', marginBottom: '8px' }} />
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '11px', width: '40%' }} />
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [myClasses, setMyClasses] = useState<ClassEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('today')

  const today = new Date()
  const dayLabel = DAYS[today.getDay()]
  const dateLabel = `${today.getDate()} ${MONTHS[today.getMonth()]}`

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
          toast.info('Schedule updated — re-export your calendar.')
        }
        setScheduleHash(newHash)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'term', label: 'Full Term' },
  ]

  return (
    <main className="min-h-screen max-w-md mx-auto">
      {/* Header */}
      <div className="px-5 pt-12 pb-0">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.22em',
                color: 'rgba(201,166,82,0.5)',
              }}
              className="text-[9px] uppercase mb-1.5"
            >
              IIM Kozhikode · Term IV
            </p>
            <div className="flex items-baseline gap-2.5">
              <h1
                style={{ fontFamily: "'Fraunces', serif", color: '#F0EDE8', fontWeight: 600 }}
                className="text-[1.5rem] leading-none"
              >
                {dayLabel}
              </h1>
              <span
                style={{ fontFamily: "'JetBrains Mono', monospace", color: '#4E4B65' }}
                className="text-[13px]"
              >
                {dateLabel}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            {/* Edit subjects */}
            <button
              onClick={() => router.push('/onboarding?edit=true')}
              title="Change subjects"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '8px',
                color: '#4E4B65',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#9E9CB8'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#4E4B65'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9.5 2L12 4.5L4.5 12H2V9.5L9.5 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <ExportButton classes={myClasses} />
          </div>
        </div>

        {/* Tab bar */}
        <div
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          className="flex"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? '#F0EDE8' : '#4E4B65',
                borderBottom: `2px solid ${activeTab === tab.key ? '#C9A652' : 'transparent'}`,
                marginBottom: '-1px',
                transition: 'all 0.15s ease',
                padding: '10px 0',
                marginRight: '24px',
                fontSize: '14px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {loading ? (
        <div className="px-5 pt-5 pb-24 flex flex-col gap-2.5">
          <SkeletonCard delay={0} />
          <SkeletonCard delay={60} />
          <SkeletonCard delay={120} />
        </div>
      ) : (
        <div key={activeTab} className="px-5 pt-5 pb-24 animate-tabSlideIn">
          {activeTab === 'today' && <TodayTab classes={myClasses} />}
          {activeTab === 'week' && <WeekTab classes={myClasses} />}
          {activeTab === 'term' && <FullTermTab classes={myClasses} />}
        </div>
      )}
    </main>
  )
}
