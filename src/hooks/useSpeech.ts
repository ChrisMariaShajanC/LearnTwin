import { useCallback, useEffect, useRef, useState } from 'react'

export function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [state, setState] = useState<'idle' | 'loading' | 'speaking' | 'paused' | 'error' | 'unsupported'>(supported ? 'idle' : 'unsupported')
  const checkTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!supported) return
    const load = () => setVoices(window.speechSynthesis.getVoices() || [])
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
      window.speechSynthesis.cancel()
      if (checkTimer.current) window.clearTimeout(checkTimer.current)
    }
  }, [supported])

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    if (checkTimer.current) window.clearTimeout(checkTimer.current)
    setState('idle')
  }, [supported])

  const speak = useCallback((text: string, lang = 'en') => {
    if (!supported) { setState('unsupported'); return }
    if (!voices.length) { setState('error'); return }
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      const v = voices.find(x => x.lang.toLowerCase().startsWith(String(lang).toLowerCase())) || voices.find(x => x.lang.toLowerCase().startsWith('en'))
      if (v) { u.voice = v; u.lang = v.lang } else u.lang = lang
      u.rate = 0.95
      u.onend = () => setState(s => (s === 'speaking' ? 'idle' : s))
      u.onerror = () => setState('error')
      window.speechSynthesis.speak(u)
      setState('speaking')
      if (checkTimer.current) window.clearTimeout(checkTimer.current)
      checkTimer.current = window.setTimeout(() => {
        if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) setState('error')
      }, 400)
    } catch { setState('error') }
  }, [supported, voices])

  const pause = useCallback(() => {
    if (!supported || state !== 'speaking') return
    try { window.speechSynthesis.pause(); setState('paused') } catch { stop() }
  }, [supported, state, stop])

  const resume = useCallback(() => {
    if (!supported || state !== 'paused') return
    try { window.speechSynthesis.resume(); setState('speaking') } catch { setState('idle') }
  }, [supported, state])

  return {
    state, voices,
    ready: supported && voices.length > 0,
    checking: supported && voices.length === 0,
    speak, pause, resume, stop,
  }
}
