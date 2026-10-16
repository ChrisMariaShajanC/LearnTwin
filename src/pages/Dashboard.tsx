import { useState } from 'react'
import type { Page, UserProfile } from '../types'

interface Props { navigate: (p: Page) => void; user: UserProfile }

const greet = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const subjects: { name: string; color: string; pct: number; topic: string }[] = []

const insights: string[] = []

export default function Dashboard({ navigate, user }: Props) {
  const [_insightIdx] = useState(0)

  return (
    <div className="min-h-screen pb-24 md:pb-10" style={{ background: 'var(--background)', fontFamily: "'Inter', sans-serif" }}>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>LearnTwin</span>
        </div>
        <button
          onClick={() => navigate('settings')}
          className="w-9 h-9 rounded-lg border flex items-center justify-center"
          style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-6 md:py-8 space-y-6">

        {/* GREETING + STATS */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 animate-fade-up">
          <div>
            <p className="text-sm mb-0.5" style={{ color: 'var(--muted-foreground)' }}>{greet()}</p>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)' }}>
              Welcome back, {user.name}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{user.grade} · {user.lessonsCompleted} lessons completed</p>
          </div>
          <div className="flex gap-3">
            {[
              { val: `${user.streak}d`, label: 'Streak',        color: '#F59E0B' },
              { val: `${user.understanding}%`, label: 'Understanding', color: 'var(--primary)' },
              { val: `${user.xp ?? 340}`,     label: 'XP',            color: '#6366F1' },
            ].map((s) => (
              <div key={s.label} className="lt-card px-5 py-3 text-center min-w-[80px]">
                <div className="text-lg font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: s.color }}>{s.val}</div>
                <div className="text-[10px] font-semibold mt-0.5 uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* UPLOAD HERO */}
        <div className="rounded-2xl overflow-hidden animate-fade-up delay-50" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
          <div className="grid md:grid-cols-2">

            {/* Left: upload zone */}
            <div className="p-6 md:p-8">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4" style={{ background: 'rgba(15,118,110,.1)', color: 'var(--primary)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload &amp; Analyze
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)' }}>
                Turn any material into a personalized lesson
              </h2>
              <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                Upload a PDF, textbook page, or note. LearnTwin adapts it to how you learn.
              </p>
              <button
                onClick={() => navigate('scan')}
                className="lt-upload-zone w-full py-8 flex flex-col items-center gap-3 mb-4"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(15,118,110,.1)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-center" style={{ color: 'var(--foreground)' }}>Drag &amp; drop your file here</p>
                  <p className="text-xs text-center mt-0.5" style={{ color: 'var(--muted-foreground)' }}>PDF, DOCX, PPTX, JPG, PNG, TXT</p>
                </div>
                <span className="lt-btn lt-btn-primary text-sm px-5 py-2">Browse File</span>
              </button>
              <div className="flex flex-wrap gap-1.5">
                {['PDF', 'DOCX', 'PPTX', 'XLSX', 'JPG', 'PNG', 'TXT'].map((f) => (
                  <span key={f} className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{f}</span>
                ))}
              </div>
            </div>

            {/* Right: what you get */}
            <div className="p-6 md:p-8 md:border-l" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--muted-foreground)' }}>What you get</p>
              <div className="space-y-3 mb-6">
                {[
                  'Smart Summary & Key Concepts',
                  'Personalized Lesson',
                  'Flashcards & Notes',
                  'Audio & Video Classes',
                  'Practice & Adaptive Quiz',
                  'Ask Twin — AI Tutor',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(15,118,110,.15)' }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted-foreground)' }}>Processing flow</p>
                <div className="flex items-center gap-1 flex-wrap">
                  {['Upload', 'Analyze', 'Understand', 'Personalize', 'Generate'].map((step, i) => (
                    <div key={step} className="flex items-center gap-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: 'var(--card)', color: 'var(--foreground)' }}>{step}</span>
                      {i < 4 && <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>›</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTINUE LEARNING */}
        <div className="animate-fade-up delay-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)' }}>Continue Learning</h2>
            <button onClick={() => navigate('mylearning')} className="text-sm font-medium" style={{ color: 'var(--primary)' }}>See all</button>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {subjects.map((s) => (
              <button key={s.name} onClick={() => navigate('pack')} className="lt-card lt-card-lift p-5 text-left flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm flex-shrink-0" style={{ background: `${s.color}18`, color: s.color }}>
                    {s.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>{s.name}</p>
                    <p className="font-semibold text-sm truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)' }}>{s.topic}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Progress</span>
                    <span className="text-xs font-semibold" style={{ color: s.color }}>{s.pct}%</span>
                  </div>
                  <div className="lt-progress">
                    <div className="lt-progress-bar" style={{ width: `${s.pct}%`, background: s.color }} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Resume lesson</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--muted-foreground)' }}><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid md:grid-cols-2 gap-4 animate-fade-up delay-150">

          {/* AI Insight */}
          <div className="lt-card p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(15,118,110,.1)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)' }}>Learning Twin Insight</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Personalized for {user.name}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--foreground)' }}>
              "{insights[0]}"
            </p>
            <button onClick={() => navigate('adapted')} className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--primary)' }}>
              See how Twin adapted this
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          {/* Difficulty Radar */}
          <div className="lt-card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)' }}>Difficulty Radar</p>
              <button onClick={() => navigate('radar')} className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Full view</button>
            </div>
            <div className="space-y-3">
              {([] as { t: string; pct: number; status: string; col: string }[]).map((r) => (
                <div key={r.t}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{r.t}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${r.col}18`, color: r.col }}>{r.status}</span>
                  </div>
                  <div className="lt-progress">
                    <div className="lt-progress-bar" style={{ width: `${r.pct}%`, background: r.col }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="animate-fade-up delay-200">
          <h2 className="font-semibold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)' }}>Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Upload Material',        page: 'scan'      as Page, color: 'var(--primary)', bg: 'rgba(15,118,110,.08)' },
              { label: 'My Library',             page: 'mylearning' as Page, color: '#6366F1',       bg: 'rgba(99,102,241,.08)' },
              { label: 'Progress Report',        page: 'reports'   as Page, color: '#F59E0B',        bg: 'rgba(245,158,11,.08)' },
              { label: 'How Twin Adapted',       page: 'adapted'   as Page, color: '#8B5CF6',        bg: 'rgba(139,92,246,.08)' },
            ].map((a) => (
              <button key={a.label} onClick={() => navigate(a.page)} className="lt-card lt-card-lift p-4 text-left flex flex-col gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: a.bg, color: a.color }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </div>
                <span className="text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--foreground)' }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
