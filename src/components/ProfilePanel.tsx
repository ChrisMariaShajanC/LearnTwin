import { useRef, useState } from 'react'
import type { Page, ThemeMode, UserProfile } from '../types'
import Mascot from './Mascot'

interface Props {
  open: boolean
  onClose: () => void
  navigate: (p: Page) => void
  user: UserProfile
  setUser: (u: UserProfile) => void
  theme: ThemeMode
  onLogout: () => void
}

const fontLabels: Record<string, string> = {
  lexend: 'Lexend',
  nunito: 'Nunito (Rounded)',
  system: 'System default',
  arial: 'Arial',
  verdana: 'Verdana',
  atkinson: 'Atkinson Hyperlegible',
}

const themeLabels: Record<string, string> = {
  light: '☀️ Light',
  dark: '🌙 Dark',
  ai: '🎨 My Theme (AI)',
}

export default function ProfilePanel({ open, onClose, navigate, user, setUser, theme, onLogout }: Props) {
  const [showLogout, setShowLogout] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const go = (p: Page) => { onClose(); navigate(p) }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setUser({ ...user, avatar: ev.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  const removeAvatar = () => setUser({ ...user, avatar: undefined })

  if (!open && !showLogout) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
        onClick={onClose}
      />

      {/* Panel — slides in from right */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm flex flex-col shadow-2xl transition-transform duration-300"
        style={{
          background: 'var(--card)',
          borderLeft: '1px solid var(--border)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-black text-lg font-display" style={{ color: 'var(--foreground)' }}>My Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-lg hover:opacity-70 transition-opacity"
            style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Avatar + name */}
          <div className="px-5 py-6 text-center border-b" style={{ borderColor: 'var(--border)' }}>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

            <div className="relative inline-block mb-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto ring-4"
                  style={{ boxShadow: '0 0 0 4px var(--primary)' }}
                />
              ) : (
                <Mascot size="md" mood="happy" className="mx-auto" />
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white transition-transform hover:scale-110"
                style={{ background: 'var(--primary)' }}
                title="Change profile picture"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </button>
            </div>

            <h3 className="text-2xl font-black font-display" style={{ color: 'var(--foreground)' }}>{user.name}</h3>
            <p className="text-sm font-body mb-1" style={{ color: 'var(--muted-foreground)' }}>{user.grade}</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs font-semibold hover:underline"
                style={{ color: 'var(--primary)' }}
              >
                {user.avatar ? 'Change photo' : 'Add photo'}
              </button>
              {user.avatar && (
                <>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>·</span>
                  <button
                    onClick={removeAvatar}
                    className="text-xs font-semibold hover:underline"
                    style={{ color: '#EF4444' }}
                  >
                    Remove
                  </button>
                </>
              )}
            </div>

            {/* Quick stats */}
            <div className="flex justify-center gap-5 mt-4">
              {[
                { icon: '🏆', val: `${user.streak}d`, label: 'Streak' },
                { icon: '⭐', val: `${user.understanding}%`, label: 'Score' },
                { icon: '📚', val: `${user.lessonsCompleted}`, label: 'Lessons' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-xl mb-0.5">{s.icon}</div>
                  <div className="font-black text-sm text-primary">{s.val}</div>
                  <div className="text-[10px] font-body" style={{ color: 'var(--muted-foreground)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3 font-display" style={{ color: 'var(--muted-foreground)' }}>Subjects</p>
            <div className="space-y-2">
              {[
                { name: 'Biology',     pct: 82, emoji: '🧬' },
                { name: 'Mathematics', pct: 71, emoji: '🔢' },
                { name: 'Physics',     pct: 91, emoji: '⚡' },
                { name: 'English',     pct: 58, emoji: '📚' },
              ].map(s => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-base w-5">{s.emoji}</span>
                  <span className="flex-1 text-sm font-semibold font-body" style={{ color: 'var(--foreground)' }}>{s.name}</span>
                  <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                    <div className="progress-bar h-full" style={{ width: `${s.pct}%` }} />
                  </div>
                  <span className="text-xs font-bold w-8 text-right" style={{ color: 'var(--muted-foreground)' }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Twin summary */}
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3 font-display" style={{ color: 'var(--muted-foreground)' }}>Learning Twin</p>
            <div className="space-y-1.5">
              {[
                { label: 'Visual learning',   val: `${user.learningPattern.visual}%` },
                { label: 'Audio learning',    val: `${user.learningPattern.audio}%` },
                { label: 'Examples',          val: `${user.learningPattern.examples}%` },
                { label: 'Step-by-step',      val: `${user.learningPattern.stepByStep}%` },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm font-body">
                  <span style={{ color: 'var(--muted-foreground)' }}>{r.label}</span>
                  <span className="font-bold" style={{ color: 'var(--foreground)' }}>{r.val}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => go('profile')}
              className="mt-3 text-xs font-bold text-primary hover:underline"
            >
              View full Learning Twin →
            </button>
          </div>

          {/* Accessibility preferences */}
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3 font-display" style={{ color: 'var(--muted-foreground)' }}>Accessibility</p>
            <div className="space-y-1.5">
              {[
                { label: 'Font',          val: fontLabels[user.accessibility.fontFamily] || 'Lexend' },
                { label: 'Font size',     val: user.accessibility.fontSize },
                { label: 'Line spacing',  val: user.accessibility.lineSpacing },
                { label: 'Word spacing',  val: user.accessibility.wordSpacing },
                { label: 'Theme',         val: themeLabels[theme] || theme },
                { label: 'Audio support', val: user.accessibility.audioEnabled ? 'On' : 'Off' },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm font-body">
                  <span style={{ color: 'var(--muted-foreground)' }}>{r.label}</span>
                  <span className="font-bold capitalize" style={{ color: 'var(--foreground)' }}>{r.val}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => go('theme')}
              className="mt-3 text-xs font-bold text-primary hover:underline"
            >
              Customise settings →
            </button>
          </div>

          {/* Navigation shortcuts */}
          <div className="px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 font-display" style={{ color: 'var(--muted-foreground)' }}>Quick links</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: '🌟', label: 'My Journey',    page: 'progress' as Page },
                { icon: '📋', label: 'Reports',        page: 'reports' as Page },
                { icon: '⚙️', label: 'Settings',       page: 'settings' as Page },
                { icon: '👨‍👩‍👧', label: 'Parent View', page: 'parent' as Page },
              ].map(l => (
                <button
                  key={l.label}
                  onClick={() => go(l.page)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold text-left card-lift"
                  style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  <span>{l.icon}</span>
                  <span className="font-display">{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer — logout */}
        <div className="px-5 py-4 border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setShowLogout(true)}
            className="w-full py-3 rounded-2xl font-black text-sm border-2 btn-press transition-all"
            style={{ borderColor: '#FF6B6B', color: '#FF6B6B', background: 'rgba(255,107,107,.06)' }}
          >
            🚪 Log Out
          </button>
        </div>
      </div>

      {/* Logout confirmation modal */}
      {showLogout && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-pop"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">👋</div>
              <h3 className="text-xl font-black font-display mb-2" style={{ color: 'var(--foreground)' }}>
                Log out?
              </h3>
              <p className="text-sm font-body" style={{ color: 'var(--muted-foreground)' }}>
                Are you sure you want to log out of LearnTwin?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 py-3 rounded-xl font-bold text-sm border btn-press"
                style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowLogout(false); onClose(); onLogout() }}
                className="flex-1 py-3 rounded-xl font-black text-sm btn-press text-white"
                style={{ background: '#FF6B6B' }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
