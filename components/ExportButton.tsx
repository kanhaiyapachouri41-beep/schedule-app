'use client'

import { useState } from 'react'
import { ClassEntry } from '@/lib/types'
import { buildICS } from '@/lib/buildICS'
import { toast } from 'sonner'

interface Props { classes: ClassEntry[] }

type Platform = 'ios' | 'mac' | 'android' | 'windows' | 'other'

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Macintosh|MacIntel/.test(ua)) return 'mac'
  if (/Android/.test(ua)) return 'android'
  if (/Windows/.test(ua)) return 'windows'
  return 'other'
}

const GUIDE: Record<Platform, { title: string; steps: string[] }> = {
  ios: {
    title: 'Add to iPhone Calendar',
    steps: [
      'Open the Files app on your iPhone',
      'Go to Browse → Downloads',
      'Tap my-iimk-schedule.ics',
      'Tap Add All Events — done!',
    ],
  },
  mac: {
    title: 'Add to Mac Calendar',
    steps: [
      'Open your Downloads folder in Finder',
      'Double-click my-iimk-schedule.ics',
      'Calendar opens and asks to import',
      'Click OK — all classes are added',
    ],
  },
  android: {
    title: 'Add to Google Calendar',
    steps: [
      'Open the downloaded my-iimk-schedule.ics file',
      'Choose Google Calendar when prompted',
      'Tap Import to add all your classes',
    ],
  },
  windows: {
    title: 'Add to Calendar',
    steps: [
      'Open your Downloads folder',
      'Double-click my-iimk-schedule.ics',
      'Outlook or Windows Calendar opens automatically',
      'Confirm the import — done!',
    ],
  },
  other: {
    title: 'Add to Your Calendar',
    steps: [
      'Find my-iimk-schedule.ics in your Downloads',
      'Open it with your calendar app',
      'Confirm the import when prompted',
    ],
  },
}

const BOLD_WORDS = [
  'my-iimk-schedule.ics', 'Files', 'Downloads', 'Finder',
  'Calendar', 'Google Calendar', 'Outlook', 'Add All Events',
  'Add All', 'Import', 'OK',
]
const BOLD_RE = new RegExp(`(${BOLD_WORDS.map(w => w.replace('.', '\\.')).join('|')})`)

function StepText({ text }: { text: string }) {
  const parts = text.split(BOLD_RE)
  return (
    <>
      {parts.map((part, i) =>
        BOLD_WORDS.includes(part)
          ? <strong key={i} style={{ color: '#D4D1E8', fontWeight: 600 }}>{part}</strong>
          : part
      )}
    </>
  )
}

export function ExportButton({ classes }: Props) {
  const [showGuide, setShowGuide] = useState(false)
  const [platform, setPlatform] = useState<Platform>('other')

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
      setPlatform(detectPlatform())
      setShowGuide(true)
    } catch {
      toast.error('Export failed — please try again.')
    }
  }

  const guide = GUIDE[platform]

  return (
    <>
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

      {showGuide && (
        <div
          onClick={() => setShowGuide(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9,9,16,0.82)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '0 0 24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#13121E',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '28px 24px 24px',
              width: '100%',
              maxWidth: '420px',
              margin: '0 16px',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
            }}
            className="animate-slideUp"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#C9A652',
                    letterSpacing: '0.14em',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                  }}
                >
                  File downloaded ✓
                </div>
                <div
                  style={{
                    fontFamily: "'Fraunces', serif",
                    color: '#F0EDE8',
                    fontWeight: 600,
                    fontSize: '1.2rem',
                    lineHeight: 1.2,
                  }}
                >
                  {guide.title}
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                style={{
                  color: '#4E4B65',
                  fontSize: '20px',
                  lineHeight: 1,
                  padding: '2px 4px',
                }}
                className="hover:text-stone-400 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Steps */}
            <ol className="flex flex-col gap-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {guide.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      background: 'rgba(201,166,82,0.12)',
                      color: '#C9A652',
                      borderRadius: '6px',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      flexShrink: 0,
                      marginTop: '1px',
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      color: '#B8B5D0',
                      fontSize: '14px',
                      lineHeight: 1.4,
                    }}
                  >
                    <StepText text={step} />
                  </span>
                </li>
              ))}
            </ol>

            {/* Tip */}
            <div
              style={{
                marginTop: '20px',
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <p
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: '#4E4B65',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Each class includes a <span style={{ color: '#7E7C96' }}>15-minute reminder</span> and is marked as{' '}
                <span style={{ color: '#7E7C96' }}>busy</span> in your calendar.
              </p>
              <p
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: '#4E4B65',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  margin: 0,
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  paddingTop: '8px',
                }}
              >
                This schedule is based on the <span style={{ color: '#7E7C96' }}>initial timetable shared by the Programme Office</span>. Last-minute room or time changes will not be reflected automatically.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowGuide(false)}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '14px',
                background: 'rgba(201,166,82,0.1)',
                border: '1px solid rgba(201,166,82,0.25)',
                borderRadius: '12px',
                fontFamily: "'Outfit', sans-serif",
                color: '#C9A652',
                fontWeight: 600,
                fontSize: '14px',
                letterSpacing: '0.04em',
                transition: 'all 0.15s ease',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}
