import type { Page } from '../types'
import Mascot from '../components/Mascot'

interface Props { navigate: (p: Page) => void }

/* Floating app-preview card shown in hero */
function PreviewCard({ style, children }: { style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div
      className="absolute rounded-2xl shadow-xl border text-xs font-display"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export default function Landing({ navigate }: Props) {
  return (
    <div className="min-h-screen font-display overflow-x-hidden" style={{ background: 'var(--background)' }}>

      {/* ══ HEADER ══ */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-lg shadow-md">✨</div>
          <span className="text-xl font-black" style={{ color: 'var(--foreground)' }}>LearnTwin</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('parent')}
            className="hidden sm:block text-sm font-bold px-4 py-2 rounded-xl hover:opacity-70 transition-opacity"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Parent / Teacher
          </button>
          <button
            onClick={() => navigate('onboarding')}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-black text-sm shadow-md btn-press"
          >
            Get started ✨
          </button>
        </div>
      </header>

      {/* ══ HERO — split canvas ══ */}
      <section className="relative min-h-[92vh] grid md:grid-cols-2">

        {/* Left panel — cream/dark split */}
        <div
          className="flex flex-col justify-center px-8 md:px-14 lg:px-20 py-16 md:py-0 relative overflow-hidden order-2 md:order-1"
          style={{ background: 'var(--background)' }}
        >
          {/* Memphis dot cluster */}
          <div className="absolute top-10 left-10 flex flex-col gap-3 opacity-20" aria-hidden="true">
            {[0,1,2].map(r => (
              <div key={r} className="flex gap-3">
                {[0,1,2].map(c => (
                  <div key={c} className="w-2 h-2 rounded-full bg-primary" />
                ))}
              </div>
            ))}
          </div>
          <div className="absolute bottom-20 right-8 w-24 h-24 rounded-full opacity-8 blur-2xl bg-primary" aria-hidden="true" />

          <div className="relative z-10 animate-slide-up max-w-lg">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold mb-6 border"
              style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)', borderColor: 'var(--border)' }}
            >
              🧠 AI-Powered Adaptive Learning
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] mb-6" style={{ color: 'var(--foreground)' }}>
              Learning{' '}
              <span
                style={{
                  background: 'linear-gradient(130deg,#4ECDC4 20%,#44A8A0 80%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                that fits
              </span>
              {' '}how you think.
            </h1>

            <p className="text-lg leading-relaxed mb-4 font-body" style={{ color: 'var(--muted-foreground)' }}>
              Don't make the learner adapt to the system.{' '}
              <strong style={{ color: 'var(--foreground)' }}>Make the system adapt to the learner.</strong>
            </p>
            <p className="text-base leading-relaxed mb-10 font-body" style={{ color: 'var(--muted-foreground)' }}>
              LearnTwin automatically adjusts font, spacing, audio, and complexity — especially designed for learners with dyslexia and reading differences.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('onboarding')}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl btn-press animate-pulse-glow"
              >
                Start My Learning Journey ✨
              </button>
              <button
                onClick={() => navigate('login')}
                className="px-8 py-4 rounded-2xl font-bold text-lg btn-press border"
                style={{ background: 'var(--card)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
              >
                See a demo 👀
              </button>
            </div>

            <div className="flex flex-wrap gap-5 mt-8">
              {['Dyslexia-friendly', 'Free to start', 'Ages 6–18'].map(b => (
                <div key={b} className="flex items-center gap-1.5 text-sm font-body" style={{ color: 'var(--muted-foreground)' }}>
                  <span className="text-emerald font-bold">✓</span> {b}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — primary tint with floating UI */}
        <div
          className="relative flex items-center justify-center py-16 md:py-0 order-1 md:order-2 overflow-hidden min-h-80"
          style={{ background: 'var(--hero-split,#E8F8F7)' }}
        >
          {/* Decorative circles */}
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full opacity-20" style={{ background: 'var(--primary)' }} />
          <div className="absolute bottom-20 left-8 w-20 h-20 rounded-full opacity-15" style={{ background: '#FF6B6B' }} />
          <div className="absolute top-1/2 right-2 w-12 h-12 rounded-full opacity-20" style={{ background: '#A78BFA' }} />
          {/* Diamond */}
          <div className="absolute top-20 left-12 w-6 h-6 rotate-45 opacity-25 rounded-sm" style={{ background: '#F59E0B' }} />

          {/* Mascot — centred, animated */}
          <div className="relative z-10 animate-float">
            <Mascot size="xl" mood="waving" />
          </div>

          {/* Floating preview cards */}
          <PreviewCard
            style={{
              top: '14%',
              left: '4%',
              padding: '10px 14px',
              animationName: 'floatB',
              animationDuration: '4s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
              width: 170,
            }}
          >
            <p className="font-bold mb-1.5" style={{ color: 'var(--foreground)', fontSize: 11 }}>🧠 Learning Twin active</p>
            <div className="flex gap-1.5">
              {['Visual','Audio','Examples'].map(t => (
                <span key={t} className="bg-primary/10 text-primary rounded-lg px-1.5 py-0.5" style={{ fontSize: 9 }}>{t}</span>
              ))}
            </div>
          </PreviewCard>

          <PreviewCard
            style={{
              bottom: '22%',
              right: '3%',
              padding: '10px 14px',
              width: 160,
              animationName: 'floatB',
              animationDuration: '5s',
              animationDelay: '1.2s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            }}
          >
            <p style={{ color: 'var(--muted-foreground)', fontSize: 9, marginBottom: 4 }}>Understanding</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                <div className="progress-bar h-full" style={{ width: '84%' }} />
              </div>
              <span className="font-black text-primary" style={{ fontSize: 12 }}>84%</span>
            </div>
          </PreviewCard>

          <PreviewCard
            style={{
              top: '58%',
              left: '2%',
              padding: '10px 14px',
              animationName: 'floatB',
              animationDuration: '3.5s',
              animationDelay: '0.6s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            }}
          >
            <div className="text-center">
              <div style={{ fontSize: 22 }}>🏆</div>
              <p className="font-black" style={{ color: 'var(--foreground)', fontSize: 10, marginTop: 2 }}>7-day streak!</p>
            </div>
          </PreviewCard>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold mb-4 border"
            style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)', borderColor: 'var(--border)' }}
          >
            💡 How it works
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: 'var(--foreground)' }}>
            Every learner is different.
          </h2>
          <p className="text-lg max-w-2xl mx-auto font-body leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            LearnTwin builds a <strong style={{ color: 'var(--foreground)' }}>personalised learning profile</strong> by observing how you interact with content — not by asking you to choose settings you might not know you need.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: '🧠', color: 'bg-primary/10 text-primary', title: 'Adapts to you', desc: 'Font, spacing, audio, complexity — all adjusted automatically.' },
            { icon: '📷', color: 'bg-coral/10 text-coral',   title: 'Scan any page', desc: 'Photo a textbook page. Instantly get a personalised lesson.' },
            { icon: '🎯', color: 'bg-lavender/10 text-lavender', title: 'Fun challenges', desc: 'Quizzes that adjust difficulty in real time based on your answers.' },
            { icon: '🌟', color: 'bg-goldenrod/10 text-goldenrod', title: 'Your Learning Twin', desc: 'An AI profile that keeps getting smarter as you learn.' },
          ].map((f, i) => (
            <div
              key={i}
              className="rounded-3xl p-6 border card-lift shadow-sm animate-slide-up"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', animationDelay: `${i * 80}ms` }}
            >
              <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center text-2xl mb-4`}>{f.icon}</div>
              <h3 className="text-lg font-black mb-2 font-display" style={{ color: 'var(--foreground)' }}>{f.title}</h3>
              <p className="text-sm font-body leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ STORY FLOW ══ */}
      <section className="py-20 px-6 md:px-12" style={{ background: 'var(--muted)' }}>
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--foreground)' }}>See the magic happen</h2>
          <p className="font-body" style={{ color: 'var(--muted-foreground)' }}>From a difficult textbook page to a perfect personalised lesson in seconds.</p>
        </div>
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-2">
          {[
            { icon: '📷', label: 'Scan page' },
            null,
            { icon: '🔍', label: 'AI analyses' },
            null,
            { icon: '🧠', label: 'Checks Twin' },
            null,
            { icon: '✨', label: 'Your lesson' },
          ].map((step, i) =>
            step === null ? (
              <div key={i} className="text-2xl font-bold" style={{ color: 'var(--muted-foreground)' }}>→</div>
            ) : (
              <div
                key={i}
                className="rounded-3xl p-5 text-center border shadow-sm"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', minWidth: 110 }}
              >
                <div className="text-4xl mb-1">{step.icon}</div>
                <div className="text-xs font-bold font-display" style={{ color: 'var(--foreground)' }}>{step.label}</div>
              </div>
            )
          )}
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-12" style={{ color: 'var(--foreground)' }}>
          Loved by learners, parents & teachers
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { quote: "LearnTwin made reading so much easier. I finally feel like I can keep up!", name: 'Mia, 11', role: 'Student', emoji: '😊' },
            { quote: "My son used to hate reading. Now he's excited to scan his textbook every evening.", name: 'Sarah T.', role: 'Parent', emoji: '🥰' },
            { quote: "The adaptive profiles give me real insight into how each child learns. Remarkable.", name: 'Mr. Davies', role: 'Class Teacher', emoji: '👩‍🏫' },
          ].map((t, i) => (
            <div key={i} className="rounded-3xl p-6 border shadow-sm card-lift" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="text-3xl mb-4">{t.emoji}</div>
              <p className="font-body leading-relaxed italic mb-4" style={{ color: 'var(--foreground)' }}>"{t.quote}"</p>
              <div>
                <p className="font-black font-display" style={{ color: 'var(--foreground)' }}>{t.name}</p>
                <p className="text-sm font-body" style={{ color: 'var(--muted-foreground)' }}>{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA FOOTER ══ */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ background: 'var(--primary)' }} />
        <div className="relative z-10 max-w-xl mx-auto">
          <Mascot size="md" mood="excited" className="mx-auto mb-6" />
          <h2 className="text-4xl font-black mb-4 font-display" style={{ color: 'var(--foreground)' }}>
            Ready to find your learning style?
          </h2>
          <p className="text-lg mb-8 font-body" style={{ color: 'var(--muted-foreground)' }}>
            Join thousands of learners who finally feel understood.
          </p>
          <button
            onClick={() => navigate('onboarding')}
            className="px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xl shadow-2xl btn-press animate-pulse-glow"
          >
            Start Free — Find How I Learn ✨
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 text-center text-sm font-body" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-lg">✨</span>
          <span className="font-black font-display" style={{ color: 'var(--foreground)' }}>LearnTwin</span>
        </div>
        <p>Made with 💙 for every learner who thinks differently.</p>
      </footer>
    </div>
  )
}
