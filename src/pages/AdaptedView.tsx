import type { Page, UserProfile } from '../types'
import BackButton from '../components/BackButton'

interface Props {
  navigate: (p: Page) => void
  user: UserProfile
}

const ORIGINAL = ''

const ADAPTED_CHUNKS: { icon: string; heading: string; body: string }[] = []

const CHANGES: { icon: string; label: string; before: string; after: string }[] = []

export default function AdaptedView({ navigate, user }: Props) {
  return (
    <div className="min-h-screen pb-24 md:pb-8 font-display" style={{ background: 'var(--background)' }}>
      <div className="max-w-3xl mx-auto px-5 py-8">

        {/* Header */}
        <div className="mb-8">
          <BackButton navigate={navigate} to="dashboard" label="Dashboard" />
        </div>
        <div className="mb-8 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold mb-4 border"
            style={{ background: 'rgba(78,205,196,.1)', color: 'var(--primary)', borderColor: 'rgba(78,205,196,.2)' }}
          >
            ✨ Twin Adapted This For You
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2" style={{ color: 'var(--foreground)' }}>
            See how Twin changed it
          </h1>
          <p className="font-body" style={{ color: 'var(--muted-foreground)' }}>
            Same content — transformed for <strong>{user.name}</strong>'s Learning Twin
          </p>
        </div>

        {/* Before / After split */}
        <div className="grid md:grid-cols-2 gap-5 mb-8">

          {/* Before */}
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold mb-3 border"
              style={{ background: 'rgba(239,68,68,.08)', color: '#EF4444', borderColor: 'rgba(239,68,68,.2)' }}
            >
              📖 Original Textbook
            </div>
            <div
              className="rounded-3xl border p-5 h-full"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.5, color: 'var(--foreground)', opacity: 0.85 }}
            >
              <div
                className="inline-block text-xs font-bold mb-3 px-2 py-0.5 rounded"
                style={{ background: 'rgba(239,68,68,.1)', color: '#EF4444' }}
              >
                ⚠️ Dense · Academic · No support
              </div>
              <p style={{ color: 'var(--foreground)' }}>{ORIGINAL}</p>
            </div>
          </div>

          {/* After */}
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold mb-3 border"
              style={{ background: 'rgba(78,205,196,.1)', color: 'var(--primary)', borderColor: 'rgba(78,205,196,.2)' }}
            >
              ✨ Your Personalised Version
            </div>
            <div
              className="rounded-3xl border p-5 h-full space-y-4"
              style={{ background: 'var(--card)', borderColor: 'rgba(78,205,196,.35)' }}
            >
              <div
                className="inline-block text-xs font-bold mb-1 px-2 py-0.5 rounded"
                style={{ background: 'rgba(16,185,129,.1)', color: '#10B981' }}
              >
                ✅ Adapted for {user.name}
              </div>
              {ADAPTED_CHUNKS.map(c => (
                <div key={c.heading} className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">{c.icon}</span>
                  <div>
                    <p className="font-black text-sm mb-0.5" style={{ color: 'var(--foreground)' }}>{c.heading}</p>
                    <p
                      className="font-body text-sm leading-relaxed"
                      style={{
                        color: 'var(--foreground)',
                        fontFamily: "'Lexend', sans-serif",
                        lineHeight: 1.8,
                        letterSpacing: '0.02em',
                      }}
                    >{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What changed */}
        <div
          className="rounded-3xl border p-6 mb-6"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <h2 className="font-black text-xl mb-1" style={{ color: 'var(--foreground)' }}>
            🧠 What Twin changed for you
          </h2>
          <p className="text-sm font-body mb-5" style={{ color: 'var(--muted-foreground)' }}>
            Based on {user.name}'s Learning Twin profile · {user.educationLevel} level
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            {CHANGES.map(ch => (
              <div
                key={ch.label}
                className="flex items-start gap-3 rounded-2xl p-3.5 border"
                style={{ background: 'rgba(16,185,129,.05)', borderColor: 'rgba(16,185,129,.2)' }}
              >
                <span className="text-lg flex-shrink-0">{ch.icon}</span>
                <div>
                  <p className="font-black text-sm font-display" style={{ color: 'var(--foreground)' }}>{ch.label}</p>
                  <p className="text-[10px] font-body mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    <span className="line-through">{ch.before}</span> → <strong style={{ color: '#10B981' }}>{ch.after}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Twin metrics */}
        <div
          className="rounded-3xl border p-6 mb-6"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <h2 className="font-black text-lg mb-4" style={{ color: 'var(--foreground)' }}>
            📊 {user.name}'s Learning Twin
          </h2>
          <div className="space-y-2.5">
            {[
              { label: 'Visual learning', val: user.learningPattern.visual, color: '#4ECDC4' },
              { label: 'Audio support',   val: user.learningPattern.audio,  color: '#A78BFA' },
              { label: 'Examples',        val: user.learningPattern.examples, color: '#F59E0B' },
              { label: 'Step-by-step',   val: user.learningPattern.stepByStep, color: '#10B981' },
              { label: 'Dense text',     val: user.learningPattern.text,    color: '#EF4444' },
            ].map(m => (
              <div key={m.label} className="flex items-center gap-3">
                <span className="text-sm font-body w-32 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>{m.label}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                  <div className="h-full rounded-full" style={{ width: `${m.val}%`, background: m.color }} />
                </div>
                <span className="text-sm font-black w-10 text-right" style={{ color: 'var(--foreground)' }}>{m.val}%</span>
              </div>
            ))}
          </div>
          <div
            className="mt-4 rounded-xl p-3.5 text-sm font-body italic border-l-4"
            style={{ background: 'rgba(78,205,196,.06)', borderColor: 'var(--primary)', color: 'var(--foreground)' }}
          >
            "You understand concepts {user.learningPattern.visual >= 80 ? '95%' : '80%'} better when they include visuals and examples. Twin adapted this lesson accordingly."
          </div>
        </div>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('pack')}
            className="flex-1 py-4 rounded-2xl font-black text-base btn-press shadow-lg"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Open Learning Pack →
          </button>
          <button
            onClick={() => navigate('lesson')}
            className="flex-1 py-4 rounded-2xl font-bold text-base border btn-press"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            📖 Start Adapted Lesson
          </button>
        </div>
      </div>
    </div>
  )
}
