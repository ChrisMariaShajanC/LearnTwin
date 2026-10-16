import { useRef, useState } from 'react'
import type { Page, UserProfile } from '../types'
import { suggestedSubjects, type SubjectDefinition } from '../data/curriculum'
import { createId } from '../lib/localData'

interface Props {
  navigate: (p: Page) => void
  user: UserProfile
  onFileUploaded: (file: UploadedFile) => void
  uploadContext?: { subjectId?: string; chapter?: string }
  customSubjects?: SubjectDefinition[]
}

export interface UploadedFile {
  id?: string
  name: string
  size: string
  type: string
  topic: string
  subject: string
  pages: number
  keyConcepts: string[]
  vocab: string[]
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  complexSections: string[]
  subjectId?: string
  chapter?: string
  extractedText?: string
  aiPack?: any
  createdAt?: string
  processingMode?: 'local' | 'demo'
}

type ScanStep = 'upload' | 'review' | 'processing' | 'analysis' | 'error'

const PROCESSING_STEPS = [
  { label: 'Analyzing document structure' },
  { label: 'Extracting text and content' },
  { label: 'Understanding key concepts' },
  { label: 'Assessing difficulty level' },
  { label: 'Adapting to your Learning Twin' },
  { label: 'Generating personalized materials' },
]

function inferFromName(name: string): Pick<UploadedFile, 'topic' | 'subject' | 'keyConcepts' | 'vocab' | 'difficulty' | 'complexSections'> {
  const n = name.toLowerCase()
  if (n.includes('photo') || n.includes('plant') || n.includes('bio')) {
    return {
      subject: 'Biology', topic: 'Photosynthesis',
      keyConcepts: ['Sunlight', 'Water', 'Carbon dioxide', 'Chlorophyll', 'Glucose'],
      vocab: ['Chlorophyll', 'Photosynthesis', 'Stomata', 'Chloroplast'],
      difficulty: 'Moderate',
      complexSections: ['Chloroplast structure', 'Light-dependent reactions'],
    }
  }
  if (n.includes('math') || n.includes('fract') || n.includes('algebra')) {
    return {
      subject: 'Mathematics', topic: 'Algebra & Fractions',
      keyConcepts: ['Addition', 'Multiplication', 'Fractions', 'Equations'],
      vocab: ['Numerator', 'Denominator', 'Variable', 'Coefficient'],
      difficulty: 'Moderate',
      complexSections: ['Solving for unknowns', 'Mixed fractions'],
    }
  }
  if (n.includes('physic') || n.includes('force') || n.includes('motion')) {
    return {
      subject: 'Physics', topic: 'Forces & Motion',
      keyConcepts: ['Gravity', 'Velocity', 'Friction', 'Acceleration'],
      vocab: ['Newton', 'Momentum', 'Inertia', 'Velocity'],
      difficulty: 'Challenging',
      complexSections: ["Newton's second law", 'Vector diagrams'],
    }
  }
  if (n.includes('history') || n.includes('war') || n.includes('world')) {
    return {
      subject: 'History',
      topic: name.replace(/\.[^.]+$/, '').replace(/_/g, ' '),
      keyConcepts: ['Timeline', 'Geography', 'Leaders', 'Conflict'],
      vocab: ['Chronology', 'Diplomacy', 'Revolution', 'Alliance'],
      difficulty: 'Moderate',
      complexSections: ['Causes and effects', 'Primary sources'],
    }
  }
  const topicName = name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return {
    subject: 'General', topic: topicName,
    keyConcepts: ['Main concept', 'Key idea', 'Supporting detail', 'Summary'],
    vocab: ['Term 1', 'Term 2', 'Term 3'],
    difficulty: 'Moderate',
    complexSections: ['Technical sections', 'Advanced terminology'],
  }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const difficultyColor = { Easy: '#10B981', Moderate: '#F59E0B', Challenging: '#EF4444' }

const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'pptx', 'xlsx', 'jpg', 'jpeg', 'png', 'heic', 'txt', 'csv']
const MAX_FILE_SIZE = 20 * 1024 * 1024

