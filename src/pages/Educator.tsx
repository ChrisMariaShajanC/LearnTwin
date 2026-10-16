import { useState } from 'react'
import type { Page, UserProfile } from '../types'
import BackButton from '../components/BackButton'

interface Props {
  navigate: (p: Page) => void
  user: UserProfile
}

const STUDENTS: { name: string; grade: string; level: string; understanding: number; streak: number; strong: string; weak: string; learning: string; status: string }[] = []

export default function Educator({ navigate, user }: Props) {
  const [activeStudent, setActiveStudent] = useState<number | null>(null)

  const selected = activeStudent !== null ? STUDENTS[activeStudent] : null

  return (
    <div className="min-h-screen pb-24 md:pb-8 font-display" style={{ background: 'var(--background)' }}>
      <div className="max-w-3xl mx-auto px-5 py-8">

        {/* Header */}
        <div className="mb-6">
          <BackButton navigate={navigate} to="dashboard" label="Dashboard" />
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold mb-4 border" style={{ background: 'rgba(245,158,11,.1)', color: '#F59E0B', borderColor: 'rgba(245,158,11,.2)' }}>
            👩‍🏫 Educator Dashboard
          </div>
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--foreground)' }}>Your Students</h1>
          <p className="font-body text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Learning Twin insights for each student — powered by AI
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: '👥', val: `${STUDENTS.length}`, label: 'Students' },
            { icon: '🟢', val: '2', label: 'On track' },
            { icon: '🔴', val: '1', label: 'Needs support' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-black text-xl" style={{ color: 'var(--foreground)' }}>{s.val}</div>
              <div className="text-xs font-body" style={{ color: 'var(--muted-foreground)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Student list */}
        <div className="space-y-3 mb-6">
          {STUDENTS.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setActiveStudent(activeStudent === i ? null : i)}
              className="w-full rounded-2xl border p-4 text-left card-lift transition-all"
              style={{
                background: activeStudent === i ? 'var(--secondary)' : 'var(--card)',
                borderColor: activeStudent === i ? 'var(--primary)' : 'var(--border)',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,var(--primary),#A78BFA)' }}
                >
                  {s.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-black font-display" style={{ color: 'var(--foreground)' }}>{s.name}</p>
                    <span>{s.status}</span>
                  </div>
                  <p className="text-xs font-body" style={{ color: 'var(--muted-foreground)' }}>{s.grade} · {s.level}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-lg" style={{ color: 'var(--primary)' }}>{s.understanding}%</p>
                  <p className="text-xs font-body" style={{ color: 'var(--muted-foreground)' }}>Understanding</p>
                </div>
              </div>

              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                <div className="progress-bar h-full" style={{ width: `${s.understanding}%` }} />
              </div>

              {/* Expanded detail */}
              {activeStudent === i && (
                <div className="mt-4 grid sm:grid-cols-2 gap-3 animate-pop">
                  {[
                    { label: '💪 Strong areas', val: s.strong },
                    { label: '🎯 Needs support', val: s.weak },
                    { label: '🧠 Learning style', val: s.learning },
                    { label: '🔥 Streak', val: `${s.streak} days` },
                  ].map(d => (
                    <div key={d.label} className="rounded-xl p-3" style={{ background: 'var(--muted)' }}>
                      <p className="text-xs font-body mb-0.5" style={{ color: 'var(--muted-foreground)' }}>{d.label}</p>
                      <p className="font-bold text-sm font-display" style={{ color: 'var(--foreground)' }}>{d.val}</p>
                    </div>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* AI recommendations */}
        <div className="rounded-3xl border p-6 mb-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="font-black text-lg mb-4" style={{ color: 'var(--foreground)' }}>🤖 AI Teaching Recommendations</h2>
          <div className="space-y-3">
            {([] as { student: string; insight: string; color: string }[]).map(r => (
              <div key={r.student} className="flex gap-3 rounded-xl p-4 border" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0 mt-0.5"
                  style={{ background: r.color }}
                >
                  {r.student[0]}
                </div>
                <div>
                  <p className="font-bold text-sm mb-0.5 font-display" style={{ color: 'var(--foreground)' }}>{r.student}</p>
                  <p className="text-xs font-body leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{r.insight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic performance */}
        <div className="rounded-3xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="font-black text-lg mb-4" style={{ color: 'var(--foreground)' }}>📊 Class Topic Performance</h2>
          {([] as { topic: string; avg: number; dot: string }[]).map(t => (
            <div key={t.topic} className="flex items-center gap-3 mb-3 last:mb-0">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: t.dot }} />
              <span className="flex-1 text-sm font-semibold font-body" style={{ color: 'var(--foreground)' }}>{t.topic}</span>
              <div className="w-28 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                <div className="h-full rounded-full" style={{ width: `${t.avg}%`, background: t.dot }} />
              </div>
              <span className="text-sm font-black w-10 text-right" style={{ color: 'var(--foreground)' }}>{t.avg}%</span>
            </div>
          ))}
          <button onClick={() => navigate('reports')} className="mt-5 w-full py-3 rounded-xl font-bold text-sm border btn-press" style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            View Full Reports →
          </button>
        </div>
      </div>
    </div>
  )
}
