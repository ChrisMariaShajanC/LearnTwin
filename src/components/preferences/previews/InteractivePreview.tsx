import { useState } from 'react'

export default function InteractivePreview({ example }: { example: any }) {
  const { quiz } = example
  const [picked, setPicked] = useState<number | null>(null)
  const [solved, setSolved] = useState(false)
  const choose = (i: number) => { setPicked(i); if (i === quiz.answerIndex) setSolved(true) }
  return (
    <div className="preview-card" aria-labelledby="interactive-preview-h">
      <h4 id="interactive-preview-h">✏️ Try a mini question</h4>
      <p aria-live="polite" style={{ fontWeight: solved ? 700 : 400, minHeight: '1.3em' }}>{solved ? '✅ Yes! Great job.' : picked == null ? 'Pick an answer:' : 'Not yet — try again. You can do it!'}</p>
      <p className="learning-text" style={{ fontWeight: 600 }}>{quiz.question}</p>
      <div role="group" aria-label="Answer choices" style={{ display: 'grid', gap: 8 }}>
        {quiz.options.map((opt: string, i: number) => (
          <button key={i} type="button" className="chip" aria-pressed={picked === i} onClick={() => choose(i)} disabled={solved}>
            {opt}{picked === i && !solved ? ' — not this one' : ''}{solved && i === quiz.answerIndex ? ' ✓' : ''}
          </button>
        ))}
      </div>
      {picked != null && !solved && <p style={{ marginTop: 8 }}>💡 Hint: {quiz.hint}</p>}
      {solved && <button type="button" style={{ marginTop: 8 }} onClick={() => { setPicked(null); setSolved(false) }}>Try it again</button>}
      <p style={{ fontSize: '0.85em', color: '#555', marginTop: 10 }}>This is just a practice example. It does <strong>not</strong> go into your scores.</p>
    </div>
  )
}
