import { useState } from 'react'
import FontChoice from './FontChoice'
import AudioPreview from './previews/AudioPreview'
import VisualPreview from './previews/VisualPreview'
import SimplifiedPreview from './previews/SimplifiedPreview'
import InteractivePreview from './previews/InteractivePreview'
import { usePreferences } from '../../context/PreferencesContext'
import { getPreviewExample } from '../../lib/previewContent'

const FORMATS = [
  { value: 'audio', label: 'Listen', icon: '🔊', hint: 'Someone tells you about it.' },
  { value: 'visual', label: 'Pictures', icon: '🖼️', hint: 'Drawings show you how it works.' },
  { value: 'simplified', label: 'Easy reading', icon: '📖', hint: 'Short parts and simple words.' },
  { value: 'interactive', label: 'Practice', icon: '✏️', hint: 'Try it with little questions.' },
]
const PREVIEW_ORDER = ['audio', 'visual', 'simplified', 'interactive']
const INTEREST_SUGGESTIONS = ['Animals', 'Space', 'Stories', 'Sports', 'How things work', 'Nature', 'Art and music', 'Games']

export default function LearningPreferencesPanel({ mode = 'settings', student = {}, subjects = [], onSave, onSkip, saving = false }: any) {
  const { prefs, update } = usePreferences()
  const set = (patch: any) => update(patch)
  const [customInterest, setCustomInterest] = useState('')
  const example = getPreviewExample({ grade: student?.grade, subject: student?.subject, language: student?.language })

  const toggleFormat = (v: string) => {
    const has = prefs.learningFormats.includes(v)
    set({ learningFormats: has ? prefs.learningFormats.filter((f: string) => f !== v) : [...prefs.learningFormats, v] })
  }
  const toggleInterest = (v: string) => {
    const has = prefs.interests.includes(v)
    set({ interests: has ? prefs.interests.filter((i: string) => i !== v) : [...prefs.interests, v].slice(0, 12) })
  }

  const previewFor = (f: string) => {
    if (f === 'audio') return <AudioPreview example={example} />
    if (f === 'visual') return <VisualPreview example={example} />
    if (f === 'simplified') return <SimplifiedPreview example={example} />
    return <InteractivePreview example={example} />
  }

  const Radio = ({ name, legend, options, value, onChange }: any) => (
    <fieldset style={{ marginTop: 22 }}>
      <legend><strong>{legend}</strong></legend>
      <div role="radiogroup" aria-label={legend} style={{ display: 'grid', gap: 8, marginTop: 8 }}>
        {options.map((o: any) => (
          <label key={o.value} className="chip" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span>{o.label}{o.hint && <span style={{ color: '#666' }}> — {o.hint}</span>}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )

  return (
    <section className="prefs-panel" aria-labelledby="prefs-h">
      <h3 id="prefs-h">{mode === 'onboarding' ? 'How do you like to learn?' : 'Your learning choices'}</h3>
      <p>{mode === 'onboarding' ? 'Pick what helps you. Try each one first. You can change your mind any time.' : 'Change anything you like, then press Save. You can come back any time.'}</p>

      <fieldset style={{ marginTop: 18 }}>
        <legend><strong>What do you like to use when you learn? Pick one or more.</strong></legend>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
          {FORMATS.map(f => {
            const selected = prefs.learningFormats.includes(f.value)
            return (
              <button key={f.value} type="button" className={`chip ${selected ? 'is-selected' : ''}`} aria-pressed={selected} onClick={() => toggleFormat(f.value)}>
                {f.icon} {f.label}{selected ? ' ✓' : ''}
                <span style={{ display: 'block', fontSize: '0.85em', color: '#666' }}>{f.hint}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      {prefs.learningFormats.length > 0 && (
        <div style={{ marginTop: 12 }} aria-live="polite">
          <h4>Your examples — try them now</h4>
          {PREVIEW_ORDER.filter(f => prefs.learningFormats.includes(f)).map(f => <div key={f}>{previewFor(f)}</div>)}
        </div>
      )}

      <Radio name="exstyle" legend="When something is hard, how should we explain it?" value={prefs.explanationStyle || ''} onChange={(v: string) => set({ explanationStyle: v || null })} options={[
        { value: 'steps', label: 'In little steps' },
        { value: 'visual', label: 'With a picture' },
        { value: 'audio', label: 'By letting me listen' },
        { value: 'worked', label: 'Show me one full example' },
        { value: 'practice', label: 'Short words first, then I try' },
        { value: '', label: 'Not sure yet' },
      ]} />

      <Radio name="chunk" legend="How much reading do you want on one page?" value={prefs.chunkSize} onChange={(v: string) => set({ chunkSize: v })} options={[
        { value: 'small', label: 'A little at a time' },
        { value: 'medium', label: 'Some' },
        { value: 'full', label: 'All of it' },
      ]} />

      <fieldset style={{ marginTop: 22 }}>
        <legend><strong>What do you like to learn about?</strong></legend>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
          {[...new Set([...(subjects || []), ...INTEREST_SUGGESTIONS])].slice(0, 16).map((s: string) => {
            const selected = prefs.interests.includes(s)
            return <button key={s} type="button" className={`chip ${selected ? 'is-selected' : ''}`} aria-pressed={selected} onClick={() => toggleInterest(s)}>{s}{selected ? ' ✓' : ''}</button>
          })}
        </div>
        <label style={{ display: 'block', marginTop: 10 }}>
          Something else? (you can write it):{' '}
          <input type="text" maxLength={200} value={prefs.interestsCustom} onChange={e => set({ interestsCustom: e.target.value })} />
        </label>
      </fieldset>

      <div style={{ marginTop: 22 }}><FontChoice value={prefs.font} onChange={(v: string) => set({ font: v })} /></div>

      <Radio name="switching" legend="Can we ask you again later about how you like to learn?" value={prefs.formatSwitching} onChange={(v: string) => set({ formatSwitching: v })} options={[
        { value: 'yes', label: 'Yes, that is okay' },
        { value: 'noPreference', label: 'I do not mind' },
        { value: 'askLater', label: 'Ask me later' },
      ]} />

      <div style={{ display: 'flex', gap: 12, marginTop: 26, flexWrap: 'wrap' }}>
        {onSave && <button type="button" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save my choices'}</button>}
        {onSkip && mode === 'onboarding' && <button type="button" onClick={onSkip} disabled={saving}>Skip — I will decide later</button>}
      </div>
      {mode === 'onboarding' && <p style={{ fontSize: '0.9em', color: '#555', marginTop: 8 }}>Nothing here is a test. There are no right or wrong answers.</p>}
    </section>
  )
}
