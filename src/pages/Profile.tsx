import { useRef, useState } from 'react'
import type { Page, UserProfile } from '../types'
import Mascot from '../components/Mascot'

interface Props {
  navigate: (p: Page) => void
  user: UserProfile
  setUser?: (u: UserProfile) => void
  onLogout?: () => void
}

function StarRating({ value }: { value: number }) {
  const stars = Math.round(value / 20)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`text-sm ${i <= stars ? 'text-goldenrod' : 'text-muted'}`}>
          ★
        </span>
      ))}
    </div>
  )
}

export default function Profile({ navigate, user, setUser, onLogout }: Props) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [grade, setGrade] = useState(user.grade)
  const [avatar, setAvatar] = useState(user.avatar)
  const fileRef = useRef<HTMLInputElement>(null)

  const saveProfile = () => {
    if (!setUser) return
    setUser({ ...user, name: name.trim() || user.name, grade: grade.trim() || user.grade, avatar })
    setEditing(false)
  }

  const uploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatar(ev.target?.result as string)
    reader.readAsDataURL(file)
  }
  const patterns = [
    { label: 'Visual', value: user.learningPattern.visual, icon: '👀', color: 'from-primary to-teal' },
    { label: 'Audio', value: user.learningPattern.audio, icon: '🎧', color: 'from-lavender to-primary' },
    { label: 'Examples', value: user.learningPattern.examples, icon: '💡', color: 'from-goldenrod to-coral' },
    { label: 'Long text', value: user.learningPattern.text, icon: '📄', color: 'from-muted to-muted-foreground' },
    { label: 'Step-by-step', value: user.learningPattern.stepByStep, icon: '📋', color: 'from-emerald to-primary' },
  ]

  const readingPrefs = [
    { label: 'Font', value: 'Lexend (Dyslexia-friendly)', icon: '🔤' },
    { label: 'Text size', value: user.accessibility.fontSize === 'xl' ? 'Extra large' : user.accessibility.fontSize === 'large' ? 'Large' : 'Normal', icon: '📏' },
    { label: 'Line spacing', value: user.accessibility.lineSpacing, icon: '↕️' },
    { label: 'Word spacing', value: user.accessibility.wordSpacing, icon: '↔️' },
    { label: 'Background', value: user.accessibility.background, icon: '🎨' },
    { label: 'Audio', value: user.accessibility.audioEnabled ? 'Enabled' : 'Disabled', icon: '🎧' },
  ]

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 font-display">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <Mascot size="lg" mood="happy" className="mx-auto mb-4" />
          <div className="inline-flex items-center gap-2 bg-lavender/10 text-lavender rounded-full px-4 py-1.5 text-sm font-bold mb-3 border border-lavender/20">
            🧠 My Learning Twin
          </div>
            <div className="flex flex-col items-center gap-3 mb-4">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
              {avatar ? <img src={avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover" style={{ boxShadow: '0 0 0 4px var(--primary)' }} /> : <Mascot size="md" mood="happy" className="mx-auto" />}
              <button onClick={() => fileRef.current?.click()} className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Change picture</button>
            </div>
            {editing ? (
              <div className="space-y-2 mb-4">
                <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }} placeholder="Name" />
                <input value={grade} onChange={e => setGrade(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }} placeholder="Class / grade" />
                <div className="flex gap-2">
                  <button onClick={saveProfile} className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm">Save</button>
                  <button onClick={() => { setEditing(false); setName(user.name); setGrade(user.grade); setAvatar(user.avatar) }} className="flex-1 py-2 bg-muted text-foreground rounded-xl font-bold text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <h1 className="text-3xl md:text-4xl font-black text-foreground">{name}'s Learning Twin</h1>
                <p className="text-muted-foreground font-body mt-1">{grade || 'Class not set'}</p>
                <button onClick={() => setEditing(true)} className="mt-2 text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Edit profile</button>
              </div>
            )}
          <p className="text-muted-foreground font-body mt-2 max-w-lg mx-auto">
            This is your personalised AI profile — it's always learning what works best for you.
          </p>
        </div>

        {/* AI Confidence card */}
        <div
          className="rounded-3xl p-6 mb-6 relative overflow-hidden shadow-xl"
          style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #44A8A0 100%)' }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-10 translate-x-10" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-body mb-1">AI Confidence in your profile</p>
              <div className="text-5xl font-black text-white mb-1">{user.aiConfidence}%</div>
              <p className="text-white/80 text-sm font-body max-w-xs">
                "LearnTwin is {user.aiConfidence}% confident these settings improve your reading comfort and understanding."
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl">
                🧠
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Learning pattern */}
          <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
            <h2 className="font-black text-foreground text-xl mb-1">How I Learn</h2>
            <p className="text-sm text-muted-foreground font-body mb-5">Your preferred learning formats</p>

            <div className="space-y-4">
              {patterns.map((p) => (
                <div key={p.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating value={p.value} />
                      <span className="text-xs font-bold text-muted-foreground w-8 text-right">{p.value}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${p.color} transition-all duration-1000`}
                      style={{ width: `${p.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 bg-secondary rounded-2xl p-3 text-sm font-body text-secondary-foreground">
              💡 You learn <strong>best</strong> with visual explanations and real-life examples.
            </div>
          </div>

          {/* Reading preferences */}
          <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
            <h2 className="font-black text-foreground text-xl mb-1">How I Read Best</h2>
            <p className="text-sm text-muted-foreground font-body mb-5">Your personalised reading setup</p>

            <div className="space-y-3">
              {readingPrefs.map((pref) => (
                <div key={pref.label} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className="text-lg">{pref.icon}</span>
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-body">{pref.label}</span>
                    <span className="font-bold text-foreground text-sm capitalize">{pref.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => navigate('theme')}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm btn-press"
              >
                🎨 Customise My Settings
              </button>
              <button
                onClick={() => navigate('onboarding')}
                className="w-full py-3 bg-muted text-foreground rounded-xl font-bold text-sm hover:bg-secondary transition-all"
              >
                🔄 Re-run Preference Check
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="mt-6 bg-card rounded-3xl border border-border p-6 shadow-sm">
          <h2 className="font-black text-foreground text-xl mb-3">My Learning Preferences</h2>
          <div className="text-sm space-y-1" style={{ color: 'var(--muted-foreground)' }}>
            <p>Font: {user.learningPreferences?.font || 'default'}</p>
            <p>Formats: {(user.learningPreferences?.learningFormats || []).join(', ') || 'Not selected'}</p>
            <p>Chunk size: {user.learningPreferences?.chunkSize || 'medium'}</p>
            <p>Interests: {(user.learningPreferences?.interests || []).join(', ') || 'Not selected'}</p>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => navigate('settings')} className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm">Edit settings</button>
            <button onClick={() => navigate('reports')} className="flex-1 py-2 bg-muted text-foreground rounded-xl font-bold text-sm">Student Report</button>
          </div>
          <button onClick={() => onLogout?.()} className="mt-3 w-full py-2 bg-card border border-border text-foreground rounded-xl font-bold text-sm">Log Out</button>
        </div>

        {/* Twin timeline */}
        <div className="mt-6 bg-card rounded-3xl border border-border p-6 shadow-sm">
          <h2 className="font-black text-foreground text-lg mb-4">🕐 How your Twin has grown</h2>
          <div className="space-y-3">
            {[
              { date: '25 Aug', update: 'Visual learning preference confirmed (95%)', icon: '👀' },
              { date: '22 Aug', update: 'Audio support added after quiz improvement detected', icon: '🎧' },
              { date: '18 Aug', update: 'Line spacing increased — reading speed improved 18%', icon: '↕️' },
              { date: '14 Aug', update: 'Warm background theme applied — reported more comfortable', icon: '🎨' },
            ].map((e) => (
              <div key={e.date} className="flex gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-sm flex-shrink-0">{e.icon}</div>
                  <div className="w-0.5 flex-1 bg-border" />
                </div>
                <div className="pb-3 flex-1">
                  <div className="text-xs text-muted-foreground font-body mb-0.5">{e.date}</div>
                  <p className="text-sm text-foreground font-body">{e.update}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
