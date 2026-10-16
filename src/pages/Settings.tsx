import { useEffect, useState } from 'react'
import type { Page, ThemeMode, DensitySize, UserProfile } from '../types'
import { readLocal, writeLocal } from '../lib/localData'

interface Props {
  navigate: (p: Page) => void
  theme: ThemeMode
  setTheme: (t: ThemeMode) => void
  density: DensitySize
  setDensity: (d: DensitySize) => void
  customPrimary: string
  setCustomColor: (c: string) => void
  user: UserProfile
  setUser: (u: UserProfile) => void
  initialSection?: Section
}

type Section = 'appearance' | 'accessibility' | 'ai' | 'privacy'

const DEFAULT_FEATURE_SETTINGS = {
  autoAdapt: true,
  personalRec: true,
  twinActive: true,
  parentShare: true,
  teacherShare: false,
  focusMode: false,
  tts: true,
}

const ACCENT_PALETTE = [
  { label: 'Teal',    color: '#4ECDC4' },
  { label: 'Indigo',  color: '#6366F1' },
  { label: 'Purple',  color: '#8B5CF6' },
  { label: 'Rose',    color: '#F43F5E' },
  { label: 'Orange',  color: '#F97316' },
  { label: 'Emerald', color: '#10B981' },
  { label: 'Blue',    color: '#3B82F6' },
  { label: 'Amber',   color: '#D97706' },
]

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-pressed={on}
      className="relative w-12 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ background: on ? 'var(--primary)' : 'var(--border)' }}
    >
      <div
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: on ? 'translateX(26px)' : 'translateX(4px)' }}
      />
    </button>
  )
}

