'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Programme, ClassEntry, SubjectGroup } from '@/lib/types'
import { setPreferences } from '@/lib/storage'
import { groupSubjectsByProgramme } from '@/lib/parseSheet'
import { ProgrammePicker } from '@/components/onboarding/ProgrammePicker'
import { SubjectPicker } from '@/components/onboarding/SubjectPicker'

type Step = 'programme' | 'subjects'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('programme')
  const [programme, setProgramme] = useState<Programme | null>(null)
  const [groups, setGroups] = useState<SubjectGroup[]>([])
  const [loading, setLoading] = useState(false)

  async function handleProgrammeSelect(p: Programme) {
    setProgramme(p)
    setLoading(true)
    try {
      const res = await fetch('/api/schedule')
      const data = await res.json()
      const classes: ClassEntry[] = data.classes ?? []
      setGroups(groupSubjectsByProgramme(classes, p))
      setStep('subjects')
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

  return (
    <div style={{ background: '#0C1220', minHeight: '100vh' }}>
      {step === 'programme' && (
        <ProgrammePicker onSelect={handleProgrammeSelect} />
      )}
      {step === 'subjects' && programme && (
        <SubjectPicker
          groups={groups}
          programme={programme}
          onDone={handleSubjectsDone}
          onBack={() => setStep('programme')}
        />
      )}
    </div>
  )
}
