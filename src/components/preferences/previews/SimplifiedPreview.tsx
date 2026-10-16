import { usePreferences } from '../../../context/PreferencesContext'
import ChunkedText from '../ChunkedText'

export default function SimplifiedPreview({ example }: { example: any }) {
  const { prefs } = usePreferences()
  return (
    <div className="preview-card" aria-labelledby="simplified-preview-h">
      <h4 id="simplified-preview-h">📖 Read an example</h4>
      <p style={{ fontSize: '0.9em', color: '#555' }}>Short parts, clear words, comfy spacing — in the font you picked.</p>
      <ChunkedText sections={example.simplified} chunkSize={prefs?.chunkSize || 'medium'} />
    </div>
  )
}
