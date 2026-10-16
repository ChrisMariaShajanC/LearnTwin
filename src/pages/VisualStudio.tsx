import { useState } from 'react'
import type { Page, UserProfile } from '../types'
import { createId, readLocal, writeLocal } from '../lib/localData'
import { api } from '../lib/api'
import DiagramRenderer from '../components/visual/DiagramRenderer'
import { validateDiagramSpec } from '../lib/diagramSchema'
import type { DiagramSpec } from '../lib/diagramSchema'

function chooseDiagramType(topic: string): DiagramSpec['type'] {
  const t = topic.toLowerCase()
  if (t.includes('water cycle')) return 'waterCycle'
  if (t.includes('photosynthesis')) return 'photosynthesis'
  if (t.includes('tree') || t.includes('binary')) return 'binaryTree'
  if (t.includes('fraction')) return 'fraction'
  if (t.includes('timeline') || t.includes('history')) return 'timeline'
  if (t.includes('map') || t.includes('concept')) return 'conceptMap'
  return 'flowchart'
}

export default function VisualStudio({ navigate, user, uploadedFile }: { navigate: (p: Page) => void; user: UserProfile; uploadedFile?: any }) {
  const topic = uploadedFile?.topic || 'Learning topic'
  const [complexity, setComplexity] = useState<'simple' | 'guided' | 'detailed'>('guided')
  const [spec, setSpec] = useState<DiagramSpec>({ type: chooseDiagramType(topic), title: topic, complexity: 'guided', steps: [{ label: 'Start', detail: 'Begin the visual explanation.' }, { label: 'Key idea', detail: 'Highlight the main concept.' }, { label: 'Review', detail: 'Summarize what you learned.' }] })
  const [status, setStatus] = useState('')

  const validate = () => {
    const result = validateDiagramSpec(spec)
    setStatus(result.ok ? 'Diagram spec is valid.' : result.errors.join('; '))
  }

  const save = async () => {
    const payload = { id: createId('diagram'), userId: 'default-user', topic, diagramType: spec.type, complexity, spec }
    writeLocal('lt-diagrams', [payload, ...readLocal('lt-diagrams', [])])
    try { await api.createUpload ? null : null } catch {}
    try { await fetch('http://localhost:3001/api/diagrams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }) } catch {}
    setStatus('Diagram saved.')
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: 'var(--background)' }}>
      <div className="max-w-3xl mx-auto px-5 py-8">
        <button onClick={() => navigate('pack')} className="mb-4 text-sm font-bold" style={{ color: 'var(--primary)' }}>← Back</button>
        <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--foreground)' }}>Visual Studio</h1>
        <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>Visual explanation for: {topic}</p>
        <div className="flex gap-2 mb-4">
          {(['simple', 'guided', 'detailed'] as const).map(c => (
            <button key={c} onClick={() => { setComplexity(c); setSpec(s => ({ ...s, complexity: c })) }} className="lt-btn" style={{ background: complexity === c ? 'var(--primary)' : 'var(--muted)', color: complexity === c ? 'var(--primary-foreground)' : 'var(--foreground)' }}>{c}</button>
          ))}
        </div>
        <div className="lt-card p-4 mb-4">
          <DiagramRenderer spec={spec} />
        </div>
        <div className="flex gap-2">
          <button onClick={validate} className="lt-btn lt-btn-primary">Validate spec</button>
          <button onClick={save} className="lt-btn">Save diagram</button>
        </div>
        {status && <p className="text-sm mt-3" style={{ color: 'var(--muted-foreground)' }}>{status}</p>}
        <p className="text-xs mt-4" style={{ color: 'var(--muted-foreground)' }}>Visualizations are structured SVG diagrams with text alternatives. They do not use AI-generated raster images for exact relationships.</p>
      </div>
    </div>
  )
}
