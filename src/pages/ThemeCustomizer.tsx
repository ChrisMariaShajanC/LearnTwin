import { useState } from 'react'
import type { Page, ThemeMode, UserProfile } from '../types'

interface Props {
  navigate: (p: Page) => void
  theme: ThemeMode
  setTheme: (t: ThemeMode) => void
  user: UserProfile
  setUser: (u: UserProfile) => void
}

const fontOptions = [
  { id: 'lexend', name: 'Lexend', desc: 'Dyslexia-friendly', family: "'Lexend', sans-serif" },
  { id: 'nunito', name: 'Nunito', desc: 'Rounded & friendly', family: "'Nunito', sans-serif" },
  { id: 'system', name: 'System default', desc: 'Uses your device font', family: "system-ui, sans-serif" },
  { id: 'arial', name: 'Arial', desc: 'Familiar and clear', family: "Arial, sans-serif" },
  { id: 'verdana', name: 'Verdana', desc: 'Open letter shapes', family: "Verdana, sans-serif" },
  { id: 'atkinson', name: 'Atkinson Hyperlegible', desc: 'Low vision friendly', family: "'Atkinson Hyperlegible', sans-serif" },
]

const previewText = `Plants make their own food using sunlight. This process is called photosynthesis and it happens inside the green parts of the plant.`

