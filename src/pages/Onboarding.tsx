import { useRef, useState } from 'react'
import type { Page, UserProfile, EducationLevel } from '../types'
import Mascot from '../components/Mascot'
import LearningPreferencesPanel from '../components/preferences/LearningPreferencesPanel'
import { usePreferences } from '../context/PreferencesContext'
import { useSpeech } from '../hooks/useSpeech'

interface Props {
  navigate: (p: Page) => void
  user: UserProfile
  setUser: (u: UserProfile) => void
}

type Step = 'welcome' | 'education' | 'name' | 'font' | 'visual' | 'audio' | 'format' | 'preferences' | 'result'
const steps: Step[] = ['welcome', 'education', 'name', 'font', 'visual', 'audio', 'format', 'preferences', 'result']

const SAMPLE = `Plants make their own food using sunlight, water, and carbon dioxide. This process is called photosynthesis. The green colour in plants comes from chlorophyll, which captures energy from the sun.`

const visualOpts = [
  {
    id: 'A', emoji: '😊', desc: 'Large · Warm · Relaxed',
    style: {
      fontFamily: "'Lexend',sans-serif", fontSize: 19, lineHeight: 2.2,
      letterSpacing: '0.04em', wordSpacing: '0.12em',
      background: '#FFF8ED', color: '#241A00', padding: '22px 26px', borderRadius: 16,
    },
  },
  {
    id: 'B', emoji: '🙂', desc: 'Medium · White · Normal',
    style: {
      fontFamily: "'Nunito',sans-serif", fontSize: 16, lineHeight: 1.75,
      background: '#FFFFFF', color: '#1C1B2E', padding: '22px 26px', borderRadius: 16,
    },
  },
  {
    id: 'C', emoji: '😐', desc: 'Compact · Blue tint · Wide letters',
    style: {
      fontFamily: "'Lexend',sans-serif", fontSize: 13.5, lineHeight: 1.55,
      letterSpacing: '0.08em', background: '#EFF6FF', color: '#1E3A5F', padding: '22px 26px', borderRadius: 16,
    },
  },
]

const formats = [
  { id: 'visual',     icon: '👀', label: 'Pictures & Diagrams', desc: 'Learning with images and visual aids' },
  { id: 'audio',      icon: '🎧', label: 'Listening',           desc: 'Hearing information read aloud' },
  { id: 'examples',  icon: '💡', label: 'Examples',             desc: 'Seeing real-life examples' },
  { id: 'text',       icon: '📄', label: 'Reading',             desc: 'Reading paragraphs of text' },
  { id: 'stepByStep', icon: '📋', label: 'Step-by-step',        desc: 'Following numbered steps' },
]

interface EduOpt {
  id: EducationLevel
  icon: string
  title: string
  subtitle: string
  color: string
  bg: string
  streams?: string[]
  grades?: string[]
  courses?: string[]
}

