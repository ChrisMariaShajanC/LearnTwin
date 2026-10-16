import { useSpeech } from '../../hooks/useSpeech'
import { usePreferences } from '../../context/PreferencesContext'

export default function ListenButton({ text, lang = 'en' }: { text: string; lang?: string }) {
  const { state, ready, checking, speak, pause, resume, stop } = useSpeech()
  const { prefs } = usePreferences()
  const preferred = prefs?.learningFormats?.includes('audio')
  const style = preferred ? { fontWeight: 700, padding: '10px 16px' } : { fontWeight: 400, padding: '6px 10px' }
  const onMain = () => state === 'speaking' ? pause() : state === 'paused' ? resume() : speak(text, lang)
  if (!ready && !checking) return null
  return (
    <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <button type="button" onClick={onMain} disabled={checking} style={style} aria-label={state === 'speaking' ? 'Pause reading this page' : 'Listen to this page'}>
        {state === 'speaking' ? '⏸ Pause' : state === 'paused' ? '▶ Continue' : '🔊 Listen'}
      </button>
      {(state === 'speaking' || state === 'paused') && <button type="button" onClick={stop} aria-label="Stop reading">⏹</button>}
      <span role="status" aria-live="polite" style={{ fontSize: '0.85em' }}>{state === 'error' ? 'Sound did not play — you can read this page instead.' : ''}</span>
    </span>
  )
}