export default function ThemeCustomizer({ navigate, theme, setTheme, user, setUser }: Props) {
  const [fontSize, setFontSize] = useState(user.accessibility.fontSize)
  const [fontFamily, setFontFamily] = useState(user.accessibility.fontFamily)
  const [lineSpacing, setLineSpacing] = useState(user.accessibility.lineSpacing)
  const [wordSpacing, setWordSpacing] = useState(user.accessibility.wordSpacing)
  const [letterSpacing, setLetterSpacing] = useState(user.accessibility.letterSpacing)
  const [contrast, setContrast] = useState(user.accessibility.contrast)
  const [saved, setSaved] = useState(false)

  const previewStyle = {
    fontFamily: fontOptions.find((f) => f.id === fontFamily)?.family || "'Lexend', sans-serif",
    fontSize: fontSize === 'xl' ? '20px' : fontSize === 'large' ? '17px' : fontSize === 'small' ? '13px' : '15px',
    lineHeight: lineSpacing === 'loose' ? '2.4' : lineSpacing === 'relaxed' ? '2' : '1.6',
    wordSpacing: wordSpacing === 'wide' ? '0.15em' : 'normal',
    letterSpacing: letterSpacing === 'wide' ? '0.06em' : 'normal',
  }

  const handleSave = () => {
    setUser({
      ...user,
      accessibility: {
        ...user.accessibility,
        fontSize,
        fontFamily: fontFamily as any,
        lineSpacing,
        wordSpacing,
        letterSpacing,
        contrast,
      },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAIChoose = () => {
    setFontSize('large')
    setFontFamily('lexend')
    setLineSpacing('relaxed')
    setWordSpacing('wide')
    setLetterSpacing('normal')
    setContrast('high')
    setTheme('customize')
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 font-display">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-bold mb-3 border border-primary/20">
            🎨 Customise My Learning Space
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground">
            Make it yours.
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            Change how LearnTwin looks and feels. Preview updates in real time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Controls panel */}
          <div className="space-y-5">

            {/* Theme mode */}
            <div className="bg-card rounded-3xl border border-border p-5 shadow-sm">
              <h3 className="font-black text-foreground mb-3">Background Theme</h3>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'light', icon: '☀️', label: 'Light', bg: '#FFFBF5' },
                  { value: 'dark', icon: '🌙', label: 'Dark', bg: '#1A1826' },
                  { value: 'customize', icon: '🎨', label: 'My Theme', bg: '#FFF5E6' },
                ] as { value: ThemeMode; icon: string; label: string; bg: string }[]).map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                      theme === t.value
                        ? 'border-primary shadow-md'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl border border-border shadow-inner"
                      style={{ background: t.bg }}
                    />
                    <span className="text-lg">{t.icon}</span>
                    <span className="text-xs font-bold text-foreground">{t.label}</span>
                  </button>
                ))}
              </div>

              {theme === 'customize' && (
                <div className="mt-3 bg-primary/5 rounded-xl px-3 py-2 text-xs font-body text-muted-foreground border border-primary/20">
                  ✨ <strong>LearnTwin recommends this theme for you</strong> — warm background, high contrast text, comfortable teal accents.
                </div>
              )}
            </div>

            {/* Font */}
            <div className="bg-card rounded-3xl border border-border p-5 shadow-sm">
              <h3 className="font-black text-foreground mb-3">Font</h3>
              <div className="space-y-2">
                {fontOptions.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontFamily(f.id as any)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                      fontFamily === f.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-foreground hover:border-muted-foreground'
                    }`}
                  >
                    <span className="font-bold" style={{ fontFamily: f.family }}>{f.name}</span>
                    <span className="text-xs text-muted-foreground">{f.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text size */}
            <div className="bg-card rounded-3xl border border-border p-5 shadow-sm">
              <h3 className="font-black text-foreground mb-3">Text Size</h3>
              <div className="flex gap-2">
                {([['small', 'S', '13px'], ['normal', 'M', '15px'], ['large', 'L', '17px'], ['xl', 'XL', '20px']] as const).map(([id, label, size]) => (
                  <button
                    key={id}
                    onClick={() => setFontSize(id)}
                    className={`flex-1 flex flex-col items-center py-3 rounded-xl border-2 transition-all ${
                      fontSize === id ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground hover:border-muted-foreground'
                    }`}
                  >
                    <span className="font-black" style={{ fontSize: size }}>{label}</span>
                    <span className="text-xs text-muted-foreground mt-1">{size}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Spacing */}
            <div className="bg-card rounded-3xl border border-border p-5 shadow-sm">
              <h3 className="font-black text-foreground mb-3">Spacing</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Line spacing</p>
                  <div className="flex gap-2">
                    {(['normal', 'relaxed', 'loose'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setLineSpacing(s)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border-2 transition-all ${
                          lineSpacing === s ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Word spacing</p>
                  <div className="flex gap-2">
                    {(['normal', 'wide'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setWordSpacing(s)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border-2 transition-all ${
                          wordSpacing === s ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Letter spacing</p>
                  <div className="flex gap-2">
                    {(['normal', 'wide'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setLetterSpacing(s)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border-2 transition-all ${
                          letterSpacing === s ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview panel */}
          <div className="md:sticky md:top-6 h-fit space-y-4">
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h3 className="font-black text-foreground">Live Preview</h3>
                <span className="text-xs text-muted-foreground font-body">This is how your lesson will look</span>
              </div>

              {/* Preview content */}
              <div
                className="p-6"
                style={{
                  background: theme === 'dark' ? '#1A1826' : theme === 'customize' ? '#FFF5E6' : '#FFFFFF',
                }}
              >
                <div
                  style={{
                    ...previewStyle,
                    color: theme === 'dark' ? '#F0EBF8' : '#2D2A3E',
                  }}
                >
                  <div className="text-xl font-black mb-3" style={{ fontFamily: previewStyle.fontFamily }}>
                    🌱 What is Photosynthesis?
                  </div>
                  <p className="mb-3">{previewText}</p>
                  <div className="flex items-center gap-2 flex-wrap text-xl">
                    <span>☀️</span>
                    <span className="font-bold" style={{ color: '#4ECDC4' }}>+</span>
                    <span>💧</span>
                    <span className="font-bold" style={{ color: '#4ECDC4' }}>+</span>
                    <span>CO₂</span>
                    <span className="font-bold mx-1" style={{ color: '#4ECDC4' }}>→</span>
                    <span>🌱</span>
                    <span className="font-bold" style={{ color: '#4ECDC4' }}>+</span>
                    <span>O₂</span>
                  </div>
                </div>
              </div>

              {/* Preview specs */}
              <div className="px-5 py-3 border-t border-border bg-muted/50 space-y-1">
                {[
                  ['Font', fontOptions.find((f) => f.id === fontFamily)?.name || ''],
                  ['Size', fontSize],
                  ['Line spacing', lineSpacing],
                  ['Theme', theme],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs font-body text-muted-foreground">
                    <span>{k}</span>
                    <span className="font-semibold text-foreground capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSave}
                className={`w-full py-4 rounded-2xl font-black text-lg btn-press transition-all shadow-lg ${
                  saved
                    ? 'bg-emerald text-white'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {saved ? '✓ Saved!' : '💾 Save My Theme'}
              </button>

              <button
                onClick={handleAIChoose}
                className="w-full py-3.5 rounded-2xl font-bold border-2 border-primary text-primary bg-primary/5 hover:bg-primary/10 transition-all text-sm"
              >
                ✨ Let AI Choose For Me
              </button>

              <button
                onClick={() => {
                  setFontSize('normal')
                  setFontFamily('lexend')
                  setLineSpacing('normal')
                  setWordSpacing('normal')
                  setLetterSpacing('normal')
                  setContrast('normal')
                  setTheme('light')
                }}
                className="w-full py-3 rounded-2xl font-semibold text-sm text-muted-foreground border border-border hover:border-muted-foreground transition-all"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