export default function ScanLearn({ navigate, user, onFileUploaded, uploadContext = {}, customSubjects = [] }: Props) {
  const [step, setStep]           = useState<ScanStep>('upload')
  const [dragOver, setDragOver]   = useState(false)
  const [completed, setCompleted] = useState(0)
  const [file, setFile]           = useState<UploadedFile | null>(null)
  const [rawFile, setRawFile]     = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [error, setError]         = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const inputRef                  = useRef<HTMLInputElement>(null)
  const subjects = [...suggestedSubjects(user), ...customSubjects]
  const initialSubject = subjects.find((subject) => subject.id === uploadContext.subjectId) || subjects[0]
  const [subjectId, setSubjectId] = useState(initialSubject?.id || '')
  const [chapter, setChapter] = useState(uploadContext.chapter || initialSubject?.chapters[0] || '')

  const processFile = async (f: File, demoText?: string) => {
    const extension = f.name.split('.').pop()?.toLowerCase() || ''
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setError(`.${extension || 'unknown'} files are not supported. Choose PDF, DOCX, PPTX, XLSX, an image, CSV or TXT.`)
      setStep('error')
      return
    }
    if (f.size > MAX_FILE_SIZE) {
      setError('This file is larger than the 20 MB on-device limit.')
      setStep('error')
      return
    }
    const inferred = inferFromName(f.name)
    const uploaded: UploadedFile = {
      id: createId('upload'),
      name: f.name,
      size: formatSize(f.size || 214000),
      type: f.type || (f.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      pages: 0,
      ...inferred,
      createdAt: new Date().toISOString(),
      processingMode: demoText ? 'demo' : 'local',
    }
    setRawFile(f)
    setFile(uploaded)
    setError('')
    setUploadProgress(25)
    try {
      let text = ''
      let pages = 0
      if (demoText) {
        text = demoText
      } else if (extension === 'txt' || extension === 'csv' || extension === 'md') {
        text = await f.text()
      } else {
        const buffer = await f.arrayBuffer()
        const bytes = new Uint8Array(buffer)
        let binary = ''
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
        const base64 = btoa(binary)
        const response = await fetch('http://localhost:3001/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: f.name, content: base64 }),
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.error || 'Extraction failed')
        }
        const payload = await response.json()
        text = payload.text || ''
        pages = Number(payload.pages || 0)
      }
      setExtractedText(text)
      setFile((current) => current ? { ...current, pages: pages || Math.max(1, Math.ceil((text.split(/\\s+/).filter(Boolean).length || 1) / 450)), extractedText: text } : current)
      setUploadProgress(100)
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The file was selected, but readable text could not be extracted. Try a TXT or CSV file, or paste the text for local prototype mode.')
      setStep('error')
    }
  }

  const generatePack = async () => {
    if (!file) return
    const finalText = extractedText.trim() || file.extractedText?.trim() || ''
    const selectedSubject = subjects.find((subject) => subject.id === subjectId)
    let keyConcepts = file.keyConcepts
    let vocab = file.vocab
    let difficulty = file.difficulty
    let aiPack: any = null
    try {
      const aiResponse = await fetch('http://localhost:3001/api/generate-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: finalText, filename: file.name }),
      })
      if (aiResponse.ok) {
        const payload = await aiResponse.json()
        aiPack = payload.pack || payload
        if (aiPack?.keyConcepts?.length) keyConcepts = aiPack.keyConcepts
        if (aiPack?.vocabulary?.length) vocab = aiPack.vocabulary
        if (aiPack?.difficulty) difficulty = aiPack.difficulty
      }
    } catch {
      // Fall back to local extraction when AI is unavailable.
    }
    try {
      const analysisResponse = await fetch('http://localhost:3001/api/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: finalText, filename: file.name }),
      })
      if (analysisResponse.ok) {
        const analysis = await analysisResponse.json()
        if (analysis.concepts?.length) keyConcepts = analysis.concepts
        if (analysis.vocabulary?.length) vocab = analysis.vocabulary
        if (analysis.difficulty) difficulty = analysis.difficulty
      }
    } catch {
      // Fall back to local frequency extraction when the backend is unavailable.
    }
    const words = finalText.match(/\b[A-Za-z][A-Za-z-]{4,}\b/g) || []
    const frequent = Array.from(new Set(words.map((word) => word.toLowerCase()))).slice(0, 6)
    if (!keyConcepts?.length && frequent.length) {
      keyConcepts = frequent.map((word) => word.replace(/^\w/, (char) => char.toUpperCase()))
    }
    if (!vocab?.length && frequent.length) {
      vocab = frequent.slice(0, 4).map((word) => word.replace(/^\w/, (char) => char.toUpperCase()))
    }
    const updated: UploadedFile = {
      ...file,
      subjectId: selectedSubject?.id,
      subject: selectedSubject?.name || (aiPack?.subject as string) || file.subject,
      topic: (aiPack?.topic as string) || file.topic,
      chapter,
      extractedText: finalText,
      keyConcepts: keyConcepts || file.keyConcepts,
      vocab: vocab || file.vocab,
      difficulty: (difficulty as UploadedFile['difficulty']) || file.difficulty,
      aiPack,
    }
    setFile(updated)
    setStep('processing')
    setCompleted(0)
    PROCESSING_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setCompleted(i + 1)
        if (i === PROCESSING_STEPS.length - 1) {
          setTimeout(() => { onFileUploaded(updated); setStep('analysis') }, 300)
        }
      }, (i + 1) * 260)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) processFile(f)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
  }

  const handleDemo = () => processFile(
    { name: 'Biology_Chapter_5_Photosynthesis.pdf', size: 214000, type: 'application/pdf' } as File,
    'Photosynthesis is the process plants use to convert light energy into chemical energy. Chlorophyll absorbs sunlight. Water and carbon dioxide are used to produce glucose and oxygen.'
  )

  const extLabel = (name: string) => {
    const ext = name.split('.').pop()?.toUpperCase()
    return ext || 'FILE'
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: 'var(--background)', fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-2xl mx-auto px-5 py-8">

        {/* Page header */}
        <div className="mb-7">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4" style={{ background: 'rgba(15,118,110,.1)', color: 'var(--primary)' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload & Analyze
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)' }}>
            Turn any material into a personalized lesson
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Upload a textbook page, PDF, or note. LearnTwin reads it, understands it, and adapts it to how you learn.
          </p>
          <div className="mt-3 rounded-xl border px-3 py-2 text-xs" style={{ background: 'rgba(245,158,11,.08)', borderColor: 'rgba(245,158,11,.25)', color: 'var(--muted-foreground)' }}>
            Local prototype mode: TXT and CSV are extracted on this device. PDF, Office files and images require a parser/OCR service; you can review and paste their text before generation.
          </div>
        </div>

        {/* ── UPLOAD ── */}
        {step === 'upload' && (
          <div className="space-y-4 animate-fade-up">

            {/* Main drag-drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragEnter={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className="lt-upload-zone py-14 flex flex-col items-center gap-4 transition-all"
              style={dragOver ? { borderColor: 'var(--primary)', background: 'rgba(15,118,110,.04)', transform: 'scale(1.01)' } : {}}
            >
              <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.heic,.txt,.docx,.pptx,.xlsx,.csv" className="hidden" onChange={handleInput} />

              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: dragOver ? 'rgba(15,118,110,.15)' : 'rgba(15,118,110,.08)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round">
                  {dragOver
                    ? <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>
                    : <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>
                  }
                </svg>
              </div>

              <div className="text-center">
                <p className="font-semibold text-sm mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)' }}>
                  {dragOver ? 'Drop to upload' : 'Drag & drop your file here'}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>or click to browse your device</p>
              </div>

              <button className="lt-btn lt-btn-primary text-sm px-6 py-2.5">Browse File</button>

              <div className="flex flex-wrap gap-1.5 justify-center">
                {['PDF', 'DOCX', 'PPTX', 'XLSX', 'JPG', 'PNG', 'CSV', 'TXT'].map(f => (
                  <span key={f} className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{f}</span>
                ))}
              </div>
            </div>

            {/* Upload method shortcuts */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Upload PDF',    sub: 'Textbooks, notes, papers', color: 'var(--primary)', bg: 'rgba(15,118,110,.08)', border: 'rgba(15,118,110,.2)',
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
                { label: 'Upload Image',  sub: 'JPG, PNG, HEIC photos', color: '#6366F1', bg: 'rgba(99,102,241,.08)', border: 'rgba(99,102,241,.2)',
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
                { label: 'Spreadsheet',   sub: 'XLSX, CSV data files', color: '#10B981', bg: 'rgba(16,185,129,.08)', border: 'rgba(16,185,129,.2)',
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg> },
                { label: 'Presentation',  sub: 'PPTX slide decks', color: '#F59E0B', bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.2)',
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
              ].map(o => (
                <button
                  key={o.label}
                  onClick={() => inputRef.current?.click()}
                  className="lt-card lt-card-lift p-4 text-left"
                  style={{ borderColor: o.border }}
                >
                  <div className="mb-3" style={{ color: o.color }}>{o.icon}</div>
                  <p className="text-sm font-semibold mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)' }}>{o.label}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{o.sub}</p>
                </button>
              ))}
            </div>

            {/* Demo shortcut */}
            <button
              onClick={handleDemo}
              className="w-full py-3 rounded-xl text-sm font-medium border transition-all hover:opacity-80"
              style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
            >
              Try demo: Biology_Chapter_5_Photosynthesis.pdf
            </button>
          </div>
        )}

        {/* ── REVIEW EXTRACTED TEXT ── */}
        {step === 'review' && file && (
          <div className="space-y-4 animate-fade-up">
            <div className="lt-card p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>Step 2 of 3</p>
                  <h2 className="font-bold mt-1" style={{ color: 'var(--foreground)' }}>Review extracted content</h2>
                </div>
                <span className="text-xs font-bold" style={{ color: uploadProgress === 100 ? '#10B981' : 'var(--muted-foreground)' }}>{uploadProgress}% loaded</span>
              </div>
              <div className="lt-progress mb-4"><div className="lt-progress-bar" style={{ width: `${uploadProgress}%` }} /></div>

              {!extractedText && (
                <div className="rounded-xl border p-4 mb-4 text-sm" style={{ background: 'rgba(245,158,11,.08)', borderColor: 'rgba(245,158,11,.3)', color: 'var(--foreground)' }}>
                  Browser-only extraction is not configured for this file type. No AI or OCR result has been invented. Paste the readable text below, or use TXT/CSV.
                </div>
              )}

              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                Extracted text
              </label>
              <textarea
                value={extractedText}
                onChange={(event) => { setExtractedText(event.target.value); setError('') }}
                rows={10}
                placeholder="Extracted text will appear here. You can correct it before generating materials."
                className="w-full rounded-xl border p-4 text-sm leading-relaxed resize-y"
                style={{ background: 'var(--background)', borderColor: error ? '#EF4444' : 'var(--border)', color: 'var(--foreground)' }}
              />
              {error && <p className="text-xs mt-2" style={{ color: '#EF4444' }}>{error}</p>}
            </div>

            <div className="lt-card p-5">
              <h2 className="font-bold mb-4" style={{ color: 'var(--foreground)' }}>Organize this material</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>
                  Subject
                  <select
                    value={subjectId}
                    onChange={(event) => {
                      setSubjectId(event.target.value)
                      const next = subjects.find((subject) => subject.id === event.target.value)
                      setChapter(next?.chapters[0] || '')
                    }}
                    className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-normal"
                    style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                  </select>
                </label>
                <label className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>
                  Chapter
                  <select value={chapter} onChange={(event) => setChapter(event.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-normal" style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                    {(subjects.find((subject) => subject.id === subjectId)?.chapters || [chapter]).map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
              </div>
            </div>

            <button onClick={generatePack} className="lt-btn lt-btn-primary w-full py-4 text-base">
              Identify topics and generate Learning Pack
            </button>
            <button onClick={() => { setStep('upload'); setFile(null); setRawFile(null); setExtractedText('') }} className="w-full py-2.5 text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
              Choose a different file
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="lt-card p-7 text-center animate-fade-up" style={{ borderColor: 'rgba(239,68,68,.3)' }}>
            <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-4 font-black" style={{ background: 'rgba(239,68,68,.1)', color: '#EF4444' }}>!</div>
            <h2 className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>We could not prepare that file</h2>
            <p className="text-sm mt-2 mb-5" style={{ color: 'var(--muted-foreground)' }}>{error}</p>
            <button onClick={() => { setStep('upload'); setError(''); setRawFile(null) }} className="lt-btn lt-btn-primary px-5 py-2.5">Try another file</button>
          </div>
        )}

        {/* ── PROCESSING ── */}
        {step === 'processing' && file && (
          <div className="animate-fade-up">
            {/* File chip */}
            <div className="lt-card flex items-center gap-3 p-4 mb-5" style={{ borderColor: 'rgba(15,118,110,.3)', background: 'rgba(15,118,110,.04)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'var(--primary)' }}>
                {extLabel(file.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)' }}>{file.name}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{file.size} · Uploaded successfully</p>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>

            <div className="lt-card p-7">
              {/* Spinner */}
              <div className="flex justify-center mb-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'var(--border)' }} />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" style={{ borderTopColor: 'var(--primary)' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round">
                      <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                    </svg>
                  </div>
                </div>
              </div>

              <h2 className="text-lg font-bold text-center mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)' }}>
                Preparing your local Learning Pack
              </h2>
              <p className="text-sm text-center mb-6" style={{ color: 'var(--muted-foreground)' }}>
                Using the text you reviewed from <em style={{ color: 'var(--foreground)', fontStyle: 'normal', fontWeight: 600 }}>{file.name}</em>
              </p>

              <div className="space-y-2 mb-5">
                {PROCESSING_STEPS.map((s, i) => {
                  const done   = i < completed
                  const active = i === completed - 1
                  return (
                    <div
                      key={s.label}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                      style={{
                        background: done ? 'rgba(16,185,129,.07)' : active ? 'rgba(15,118,110,.05)' : 'transparent',
                        opacity: i > completed ? 0.35 : 1,
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all"
                        style={{
                          background: done ? '#10B981' : active ? 'var(--primary)' : 'var(--muted)',
                          color: done || active ? 'white' : 'var(--muted-foreground)',
                        }}
                      >
                        {done ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : i + 1}
                      </div>
                      <span className="text-sm" style={{ color: done ? '#10B981' : active ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: active ? 500 : 400 }}>
                        {s.label}
                      </span>
                      {active && (
                        <div className="ml-auto flex gap-1">
                          {[0, 1, 2].map(d => (
                            <div key={d} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary)', animation: `bounce 1.2s ease ${d * 0.15}s infinite` }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="lt-progress">
                <div className="lt-progress-bar" style={{ width: `${(completed / PROCESSING_STEPS.length) * 100}%` }} />
              </div>
              <p className="text-center text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                {completed} of {PROCESSING_STEPS.length} steps complete
              </p>
            </div>
          </div>
        )}

        {/* ── ANALYSIS ── */}
        {step === 'analysis' && file && (
          <div className="space-y-4 animate-fade-up">

            {/* Success banner */}
            <div className="lt-card flex items-center gap-3 p-4" style={{ borderColor: 'rgba(16,185,129,.3)', background: 'rgba(16,185,129,.05)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,.15)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)' }}>Local Learning Pack ready</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{file.name} · {file.size}</p>
              </div>
            </div>

            {/* Document metadata */}
            <div className="lt-card p-6">
              <h2 className="font-semibold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)' }}>Document Analysis</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>Created from reviewed text in <strong style={{ color: 'var(--foreground)', fontWeight: 500 }}>{file.name}</strong></p>

              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { label: 'Subject', val: file.subject },
                  { label: 'Topic',   val: file.topic },
                  { label: 'Pages',   val: `~${file.pages} pages` },
                  { label: 'Difficulty', val: file.difficulty,
                    valStyle: { color: difficultyColor[file.difficulty], fontWeight: 600 } },
                ].map(d => (
                  <div key={d.label} className="rounded-xl p-3" style={{ background: 'var(--muted)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--muted-foreground)' }}>{d.label}</p>
                    <p className="text-sm font-semibold truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)', ...('valStyle' in d ? d.valStyle as React.CSSProperties : {}) }}>{d.val}</p>
                  </div>
                ))}
              </div>

              {/* Key concepts */}
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--muted-foreground)' }}>Key concepts identified</p>
                <div className="flex flex-wrap gap-2">
                  {file.keyConcepts.map(c => (
                    <span key={c} className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: 'rgba(15,118,110,.1)', color: 'var(--primary)' }}>{c}</span>
                  ))}
                </div>
              </div>

              {/* Vocabulary */}
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--muted-foreground)' }}>Vocabulary to address</p>
                <div className="flex flex-wrap gap-2">
                  {file.vocab.map(v => (
                    <span key={v} className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: 'rgba(245,158,11,.1)', color: '#D97706', border: '1px solid rgba(245,158,11,.2)' }}>{v}</span>
                  ))}
                </div>
              </div>

              {/* Complex sections */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--muted-foreground)' }}>Complex sections flagged</p>
                <div className="space-y-1.5">
                  {file.complexSections.map(s => (
                    <div key={s} className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#EF4444' }} />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Adaptation plan */}
            <div className="lt-card p-6">
              <h2 className="font-semibold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)' }}>How Twin will adapt this for {user.name}</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>Based on your personal learning profile:</p>
              <div className="space-y-2.5">
                {[
                  'Short, clear sentences matched to your reading pace',
                  'Visual diagrams and concept maps',
                  'Real-world examples added to each concept',
                  'Step-by-step breakdowns for complex sections',
                  'Audio read-aloud and text highlighting',
                ].map(item => (
                  <div key={item} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--foreground)' }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(15,118,110,.12)' }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('pack')}
              className="lt-btn lt-btn-primary w-full py-4 text-base"
            >
              Create My Learning Pack
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>

            <button
              onClick={() => { setStep('upload'); setFile(null); setRawFile(null); setExtractedText(''); setCompleted(0) }}
              className="w-full py-2.5 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Upload a different file
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