const EDU_OPTIONS: EduOpt[] = [
  { id: 'kg',     icon: '🌱', title: 'Kindergarten',        subtitle: 'LKG and UKG',                    color: '#10B981', bg: 'rgba(16,185,129,.08)', grades: ['LKG', 'UKG'] },
  { id: 'lp',     icon: '📗', title: 'Lower Primary',       subtitle: 'Grades 1–4',                     color: '#22C55E', bg: 'rgba(34,197,94,.08)', grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'] },
  { id: 'up',     icon: '📚', title: 'Upper Primary',       subtitle: 'Grades 5–7',                     color: '#3B82F6', bg: 'rgba(59,130,246,.08)', grades: ['Grade 5', 'Grade 6', 'Grade 7'] },
  { id: 'hs',     icon: '🎒', title: 'High School',         subtitle: 'Grades 8–10',                    color: '#8B5CF6', bg: 'rgba(139,92,246,.08)', grades: ['Grade 8', 'Grade 9', 'Grade 10'] },
  { id: 'hss',    icon: '🎓', title: 'Higher Secondary',    subtitle: 'Grades 11–12',                   color: '#F59E0B', bg: 'rgba(245,158,11,.08)', grades: ['Grade 11', 'Grade 12'], streams: ['Science', 'Commerce', 'Humanities', 'Other'] },
  { id: 'higher', icon: '💻', title: 'Higher Education',    subtitle: 'Degree, diploma or postgraduate', color: '#EF4444', bg: 'rgba(239,68,68,.08)', courses: ['B.Tech', 'BA', 'BSc', 'BCom', 'BBA', 'BCA', 'Diploma', 'Vocational', 'Postgraduate', 'Other'] },
  { id: 'other',  icon: '＋', title: 'Other / Custom Course', subtitle: 'Enter a course that is not listed', color: '#64748B', bg: 'rgba(100,116,139,.08)' },
]

export default function Onboarding({ navigate, user, setUser }: Props) {
  const { update } = usePreferences()
  const [step, setStep]         = useState<Step>('welcome')
  const [name, setName]         = useState('')
  const [eduLevel, setEduLevel] = useState<EducationLevel | null>(null)
  const [stream, setStream]     = useState('')
  const [grade, setGrade]       = useState('')
  const [course, setCourse]     = useState('')
  const [department, setDepartment] = useState('')
  const [semester, setSemester] = useState('')
  const [institution, setInstitution] = useState('')
  const [customCourse, setCustomCourse] = useState('')
  const [visual, setVisual]     = useState<string | null>(() => (user.accessibility?.fontSize === 'xl' ? 'A' : user.accessibility?.fontSize === 'large' ? 'B' : user.accessibility?.fontSize ? 'C' : null))
  const [fontChoice, setFontChoice] = useState<'sans' | 'opendyslexic' | 'lexend'>(() => (user.accessibility?.fontFamily === 'opendyslexic' ? 'opendyslexic' : user.accessibility?.fontFamily === 'lexend' ? 'lexend' : 'sans'))
  const [audioAns, setAudioAns] = useState<string | null>(null)
  const [ratings, setRatings]   = useState<Record<string, number>>({})
  const [playing, setPlaying]   = useState(false)
  const speech = useSpeech()
  const [avatar, setAvatar]     = useState<string | undefined>(undefined)
  const avatarRef = useRef<HTMLInputElement>(null)

  const idx      = steps.indexOf(step)
  const progress = (idx / (steps.length - 1)) * 100
  const rate     = (id: string, s: number) => setRatings(r => ({ ...r, [id]: s }))
  const selectedEdu = EDU_OPTIONS.find(e => e.id === eduLevel)

  const finish = () => {
    setUser({
      ...user,
      name: name.trim() || user.name,
      avatar,
      educationLevel: eduLevel || 'highschool',
      grade: grade || course || customCourse || user.grade,
      stream: stream || undefined,
      education: {
        grade: grade || undefined,
        stream: stream || undefined,
        course: course || undefined,
        department: department || undefined,
        semester: semester || undefined,
        institution: institution || undefined,
        customCourse: customCourse || undefined,
      },
      selectedSubjects: [],
      role: 'student',
      accessibility: {
        ...user.accessibility,
        fontSize:    visual === 'A' ? 'xl' : visual === 'B' ? 'large' : 'normal',
        fontFamily:  fontChoice === 'opendyslexic' ? 'opendyslexic' : fontChoice === 'lexend' ? 'lexend' : 'system',
        background:  visual === 'A' ? 'warm' : visual === 'C' ? 'cool' : 'light',
        lineSpacing: visual === 'A' ? 'loose' : 'relaxed',
        audioEnabled: audioAns === 'Chlorophyll',
      },
      learningPreferences: {
        font: fontChoice === 'opendyslexic' ? 'opendyslexic' : fontChoice === 'lexend' ? 'atkinson' : 'default',
        learningFormats: user.learningPreferences?.learningFormats || [],
        explanationStyle: user.learningPreferences?.explanationStyle ?? null,
        chunkSize: user.learningPreferences?.chunkSize || 'medium',
        interests: user.learningPreferences?.interests || [],
        interestsCustom: user.learningPreferences?.interestsCustom || '',
        formatSwitching: user.learningPreferences?.formatSwitching || 'noPreference',
        onboardingPreferencesDone: user.learningPreferences?.onboardingPreferencesDone || false,
      },
      learningPattern: {
        visual:     (ratings['visual']     ?? 4) * 20,
        audio:      (ratings['audio']      ?? 3) * 20,
        examples:   (ratings['examples']   ?? 5) * 20,
        text:       (ratings['text']       ?? 2) * 20,
        stepByStep: (ratings['stepByStep'] ?? 4) * 20,
      },
    })
    navigate('dashboard')
  }

  const back = () => setStep(steps[idx - 1])
  const fwd  = () => setStep(steps[idx + 1])

  return (
    <div className="min-h-screen font-display flex flex-col" style={{ background: 'var(--background)' }}>

      {step !== 'welcome' && (
        <div className="fixed top-0 left-0 right-0 h-1.5 z-50" style={{ background: 'var(--muted)' }}>
          <div className="progress-bar h-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-5 pt-8">

        {/* ── WELCOME ── */}
        {step === 'welcome' && (
          <div className="max-w-md w-full text-center animate-pop">
            <Mascot size="xl" mood="waving" className="mx-auto mb-7" />
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold mb-5 border" style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)', borderColor: 'var(--border)' }}>
              🧪 Learning &amp; Accessibility Check
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ color: 'var(--foreground)' }}>
              Let's find the easiest way for you to learn.
            </h1>
            <p className="text-base font-body leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
              Takes about <strong style={{ color: 'var(--foreground)' }}>2 minutes</strong>. No right or wrong answers.
            </p>
            <p className="text-xs font-body mb-7 italic px-4" style={{ color: 'var(--muted-foreground)' }}>
              This is not a medical diagnosis. We simply learn which learning preferences and reading settings are most comfortable for you.
            </p>
            <div className="rounded-3xl p-5 border mb-7 text-left" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <p className="font-black mb-3" style={{ color: 'var(--foreground)' }}>We'll check:</p>
              {[['🎒','Your education level'], ['👀','Which reading style feels most comfortable'], ['🎧','Whether you prefer listening or reading'], ['🧠','Which learning formats you enjoy most']].map(([icon, txt]) => (
                <div key={txt as string} className="flex items-center gap-3 text-sm font-body mb-2 last:mb-0" style={{ color: 'var(--muted-foreground)' }}>
                  <span>{icon}</span><span>{txt}</span>
                </div>
              ))}
            </div>
            <button onClick={fwd} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl btn-press animate-pulse-glow">
              Let's go! 🚀
            </button>
          </div>
        )}

        {/* ── EDUCATION LEVEL ── */}
        {step === 'education' && (
          <div className="max-w-lg w-full animate-pop">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🎒</div>
              <h2 className="text-2xl md:text-3xl font-black mb-2" style={{ color: 'var(--foreground)' }}>What's your education level?</h2>
              <p className="font-body text-sm" style={{ color: 'var(--muted-foreground)' }}>
                LearnTwin adapts its language, style, and interface to match your level.
              </p>
            </div>

            <div className="space-y-2.5 mb-5">
              {EDU_OPTIONS.map(opt => (
                <div
                  key={opt.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => { setEduLevel(opt.id); setGrade(''); setStream(''); setCourse('') }}
                  onKeyDown={e => e.key === 'Enter' && (setEduLevel(opt.id), setGrade(''), setStream(''), setCourse(''))}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer"
                  style={{
                    borderColor: eduLevel === opt.id ? opt.color : 'var(--border)',
                    background:  eduLevel === opt.id ? opt.bg : 'var(--card)',
                    boxShadow:   eduLevel === opt.id ? `0 0 0 3px ${opt.color}22` : undefined,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: opt.bg, border: `1.5px solid ${opt.color}30` }}
                  >
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black font-display" style={{ color: 'var(--foreground)' }}>{opt.title}</p>
                    <p className="text-xs font-body" style={{ color: 'var(--muted-foreground)' }}>{opt.subtitle}</p>

                    {/* Stream selector — shown inline when selected */}
                    {opt.streams && eduLevel === opt.id && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {opt.streams.map(s => (
                          <button
                            key={s}
                            onClick={e => { e.stopPropagation(); setStream(s) }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold border transition-all"
                            style={{
                              background:  stream === s ? opt.color : 'transparent',
                              color:       stream === s ? 'white' : opt.color,
                              borderColor: opt.color,
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                    {opt.grades && eduLevel === opt.id && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {opt.grades.map(item => (
                          <button
                            key={item}
                            onClick={event => { event.stopPropagation(); setGrade(item) }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold border"
                            style={{ background: grade === item ? opt.color : 'transparent', color: grade === item ? 'white' : opt.color, borderColor: opt.color }}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                    {opt.courses && eduLevel === opt.id && (
                      <div className="mt-3 space-y-2" onClick={event => event.stopPropagation()}>
                        <select value={course} onChange={event => setCourse(event.target.value)} className="w-full rounded-lg border px-3 py-2 text-xs font-bold" style={{ background: 'var(--background)', borderColor: opt.color, color: 'var(--foreground)' }}>
                          <option value="">Select programme</option>
                          {opt.courses.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                        {course && (
                          <div className="grid grid-cols-2 gap-2">
                            <input value={department} onChange={event => setDepartment(event.target.value)} placeholder={course === 'B.Tech' ? 'Branch, e.g. CSE' : 'Department / major'} className="rounded-lg border px-3 py-2 text-xs" style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                            <input value={semester} onChange={event => setSemester(event.target.value)} placeholder="Semester / year" className="rounded-lg border px-3 py-2 text-xs" style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                            <input value={institution} onChange={event => setInstitution(event.target.value)} placeholder="Institution (optional)" className="col-span-2 rounded-lg border px-3 py-2 text-xs" style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                          </div>
                        )}
                      </div>
                    )}
                    {opt.id === 'other' && eduLevel === opt.id && (
                      <input
                        value={customCourse}
                        onClick={event => event.stopPropagation()}
                        onChange={event => setCustomCourse(event.target.value)}
                        placeholder="Enter your course"
                        className="mt-3 w-full rounded-lg border px-3 py-2 text-xs"
                        style={{ background: 'var(--background)', borderColor: opt.color, color: 'var(--foreground)' }}
                      />
                    )}
                  </div>
                  <div
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all text-sm font-black"
                    style={{
                      borderColor: eduLevel === opt.id ? opt.color : 'var(--border)',
                      background:  eduLevel === opt.id ? opt.color : 'transparent',
                      color:       'white',
                    }}
                  >
                    {eduLevel === opt.id && '✓'}
                  </div>
                </div>
              ))}

            </div>

            <button
              onClick={fwd}
              disabled={!eduLevel || Boolean(selectedEdu?.grades && !grade) || Boolean(selectedEdu?.streams && !stream) || eduLevel === 'higher' && !course || eduLevel === 'other' && !customCourse.trim()}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl btn-press disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── NAME ── */}
        {step === 'name' && (
          <div className="max-w-sm w-full animate-pop">
            <div className="text-center mb-7">
              {/* Avatar picker */}
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = (ev) => setAvatar(ev.target?.result as string)
                  reader.readAsDataURL(file)
                }}
              />
              <div className="relative inline-block mb-4">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover mx-auto" style={{ boxShadow: '0 0 0 4px var(--primary)' }} />
                ) : (eduLevel === 'kg' || eduLevel === 'lp' || eduLevel === 'up' || eduLevel === 'primary' || eduLevel === 'middle')
                  ? <Mascot size="md" mood="happy" className="mx-auto" />
                  : <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl" style={{ background: 'var(--muted)', border: '2px dashed var(--border)' }}>👤</div>
                }
                <button
                  onClick={() => avatarRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white transition-transform hover:scale-110"
                  style={{ background: 'var(--primary)' }}
                  title="Add profile picture"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <button onClick={() => avatarRef.current?.click()} className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                  {avatar ? 'Change photo' : 'Add profile photo'}
                </button>
                {avatar && (
                  <>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>·</span>
                    <button onClick={() => setAvatar(undefined)} className="text-xs font-semibold hover:underline" style={{ color: '#EF4444' }}>Remove</button>
                  </>
                )}
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>(optional)</span>
              </div>

              <h2 className="text-3xl font-black mb-1" style={{ color: 'var(--foreground)' }}>
                {['kg', 'lp', 'primary'].includes(eduLevel || '') ? "Hi there! What's your name?" : "What should we call you?"}
              </h2>
              {selectedEdu && (
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mt-3 border"
                  style={{ background: selectedEdu.bg, color: selectedEdu.color, borderColor: `${selectedEdu.color}30` }}
                >
                  {selectedEdu.icon} {selectedEdu.title}{grade ? ` · ${grade}` : ''}{stream ? ` · ${stream}` : ''}{course ? ` · ${course}` : ''}
                </div>
              )}
            </div>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && fwd()}
              placeholder="My name is…"
              className="w-full px-6 py-4 text-xl rounded-2xl border-2 text-center font-black mb-3"
              style={{
                background: 'var(--card)', borderColor: name.trim() ? 'var(--primary)' : 'var(--border)',
                color: 'var(--foreground)', outline: 'none', fontFamily: "'Nunito',sans-serif",
              }}
            />
            <button onClick={fwd} disabled={!name.trim()} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl btn-press disabled:opacity-40 mb-2">
              Next →
            </button>
            <button onClick={() => { setName(user.name); fwd() }} className="w-full py-3 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: 'var(--muted-foreground)' }}>
              Skip for now
            </button>
          </div>
        )}

        {/* ── FONT ── */}
        {step === 'font' && (
          <div className="max-w-lg w-full animate-pop">
            <div className="text-center mb-7">
              <div className="text-4xl mb-2">🔤</div>
              <h2 className="text-2xl md:text-3xl font-black mb-2" style={{ color: 'var(--foreground)' }}>Which letters are easiest to read?</h2>
              <p className="font-body" style={{ color: 'var(--muted-foreground)' }}>Pick the font that feels best. You can change it later.</p>
            </div>
            <div className="space-y-3 mb-7">
              {[
                { id: 'sans', label: 'Sans Serif', css: "system-ui, sans-serif", sample: 'Plants need water and light.' },
                { id: 'opendyslexic', label: 'OpenDyslexic', css: "'OpenDyslexic', Verdana, sans-serif", sample: 'Plants need water and light.' },
                { id: 'lexend', label: 'Lexend', css: "'Lexend', sans-serif", sample: 'Plants need water and light.' },
              ].map(opt => (
                <button key={opt.id} onClick={() => setFontChoice(opt.id as any)} className="w-full text-left rounded-3xl border-2 overflow-hidden transition-all" style={{ borderColor: fontChoice === opt.id ? 'var(--primary)' : 'var(--border)', transform: fontChoice === opt.id ? 'scale(1.015)' : 'scale(1)' }}>
                  <div className="px-5 py-4" style={{ fontFamily: opt.css, fontSize: 18, lineHeight: 1.8, color: 'var(--foreground)', background: 'var(--card)' }}>{opt.sample}</div>
                  <div className="flex items-center justify-between px-5 py-3 border-t" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                    <span className="font-black font-display" style={{ color: 'var(--foreground)' }}>Option {opt.id === 'sans' ? 'A' : opt.id === 'opendyslexic' ? 'B' : 'C'} {opt.label}</span>
                    {fontChoice === opt.id && <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-black">✓</div>}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={fwd} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl btn-press">Next →</button>
          </div>
        )}

        {/* ── VISUAL ── */}
        {step === 'visual' && (
          <div className="max-w-2xl w-full animate-pop">
            <div className="text-center mb-7">
              <div className="text-4xl mb-2">👀</div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--muted-foreground)' }}>Step 1 of 3</p>
              <h2 className="text-2xl md:text-3xl font-black mb-2" style={{ color: 'var(--foreground)' }}>Which one feels easier to read?</h2>
              <p className="font-body" style={{ color: 'var(--muted-foreground)' }}>Read each version of the same text. Pick the one that feels most comfortable.</p>
            </div>
            <div className="space-y-4 mb-7">
              {visualOpts.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setVisual(opt.id)}
                  className="w-full text-left rounded-3xl border-2 overflow-hidden transition-all"
                  style={{
                    borderColor: visual === opt.id ? 'var(--primary)' : 'var(--border)',
                    transform: visual === opt.id ? 'scale(1.015)' : 'scale(1)',
                    boxShadow: visual === opt.id ? '0 0 0 3px rgba(78,205,196,.2)' : undefined,
                  }}
                >
                  <div style={{ ...(opt.style as React.CSSProperties), fontFamily: fontChoice === 'opendyslexic' ? "'OpenDyslexic', Verdana, sans-serif" : fontChoice === 'lexend' ? "'Lexend', sans-serif" : "system-ui, sans-serif" }} className="font-body">{SAMPLE}</div>
                  <div className="flex items-center justify-between px-5 py-3 border-t" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                    <div>
                      <span className="font-black font-display" style={{ color: 'var(--foreground)' }}>Option {opt.id} {opt.emoji}</span>
                      <span className="ml-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>{opt.desc}</span>
                    </div>
                    {visual === opt.id && <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-black">✓</div>}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={fwd} disabled={!visual} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl btn-press disabled:opacity-40">
              Next →
            </button>
          </div>
        )}

        {/* ── AUDIO ── */}
        {step === 'audio' && (
          <div className="max-w-lg w-full animate-pop">
            <div className="text-center mb-7">
              <div className="text-4xl mb-2">🎧</div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--muted-foreground)' }}>Step 2 of 3</p>
              <h2 className="text-2xl md:text-3xl font-black mb-2" style={{ color: 'var(--foreground)' }}>Do you prefer listening?</h2>
              <p className="font-body" style={{ color: 'var(--muted-foreground)' }}>Some people understand more by listening. Let's find out!</p>
            </div>
            <div className="rounded-3xl border p-6 mb-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <p className="font-body leading-relaxed mb-5" style={{ ...(visualOpts.find(o => o.id === visual)?.style as React.CSSProperties || {}), fontFamily: fontChoice === 'opendyslexic' ? "'OpenDyslexic', Verdana, sans-serif" : fontChoice === 'lexend' ? "'Lexend', sans-serif" : "system-ui, sans-serif", color: 'var(--foreground)' }}>{SAMPLE}</p>
              <button onClick={() => {
                if (speech.state === 'speaking') speech.pause()
                else if (speech.state === 'paused') speech.resume()
                else speech.speak(SAMPLE, 'en')
                setPlaying(speech.state !== 'speaking')
              }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm btn-press">
                {speech.state === 'speaking' ? '⏸ Pause' : speech.state === 'paused' ? '▶ Resume' : '🔊 Listen to this'}
              </button>
              {(speech.state === 'speaking' || speech.state === 'paused') && (
                <div className="flex gap-1 items-end h-5 mt-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="w-1 rounded-full animate-bounce bg-primary" style={{ height: `${8 + Math.sin(i * 0.7) * 8}px`, animationDelay: `${i * .1}s` }} />
                  ))}
                  <span className="text-xs font-body ml-2 self-center" style={{ color: 'var(--muted-foreground)' }}>{speech.state === 'speaking' ? 'Reading aloud…' : 'Paused.'}</span>
                </div>
              )}
              {speech.state === 'error' && <p className="text-xs mt-2" style={{ color: '#EF4444' }}>Audio could not play. You can still read the sample.</p>}
            </div>
            <div className="rounded-2xl p-5 mb-5 border" style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
              <p className="font-black mb-3" style={{ color: 'var(--foreground)' }}>Quick question about the text:</p>
              <p className="font-body mb-4" style={{ color: 'var(--foreground)' }}>What gives plants their green colour?</p>
              <div className="space-y-2">
                {['Sunlight', 'Chlorophyll', 'Water', 'Carbon dioxide'].map((opt, i) => {
                  const correct = opt === 'Chlorophyll'; const chosen = audioAns === opt
                  return (
                    <button key={opt} onClick={() => setAudioAns(opt)}
                      className="w-full text-left px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-all font-body"
                      style={{ background: chosen ? (correct ? 'rgba(16,185,129,.1)' : 'rgba(255,107,107,.1)') : 'var(--card)', borderColor: chosen ? (correct ? '#10B981' : '#FF6B6B') : 'var(--border)', color: chosen ? (correct ? '#10B981' : '#FF6B6B') : 'var(--foreground)' }}
                    >
                      {String.fromCharCode(65 + i)}. {opt} {chosen && correct && '✓'}
                    </button>
                  )
                })}
              </div>
              {audioAns && (
                <div className="mt-3 rounded-xl p-3 text-sm font-body border animate-pop"
                  style={{ background: audioAns === 'Chlorophyll' ? 'rgba(16,185,129,.08)' : 'var(--muted)', borderColor: audioAns === 'Chlorophyll' ? 'rgba(16,185,129,.3)' : 'var(--border)', color: 'var(--foreground)' }}>
                  {audioAns === 'Chlorophyll' ? '🎉 Correct! Listening mode seems to work well for you.' : "💙 That's okay! We'll note your preference."}
                </div>
              )}
            </div>
            <button onClick={fwd} disabled={!audioAns} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl btn-press disabled:opacity-40">
              Next →
            </button>
          </div>
        )}

        {/* ── FORMAT ── */}
        {step === 'format' && (
          <div className="max-w-lg w-full animate-pop">
            <div className="text-center mb-7">
              <div className="text-4xl mb-2">🧠</div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--muted-foreground)' }}>Step 3 of 3</p>
              <h2 className="text-2xl md:text-3xl font-black mb-2" style={{ color: 'var(--foreground)' }}>How do you like to learn?</h2>
              <p className="font-body" style={{ color: 'var(--muted-foreground)' }}>Rate each style from 1 to 5 stars.</p>
            </div>
            <div className="space-y-3 mb-7">
              {formats.map(f => (
                <div key={f.id} className="rounded-2xl border p-4 flex items-center gap-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'var(--muted)' }}>{f.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black font-display" style={{ color: 'var(--foreground)' }}>{f.label}</p>
                    <p className="text-xs font-body" style={{ color: 'var(--muted-foreground)' }}>{f.desc}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => rate(f.id, s)} className="text-xl transition-transform hover:scale-125">
                        <span style={{ color: (ratings[f.id] ?? 0) >= s ? '#F59E0B' : 'var(--muted)' }}>★</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={fwd} disabled={Object.keys(ratings).length < 3} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl btn-press disabled:opacity-40">
              See My Results ✨
            </button>
          </div>
        )}

        {/* ── LEARNING PREFERENCES ── */}
        {step === 'preferences' && (
          <div className="max-w-2xl w-full animate-pop">
            <LearningPreferencesPanel
              mode="onboarding"
              student={{ grade, subject: '', language: 'en' }}
              subjects={[]}
              onSave={() => { update({ onboardingPreferencesDone: true }); fwd() }}
              onSkip={() => { update({ onboardingPreferencesDone: true }); fwd() }}
            />
          </div>
        )}

        {/* ── RESULT ── */}
        {step === 'result' && (
          <div className="max-w-xl w-full animate-pop">
            <div className="text-center mb-7">
              <Mascot size="lg" mood="celebrating" className="mx-auto mb-4" />
              <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--foreground)' }}>Your Learning Twin is ready!</h2>
              <p className="font-body" style={{ color: 'var(--muted-foreground)' }}>Here's how LearnTwin will adapt for you.</p>
            </div>

            {selectedEdu && (
              <div className="flex items-center gap-3 rounded-2xl p-4 mb-4 border" style={{ background: selectedEdu.bg, borderColor: `${selectedEdu.color}30` }}>
                <span className="text-3xl">{selectedEdu.icon}</span>
                <div>
                  <p className="font-black font-display" style={{ color: 'var(--foreground)' }}>{selectedEdu.title}{stream ? ` · ${stream}` : ''}</p>
                  <p className="text-xs font-body" style={{ color: 'var(--muted-foreground)' }}>Interface and language will adapt to your level</p>
                </div>
              </div>
            )}

            <div className="rounded-3xl border p-6 mb-5 space-y-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              {[
                ['🔤', 'Font', 'Lexend (Dyslexia-friendly)'],
                ['📏', 'Size', visual === 'A' ? 'Extra large' : visual === 'B' ? 'Large' : 'Medium'],
                ['↕️', 'Line spacing', visual === 'A' ? 'Comfortable (loose)' : 'Relaxed'],
                ['🎨', 'Background', visual === 'A' ? 'Warm light' : visual === 'C' ? 'Cool blue tint' : 'White'],
                ['🎧', 'Audio support', audioAns === 'Chlorophyll' ? 'Recommended ✓' : 'Optional'],
              ].map(([icon, label, value]) => (
                <div key={label as string} className="flex items-center gap-3">
                  <span className="text-xl">{icon}</span>
                  <div className="flex-1 flex justify-between">
                    <span className="text-sm font-body" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                    <span className="font-black text-sm font-display" style={{ color: 'var(--foreground)' }}>{value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-4 border mb-6" style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
              <div className="flex items-start gap-3">
                <span className="text-xl">🧠</span>
                <p className="text-sm font-body" style={{ color: 'var(--foreground)' }}>
                  <strong>AI confidence:</strong> LearnTwin is <strong className="text-primary">87% confident</strong> these settings will improve your experience. We'll keep refining as you learn!
                </p>
              </div>
            </div>

            <button onClick={finish} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xl shadow-xl btn-press animate-pulse-glow mb-3">
              Start Learning ✨
            </button>
            <p className="text-center text-xs font-body" style={{ color: 'var(--muted-foreground)' }}>
              You can change these any time in Settings.
            </p>
          </div>
        )}
      </div>

      {!['welcome', 'result'].includes(step) && (
        <div className="p-5 text-center flex-shrink-0">
          <button onClick={back} className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: 'var(--muted-foreground)' }}>← Back</button>
        </div>
      )}
    </div>
  )
}
