import { useState } from 'react'
import type { Page, ThemeMode, UserProfile } from '../types'

interface Props {
  navigate: (p: Page) => void
  user: UserProfile
  theme: ThemeMode
}

type LessonSection = 'intro' | 'process' | 'formula' | 'examples'

const sections = [
  { id: 'intro' as LessonSection, title: 'What is Photosynthesis?', emoji: '🌱' },
  { id: 'process' as LessonSection, title: 'How does it work?', emoji: '🔬' },
  { id: 'formula' as LessonSection, title: 'The Simple Formula', emoji: '⚗️' },
  { id: 'examples' as LessonSection, title: 'In Real Life', emoji: '🌍' },
]

const fontFamilies: Record<string, string> = {
  lexend: "'Lexend', sans-serif",
  nunito: "'Nunito', sans-serif",
  system: "system-ui, sans-serif",
  arial: "Arial, sans-serif",
  verdana: "Verdana, sans-serif",
  atkinson: "'Atkinson Hyperlegible', sans-serif",
}

export default function Lesson({ navigate, user, theme }: Props) {
  const [section, setSection] = useState<LessonSection>('intro')
  const [showControls, setShowControls] = useState(false)
  const [fontSize, setFontSize] = useState(user.accessibility.fontSize)
  const [lineSpacing, setLineSpacing] = useState(user.accessibility.lineSpacing)
  const [wordSpacing, setWordSpacing] = useState(user.accessibility.wordSpacing)
  const [fontFamily, setFontFamily] = useState(user.accessibility.fontFamily)
  const [playing, setPlaying] = useState(false)
  const [simplified, setSimplified] = useState(false)
  const [showVisual, setShowVisual] = useState(false)
  const [showExample, setShowExample] = useState(false)
  const [aiTip, setAiTip] = useState(false)

  const sectionIndex = sections.findIndex((s) => s.id === section)

  const readingStyle = {
    fontFamily: fontFamilies[fontFamily] || fontFamilies.lexend,
    fontSize: fontSize === 'xl' ? '20px' : fontSize === 'large' ? '17px' : fontSize === 'small' ? '13px' : '15px',
    lineHeight: lineSpacing === 'loose' ? '2.4' : lineSpacing === 'relaxed' ? '2' : '1.6',
    wordSpacing: wordSpacing === 'wide' ? '0.15em' : 'normal',
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 font-display relative">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-card border-b border-border px-4 md:px-8 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate('pack')}
          className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to Learning Pack"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground font-body">Biology · Photosynthesis</div>
          <div className="font-black text-foreground truncate">{sections.find((s) => s.id === section)?.title}</div>
        </div>
        <div className="flex items-center gap-2">
          {/* Progress dots */}
          <div className="hidden sm:flex gap-1.5">
            {sections.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i <= sectionIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          {/* Aa button */}
          <button
            onClick={() => setShowControls(!showControls)}
            className={`px-3 py-1.5 rounded-xl font-black text-sm border transition-all ${
              showControls
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-foreground border-border hover:border-primary'
            }`}
          >
            Aa
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 relative">

        {/* Section nav tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                section === s.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary'
              }`}
            >
              {s.emoji} {s.title}
            </button>
          ))}
        </div>

        {/* AI Personalization notice */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-xl px-3 py-2 mb-5">
          <span>✨</span>
          <span className="font-body">
            This lesson is adapted to your Learning Twin — larger text, visual explanations, and examples included.
          </span>
        </div>

        {/* LESSON CONTENT */}
        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden mb-5">
          <div className="px-6 md:px-10 py-8" style={readingStyle}>

            {section === 'intro' && (
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground mb-5 font-display">
                  🌱 What is Photosynthesis?
                </h2>
                {simplified ? (
                  <div className="space-y-3 text-foreground font-body">
                    <p>Plants eat sunlight. 🌞</p>
                    <p>They use sunlight to make food.</p>
                    <p>This is called photosynthesis.</p>
                  </div>
                ) : (
                  <div className="space-y-4 text-foreground font-body">
                    <p><strong>Plants make their own food using sunlight.</strong></p>
                    <p>
                      This amazing process is called <strong>photosynthesis</strong> — from the Greek words
                      for "light" and "putting together."
                    </p>
                    <p>
                      Plants capture energy from sunlight using a special green substance called
                      <strong> chlorophyll</strong>. That's also what makes plants green!
                    </p>
                  </div>
                )}

                {showVisual && (
                  <div className="mt-6 animate-pop">
                    <div className="bg-muted rounded-2xl p-6 text-center">
                      <div className="text-5xl mb-3 animate-float-b">🌿</div>
                      <div className="flex items-center justify-center gap-3 text-2xl flex-wrap">
                        <span>☀️</span>
                        <span className="text-muted-foreground text-base">+</span>
                        <span>💧</span>
                        <span className="text-muted-foreground text-base">+</span>
                        <span>💨</span>
                        <span className="text-muted-foreground text-base font-bold mx-1">→</span>
                        <span>🍬</span>
                        <span className="text-muted-foreground text-base">+</span>
                        <span>🌬️</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 font-body">
                        Sunlight + Water + CO₂ → Sugar (food) + Oxygen
                      </p>
                    </div>
                  </div>
                )}

                {showExample && (
                  <div className="mt-5 animate-pop bg-goldenrod/10 border border-goldenrod/30 rounded-2xl p-4">
                    <p className="font-bold text-foreground mb-2">💡 Real-life example:</p>
                    <p className="text-sm text-foreground font-body">
                      Think of a plant like a tiny kitchen. The leaves are the cooker, sunlight
                      is the gas, water and CO₂ are the ingredients — and sugar is the meal!
                    </p>
                  </div>
                )}
              </div>
            )}

            {section === 'process' && (
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground mb-5 font-display">
                  🔬 How Does it Work?
                </h2>
                <div className="space-y-5 font-body text-foreground">
                  {[
                    { step: '1', icon: '🌿', title: 'Leaves absorb sunlight', text: 'Chlorophyll in the leaves captures energy from sunlight.' },
                    { step: '2', icon: '💧', title: 'Roots collect water', text: 'Water travels up from the roots through tiny tubes.' },
                    { step: '3', icon: '💨', title: 'Leaves absorb CO₂', text: 'Carbon dioxide enters through tiny holes called stomata.' },
                    { step: '4', icon: '🍬', title: 'Food is made!', text: 'The plant combines these to make sugar and releases oxygen.' },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-4">
                      <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-black flex items-center justify-center flex-shrink-0 font-display">
                        {s.step}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{s.icon} {s.title}</p>
                        <p className="text-muted-foreground mt-0.5">{s.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section === 'formula' && (
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground mb-5 font-display">
                  ⚗️ The Simple Formula
                </h2>
                <div className="bg-muted rounded-2xl p-6 text-center mb-5">
                  <div className="flex items-center justify-center gap-2 flex-wrap text-2xl md:text-3xl">
                    <span>☀️</span>
                    <span className="font-black text-foreground">+</span>
                    <span>💧</span>
                    <span className="font-black text-foreground">+</span>
                    <span className="font-mono text-primary font-black">CO₂</span>
                    <span className="text-3xl text-primary font-black mx-2">→</span>
                    <span>🌱</span>
                    <span className="font-black text-foreground">+</span>
                    <span className="font-mono text-primary font-black">O₂</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 font-body">
                    Sunlight + Water + Carbon Dioxide → Glucose (food) + Oxygen
                  </p>
                </div>
                <div className="font-body text-foreground space-y-3">
                  <p>The plant uses these three things to make food:</p>
                  <div className="flex flex-col gap-2">
                    {[
                      ['☀️', 'Sunlight — energy source'],
                      ['💧', 'Water — collected by roots'],
                      ['💨', 'Carbon dioxide — from the air'],
                    ].map(([icon, text]) => (
                      <div key={text} className="flex gap-3 items-center">
                        <span className="text-xl">{icon}</span>
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {section === 'examples' && (
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground mb-5 font-display">
                  🌍 Photosynthesis in Real Life
                </h2>
                <div className="space-y-4 font-body text-foreground">
                  {[
                    { icon: '🌳', title: 'Trees in a park', text: "Every tree you see is constantly making food from sunlight. They're like solar-powered food factories!" },
                    { icon: '🥦', title: 'Your vegetables', text: 'Broccoli, spinach, and all green veg grew by photosynthesising sunlight into food!' },
                    { icon: '🌾', title: 'Wheat and bread', text: 'Wheat fields use photosynthesis to store energy in seeds — which we eat as bread.' },
                  ].map((ex) => (
                    <div key={ex.title} className="bg-muted rounded-2xl p-4 flex gap-4">
                      <span className="text-3xl flex-shrink-0">{ex.icon}</span>
                      <div>
                        <p className="font-bold mb-1">{ex.title}</p>
                        <p className="text-sm text-muted-foreground">{ex.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          {[
            { icon: '🔊', label: playing ? 'Pause' : 'Listen', action: () => setPlaying(!playing), active: playing, color: 'border-primary/40 hover:bg-primary/10' },
            { icon: '✨', label: simplified ? 'Full version' : 'Make it simpler', action: () => setSimplified(!simplified), active: simplified, color: 'border-lavender/40 hover:bg-lavender/10' },
            { icon: '👀', label: 'Show visually', action: () => setShowVisual(!showVisual), active: showVisual, color: 'border-teal/40 hover:bg-teal/10' },
            { icon: '💡', label: 'Give an example', action: () => setShowExample(!showExample), active: showExample, color: 'border-goldenrod/40 hover:bg-goldenrod/10' },
            { icon: '💬', label: 'Ask LearnTwin', action: () => setAiTip(!aiTip), active: aiTip, color: 'border-coral/40 hover:bg-coral/10' },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              className={`flex items-center gap-2 px-4 py-3 bg-card border-2 rounded-2xl text-sm font-bold transition-all btn-press ${
                btn.active ? 'border-primary bg-primary/10 text-primary' : `border-border text-foreground ${btn.color}`
              }`}
            >
              <span>{btn.icon}</span>
              <span className="font-display">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* AI Chat tip */}
        {aiTip && (
          <div className="animate-pop bg-card border border-border rounded-3xl p-5 shadow-sm mb-5">
            <div className="flex gap-3">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">✨</div>
              <div>
                <p className="font-bold font-display text-foreground mb-1">LearnTwin says:</p>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  "Chlorophyll is the key word here — remember it as 'the green catcher'! Plants need it to grab sunlight, just like you need hands to catch a ball. 🌞"
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <input
                className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-body focus:outline-none focus:border-primary"
                placeholder="Ask LearnTwin a question…"
              />
              <button className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold btn-press">
                Ask →
              </button>
            </div>
          </div>
        )}

        {/* Audio playing indicator */}
        {playing && (
          <div className="animate-pop flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 mb-5">
            <div className="flex gap-1 items-end h-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full animate-bounce"
                  style={{ height: `${Math.random() * 14 + 6}px`, animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
            <span className="text-sm font-body text-primary font-semibold">
              Reading aloud — "Plants make their own food using sunlight…"
            </span>
          </div>
        )}

        {/* Next / previous navigation */}
        <div className="flex gap-3">
          <button
            disabled={sectionIndex === 0}
            onClick={() => setSection(sections[sectionIndex - 1].id)}
            className="flex-1 py-3 bg-card border border-border rounded-2xl font-bold text-foreground hover:border-primary transition-colors disabled:opacity-30"
          >
            ← Previous
          </button>
          {sectionIndex < sections.length - 1 ? (
            <button
              onClick={() => setSection(sections[sectionIndex + 1].id)}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-2xl font-bold btn-press shadow-lg"
            >
              Next Section →
            </button>
          ) : (
            <button
              onClick={() => navigate('quiz')}
              className="flex-1 py-3 bg-accent text-accent-foreground rounded-2xl font-black btn-press shadow-lg"
            >
              Take the Quiz! 🎯
            </button>
          )}
        </div>
      </div>

      {/* FLOATING READING CONTROLS PANEL */}
      {showControls && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowControls(false) }}>
          <div className="bg-card rounded-3xl border border-border shadow-2xl w-full max-w-sm animate-pop overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-black text-foreground font-display">Aa Reading Controls</h3>
              <button onClick={() => setShowControls(false)} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">×</button>
            </div>

            <div className="p-5 space-y-5">
              {/* Font size */}
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Text Size</p>
                <div className="flex gap-2">
                  {(['small', 'normal', 'large', 'xl'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`flex-1 py-2 rounded-xl font-bold transition-all text-sm ${
                        fontSize === size ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-secondary'
                      }`}
                    >
                      {size === 'small' ? 'S' : size === 'normal' ? 'M' : size === 'large' ? 'L' : 'XL'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font family */}
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Font</p>
                <div className="space-y-2">
                  {[
                    { id: 'lexend', label: 'Lexend', desc: 'Reading-friendly' },
                    { id: 'nunito', label: 'Nunito', desc: 'Rounded & friendly' },
                    { id: 'system', label: 'System', desc: 'Your device font' },
                    { id: 'arial', label: 'Arial', desc: 'Familiar & clear' },
                    { id: 'verdana', label: 'Verdana', desc: 'Open letter shapes' },
                    { id: 'atkinson', label: 'Atkinson', desc: 'High readability' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFontFamily(f.id as any)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm border transition-all ${
                        fontFamily === f.id ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-transparent text-foreground hover:border-border'
                      }`}
                    >
                      <span className="font-bold" style={{ fontFamily: fontFamilies[f.id] }}>{f.label}</span>
                      <span className="text-xs text-muted-foreground">{f.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Spacing */}
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Line Spacing</p>
                <div className="flex gap-2">
                  {(['normal', 'relaxed', 'loose'] as const).map((sp) => (
                    <button
                      key={sp}
                      onClick={() => setLineSpacing(sp)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                        lineSpacing === sp ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                      }`}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI optimise */}
              <div className="bg-secondary rounded-2xl p-3">
                <button className="w-full flex items-center gap-2 text-sm font-bold text-secondary-foreground">
                  <span>✨</span>
                  <span className="font-display">Ask AI to optimise for me</span>
                </button>
                <p className="text-xs text-muted-foreground font-body mt-1">
                  "I think slightly larger text and more line spacing may be easier for you."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
