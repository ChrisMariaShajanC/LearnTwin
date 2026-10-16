import { useState } from 'react'
import { useSpeech } from '../../../hooks/useSpeech'

export default function AudioPreview({ example }: { example: any }) {
  const { state, ready, checking, speak, pause, resume, stop } = useSpeech()
  const [lang, setLang] = useState(example.speechLang || 'en')

  const mainLabel = state === 'speaking' ? '⏸ Pause' : state === 'paused' ? '▶ Continue' : checking ? 'Getting sound ready…' : state === 'error' ? '⚠ Could not play — try again' : '▶ Play'

  const onMain = () => {
    if (state === 'speaking') pause()
    else if (state === 'paused') resume()
    else if (!checking) speak(example.audioText, lang)
  }

  return (
    <div className="preview-card" aria-labelledby="audio-preview-h">
      <h4 id="audio-preview-h">🔊 Listen to an example</h4>
      {example.languageNote && <p style={{ fontSize: '0.9em' }}>{example.languageNote}</p>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={onMain} disabled={checking} aria-label={state === 'speaking' ? 'Pause the example' : 'Play the example'}>{mainLabel}</button>
        {(state === 'speaking' || state === 'paused') && <button type="button" onClick={stop} aria-label="Stop the example">⏹ Stop</button>}
      </div>
      <p role="status" aria-live="polite" style={{ minHeight: '1.2em', fontWeight: state === 'speaking' || state === 'paused' ? 600 : 400 }}>
        {state === 'speaking' ? 'Playing…' : state === 'paused' ? 'Paused.' : state === 'error' ? 'Sound did not play. Your browser may have no voices installed — you can still read the example below.' : state === 'unsupported' ? 'This browser cannot play sound. You can still read the example below.' : ''}
      </p>
      <p className="learning-text" style={{ fontStyle: 'italic' }}>"{example.audioText}"</p>
    </div>
  )
}
