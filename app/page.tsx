'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPreferences } from '@/lib/storage'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const prefs = getPreferences()
    router.replace(prefs ? '/home' : '/onboarding')
  }, [router])

  return null
}
