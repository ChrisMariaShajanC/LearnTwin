import { useState } from 'react'
import type { Page, UserProfile, Role, EducationLevel } from '../types'

interface Props {
  navigate: (p: Page) => void
  setUser: (u: UserProfile) => void
  defaultUser: UserProfile
  onLogin: () => void
}

const demoAccounts: { name: string; grade: string; avatar: string; desc: string; role: Role; educationLevel: EducationLevel; color: string }[] = []

export default function Login({ navigate, setUser, defaultUser, onLogin }: Props) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [tab, setTab]           = useState<'login' | 'demo'>('login')

  const handleLogin = () => {
    if (!email.trim()) { setError('Please enter your email or username.'); return }
    setError('')
    setLoading(true)
    setTimeout(() => { setLoading(false); onLogin(); navigate('dashboard') }, 1200)
  }

  const handleDemo = (acc: typeof demoAccounts[0]) => {
    setLoading(true)
    setTimeout(() => {
      setUser({ ...defaultUser, name: acc.name, grade: acc.grade, role: acc.role, educationLevel: acc.educationLevel })
      setLoading(false)
      onLogin()
      navigate(acc.role === 'educator' ? 'educator' : acc.role === 'parent' ? 'parent' : 'dashboard')
    }, 800)
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)', fontFamily: "'Inter', sans-serif" }}>

      {/* Left branding panel */}
      <div className="hidden md:flex flex-col justify-between w-[42%] p-10 relative overflow-hidden" style={{ background: 'var(--sidebar-bg)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #0F766E 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '16px', color: '#F1F5F9' }}>LearnTwin</span>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#F1F5F9' }}>
            Every learner<br />is different.
          </h2>
          <p className="text-sm leading-relaxed mb-10" style={{ color: '#64748B' }}>
            LearnTwin adapts content to match how{' '}
            <em style={{ color: '#94A3B8', fontStyle: 'normal' }}>you</em>{' '}
            learn — your pace, your format, your understanding.
          </p>

          <div className="space-y-4">
            {[
              { label: 'Upload any material',    sub: 'PDF, DOCX, images, notes' },
              { label: 'AI adapts the content',  sub: 'To your pace and learning style' },
              { label: 'Practice and improve',   sub: 'Quizzes, flashcards, Ask Twin' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(15,118,110,.25)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#E2E8F0' }}>{f.label}</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs" style={{ color: '#334155' }}>
          2026 LearnTwin · Adaptive Learning Platform
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[360px] animate-fade-up">

          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: 'var(--foreground)' }}>LearnTwin</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)' }}>Sign in</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Welcome back — your Learning Twin is ready.</p>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--muted)' }}>
            {(['login', 'demo'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: tab === t ? 'var(--card)' : 'transparent',
                  color: tab === t ? 'var(--foreground)' : 'var(--muted-foreground)',
                  boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,.07)' : 'none',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Demo Accounts'}
              </button>
            ))}
          </div>

          {tab === 'login' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Email or username</label>
                <input
                  type="text"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="alex@learntwin.com"
                  autoFocus
                  className="lt-input"
                  style={{ borderColor: error ? '#EF4444' : email ? 'var(--primary)' : undefined }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="Password"
                  className="lt-input"
                />
              </div>
              {error && <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="lt-btn lt-btn-primary w-full py-3 text-sm disabled:opacity-60"
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in</>
                  : 'Sign In'}
              </button>
              <p className="text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                New here?{' '}
                <button onClick={() => navigate('onboarding')} className="font-semibold" style={{ color: 'var(--primary)' }}>
                  Create your Learning Twin
                </button>
              </p>
            </div>
          )}

          {tab === 'demo' && (
            <div className="space-y-2.5 animate-fade-in">
              <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>Click any account for instant demo access:</p>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.name}
                  onClick={() => handleDemo(acc)}
                  disabled={loading}
                  className="lt-card lt-card-lift w-full flex items-center gap-3 p-3.5 text-left disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: acc.color }}>
                    {acc.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)' }}>{acc.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{acc.desc}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--muted-foreground)' }}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              ))}
              {loading && (
                <div className="flex items-center justify-center gap-2 py-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(15,118,110,.3)', borderTopColor: 'var(--primary)' }} />
                  Signing in
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
