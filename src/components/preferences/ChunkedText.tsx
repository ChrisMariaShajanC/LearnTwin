import { useEffect, useState } from 'react'

export default function ChunkedText({ sections, chunkSize = 'medium', className = 'learning-text' }: { sections: string[]; chunkSize?: string; className?: string }) {
  const per = chunkSize === 'small' ? 1 : chunkSize === 'full' ? sections.length : 2
  const [shown, setShown] = useState(per)
  useEffect(() => setShown(per), [per, sections])
  return (
    <div className={className}>
      {sections.slice(0, shown).map((s, i) => <p key={i}>{s}</p>)}
      {shown < sections.length && <button type="button" className="lt-btn" onClick={() => setShown(n => n + per)}>Show a bit more ({sections.length - shown} left)</button>}
    </div>
  )
}
