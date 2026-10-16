import React from 'react'

const FractionCircle = () => (
  <svg viewBox="0 0 120 120" width="150" role="img" aria-label="Circle cut into 4 equal parts with 3 parts coloured"><g>{[['60,20','100,60',true],['100,60','60,100',true],['60,100','20,60',true],['20,60','60,20',false]].map(([a,b,fill],i)=><path key={i} d={`M60,60 L${a} A40,40 0 0 1 ${b} Z`} fill={fill?'#4a90d9':'#fff'} stroke="#333" />)}</g><text x="60" y="115" textAnchor="middle" fontSize="11">3 of 4 parts = 3/4</text></svg>
)
const ApplesAddition = () => (
  <svg viewBox="0 0 220 80" width="220" role="img" aria-label="Two red apples plus three green apples equals five apples"><text x="66" y="46" fontSize="18">+</text><text x="160" y="46" fontSize="18">= 5</text>{[0,1].map(i=><circle key={i} cx={20+i*26} cy={40} r={11} fill="#d33" />)}{[0,1,2].map(i=><circle key={i} cx={86+i*26} cy={40} r={11} fill="#3a3" />)}</svg>
)
const WaterCycle = () => (
  <svg viewBox="0 0 260 150" width="260" role="img" aria-label="Water cycle diagram"><rect x="0" y="115" width="260" height="35" fill="#7db8e8" /><circle cx="30" cy="25" r="14" fill="#f4c430" /><text x="55" y="30" fontSize="11">1. Sun warms water</text><ellipse cx="185" cy="35" rx="28" ry="12" fill="#ccc" /><text x="140" y="80" fontSize="11">2. Water rises</text><text x="185" y="60" fontSize="11">3. Cloud forms</text>{[175,190,205].map(x=><line key={x} x1={x} y1="52" x2={x-4} y2="72" stroke="#4a90d9" strokeWidth="2" />)}</svg>
)
const PlantGrowth = () => (
  <svg viewBox="0 0 240 110" width="240" role="img" aria-label="Three steps of a growing plant"><ellipse cx="35" cy="90" rx="10" ry="6" fill="#8a5a2b" /><text x="28" y="106" fontSize="10">1. Seed</text><line x1="115" y1="95" x2="115" y2="65" stroke="#2a7" strokeWidth="3" /><text x="100" y="106" fontSize="10">2. Sprout</text><line x1="195" y1="95" x2="195" y2="40" stroke="#2a7" strokeWidth="3" /><circle cx="195" cy="32" r="9" fill="#e91e63" /><text x="172" y="106" fontSize="10">3. Plant</text></svg>
)
const CatScene = () => (
  <svg viewBox="0 0 160 110" width="160" role="img" aria-label="A cat sitting on a mat"><rect x="20" y="85" width="120" height="18" rx="6" fill="#c96" /><ellipse cx="80" cy="65" rx="28" ry="20" fill="#666" /><circle cx="80" cy="38" r="16" fill="#666" /></svg>
)
const StoryMap = () => (
  <svg viewBox="0 0 240 80" width="240" role="img" aria-label="Story map with beginning, middle, end"><g>{['Beginning','Middle','End'].map((t,i)=><g key={t}><rect x={10+i*80} y="20" width="66" height="34" rx="8" fill={i===1?'#ffe08a':'#e8f0fe'} stroke="#333" /><text x={43+i*80} y="41" textAnchor="middle" fontSize="11">{t}</text>{i<2 && <text x={86+i*80} y="42" fontSize="14">→</text>}</g>)}</g></svg>
)

const FIGURES: Record<string, React.ComponentType> = { fraction: FractionCircle, apples: ApplesAddition, water: WaterCycle, plant: PlantGrowth, cat: CatScene, story: StoryMap }

export default function VisualPreview({ example }: { example: any }) {
  const Figure = FIGURES[example.visual]
  return (
    <div className="preview-card" aria-labelledby="visual-preview-h">
      <h4 id="visual-preview-h">🖼️ Look at an example</h4>
      {Figure ? <figure style={{ margin: 0 }}><Figure /></figure> : <p role="status">No picture example is ready right now. Your lessons will still show pictures whenever a picture is available.</p>}
      <p style={{ fontSize: '0.9em', color: '#555' }}>This is an example picture, like the ones your lessons can show.</p>
    </div>
  )
}
