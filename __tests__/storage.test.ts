import { getPreferences, setPreferences, getScheduleHash, setScheduleHash, clearPreferences } from '@/lib/storage'
import { UserPreferences } from '@/lib/types'

const store: Record<string, string> = {}
const localStorageMock = {
  getItem: jest.fn((k: string) => store[k] ?? null),
  setItem: jest.fn((k: string, v: string) => { store[k] = v }),
  removeItem: jest.fn((k: string) => { delete store[k] }),
  clear: jest.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

const PREFS: UserPreferences = { programme: 'PGP-29', subjects: ['GT-A', 'FIS'] }

beforeEach(() => localStorageMock.clear())

describe('storage', () => {
  it('returns null when no preferences are stored', () => {
    expect(getPreferences()).toBeNull()
  })

  it('stores and retrieves preferences', () => {
    setPreferences(PREFS)
    expect(getPreferences()).toEqual(PREFS)
  })

  it('returns null hash when not set', () => {
    expect(getScheduleHash()).toBeNull()
  })

  it('stores and retrieves schedule hash', () => {
    setScheduleHash('abc123')
    expect(getScheduleHash()).toBe('abc123')
  })

  it('clears both preferences and hash', () => {
    setPreferences(PREFS)
    setScheduleHash('abc123')
    clearPreferences()
    expect(getPreferences()).toBeNull()
    expect(getScheduleHash()).toBeNull()
  })
})
