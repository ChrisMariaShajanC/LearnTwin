import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { UserProfile } from '../types'

const DEFAULTS = {
  font: 'default',
  learningFormats: [],
  explanationStyle: null,
  chunkSize: 'medium',
  interests: [],
  interestsCustom: '',
  formatSwitching: 'noPreference',
  onboardingPreferencesDone: false,
}

const KEY = 'lt-learning-preferences'

function applyFont(font: string) {
  if (font && font !== 'default') document.documentElement.setAttribute('data-font', font)
  else document.documentElement.removeAttribute('data-font')
}

function readCache() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return { ...DEFAULTS } }
}

const Ctx = createContext<any>(null)

export function PreferencesProvider({ children, isAuthed, user, setUser }: { children: React.ReactNode; isAuthed: boolean; user: UserProfile; setUser: (u: UserProfile) => void }) {
  const [prefs, setPrefs] = useState<any>(readCache())
  const [status, setStatus] = useState('idle')

  useEffect(() => { applyFont(prefs.font) }, [prefs.font])

  useEffect(() => {
    if (!isAuthed) return
    const cached = user?.learningPreferences
    if (cached && Object.keys(cached).length) {
      setPrefs({ ...DEFAULTS, ...cached })
      localStorage.setItem(KEY, JSON.stringify(cached))
      applyFont(cached.font || 'default')
      return
    }
    let alive = true
    setStatus('loading')
    fetch('http://localhost:3001/api/user/default-user')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: any) => {
        if (!alive) return
        const next = { ...DEFAULTS, ...(data?.learningPreferences || {}) } as any
        setPrefs(next)
        localStorage.setItem(KEY, JSON.stringify(next))
        applyFont(next.font)
        setStatus('idle')
      })
      .catch(() => { if (alive) setStatus('error') })
    return () => { alive = false }
  }, [isAuthed, user])

  const update = useCallback(async (patch: any) => {
    const prev = prefs
    const next = { ...prev, ...patch }
    setPrefs(next)
    applyFont(next.font)
    setStatus('saving')
    try {
      const nextUser = { ...user, learningPreferences: next }
      setUser(nextUser)
      localStorage.setItem(KEY, JSON.stringify(next))
      setStatus('idle')
      return true
    } catch {
      setPrefs(prev)
      applyFont(prev.font)
      setStatus('error')
      return false
    }
  }, [prefs, user, setUser])

  const reset = useCallback(async () => {
    const next = { ...DEFAULTS } as any
    setPrefs(next)
    applyFont(next.font)
    setUser({ ...user, learningPreferences: next })
    localStorage.setItem(KEY, JSON.stringify(next))
    return true
  }, [user, setUser])

  return <Ctx.Provider value={{ prefs, status, update, reset }}>{children}</Ctx.Provider>
}

export const usePreferences = () => useContext(Ctx)
