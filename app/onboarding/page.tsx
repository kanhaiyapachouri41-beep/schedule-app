'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Programme, ClassEntry, SubjectGroup } from '@/lib/types'
import { getPreferences, setPreferences } from '@/lib/storage'
import { groupSubjectsByProgramme } from '@/lib/parseSheet'
import { ProgrammePicker } from '@/components/onboarding/ProgrammePicker'
import { SubjectPicker } from '@/components/onboarding/SubjectPicker'

type Step = 'programme' | 'subjects'

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEdit = searchParams.get('edit') === 'true'

  const [step, setStep] = useState<Step>('programme')
  const [programme, setProgramme] = useState<Programme | null>(null)
  const [groups, setGroups] = useState<SubjectGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [initialSubjects, setInitialSubjects] = useState<string[]>([])

  useEffect(() => {
    if (!isEdit) return
    const prefs = getPreferences()
    if (!prefs) { router.replace('/onboarding'); return }

    setProgramme(prefs.programme)
    setInitialSubjects(prefs.subjects)
    setLoading(true)
    fetch('/api/schedule')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setFetchError(data.error); return }
        const classes: ClassEntry[] = data.classes ?? []
        setGroups(groupSubjectsByProgramme(classes, prefs.programme))
        setStep('subjects')
      })
      .catch(() => setFetchError('Network error. Please check your connection and try again.'))
      .finally(() => setLoading(false))
  }, [isEdit, router])

  async function handleProgrammeSelect(p: Programme) {
    setProgramme(p)
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/schedule')
      const data = await res.json()
      if (!res.ok || data.error) {
        setFetchError(data.error ?? 'Failed to load schedule. Please try again.')
        setLoading(false)
        return
      }
      const classes: ClassEntry[] = data.classes ?? []
      setGroups(groupSubjectsByProgramme(classes, p))
      setStep('subjects')
    } catch {
      setFetchError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSubjectsDone(subjects: string[]) {
    if (!programme) return
    setPreferences({ programme, subjects })
    router.push('/home')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div
          style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em' }}
          className="text-[11px] text-slate-500 uppercase animate-pulse"
        >
          Loading subjects…
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <div
          style={{ fontFamily: "'Fraunces', serif" }}
          className="text-2xl text-slate-300 text-center"
        >
          Could not load schedule
        </div>
        <div
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          className="text-[11px] text-red-400 text-center leading-relaxed max-w-sm"
        >
          {fetchError}
        </div>
        <button
          onClick={() => { setFetchError(null); if (isEdit) router.push('/home'); else setStep('programme') }}
          style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em' }}
          className="text-[11px] text-yellow-400 uppercase border border-yellow-400/30 px-4 py-2 rounded hover:bg-yellow-400/10 transition-colors"
        >
          ← {isEdit ? 'Back to schedule' : 'Try Again'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ background: '#090910', minHeight: '100vh' }}>
      {step === 'programme' && (
        <ProgrammePicker onSelect={handleProgrammeSelect} />
      )}
      {step === 'subjects' && programme && (
        <SubjectPicker
          groups={groups}
          programme={programme}
          onDone={handleSubjectsDone}
          onBack={() => isEdit ? router.push('/home') : setStep('programme')}
          initialSelected={initialSubjects}
        />
      )}
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div
          style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', color: '#3E3C52' }}
          className="text-[11px] uppercase animate-pulse"
        >
          Loading…
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
