import { UserPreferences } from './types'

const PREFS_KEY = 'schedule_prefs'
const HASH_KEY = 'schedule_hash'

export function getPreferences(): UserPreferences | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(PREFS_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as UserPreferences } catch { return null }
}

export function setPreferences(prefs: UserPreferences): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}

export function getScheduleHash(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(HASH_KEY)
}

export function setScheduleHash(hash: string): void {
  localStorage.setItem(HASH_KEY, hash)
}

export function clearPreferences(): void {
  localStorage.removeItem(PREFS_KEY)
  localStorage.removeItem(HASH_KEY)
}
