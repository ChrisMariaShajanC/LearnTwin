import { useState } from 'react'
import type { DiagramSpec } from '../../lib/diagramSchema'

export default function DiagramRenderer({ spec, onChange }: { spec: DiagramSpec; onChange?: (next: DiagramSpec) => void }) {
  const [step, setStep] = useState(0)
  const steps = spec.steps || []
  const total = steps.length || 1

  const next = () => setStep(s => Math.min(total - 1, s + 1))
  const prev = () => setStep(s => Math.max(0, s - 1))
  const reset = () => setStep(0)

  const renderVisual = () => {
    switch (spec.type) {
      case 'waterCycle':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-auto" role="img" aria-label={spec.title || 'Water cycle'}>
            <rect x="0" y="130" width="320" height="50" fill="#7db8e8" />
            <circle cx="40" cy="35" r="18" fill="#f4c430" />
            <ellipse cx="160" cy="45" rx="45" ry="18" fill="#ccc" />
            {step >= 0 && <text x="60" y="120" fontSize="12">1. Evaporation</text>}
            {step >= 1 && <text x="120" y="30" fontSize="12">2. Condensation</text>}
            {step >= 2 && <text x="210" y="95" fontSize="12">3. Precipitation</text>}
            {step >= 3 && <text x="90" y="165" fontSize="12">4. Collection</text>}
          </svg>
        )
      case 'photosynthesis':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-auto" role="img" aria-label={spec.title || 'Photosynthesis'}>
            <rect x="120" y="60" width="80" height="80" rx="12" fill="#8fd19e" />
            <text x="160" y="105" textAnchor="middle" fontSize="12">Plant</text>
            {step >= 0 && <text x="20" y="40" fontSize="12">☀ Sunlight</text>}
            {step >= 1 && <text x="20" y="90" fontSize="12">💧 Water</text>}
            {step >= 2 && <text x="20" y="140" fontSize="12">💨 CO₂</text>}
            {step >= 3 && <text x="230" y="90" fontSize="12">🍬 Glucose</text>}
            {step >= 4 && <text x="230" y="130" fontSize="12">🌬 Oxygen</text>}
          </svg>
        )
      case 'binaryTree':
        return (
          <svg viewBox="0 0 320 200" className="w-full h-auto" role="img" aria-label={spec.title || 'Binary tree'}>
            {[[160,30],[90,80],[230,80],[50,140],[130,140],[190,140],[270,140]].map((p,i)=>(
              <g key={i}>
                <circle cx={p[0]} cy={p[1]} r="16" fill={i===step?'#4ECDC4':'#e5e7eb'} stroke="#333" />
                <text x={p[0]} y={p[1]+4} textAnchor="middle" fontSize="12">{i+1}</text>
              </g>
            ))}
            {[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]].map(([a,b],i)=> {
              const pts=[[160,30],[90,80],[230,80],[50,140],[130,140],[190,140],[270,140]]
              return <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="#999" />
            })}
          </svg>
        )
      case 'fraction':
        const num = spec.fraction?.numerator ?? 1
        const den = spec.fraction?.denominator ?? 4
        return (
          <svg viewBox="0 0 220 120" className="w-full h-auto" role="img" aria-label={`Fraction ${num}/${den}`}>
            {Array.from({ length: den }).map((_, i) => (
              <rect key={i} x={10 + i * (200 / den)} y="20" width={200 / den - 2} height="60" fill={i < num ? '#4ECDC4' : '#fff'} stroke="#333" />
            ))}
            <text x="110" y="105" textAnchor="middle" fontSize="14">{num}/{den}</text>
          </svg>
        )
      case 'flowchart':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-auto" role="img" aria-label={spec.title || 'Flowchart'}>
            {(spec.nodes || []).map((node: any, i: any) => (
              <g key={node.id}>
                <rect x={20 + (i % 3) * 100} y={20 + Math.floor(i / 3) * 70} width="80" height="36" rx="8" fill={i === step ? '#4ECDC4' : '#e5e7eb'} stroke="#333" />
                <text x={60 + (i % 3) * 100} y={42 + Math.floor(i / 3) * 70} textAnchor="middle" fontSize="11">{node.label}</text>
              </g>
            ))}
          </svg>
        )
      case 'timeline':
        return (
          <svg viewBox="0 0 320 120" className="w-full h-auto" role="img" aria-label={spec.title || 'Timeline'}>
            <line x1="20" y1="60" x2="300" y2="60" stroke="#333" />
            {(spec.steps || []).map((s: any, i: any) => (
              <g key={i}>
                <circle cx={20 + i * (280 / Math.max(1, (spec.steps || []).length - 1))} cy="60" r="6" fill={i === step ? '#4ECDC4' : '#999'} />
                <text x={20 + i * (280 / Math.max(1, (spec.steps || []).length - 1))} y="45" textAnchor="middle" fontSize="10">{s.label}</text>
              </g>
            ))}
          </svg>
        )
      case 'conceptMap':
        return (
          <svg viewBox="0 0 320 180" className="w-full h-auto" role="img" aria-label={spec.title || 'Concept map'}>
            {(spec.nodes || []).map((node: any, i: any) => (
              <g key={node.id}>
                <circle cx={60 + (i % 4) * 70} cy={40 + Math.floor(i / 4) * 70} r="24" fill={i === step ? '#4ECDC4' : '#e5e7eb'} stroke="#333" />
                <text x={60 + (i % 4) * 70} y={44 + Math.floor(i / 4) * 70} textAnchor="middle" fontSize="10">{node.label}</text>
              </g>
            ))}
          </svg>
        )
      default:
        return <p>No visualization available.</p>
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold">{spec.title || 'Visual explanation'}</h3>
        <div className="flex gap-2">
          <button type="button" onClick={prev} disabled={step === 0} className="lt-btn">Previous</button>
          <button type="button" onClick={next} disabled={step >= total - 1} className="lt-btn">Next</button>
          <button type="button" onClick={reset} className="lt-btn">Reset</button>
        </div>
      </div>
      <div className="rounded-2xl border p-3" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>{renderVisual()}</div>
      {steps.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: 'var(--muted)' }}>
          <p className="font-bold">{steps[step]?.label}</p>
          <p className="text-sm">{steps[step]?.detail}</p>
        </div>
      )}
      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Step {step + 1} of {total}. Use Previous/Next to move through the visual. Text description is provided for accessibility.</p>
    </div>
  )
}