function SettingsRow({
  icon, label, desc, children,
}: {
  icon: string; label: string; desc?: string; children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4 py-4 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: 'var(--muted)' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold font-display" style={{ color: 'var(--foreground)' }}>{label}</p>
        {desc && <p className="text-xs font-body mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border shadow-sm overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="font-black font-display" style={{ color: 'var(--foreground)' }}>{title}</h3>
      </div>
      <div className="px-5">{children}</div>
    </div>
  )
}

export default function Settings({ navigate, theme, setTheme, density, setDensity, customPrimary, setCustomColor, user, setUser, initialSection = 'appearance' }: Props) {
  const [section, setSection] = useState<Section>(initialSection)
  const savedFeatures = readLocal('lt-feature-settings', DEFAULT_FEATURE_SETTINGS)

  const [fontSize, setFontSize]   = useState(user.accessibility.fontSize)
  const [fontFam, setFontFam]     = useState(user.accessibility.fontFamily)
  const [lineSpacing, setLine]    = useState(user.accessibility.lineSpacing)
  const [wordSpacing, setWordSpacing] = useState(user.accessibility.wordSpacing)
  const [letterSpacing, setLetterSpacing] = useState(user.accessibility.letterSpacing)
  const [contentWidth, setContentWidth] = useState(user.accessibility.contentWidth || 'comfortable')
  const [reducedMotion, setReducedMotion] = useState(Boolean(user.accessibility.reducedMotion))
  const [audio, setAudio]         = useState(user.accessibility.audioEnabled)
  const [contrast, setContrast]   = useState(user.accessibility.contrast)

  const [autoAdapt, setAutoAdapt]       = useState(savedFeatures.autoAdapt)
  const [personalRec, setPersonalRec]   = useState(savedFeatures.personalRec)
  const [twinActive, setTwinActive]     = useState(savedFeatures.twinActive)
  const [parentShare, setParentShare]   = useState(savedFeatures.parentShare)
  const [teacherShare, setTeacherShare] = useState(savedFeatures.teacherShare)
  const [focusMode, setFocusMode]       = useState(savedFeatures.focusMode)
  const [tts, setTts]                   = useState(savedFeatures.tts ?? audio)

  useEffect(() => {
    writeLocal('lt-feature-settings', { autoAdapt, personalRec, twinActive, parentShare, teacherShare, focusMode, tts })
  }, [autoAdapt, personalRec, twinActive, parentShare, teacherShare, focusMode, tts])

  const tabs: { id: Section; icon: string; label: string }[] = [
    { id: 'appearance',   icon: '🎨', label: 'Appearance' },
    { id: 'accessibility', icon: '♿', label: 'Accessibility' },
    { id: 'ai',           icon: '🧠', label: 'AI' },
    { id: 'privacy',      icon: '🔒', label: 'Privacy' },
  ]

  const saveChanges = () => {
    setUser({
      ...user,
      accessibility: {
        ...user.accessibility,
        fontSize,
        fontFamily: fontFam as any,
        lineSpacing,
        wordSpacing,
        letterSpacing,
        contentWidth,
        reducedMotion,
        audioEnabled: audio,
        contrast,
      },
    })
  }

  const downloadData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      profile: user,
      featureSettings: { autoAdapt, personalRec, twinActive, parentShare, teacherShare, focusMode, tts },
      uploads: readLocal('lt-uploads', []),
      exams: readLocal('lt-exams', []),
      studySessions: readLocal('lt-study-sessions', []),
      quizAttempts: readLocal('lt-quiz-attempts', []),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `LearnTwin_${user.name}_data.json`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  const resetLearningTwin = () => {
    localStorage.removeItem('lt-quiz-attempts')
    setUser({
      ...user,
      learningPattern: { visual: 50, audio: 50, examples: 50, text: 50, stepByStep: 50 },
      aiConfidence: 0,
    })
  }

  const densityOptions: { id: DensitySize; label: string; desc: string; icon: string }[] = [
    { id: 'small',  label: 'Small',  desc: 'Compact — more on screen', icon: 'S' },
    { id: 'medium', label: 'Medium', desc: 'Balanced — default layout', icon: 'M' },
    { id: 'large',  label: 'Large',  desc: 'Bigger text and controls',  icon: 'L' },
  ]

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-display" style={{ background: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto px-5 py-8">

        {/* Header */}
        <div className="mb-7">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold mb-3 border"
            style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)', borderColor: 'var(--border)' }}
          >
            ⚙️ Settings
          </div>
          <h1 className="text-3xl md:text-4xl font-black" style={{ color: 'var(--foreground)' }}>Your preferences</h1>
          <p className="font-body mt-1" style={{ color: 'var(--muted-foreground)' }}>Control how LearnTwin looks and behaves.</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setSection(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                section === t.id ? 'bg-primary text-primary-foreground shadow-md' : 'border'
              }`}
              style={section !== t.id ? { background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' } : undefined}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── APPEARANCE ── */}
        {section === 'appearance' && (
          <div className="space-y-4 animate-fade-in">

            {/* Theme */}
            <Card title="☀️ Theme">
              <div className="py-4">
                <p className="text-sm font-body mb-3" style={{ color: 'var(--muted-foreground)' }}>Choose how the app looks</p>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { v: 'light'    as ThemeMode, icon: '☀️',  label: 'Light',     bg: '#F8FAFF' },
                    { v: 'dark'     as ThemeMode, icon: '🌙',  label: 'Dark',      bg: '#13121F' },
                    { v: 'customize'as ThemeMode, icon: '🎨',  label: 'Customize', bg: customPrimary },
                  ]).map(t => (
                    <button
                      key={t.v}
                      onClick={() => setTheme(t.v)}
                      className="p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all"
                      style={{ borderColor: theme === t.v ? 'var(--primary)' : 'var(--border)', boxShadow: theme === t.v ? '0 4px 12px rgba(0,0,0,.1)' : 'none' }}
                    >
                      <div className="w-8 h-8 rounded-xl border shadow-inner" style={{ background: t.bg, borderColor: 'var(--border)' }} />
                      <span className="text-xl">{t.icon}</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{t.label}</span>
                    </button>
                  ))}
                </div>

                {/* Customize palette */}
                {theme === 'customize' && (
                  <div className="mt-4 p-4 rounded-2xl border" style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
                    <p className="text-sm font-bold mb-3" style={{ color: 'var(--foreground)' }}>Accent colour</p>
                    <div className="flex flex-wrap gap-2.5">
                      {ACCENT_PALETTE.map(({ label, color }) => (
                        <button
                          key={color}
                          title={label}
                          onClick={() => setCustomColor(color)}
                          className="w-8 h-8 rounded-full transition-all relative"
                          style={{
                            background: color,
                            boxShadow: customPrimary === color
                              ? `0 0 0 3px var(--background), 0 0 0 5px ${color}`
                              : '0 1px 3px rgba(0,0,0,.2)',
                            transform: customPrimary === color ? 'scale(1.15)' : 'scale(1)',
                          }}
                          aria-label={label}
                        >
                          {customPrimary === color && (
                            <svg className="absolute inset-0 m-auto" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs mt-3 font-body" style={{ color: 'var(--muted-foreground)' }}>
                      Selected: <strong style={{ color: 'var(--primary)' }}>{ACCENT_PALETTE.find(p => p.color === customPrimary)?.label ?? 'Custom'}</strong>
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Density / Interface Size */}
            <Card title="📐 Interface Size">
              <div className="py-4">
                <p className="text-sm font-body mb-4" style={{ color: 'var(--muted-foreground)' }}>
                  Controls text, card and spacing sizes across the whole app
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {densityOptions.map(({ id, label, desc, icon }) => (
                    <button
                      key={id}
                      onClick={() => setDensity(id)}
                      className="p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-center"
                      style={{ borderColor: density === id ? 'var(--primary)' : 'var(--border)', boxShadow: density === id ? '0 4px 12px rgba(0,0,0,.08)' : 'none' }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black"
                        style={{
                          background: density === id ? 'var(--primary)' : 'var(--muted)',
                          color: density === id ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                          fontSize: id === 'small' ? '14px' : id === 'medium' ? '17px' : '20px',
                        }}
                      >
                        {icon}
                      </div>
                      <span className="text-xs font-bold leading-none" style={{ color: density === id ? 'var(--primary)' : 'var(--foreground)' }}>{label}</span>
                      <span className="text-[10px] leading-tight" style={{ color: 'var(--muted-foreground)' }}>{desc}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 p-3 rounded-xl border" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
                  <p className="text-xs font-body" style={{ color: 'var(--muted-foreground)' }}>
                    Current: <strong style={{ color: 'var(--foreground)' }}>{densityOptions.find(d => d.id === density)?.label}</strong>
                    {' — '}{densityOptions.find(d => d.id === density)?.desc}
                  </p>
                </div>
              </div>
            </Card>

            <Card title="🎨 Customise">
              <SettingsRow icon="🖌️" label="Full Theme Customiser" desc="Fonts, spacing, colours, live preview">
                <button
                  onClick={() => navigate('theme')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold btn-press"
                >
                  Open →
                </button>
              </SettingsRow>
            </Card>
          </div>
        )}

        {/* ── ACCESSIBILITY ── */}
        {section === 'accessibility' && (
          <div className="space-y-4 animate-fade-in">
            <Card title="📝 Text">
              <SettingsRow icon="🔤" label="Font" desc="Choose a reading-friendly font">
                <select
                  value={fontFam}
                  onChange={e => setFontFam(e.target.value as UserProfile['accessibility']['fontFamily'])}
                  className="rounded-xl border px-3 py-2 text-sm font-bold font-body"
                  style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  <option value="lexend">Lexend</option>
                  <option value="nunito">Nunito</option>
                  <option value="system">System default</option>
                  <option value="arial">Arial</option>
                  <option value="verdana">Verdana</option>
                  <option value="atkinson">Atkinson Hyperlegible</option>
                </select>
              </SettingsRow>

              <SettingsRow icon="📏" label="Text size" desc="Larger text is easier to read">
                <div className="flex gap-1.5">
                  {(['small', 'normal', 'large', 'xl'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setFontSize(s)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                      style={fontSize === s ? { background: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--primary)' } : { background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    >
                      {s === 'small' ? 'S' : s === 'normal' ? 'M' : s === 'large' ? 'L' : 'XL'}
                    </button>
                  ))}
                </div>
              </SettingsRow>

              <SettingsRow icon="↕️" label="Line spacing" desc="More space between lines helps reading">
                <div className="flex gap-1.5">
                  {(['normal', 'relaxed', 'loose'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setLine(s)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border capitalize transition-all"
                      style={lineSpacing === s ? { background: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--primary)' } : { background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </SettingsRow>

              <SettingsRow icon="↔️" label="Word spacing" desc="Increase space between words">
                <div className="flex gap-1.5">
                  {(['normal', 'wide'] as const).map(s => (
                    <button key={s} onClick={() => setWordSpacing(s)} className="px-3 py-1.5 rounded-xl text-xs font-bold border capitalize" style={wordSpacing === s ? { background: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--primary)' } : { background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>{s}</button>
                  ))}
                </div>
              </SettingsRow>

              <SettingsRow icon="AV" label="Letter spacing" desc="Increase space between letters">
                <div className="flex gap-1.5">
                  {(['normal', 'wide'] as const).map(s => (
                    <button key={s} onClick={() => setLetterSpacing(s)} className="px-3 py-1.5 rounded-xl text-xs font-bold border capitalize" style={letterSpacing === s ? { background: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--primary)' } : { background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>{s}</button>
                  ))}
                </div>
              </SettingsRow>

              <SettingsRow icon="▭" label="Content width" desc="Control the reading line length">
                <select value={contentWidth} onChange={e => setContentWidth(e.target.value as typeof contentWidth)} className="rounded-xl border px-3 py-2 text-sm font-bold" style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  <option value="compact">Compact</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="wide">Wide</option>
                </select>
              </SettingsRow>

              <SettingsRow icon="🔆" label="High contrast" desc="Stronger colour contrast for readability">
                <Toggle on={contrast === 'high'} onChange={() => setContrast(c => c === 'high' ? 'normal' : 'high')} />
              </SettingsRow>
            </Card>

            <Card title="🎧 Audio">
              <SettingsRow icon="🔊" label="Text-to-speech" desc="Read lesson content aloud">
                <Toggle on={tts} onChange={() => setTts(t => !t)} />
              </SettingsRow>
              <SettingsRow icon="🎵" label="Audio support" desc="Enable audio for all lessons">
                <Toggle on={audio} onChange={() => setAudio(a => !a)} />
              </SettingsRow>
            </Card>

            <Card title="🌟 Focus">
              <SettingsRow icon="🎯" label="Focus mode" desc="Hide distractions during lessons">
                <Toggle on={focusMode} onChange={() => setFocusMode(f => !f)} />
              </SettingsRow>
              <SettingsRow icon="◌" label="Reduced motion" desc="Minimise non-essential animation">
                <Toggle on={reducedMotion} onChange={() => setReducedMotion(value => !value)} />
              </SettingsRow>
            </Card>
          </div>
        )}

        {/* ── AI PERSONALIZATION ── */}
        {section === 'ai' && (
          <div className="space-y-4 animate-fade-in">
            <Card title="🧠 Learning Twin">
              <SettingsRow icon="🧠" label="My Learning Twin" desc="Your personalised AI learning profile">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald font-body">Active</span>
                  <Toggle on={twinActive} onChange={() => setTwinActive(t => !t)} />
                </div>
              </SettingsRow>
              <SettingsRow icon="✨" label="Automatic adaptation" desc="Let AI adjust lessons as you learn">
                <Toggle on={autoAdapt} onChange={() => setAutoAdapt(a => !a)} />
              </SettingsRow>
              <SettingsRow icon="💡" label="Personalised recommendations" desc="AI suggests what to study next">
                <Toggle on={personalRec} onChange={() => setPersonalRec(r => !r)} />
              </SettingsRow>
            </Card>

            <div className="rounded-3xl border p-5" style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <p className="font-black font-display mb-1" style={{ color: 'var(--foreground)' }}>Your Learning Twin profile</p>
                  <p className="text-sm font-body leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    LearnTwin is <strong style={{ color: 'var(--primary)' }}>87% confident</strong> in your current profile. The more you learn, the better it understands you.
                  </p>
                  <button onClick={() => navigate('profile')} className="mt-3 text-sm font-bold text-primary hover:underline">
                    View Learning Twin →
                  </button>
                </div>
              </div>
            </div>

            <button onClick={() => navigate('onboarding')} className="w-full py-3 rounded-2xl font-bold text-sm border btn-press" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              🔄 Re-run Preference Check
            </button>
          </div>
        )}

        {/* ── PRIVACY ── */}
        {section === 'privacy' && (
          <div className="space-y-4 animate-fade-in">
            <Card title="🔒 Sharing">
              <SettingsRow icon="👨‍👩‍👧" label="Share with Parent" desc="Parent can view your progress and reports">
                <Toggle on={parentShare} onChange={() => setParentShare(s => !s)} />
              </SettingsRow>
              <SettingsRow icon="👩‍🏫" label="Share with Teacher" desc="Teacher can view your learning reports">
                <Toggle on={teacherShare} onChange={() => setTeacherShare(s => !s)} />
              </SettingsRow>
            </Card>

            <Card title="📊 Your Data">
              <SettingsRow icon="📥" label="Download my data" desc="Export everything LearnTwin knows about you">
                <button onClick={downloadData} className="px-4 py-2 rounded-xl text-sm font-bold border btn-press" style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  Download
                </button>
              </SettingsRow>
              <SettingsRow icon="🗑️" label="Reset Learning Twin" desc="Clear your personalised profile and start fresh">
                <button onClick={resetLearningTwin} className="px-4 py-2 rounded-xl text-sm font-bold border" style={{ background: 'rgba(255,107,107,.1)', borderColor: 'rgba(255,107,107,.3)', color: '#FF6B6B' }}>
                  Reset
                </button>
              </SettingsRow>
            </Card>

            <div className="rounded-2xl p-4 text-sm font-body border" style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
              🔒 LearnTwin never sells your data or uses it for advertising. Your learning data is private and used only to improve your personalised experience.
            </div>
          </div>
        )}

        {/* Save button (for accessibility section) */}
        {section === 'accessibility' && (
          <div className="flex gap-2 mt-5">
            <button onClick={saveChanges} className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl btn-press">
              Save Changes
            </button>
            <button
              onClick={() => {
                setFontSize('normal'); setFontFam('lexend'); setLine('relaxed'); setWordSpacing('normal')
                setLetterSpacing('normal'); setContentWidth('comfortable'); setContrast('normal'); setAudio(true); setReducedMotion(false)
              }}
              className="px-5 rounded-2xl border text-sm font-bold"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
